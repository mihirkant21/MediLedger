from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from paddleocr import PaddleOCR
import numpy as np
import io
import os
import logging
import json
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(title="MediLedger OCR Service")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize PaddleOCR (downloads model on first run)
try:
    # use_gpu is not supported in this version's constructor, removing it.
    # use_angle_cls is deprecated, replaced with use_textline_orientation.
    ocr = PaddleOCR(use_textline_orientation=True, lang='en', enable_mkldnn=False)
    logger.info("✅ PaddleOCR initialized successfully")
except Exception as e:
    logger.error(f"❌ Failed to initialize PaddleOCR: {e}")
    raise RuntimeError("OCR Engine failed to start")

# Initialize Groq Client
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    logger.warning("⚠️ GROQ_API_KEY not found. LLM extraction will be disabled.")

client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

def extract_structured_data_llm(text: str):
    """
    Uses Groq LLM to extract structured medical data from text.
    Returns a JSON object with standard fields.
    """
    if not client:
        return {}

    system_prompt = """
    You are an expert medical data extractor. 
    Extract the following fields from the provided OCR text of a medical document:
    - patientName (string)
    - patientAge (string or number)
    - patientGender (string)
    - doctorName (string, include 'Dr.' prefix if applicable)
    - hospitalName (string)
    - date (string, YYYY-MM-DD format if possible)
    - diagnosis (string, brief summary)
    - medicines (list of strings, include dosage if available)
    - symptoms (list of strings)
    - tests (list of strings)

    Return ONLY a valid JSON object. Do not include markdown formatting (```json ... ```).
    If a field is not found, use null.
    """

    try:
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Extract data from this medical text:\n\n{text}"}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        
        result = completion.choices[0].message.content
        return json.loads(result)
    except Exception as e:
        logger.error(f"LLM extraction failed: {e}")
        return {}

@app.post("/api/ocr/extract")
async def extract_text(file: UploadFile = File(...)):
    """Extract text from uploaded image using PaddleOCR and structure it with LLM"""
    try:
        contents = await file.read()
        
        # Determine if file is PDF or Image
        # For simplicity, assuming Image for now as PaddleOCR handles images natively.
        # If PDF support is strictly required, we'd use pdf2image here.
        
        # Read image
        try:
            image_array = np.frombuffer(contents, np.uint8)
            # Decode using OpenCV to handle various formats
            import cv2
            img = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
            if img is None:
                raise ValueError("Could not decode image")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid image file: {e}")

        # Perform OCR
        # cls=True enables orientation classification (handled in __init__ now)
        try:
            result = ocr.ocr(img)
            logger.info(f"OCR Raw Result: {result}")
        except Exception as ocr_err:
            logger.error(f"PaddleOCR internal error: {ocr_err}")
            raise ocr_err
        
        # PaddleOCR result structure: result = [ [ [ [x1,y1],[x2,y2]... ], (text, confidence) ], ... ]
        # We need to flatten this to get full text and average confidence.
        
        extracted_lines = []
        scores = []
        
        # Handle different return formats from PaddleOCR
        if result and isinstance(result[0], dict):
            # Format seen in logs: [{'rec_texts': [...], 'rec_scores': [...], ...}]
            # Keys might be 'rec_texts' or 'rec_text', 'rec_scores' or 'rec_score'
            logger.info(f"OCR Result Keys: {result[0].keys()}")
            
            # Try to get text list
            extracted_lines = result[0].get('rec_texts', result[0].get('rec_text', []))
            
            # Try to get score list
            scores = result[0].get('rec_scores', result[0].get('rec_score', []))
            
            # If still empty, check if it's nested in another key like 'dt_polys' or similar if needed, 
            # but log shows 'rec_texts' is at root of the dict in result[0].
            
        else:
            # Standard/Legacy format: [[[[x1,y1]..], (text, score)], ...]
            # Safely handle various return types (None, [], [None], etc.)
            if result:
                # result is usually a list of lists.
                # If nothing found, it might be [None] or [] or None.
                pages = [page for page in result if page is not None]
                
                for page in pages:
                    for line in page:
                        # line structure: [[box], [text, score]]
                        if len(line) >= 2 and len(line[1]) >= 2:
                            text_content = line[1][0]
                            score = line[1][1]
                            extracted_lines.append(text_content)
                            scores.append(score)
        
        full_text = "\n".join(extracted_lines)
        avg_confidence = sum(scores) / len(scores) if scores else 0
        
        logger.info(f"Extracted Text Length: {len(full_text)}")
        logger.info(f"Extracted Text Preview: {full_text[:200]}")
        
        # Extract structured data using LLM
        structured_data = extract_structured_data_llm(full_text)
        logger.info(f"Structured Data: {structured_data}")
        
        return {
            "success": True,
            "text": full_text,
            "confidence": round(avg_confidence, 2),
            "metadata": {
                "file_name": file.filename,
                "file_size": len(contents),
                **structured_data
            }
        }
    
    except Exception as e:
        logger.error(f"OCR extraction failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    status = {"status": "healthy", "service": "OCR Service (PaddleOCR + Groq)"}
    if not GROQ_API_KEY:
        status["warning"] = "GROQ_API_KEY not set"
    return status

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


import requests
from PIL import Image, ImageDraw, ImageFont
import io

# Create dummy image
img = Image.new('RGB', (200, 100), color = (255, 255, 255))
d = ImageDraw.Draw(img)
d.text((10,10), "Patient Name: John Doe", fill=(0,0,0))
d.text((10,30), "Diagnosis: Fever", fill=(0,0,0))

# Save to buffer
buf = io.BytesIO()
img.save(buf, format='PNG')
buf.seek(0)

# Send request
try:
    files = {'file': ('test.png', buf, 'image/png')}
    response = requests.post('http://localhost:8000/api/ocr/extract', files=files)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")

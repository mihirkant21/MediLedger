const axios = require('axios');
const Document = require('../models/Document');

const OCR_SERVICE_URL = process.env.OCR_SERVICE_URL || 'http://localhost:8000';

exports.extractText = async (req, res, next) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Send to OCR service using buffer (Multer MemoryStorage)
    const FormData = require('form-data');
    const formData = new FormData();
    
    // Convert buffer to a stream-like object for form-data to handle it properly
    formData.append('file', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
      knownLength: file.size
    });

    const response = await axios.post(`${OCR_SERVICE_URL}/api/ocr/extract`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      maxBodyLength: Infinity
    });

    console.log('OCR Service Response Data:', JSON.stringify(response.data, null, 2));

    res.json({
      success: true,
      text: response.data.text,
      confidence: response.data.confidence,
      metadata: response.data.metadata
    });
  } catch (error) {
    console.error('OCR service error:', error);
    res.status(500).json({
      success: false,
      message: 'OCR processing failed',
      error: error.message,
      stack: error.stack,
      response: error.response ? error.response.data : null
    });
  }
};

exports.processDocument = async (req, res, next) => {
  try {
    const { documentId } = req.body;
    const userId = req.user.id || req.user._id || req.user.userId;

    const document = await Document.getDocumentById(userId, documentId);

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    await Document.updateDocument(userId, documentId, { ocrStatus: 'processing' });

    res.json({ success: true, message: 'OCR processing started', jobId: documentId });
  } catch (error) {
    next(error);
  }
};

exports.getOCRStatus = async (req, res, next) => {
  try {
    // Note: If we don't have userId here, it's better to fetch all docs for this user and find it,
    // or just assume req.params.jobId is documentId and we use req.user.id.
    const userId = req.user.id || req.user._id || req.user.userId;
    const documentId = req.params.jobId;

    const document = await Document.getDocumentById(userId, documentId);

    if (!document) {
        // If not found by documentId, fallback to check if any doc has this ocrJobId (edge case)
        const docs = await Document.getDocumentsByUser(userId);
        const matchedJob = docs.find(d => d.ocrJobId === req.params.jobId);
        if (matchedJob) {
            return res.json({ success: true, status: matchedJob.ocrStatus, text: matchedJob.ocrText });
        }
        return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.json({ success: true, status: document.ocrStatus, text: document.ocrText });
  } catch (error) {
    next(error);
  }
};

exports.correctOCRText = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id || req.user.userId;
    const documentId = req.params.documentId;

    const document = await Document.getDocumentById(userId, documentId);

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const updatedDocument = await Document.updateDocument(userId, documentId, { ocrText: req.body.correctedText });

    res.json({ success: true, data: { ...updatedDocument, _id: updatedDocument.documentId } });
  } catch (error) {
    next(error);
  }
};

const axios = require('axios');
const Document = require('../models/Document');

const OCR_SERVICE_URL = process.env.OCR_SERVICE_URL || 'http://localhost:8000';

exports.extractText = async (req, res, next) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Send to OCR service
    const FormData = require('form-data');
    const fs = require('fs');
    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.path));

    const response = await axios.post(`${OCR_SERVICE_URL}/api/ocr/extract`, formData, {
      headers: formData.getHeaders()
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

    const document = await Document.findOne({ _id: documentId, user: req.user._id });

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    document.ocrStatus = 'processing';
    await document.save();

    // Process asynchronously (implement actual OCR processing)

    res.json({ success: true, message: 'OCR processing started', jobId: documentId });
  } catch (error) {
    next(error);
  }
};

exports.getOCRStatus = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.jobId);

    if (!document) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.json({ success: true, status: document.ocrStatus, text: document.ocrText });
  } catch (error) {
    next(error);
  }
};

exports.correctOCRText = async (req, res, next) => {
  try {
    const document = await Document.findOneAndUpdate(
      { _id: req.params.documentId, user: req.user._id },
      { ocrText: req.body.correctedText },
      { new: true }
    );

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    res.json({ success: true, data: document });
  } catch (error) {
    next(error);
  }
};

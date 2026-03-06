const Document = require('../models/Document');
const crypto = require('crypto');

exports.uploadDocument = async (req, res, next) => {
  try {
    const { metadata, ocrText } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const parsedMetadata = JSON.parse(metadata || '{}');

    const document = await Document.create({
      user: req.user._id,
      title: parsedMetadata.title || file.originalname,
      documentType: parsedMetadata.documentType || 'other',
      fileName: file.originalname,
      filePath: file.path,
      fileUrl: file.path.startsWith('http') ? file.path : `/uploads/${file.filename}`,
      fileSize: file.size,
      mimeType: file.mimetype,
      patientName: parsedMetadata.patientName,
      patientAge: parsedMetadata.patientAge,
      patientGender: parsedMetadata.patientGender,
      doctorName: parsedMetadata.doctorName,
      hospitalName: parsedMetadata.hospitalName,
      date: parsedMetadata.date,
      notes: parsedMetadata.notes,
      diagnosis: parsedMetadata.diagnosis,
      medicines: parsedMetadata.medicines, // Assumes array or handles it
      symptoms: parsedMetadata.symptoms,
      tests: parsedMetadata.tests,
      ocrText: ocrText,
      ocrStatus: 'completed'
    });

    res.status(201).json({ success: true, document });
  } catch (error) {
    next(error);
  }
};

exports.getAllDocuments = async (req, res, next) => {
  try {
    const { documentType, limit = 50, sort = '-createdAt' } = req.query;

    const query = { user: req.user._id };
    if (documentType) query.documentType = documentType;

    const documents = await Document.find(query).sort(sort).limit(parseInt(limit));
    const total = await Document.countDocuments(query);

    res.json({ success: true, documents, total });
  } catch (error) {
    next(error);
  }
};

exports.getDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, user: req.user._id });

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    res.json({ success: true, data: document });
  } catch (error) {
    next(error);
  }
};

exports.updateDocument = async (req, res, next) => {
  try {
    const document = await Document.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    res.json({ success: true, data: document });
  } catch (error) {
    next(error);
  }
};

exports.deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    res.json({ success: true, message: 'Document deleted' });
  } catch (error) {
    next(error);
  }
};

exports.getTimeline = async (req, res, next) => {
  try {
    const { documentType } = req.query;
    const query = { user: req.user._id };
    if (documentType) query.documentType = documentType;

    const documents = await Document.find(query).sort({ date: -1, createdAt: -1 });

    res.json({ success: true, documents });
  } catch (error) {
    next(error);
  }
};

const Document = require('../models/Document');
const { uploadToS3, deleteFromS3 } = require('../config/s3');

exports.uploadDocument = async (req, res, next) => {
  try {
    const data = req.validatedData || req.body;
    let { metadata, ocrText } = data;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const userId = req.user.id || req.user._id || req.user.userId;

    let parsedFileTypes = [];
    if (req.body.fileTypes) {
      try {
        parsedFileTypes = JSON.parse(req.body.fileTypes);
      } catch(e) {
        console.warn('Failed to parse fileTypes JSON', e);
      }
    }

    // Upload all files to S3
    const uploadedFiles = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const { key, fileUrl } = await uploadToS3(file, userId);
      uploadedFiles.push({
        fileName: file.originalname,
        documentType: parsedFileTypes[i] || 'other',
        filePath: key,
        fileUrl: fileUrl,
        fileSize: file.size,
        mimeType: file.mimetype
      });
    }

    // Backwards compatibility: expose the primary (first) file's properties on the root level
    const primaryFile = uploadedFiles[0];

    const documentItem = {
      userId,
      title: data.title || primaryFile.fileName,
      documentType: data.documentType || 'other',
      
      // Legacy structure for older frontend code
      fileName: primaryFile.fileName,
      filePath: primaryFile.filePath,
      fileUrl: primaryFile.fileUrl,
      fileSize: primaryFile.fileSize,
      mimeType: primaryFile.mimeType,
      
      // New array structure
      files: uploadedFiles,
      patientName: data.patientName,
      patientAge: data.patientAge,
      patientGender: data.patientGender,
      doctorName: data.doctorName,
      hospitalName: data.hospitalName,
      date: data.date,
      notes: data.notes,
      diagnosis: data.diagnosis,
      medicines: data.medicines,
      symptoms: data.symptoms,
      tests: data.tests,
      ocrText: ocrText || data.ocrText,
      ocrStatus: data.ocrStatus || (ocrText ? 'completed' : 'pending'),
      ocrJobId: data.ocrJobId,
      ocrConfidence: data.ocrConfidence,
    };

    const document = await Document.createDocument(documentItem);

    res.status(201).json({ success: true, document: { ...document, _id: document.documentId } }); // Frontend depends on _id
  } catch (error) {
    next(error);
  }
};

exports.getAllDocuments = async (req, res, next) => {
  try {
    const { documentType, limit = 50 } = req.query;
    const userId = req.user.id || req.user._id || req.user.userId;

    let documents = await Document.getDocumentsByUser(userId);

    if (documentType) {
      documents = documents.filter(doc => 
        doc.documentType === documentType || 
        (doc.files && doc.files.some(f => f.documentType === documentType))
      );
    }
    
    // limit results
    const limitedDocuments = documents.slice(0, parseInt(limit));

    // Map `documentId` to `_id` for frontend compatibility
    const formattedDocs = limitedDocuments.map(doc => ({ ...doc, _id: doc.documentId }));

    res.json({ success: true, documents: formattedDocs, total: documents.length });
  } catch (error) {
    next(error);
  }
};

exports.getDocument = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id || req.user.userId;
    const documentId = req.params.id;

    const document = await Document.getDocumentById(userId, documentId);

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    res.json({ success: true, document: { ...document, _id: document.documentId } });
  } catch (error) {
    next(error);
  }
};

exports.downloadDocument = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id || req.user.userId;
    const documentId = req.params.id;
    const fileIndex = req.query.fileIndex;

    const document = await Document.getDocumentById(userId, documentId);

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    let targetFilePath = document.filePath;
    let targetFileName = document.fileName || 'document.pdf';

    if (fileIndex !== undefined && document.files && document.files[parseInt(fileIndex)]) {
      const targetFile = document.files[parseInt(fileIndex)];
      targetFilePath = targetFile.filePath;
      targetFileName = targetFile.fileName || 'document.pdf';
    }

    if (!targetFilePath) {
      return res.status(404).json({ success: false, message: 'File path not available' });
    }

    const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
    const { GetObjectCommand } = require('@aws-sdk/client-s3');
    const { s3Client } = require('../config/s3');
    
    const getCommand = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: targetFilePath,
      ResponseContentDisposition: `attachment; filename="${targetFileName}"`
    });

    const downloadUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 }); // 1 hour

    res.json({ success: true, downloadUrl });
  } catch (error) {
    next(error);
  }
};

exports.updateDocument = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id || req.user.userId;
    const documentId = req.params.id;
    const updates = req.validatedData || req.body;

    const existingDocument = await Document.getDocumentById(userId, documentId);
    if (!existingDocument) {
        return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const updatedDocument = await Document.updateDocument(userId, documentId, updates);

    res.json({ success: true, data: { ...updatedDocument, _id: updatedDocument.documentId } });
  } catch (error) {
    next(error);
  }
};

exports.deleteDocument = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id || req.user.userId;
    const documentId = req.params.id;

    const document = await Document.getDocumentById(userId, documentId);

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Delete from S3
    try {
      if (document.files && document.files.length > 0) {
        for (const file of document.files) {
          if (file.filePath) await deleteFromS3(file.filePath);
        }
      } else if (document.filePath) {
        await deleteFromS3(document.filePath);
      }
    } catch (s3Error) {
      console.error('Failed to delete files from S3:', s3Error);
    }

    await Document.deleteDocument(userId, documentId);

    res.json({ success: true, message: 'Document deleted' });
  } catch (error) {
    next(error);
  }
};

exports.getTimeline = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id || req.user.userId;
    const { documentType } = req.query;

    let documents = await Document.getDocumentsByUser(userId);

    if (documentType) {
      documents = documents.filter(doc => 
        doc.documentType === documentType || 
        (doc.files && doc.files.some(f => f.documentType === documentType))
      );
    }
    
    // Sort logic to match Mongoose: { date: -1, createdAt: -1 }
    documents.sort((a, b) => {
        const dateA = new Date(a.date || a.createdAt).getTime();
        const dateB = new Date(b.date || b.createdAt).getTime();
        if (dateA !== dateB) return dateB - dateA;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const formattedDocs = documents.map(doc => ({ ...doc, _id: doc.documentId }));

    res.json({ success: true, documents: formattedDocs });
  } catch (error) {
    next(error);
  }
};

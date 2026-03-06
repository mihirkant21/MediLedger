const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const documentController = require('../controllers/documentController');
const validate = require('../middleware/validate');
const { uploadDocumentSchema, updateDocumentSchema } = require('../validators/document');

router.post('/upload', protect, upload.array('files', 10), validate(uploadDocumentSchema), documentController.uploadDocument);
router.get('/', protect, documentController.getAllDocuments);
router.get('/timeline', protect, documentController.getTimeline);
router.get('/:id', protect, documentController.getDocument);
router.get('/:id/download', protect, documentController.downloadDocument);
router.put('/:id', protect, validate(updateDocumentSchema), documentController.updateDocument);
router.delete('/:id', protect, documentController.deleteDocument);

module.exports = router;

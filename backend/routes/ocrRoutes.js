const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const ocrController = require('../controllers/ocrController');

router.post('/process', protect, ocrController.processDocument);
router.post('/extract', protect, upload.single('file'), ocrController.extractText);
router.get('/status/:jobId', protect, ocrController.getOCRStatus);
router.post('/correct/:documentId', protect, ocrController.correctOCRText);

module.exports = router;

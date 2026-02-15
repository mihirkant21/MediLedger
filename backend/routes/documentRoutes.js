const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const documentController = require('../controllers/documentController');

router.post('/upload', protect, upload.single('file'), documentController.uploadDocument);
router.get('/', protect, documentController.getAllDocuments);
router.get('/timeline', protect, documentController.getTimeline);
router.get('/:id', protect, documentController.getDocument);
router.put('/:id', protect, documentController.updateDocument);
router.delete('/:id', protect, documentController.deleteDocument);

module.exports = router;

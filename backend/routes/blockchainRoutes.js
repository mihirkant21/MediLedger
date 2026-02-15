const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const blockchainController = require('../controllers/blockchainController');

router.post('/hash', protect, blockchainController.hashDocument);
router.post('/verify', protect, blockchainController.verifyDocument);
router.get('/hash/:documentId', protect, blockchainController.getDocumentHash);
router.post('/register', protect, blockchainController.registerOnChain);
router.post('/verify-chain', blockchainController.verifyOnChain);
router.get('/contract/:hash', blockchainController.getContractInfo);

module.exports = router;

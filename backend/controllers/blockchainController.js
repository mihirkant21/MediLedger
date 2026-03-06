const Document = require('../models/Document');
const blockchainService = require('../services/blockchainService');

exports.hashDocument = async (req, res, next) => {
  try {
    const { documentId } = req.body;

    const document = await Document.findOne({ _id: documentId, user: req.user._id });

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Generate hash using the consistent method in blockchainService
    // We pass the document object directly as it contains the needed fields
    const hash = blockchainService.generateHash(document);

    document.blockchainHash = hash;
    document.blockchainTimestamp = new Date();
    await document.save();

    res.json({ success: true, hash, documentId });
  } catch (error) {
    next(error);
  }
};

exports.verifyDocument = async (req, res, next) => {
  try {
    const { documentId, hash } = req.body;

    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const calculatedHash = blockchainService.generateHash(document);
    const verified = calculatedHash === hash && document.blockchainHash === hash;

    res.json({ success: true, verified, hash: calculatedHash });
  } catch (error) {
    next(error);
  }
};

exports.getDocumentHash = async (req, res, next) => {
  try {
    const document = await Document.findOne({ _id: req.params.documentId, user: req.user._id });

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    res.json({ success: true, hash: document.blockchainHash });
  } catch (error) {
    next(error);
  }
};

exports.registerOnChain = async (req, res, next) => {
  try {
    const { documentId } = req.body;

    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const hash = document.blockchainHash || blockchainService.generateHash(document);

    // Register on blockchain
    const txResult = await blockchainService.registerDocument(hash);

    document.blockchainHash = hash;
    document.blockchainTxHash = txResult.transactionHash;
    document.blockchainVerified = true;
    document.blockchainTimestamp = new Date();
    await document.save();

    res.json({ success: true, hash, transactionHash: txResult.transactionHash });
  } catch (error) {
    next(error);
  }
};

exports.verifyOnChain = async (req, res, next) => {
  try {
    const { hash } = req.body;

    const document = await Document.findOne({ blockchainHash: hash });

    if (!document) {
      return res.status(404).json({ success: false, verified: false, message: 'Document not found in database (search by hash)' });
    }

    // Check actual blockchain state
    const chainResult = await blockchainService.verifyDocument(hash);

    res.json({
      success: true,
      verified: chainResult.exists,
      timestamp: chainResult.timestamp,
      owner: chainResult.owner,
      dbMatched: true
    });
  } catch (error) {
    next(error);
  }
};

exports.getContractInfo = async (req, res, next) => {
  try {
    const { hash } = req.params;

    const document = await Document.findOne({ blockchainHash: hash });

    // Even if not in DB, we could check chain, but for now stick to DB record existing
    if (!document) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    res.json({
      success: true,
      contract: {
        hash: document.blockchainHash,
        transactionHash: document.blockchainTxHash,
        verified: document.blockchainVerified,
        timestamp: document.blockchainTimestamp,
        owner: document.user
      }
    });
  } catch (error) {
    next(error);
  }
};


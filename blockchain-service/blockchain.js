const { ethers } = require('ethers');
const crypto = require('crypto');
require('dotenv').config();

class BlockchainService {
  constructor() {
    this.provider = null;
    this.contract = null;
    this.wallet = null;
    this.initialize();
  }

  initialize() {
    try {
      // Initialize provider
      this.provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
      
      // Initialize wallet
      this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
      
      // Contract ABI (simplified version)
      const contractABI = [
        "function registerDocument(bytes32 _documentHash) public",
        "function verifyDocument(bytes32 _documentHash) public view returns (bool, address, uint256)",
        "function getUserDocuments(address _owner) public view returns (bytes32[])",
        "event DocumentRegistered(bytes32 indexed documentHash, address indexed owner, uint256 timestamp)"
      ];
      
      // Initialize contract
      this.contract = new ethers.Contract(
        process.env.CONTRACT_ADDRESS,
        contractABI,
        this.wallet
      );
      
      console.log('✅ Blockchain service initialized');
    } catch (error) {
      console.error('❌ Blockchain initialization failed:', error);
    }
  }

  // Generate SHA-256 hash of document
  generateHash(documentData) {
    return crypto.createHash('sha256').update(JSON.stringify(documentData)).digest('hex');
  }

  // Register document on blockchain
  async registerDocument(documentHash) {
    try {
      const hashBytes = ethers.encodeBytes32String(documentHash);
      const tx = await this.contract.registerDocument(hashBytes);
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        documentHash: documentHash
      };
    } catch (error) {
      console.error('Blockchain registration failed:', error);
      throw error;
    }
  }

  // Verify document on blockchain
  async verifyDocument(documentHash) {
    try {
      const hashBytes = ethers.encodeBytes32String(documentHash);
      const [exists, owner, timestamp] = await this.contract.verifyDocument(hashBytes);
      
      return {
        verified: exists,
        owner: owner,
        timestamp: new Date(Number(timestamp) * 1000).toISOString(),
        documentHash: documentHash
      };
    } catch (error) {
      console.error('Blockchain verification failed:', error);
      return { verified: false, error: error.message };
    }
  }

  // Get user documents
  async getUserDocuments(userAddress) {
    try {
      const documents = await this.contract.getUserDocuments(userAddress);
      return {
        success: true,
        documents: documents.map(hash => ethers.decodeBytes32String(hash))
      };
    } catch (error) {
      console.error('Failed to get user documents:', error);
      throw error;
    }
  }
}

module.exports = new BlockchainService();

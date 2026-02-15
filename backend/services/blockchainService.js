const { ethers } = require('ethers');
const crypto = require('crypto');
require('dotenv').config();

class BlockchainService {
    constructor() {
        this.provider = null;
        this.wallet = null;
        this.contract = null;
        this.contractAddress = process.env.CONTRACT_ADDRESS;
        this.rpcUrl = process.env.BLOCKCHAIN_RPC_URL;
        this.privateKey = process.env.PRIVATE_KEY;

        // ABI for the MedicalRecords contract
        this.contractABI = [
            "function registerDocument(bytes32 _documentHash) public",
            "function verifyDocument(bytes32 _documentHash) public view returns (bool, address, uint256)",
            "function getUserDocuments(address _owner) public view returns (bytes32[])",
            "event DocumentRegistered(bytes32 indexed documentHash, address indexed owner, uint256 timestamp)"
        ];

        this.initialize();
    }

    initialize() {
        try {
            if (this.rpcUrl && this.privateKey && this.contractAddress) {
                this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
                this.wallet = new ethers.Wallet(this.privateKey, this.provider);
                this.contract = new ethers.Contract(this.contractAddress, this.contractABI, this.wallet);
                console.log('✅ Blockchain Service Initialized');
            } else {
                console.warn('⚠️ Blockchain Service: Missing configuration (RPC, Key, or Address). processing will be simulated or fail.');
            }
        } catch (error) {
            console.error('❌ Blockchain Service Initialization Error:', error);
        }
    }

    generateHash(documentData) {
        // Determine what data to hash. 
        // Consistent with the controller's previous logic or define a standard here.
        // We should strictly define what constitutes the "document" for hashing purposes.
        // Usually it's the file content hash + metadata, or just a unique ID, or user defined.
        // For this app, let's hash specific fields as seen in the controller before,
        // OR if we receive a pre-calculated hash from frontend/controller, we use that.

        // Implementation matching previous controller logic for consistency:
        const dataString = JSON.stringify({
            title: documentData.title,
            documentType: documentData.documentType,
            ocrText: documentData.ocrText,
            date: documentData.date,
            doctorName: documentData.doctorName,
            hospitalName: documentData.hospitalName
        });

        return crypto.createHash('sha256').update(dataString).digest('hex');
    }

    async registerDocument(documentHash) {
        if (!this.contract) {
            throw new Error('Blockchain service not initialized');
        }

        try {
            console.log(`🔗 Registering document hash on blockchain: ${documentHash}`);

            // Ensure hash is 0x prefixed for bytes32
            const formattedHash = documentHash.startsWith('0x') ? documentHash : `0x${documentHash}`;

            const tx = await this.contract.registerDocument(formattedHash);
            console.log(`⏳ Transaction sent: ${tx.hash}`);

            const receipt = await tx.wait();
            console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);

            return {
                success: true,
                transactionHash: receipt.hash, // ethers v6 uses .hash, v5 uses .transactionHash usually check receipt
                blockNumber: receipt.blockNumber
            };
        } catch (error) {
            console.error('❌ Blockchain Registration Failed:', error);
            // Check for specific revert reasons if needed
            if (error.reason) console.error('Revert Reason:', error.reason);
            throw error;
        }
    }

    async verifyDocument(documentHash) {
        if (!this.contract) {
            throw new Error('Blockchain service not initialized');
        }

        try {
            const formattedHash = documentHash.startsWith('0x') ? documentHash : `0x${documentHash}`;
            const result = await this.contract.verifyDocument(formattedHash);

            // Result is [bool exists, address owner, uint256 timestamp]
            return {
                exists: result[0],
                owner: result[1],
                timestamp: Number(result[2]), // Convert BigInt to Number (timestamps fit in safe integer range)
                verified: result[0]
            };
        } catch (error) {
            console.error('❌ Blockchain Verification Failed:', error);
            throw error;
        }
    }
}

module.exports = new BlockchainService();

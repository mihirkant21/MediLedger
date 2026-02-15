require('dotenv').config();
const blockchainService = require('./services/blockchainService');

async function testConnection() {
    console.log('Testing Blockchain Connection...');
    console.log('RPC URL:', process.env.BLOCKCHAIN_RPC_URL ? 'Set' : 'Not Set');
    console.log('Contract Address:', process.env.CONTRACT_ADDRESS ? 'Set' : 'Not Set');

    try {
        if (!process.env.BLOCKCHAIN_RPC_URL) {
            throw new Error('BLOCKCHAIN_RPC_URL is missing in .env');
        }

        const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
        const network = await provider.getNetwork();
        console.log(`✅ Connected to network: ${network.name} (Chain ID: ${network.chainId})`);

        if (process.env.CONTRACT_ADDRESS) {
            console.log('Verifying contract existence...');
            const code = await provider.getCode(process.env.CONTRACT_ADDRESS);
            if (code === '0x') {
                console.warn('⚠️  Contract address has no code (it might be an EOA or incorrect address)');
            } else {
                console.log('✅ Contract found at address');
            }
        }

    } catch (error) {
        console.error('❌ Connection failed:', error.message);
    }
}

// Mock ethers for standalone test if needed, but here we assume context of app
const { ethers } = require('ethers');
testConnection();

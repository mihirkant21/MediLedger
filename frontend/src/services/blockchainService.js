import api from './api'

export const blockchainService = {
  async hashDocument(documentId) {
    const response = await api.post('/blockchain/hash', { documentId })
    return response.data
  },

  async verifyDocument(documentId, hash) {
    const response = await api.post('/blockchain/verify', { documentId, hash })
    return response.data
  },

  async getContractInfo(hash) {
    const response = await api.get(`/blockchain/contract/${hash}`)
    return response.data
  },

  async getDocumentHash(documentId) {
    const response = await api.get(`/blockchain/hash/${documentId}`)
    return response.data
  },

  async registerOnChain(documentData) {
    const response = await api.post('/blockchain/register', documentData)
    return response.data
  },

  async verifyOnChain(hash, originalData) {
    const response = await api.post('/blockchain/verify-chain', { hash, originalData })
    return response.data
  }
}

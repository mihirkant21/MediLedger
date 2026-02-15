import api from './api'
import axios from 'axios'

export const ocrService = {
  async processDocument(documentId) {
    const response = await api.post('/ocr/process', { documentId })
    return response.data
  },

  async getOCRStatus(jobId) {
    const response = await api.get(`/ocr/status/${jobId}`)
    return response.data
  },

  async extractText(file) {
    const formData = new FormData()
    formData.append('file', file)

    const token = localStorage.getItem('token')
    // Use axios directly to avoid default Content-Type: application/json from api instance
    // This allows the browser to correctly set Content-Type: multipart/form-data with boundary
    const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/ocr/extract`, formData, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })
    return response.data
  },

  async correctOCRText(documentId, corrections) {
    const response = await api.post(`/ocr/correct/${documentId}`, corrections)
    return response.data
  }
}

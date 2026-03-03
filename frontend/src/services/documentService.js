import api from './api'
import axios from 'axios'

export const documentService = {
  async uploadDocument(formData, onUploadProgress) {
    const token = localStorage.getItem('token')
    const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/documents/upload`, formData, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      onUploadProgress
    })
    return response.data
  },

  async getAllDocuments(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString()
    const response = await api.get(`/documents?${queryParams}`)
    return response.data
  },

  async getDocument(id) {
    const response = await api.get(`/documents/${id}`)
    return response.data
  },

  async updateDocument(id, data) {
    const response = await api.put(`/documents/${id}`, data)
    return response.data
  },

  async deleteDocument(id) {
    const response = await api.delete(`/documents/${id}`)
    return response.data
  },

  async getTimeline(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString()
    const response = await api.get(`/documents/timeline?${queryParams}`)
    return response.data
  }
}

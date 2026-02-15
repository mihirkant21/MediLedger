import api from './api'

export const documentService = {
  async uploadDocument(formData, onUploadProgress) {
    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
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

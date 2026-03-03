import api from './api'

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  async verifyOTP(email, otp) {
    const response = await api.post('/auth/verify-otp', { email, otp })
    return response.data
  },

  async googleLogin(credential) {
    const response = await api.post('/auth/google', { credential })
    return response.data
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me')
    return response.data
  },

  logout() {
    localStorage.removeItem('token')
  }
}

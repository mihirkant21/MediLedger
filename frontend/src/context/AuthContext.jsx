import { createContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token')
      if (storedToken) {
        try {
          const response = await authService.getCurrentUser()
          setUser(response.data) // Extract nested data
          setToken(storedToken)
        } catch (error) {
          console.error('Failed to fetch user:', error)
          localStorage.removeItem('token')
          setToken(null)
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email, password) => {
    const response = await authService.login(email, password)
    setUser(response.user)
    setToken(response.token)
    localStorage.setItem('token', response.token)
    return response
  }

  const register = async (userData) => {
    // Note: register now returns a success message asking for OTP,
    // it no longer returns the user/token immediately.
    const response = await authService.register(userData)
    return response
  }

  const verifyOTP = async (email, otp) => {
    const response = await authService.verifyOTP(email, otp)
    setUser(response.user)
    setToken(response.token)
    localStorage.setItem('token', response.token)
    return response
  }

  const googleLogin = async (credential) => {
    const response = await authService.googleLogin(credential)
    setUser(response.user)
    setToken(response.token)
    localStorage.setItem('token', response.token)
    return response
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    authService.logout()
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    verifyOTP,
    googleLogin,
    logout,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

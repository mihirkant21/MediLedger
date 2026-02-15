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
          const userData = await authService.getCurrentUser()
          setUser(userData)
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
    const response = await authService.register(userData)
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
    logout,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

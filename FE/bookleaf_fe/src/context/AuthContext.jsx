import { createContext, useContext, useState, useCallback } from 'react'
import authApi from '../api/auth.api.js'

const AuthContext = createContext(null)

const TOKEN_KEY = 'bl_token'
const USER_KEY  = 'bl_user'

export const AuthProvider = ({ children }) => {
  const [user,  setUser]  = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const login = useCallback(async (credentials) => {
    setLoading(true)
    setError(null)
    try {
      const res = await authApi.login(credentials)
      const { token: newToken, user: newUser } = res.data
      localStorage.setItem(TOKEN_KEY, newToken)
      localStorage.setItem(USER_KEY, JSON.stringify(newUser))
      setToken(newToken)
      setUser(newUser)
      return newUser
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const isAdmin  = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
  const isAuthor = user?.role === 'AUTHOR'

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, logout, isAdmin, isAuthor }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

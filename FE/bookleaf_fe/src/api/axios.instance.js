import axios from 'axios'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ''}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 1500000,
})

// ── Request interceptor: attach JWT ───────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bl_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response interceptor: unwrap data / handle 401 ────────
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('bl_token')
      localStorage.removeItem('bl_user')
      window.location.href = '/login'
    }
    const message =
      error.response?.data?.message || error.message || 'Something went wrong'
    return Promise.reject(new Error(message))
  },
)

export default api

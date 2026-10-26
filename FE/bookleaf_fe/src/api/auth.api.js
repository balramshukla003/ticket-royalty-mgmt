import api from './axios.instance.js'

const authApi = {
  login:  (credentials) => api.post('/auth/login', credentials),
  getMe:  ()            => api.get('/auth/me'),
}

export default authApi

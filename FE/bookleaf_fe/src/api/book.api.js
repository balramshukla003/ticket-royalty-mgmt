import api from './axios.instance.js'

const bookApi = {
  getMyBooks:   ()   => api.get('/books'),
  getBookById:  (id) => api.get(`/books/${id}`),
  getDropdown:  ()   => api.get('/books/dropdown'),
}

export default bookApi

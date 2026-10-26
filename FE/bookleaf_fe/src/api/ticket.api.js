import api from './axios.instance.js'

const ticketApi = {
  create:        (data)           => api.post('/tickets', data),
  getMyTickets:  (params)         => api.get('/tickets', { params }),
  getTicketById: (id)             => api.get(`/tickets/${id}`),
  reply:         (id, data)       => api.post(`/tickets/${id}/reply`, data),
}

export default ticketApi

import api from './axios.instance.js'

const adminApi = {
  getTickets:       (params) => api.get('/admin/tickets', { params }),
  getTicketById:    (id)     => api.get(`/admin/tickets/${id}`),
  updateStatus:     (id, status)   => api.patch(`/admin/tickets/${id}/status`,   { status }),
  overrideCategory: (id, category) => api.patch(`/admin/tickets/${id}/category`, { category }),
  overridePriority: (id, priority) => api.patch(`/admin/tickets/${id}/priority`, { priority }),
  assignToSelf:     (id)           => api.patch(`/admin/tickets/${id}/assign`),
  reply:            (id, data)     => api.post(`/admin/tickets/${id}/reply`, data),
  addNote:          (id, body)     => api.post(`/admin/tickets/${id}/notes`, { body }),
  generateDraft:    (id)           => api.post(`/admin/tickets/${id}/draft`),
}

export default adminApi

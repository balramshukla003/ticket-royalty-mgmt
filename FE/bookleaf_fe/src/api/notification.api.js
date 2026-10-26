import api from './axios.instance.js'

const notificationApi = {
  getAll:       ()   => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markRead:     (id) => api.patch(`/notifications/${id}/read`),
  markAllRead:  ()   => api.patch('/notifications/read-all'),
}

export default notificationApi

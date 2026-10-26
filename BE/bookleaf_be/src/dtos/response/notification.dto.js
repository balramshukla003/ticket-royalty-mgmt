export const toNotificationDTO = (n) => ({
  id:        n.id,
  type:      n.type,
  title:     n.title,
  body:      n.body,
  ticketId:  n.ticket_id,
  isRead:    !!n.is_read,
  readAt:    n.read_at,
  createdAt: n.created_at,
});

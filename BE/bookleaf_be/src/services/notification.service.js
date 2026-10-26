import notificationRepository      from '../repositories/notification.repository.js';
import { toNotificationDTO }        from '../dtos/response/notification.dto.js';
import { emitToUser, emitToAdmins } from '../core/realtime/emitter.js';
import { SOCKET_EVENTS, NOTIFICATION_TYPE } from '../constants/index.js';
import prisma from '../config/db.js';

const notificationService = {
  // ── Notify all admins about a new ticket ──────────────────
  notifyAdminsNewTicket: async (ticket, authorName) => {
    const admins = await prisma.users.findMany({
      where:  { role: { in: ['ADMIN', 'SUPER_ADMIN'] }, is_active: true },
      select: { id: true },
    });

    const notifications = admins.map((admin) => ({
      user_id:   admin.id,
      type:      NOTIFICATION_TYPE.TICKET_CREATED,
      title:     `New ticket from ${authorName}`,
      body:      ticket.subject,
      ticket_id: ticket.id,
    }));

    await notificationRepository.createMany(notifications);

    const payload = { ticketId: ticket.id, title: `New ticket from ${authorName}`, body: ticket.subject };
    emitToAdmins(SOCKET_EVENTS.NOTIFICATION, payload);
    emitToAdmins(SOCKET_EVENTS.TICKET_CREATED, { ticketId: ticket.id });
  },

  // ── Notify author of admin reply ──────────────────────────
  notifyAuthorReply: async (ticket, authorId) => {
    const n = await notificationRepository.create({
      user_id:   authorId,
      type:      NOTIFICATION_TYPE.TICKET_REPLY,
      title:     'Admin replied to your ticket',
      body:      ticket.subject,
      ticket_id: ticket.id,
    });

    const payload = toNotificationDTO(n);
    emitToUser(authorId, SOCKET_EVENTS.NOTIFICATION, payload);
    emitToTicket(ticket.id, SOCKET_EVENTS.TICKET_MESSAGE, { ticketId: ticket.id });
  },

  // ── Notify author of status change ────────────────────────
  notifyAuthorStatusChange: async (ticket, authorId, newStatus) => {
    const n = await notificationRepository.create({
      user_id:   authorId,
      type:      NOTIFICATION_TYPE.TICKET_STATUS_CHANGED,
      title:     `Your ticket has been ${newStatus.toLowerCase()}`,
      body:      ticket.subject,
      ticket_id: ticket.id,
    });

    emitToUser(authorId, SOCKET_EVENTS.NOTIFICATION, toNotificationDTO(n));
    emitToTicket(ticket.id, SOCKET_EVENTS.TICKET_STATUS_CHANGED, { ticketId: ticket.id, status: newStatus });
  },

  // ── Notify assigned admin ──────────────────────────────────
  notifyAdminAssigned: async (ticket, adminId) => {
    const n = await notificationRepository.create({
      user_id:   adminId,
      type:      NOTIFICATION_TYPE.TICKET_ASSIGNED,
      title:     'Ticket assigned to you',
      body:      ticket.subject,
      ticket_id: ticket.id,
    });

    emitToUser(adminId, SOCKET_EVENTS.NOTIFICATION, toNotificationDTO(n));
    emitToAdmins(SOCKET_EVENTS.TICKET_ASSIGNED, { ticketId: ticket.id, adminId });
  },

  // ── Notify admins of AI failure ────────────────────────────
  notifyAdminsAiFailed: async (ticket) => {
    const admins = await prisma.users.findMany({
      where:  { role: { in: ['ADMIN', 'SUPER_ADMIN'] }, is_active: true },
      select: { id: true },
    });

    const notifications = admins.map((admin) => ({
      user_id:   admin.id,
      type:      NOTIFICATION_TYPE.AI_FAILED,
      title:     'AI classification failed',
      body:      `Ticket ${ticket.ticket_code} requires manual classification`,
      ticket_id: ticket.id,
    }));

    await notificationRepository.createMany(notifications);
    emitToAdmins(SOCKET_EVENTS.TICKET_AI_FAILED, { ticketId: ticket.id });
  },

  // ── Read operations ────────────────────────────────────────
  getMyNotifications: async (userId) => {
    const notifications = await notificationRepository.findByUser(userId);
    return notifications.map(toNotificationDTO);
  },

  getUnreadCount: (userId) => notificationRepository.countUnread(userId),

  markRead: (id, userId) => notificationRepository.markRead(id, userId),

  markAllRead: (userId) => notificationRepository.markAllRead(userId),
};

// helper needed inside the service
const { emitToTicket } = await import('../core/realtime/emitter.js');

export default notificationService;

import prisma from '../config/db.js';

const notificationRepository = {
  create: (data) => prisma.notifications.create({ data }),

  createMany: (dataArray) =>
    prisma.notifications.createMany({ data: dataArray }),

  findByUser: (userId, limit = 20) =>
    prisma.notifications.findMany({
      where:   { user_id: userId },
      orderBy: [{ is_read: 'asc' }, { created_at: 'desc' }],
      take:    limit,
    }),

  countUnread: (userId) =>
    prisma.notifications.count({ where: { user_id: userId, is_read: false } }),

  markRead: (id, userId) =>
    prisma.notifications.updateMany({
      where: { id, user_id: userId },
      data:  { is_read: true, read_at: new Date() },
    }),

  markAllRead: (userId) =>
    prisma.notifications.updateMany({
      where: { user_id: userId, is_read: false },
      data:  { is_read: true, read_at: new Date() },
    }),
};

export default notificationRepository;

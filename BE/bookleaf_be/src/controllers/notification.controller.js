import notificationService from '../services/notification.service.js';
import { ok }              from '../core/http/response.js';
import asyncHandler        from '../core/asyncHandler.js';

const notificationController = {
  getAll: asyncHandler(async (req, res) => {
    const notifications = await notificationService.getMyNotifications(req.user.id);
    return ok(res, notifications, 'Notifications fetched');
  }),

  getUnreadCount: asyncHandler(async (req, res) => {
    const count = await notificationService.getUnreadCount(req.user.id);
    return ok(res, { count }, 'Unread count fetched');
  }),

  markRead: asyncHandler(async (req, res) => {
    await notificationService.markRead(parseInt(req.params.id), req.user.id);
    return ok(res, null, 'Notification marked as read');
  }),

  markAllRead: asyncHandler(async (req, res) => {
    await notificationService.markAllRead(req.user.id);
    return ok(res, null, 'All notifications marked as read');
  }),
};

export default notificationController;

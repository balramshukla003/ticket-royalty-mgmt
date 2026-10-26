import { Router }              from 'express';
import notificationController  from '../controllers/notification.controller.js';
import authenticate            from '../middlewares/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/',              notificationController.getAll);
router.get('/unread-count',  notificationController.getUnreadCount);
router.patch('/read-all',    notificationController.markAllRead);
router.patch('/:id/read',    notificationController.markRead);

export default router;

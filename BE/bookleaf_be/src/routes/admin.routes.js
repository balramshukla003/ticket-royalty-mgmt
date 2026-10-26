import { Router }       from 'express';
import ticketController from '../controllers/ticket.controller.js';
import authenticate     from '../middlewares/authenticate.js';
import authorize        from '../middlewares/authorize.js';
import validate         from '../middlewares/validate.js';
import { ROLES }        from '../constants/index.js';
import {
  updateTicketStatusSchema,
  overrideCategorySchema,
  overridePrioritySchema,
  adminReplySchema,
  addNoteSchema,
} from '../dtos/request/ticket.dto.js';

const router = Router();

router.use(authenticate, authorize(ROLES.ADMIN));

// Ticket queue
router.get('/tickets',                   ticketController.adminGetAll);
router.get('/tickets/:id',               ticketController.adminGetById);

// Ticket lifecycle
router.patch('/tickets/:id/status',      validate(updateTicketStatusSchema), ticketController.updateStatus);
router.patch('/tickets/:id/category',    validate(overrideCategorySchema),   ticketController.overrideCategory);
router.patch('/tickets/:id/priority',    validate(overridePrioritySchema),   ticketController.overridePriority);
router.patch('/tickets/:id/assign',      ticketController.assignTicket);

// Messages and notes
router.post('/tickets/:id/reply',        validate(adminReplySchema),         ticketController.adminReply);
router.post('/tickets/:id/notes',        validate(addNoteSchema),            ticketController.addNote);

// AI
router.post('/tickets/:id/draft',        ticketController.generateDraft);

export default router;

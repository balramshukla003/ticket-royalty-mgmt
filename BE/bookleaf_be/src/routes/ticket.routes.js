import { Router }       from 'express';
import ticketController from '../controllers/ticket.controller.js';
import authenticate     from '../middlewares/authenticate.js';
import authorize        from '../middlewares/authorize.js';
import validate         from '../middlewares/validate.js';
import { ROLES }        from '../constants/index.js';
import {
  createTicketSchema,
  authorReplySchema,
} from '../dtos/request/ticket.dto.js';

const router = Router();

router.use(authenticate, authorize(ROLES.AUTHOR));

router.post('/',                 validate(createTicketSchema), ticketController.create);
router.get('/',                  ticketController.getMyTickets);
router.get('/:id',               ticketController.getMyTicketById);
router.post('/:id/reply',        validate(authorReplySchema),  ticketController.authorReply);

export default router;

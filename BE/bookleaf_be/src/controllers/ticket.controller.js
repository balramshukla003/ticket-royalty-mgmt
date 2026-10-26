import ticketService        from '../services/ticket.service.js';
import { ok, created }      from '../core/http/response.js';
import { paginated }        from '../core/http/response.js';
import asyncHandler         from '../core/asyncHandler.js';

const ticketController = {
  // ── Author side ───────────────────────────────────────────
  create: asyncHandler(async (req, res) => {
    const ticket = await ticketService.create(req.user.id, req.body);
    return created(res, ticket, 'Ticket created successfully');
  }),

  getMyTickets: asyncHandler(async (req, res) => {
    const { tickets, meta } = await ticketService.getMyTickets(req.user.id, req.query);
    return paginated(res, tickets, meta, 'Tickets fetched');
  }),

  getMyTicketById: asyncHandler(async (req, res) => {
    const ticket = await ticketService.getMyTicketById(parseInt(req.params.id), req.user.id);
    return ok(res, ticket, 'Ticket fetched');
  }),

  authorReply: asyncHandler(async (req, res) => {
    const message = await ticketService.authorReply(
      parseInt(req.params.id),
      req.user.id,
      req.body.body,
    );
    return created(res, message, 'Reply sent');
  }),

  // ── Admin side ────────────────────────────────────────────
  adminGetAll: asyncHandler(async (req, res) => {
    const { tickets, meta } = await ticketService.adminGetAll({
      ...req.query,
      adminId: req.user.id,
    });
    return paginated(res, tickets, meta, 'Tickets fetched');
  }),

  adminGetById: asyncHandler(async (req, res) => {
    const ticket = await ticketService.adminGetById(parseInt(req.params.id));
    return ok(res, ticket, 'Ticket fetched');
  }),

  updateStatus: asyncHandler(async (req, res) => {
    await ticketService.updateStatus(parseInt(req.params.id), req.body.status);
    return ok(res, null, 'Status updated');
  }),

  overrideCategory: asyncHandler(async (req, res) => {
    await ticketService.overrideCategory(parseInt(req.params.id), req.body.category);
    return ok(res, null, 'Category updated');
  }),

  overridePriority: asyncHandler(async (req, res) => {
    await ticketService.overridePriority(parseInt(req.params.id), req.body.priority);
    return ok(res, null, 'Priority updated');
  }),

  assignTicket: asyncHandler(async (req, res) => {
    await ticketService.assignTicket(parseInt(req.params.id), req.user.id);
    return ok(res, null, 'Ticket assigned');
  }),

  adminReply: asyncHandler(async (req, res) => {
    const message = await ticketService.adminReply(
      parseInt(req.params.id),
      req.user.id,
      req.body,
    );
    return created(res, message, 'Reply sent');
  }),

  addNote: asyncHandler(async (req, res) => {
    const note = await ticketService.addNote(
      parseInt(req.params.id),
      req.user.id,
      req.body.body,
    );
    return created(res, note, 'Note added');
  }),

  generateDraft: asyncHandler(async (req, res) => {
    const draft = await ticketService.generateDraft(parseInt(req.params.id));
    if (!draft) {
      return ok(res, { draft: null }, 'AI draft generation failed — write manually');
    }
    return ok(res, { draft }, 'AI draft generated');
  }),
};

export default ticketController;

import ticketRepository       from '../repositories/ticket.repository.js';
import bookRepository         from '../repositories/book.repository.js';
import notificationService    from './notification.service.js';
import { classifyTicket, fallbackClassify, generateDraft } from '../ai/ai.service.js';
import { toTicketDTO, toTicketListDTO } from '../dtos/response/ticket.dto.js';
import { NotFoundError, ForbiddenError } from '../core/errors/AppError.js';
import { parsePagination, buildMeta }    from '../core/http/pagination.js';
import { emitToAdmins, emitToTicket }    from '../core/realtime/emitter.js';
import { SOCKET_EVENTS, AI_STATUS }      from '../constants/index.js';
import prisma from '../config/db.js';
import logger from '../core/logger.js';

const ticketService = {
  // ── Author: create ticket ─────────────────────────────────
  create: async (authorId, body) => {
    const { bookId, subject, description } = body;

    // Verify book ownership if a book is specified
    if (bookId) {
      const book = await bookRepository.findByIdAndAuthor(bookId, authorId);
      if (!book) throw new NotFoundError('Book');
    }

    // 1. Insert ticket with defaults
    const ticket = await ticketRepository.create({
      author_id:   authorId,
      book_id:     bookId || null,
      subject,
      description,
      ai_status:   AI_STATUS.PENDING,
    });

    // 2. Set ticket_code from generated id
    const ticketCode = `TKT-${String(ticket.id).padStart(6, '0')}`;
    await ticketRepository.updateTicketCode(ticket.id, ticketCode);
    ticket.ticket_code = ticketCode;

    // 3. Notify admins (fire-and-forget)
    const author = await prisma.users.findUnique({ where: { id: authorId }, select: { name: true } });
    notificationService.notifyAdminsNewTicket(ticket, author.name).catch(() => {});

    // 4. Run AI classification in the background
    runAiClassification(ticket).catch(() => {});

    return toTicketDTO(ticket);
  },

  // ── Author: list my tickets ───────────────────────────────
  getMyTickets: async (authorId, query) => {
    const { page, limit, skip } = parsePagination(query);
    const [tickets, total] = await ticketRepository.findByAuthor(authorId, {
      skip, limit, status: query.status,
    });
    return {
      tickets: tickets.map(toTicketListDTO),
      meta:    buildMeta(total, page, limit),
    };
  },

  // ── Author: get single ticket ─────────────────────────────
  getMyTicketById: async (id, authorId) => {
    const ticket = await ticketRepository.findByIdAndAuthor(id, authorId);
    if (!ticket) throw new NotFoundError('Ticket');
    return toTicketDTO(ticket, false);
  },

  // ── Author: reply ─────────────────────────────────────────
  authorReply: async (ticketId, authorId, body) => {
    const ticket = await ticketRepository.findByIdAndAuthor(ticketId, authorId);
    if (!ticket) throw new NotFoundError('Ticket');
    if (ticket.status === 'CLOSED') throw new ForbiddenError('Cannot reply to a closed ticket');

    const message = await ticketRepository.addMessage({
      ticket_id:   ticketId,
      sender_id:   authorId,
      sender_role: 'AUTHOR',
      body,
       was_ai_drafted: false,
    });

    await ticketRepository.update(ticketId, { last_activity_at: new Date() });

    // Notify assigned admin or all admins
    const recipientId = ticket.assigned_to_id;
    emitToTicket(ticketId, SOCKET_EVENTS.TICKET_MESSAGE, { ticketId, message });
    if (recipientId) emitToAdmins(SOCKET_EVENTS.TICKET_MESSAGE, { ticketId });

    return message;
  },

  // ── Admin: list all tickets ───────────────────────────────
  adminGetAll: async (query) => {
    const { page, limit, skip } = parsePagination(query);

    const where = {};
    if (query.status)   where.status   = query.status;
    if (query.category) where.category = query.category;
    if (query.priority) where.priority = query.priority;
    if (query.assignedToMe === 'true' && query.adminId) {
      where.assigned_to_id = parseInt(query.adminId);
    }
    if (query.search) {
      where.OR = [
        { subject:     { contains: query.search } },
        { ticket_code: { contains: query.search } },
      ];
    }
    if (query.dateFrom || query.dateTo) {
      where.created_at = {};
      if (query.dateFrom) where.created_at.gte = new Date(query.dateFrom);
      if (query.dateTo)   where.created_at.lte = new Date(query.dateTo);
    }

    const [tickets, total] = await ticketRepository.adminFindAll(where, { skip, limit });
    return {
      tickets: tickets.map(toTicketListDTO),
      meta:    buildMeta(total, page, limit),
    };
  },

  // ── Admin: get single ticket with notes ───────────────────
  adminGetById: async (id) => {
    const ticket = await ticketRepository.findByIdAdmin(id);
    if (!ticket) throw new NotFoundError('Ticket');
    return toTicketDTO(ticket, true);
  },

  // ── Admin: update status ──────────────────────────────────
  updateStatus: async (id, status) => {
    const ticket = await ticketRepository.findByIdAdmin(id);
    if (!ticket) throw new NotFoundError('Ticket');

    const updates = { status, last_activity_at: new Date() };
    if (status === 'RESOLVED') updates.resolved_at = new Date();
    if (status === 'CLOSED')   updates.closed_at   = new Date();

    const updated = await ticketRepository.update(id, updates);

    notificationService.notifyAuthorStatusChange(ticket, ticket.author_id, status).catch(() => {});
    emitToAdmins(SOCKET_EVENTS.TICKET_UPDATED, { ticketId: id, status });

    return updated;
  },

  // ── Admin: override category ──────────────────────────────
  overrideCategory: async (id, category) => {
    const ticket = await ticketRepository.findByIdAdmin(id);
    if (!ticket) throw new NotFoundError('Ticket');
    return ticketRepository.update(id, { category, category_overridden: true });
  },

  // ── Admin: override priority ──────────────────────────────
  overridePriority: async (id, priority) => {
    const ticket = await ticketRepository.findByIdAdmin(id);
    if (!ticket) throw new NotFoundError('Ticket');
    return ticketRepository.update(id, { priority, priority_overridden: true });
  },

  // ── Admin: assign ticket ──────────────────────────────────
  assignTicket: async (id, adminId) => {
    const ticket = await ticketRepository.findByIdAdmin(id);
    if (!ticket) throw new NotFoundError('Ticket');

    const updated = await ticketRepository.update(id, {
      assigned_to_id: adminId,
      status: ticket.status === 'OPEN' ? 'IN_PROGRESS' : ticket.status,
    });

    notificationService.notifyAdminAssigned(ticket, adminId).catch(() => {});
    return updated;
  },

  // ── Admin: reply ──────────────────────────────────────────
  adminReply: async (ticketId, adminId, { body, wasAiDrafted }) => {
    const ticket = await ticketRepository.findByIdAdmin(ticketId);
    if (!ticket) throw new NotFoundError('Ticket');

    const message = await ticketRepository.addMessage({
      ticket_id:      ticketId,
      sender_id:      adminId,
      sender_role:    'ADMIN',
      body,
      was_ai_drafted: Boolean(wasAiDrafted),
    });

    const updates = { last_activity_at: new Date() };
    if (!ticket.first_response_at) updates.first_response_at = new Date();
    if (ticket.status === 'OPEN')  updates.status = 'IN_PROGRESS';
    await ticketRepository.update(ticketId, updates);

    notificationService.notifyAuthorReply(ticket, ticket.author_id).catch(() => {});
    emitToTicket(ticketId, SOCKET_EVENTS.TICKET_MESSAGE, { ticketId, message });

    return message;
  },

  // ── Admin: add internal note ──────────────────────────────
  addNote: async (ticketId, adminId, body) => {
    const ticket = await ticketRepository.findByIdAdmin(ticketId);
    if (!ticket) throw new NotFoundError('Ticket');
    return ticketRepository.addNote({ ticket_id: ticketId, admin_id: adminId, body });
  },

  // ── Admin: generate / regenerate AI draft ─────────────────
  generateDraft: async (ticketId) => {
    const ticket = await ticketRepository.findByIdAdmin(ticketId);
    if (!ticket) throw new NotFoundError('Ticket');

    // Fetch full author data for grounding
    const authorData = await prisma.users.findUnique({
      where:   { id: ticket.author_id },
      include: { author_profiles: true },
    });

    const bookData = ticket.book_id
      ? await bookRepository.findById(ticket.book_id)
      : null;

    const draft = await generateDraft({ ticket, authorData, bookData });

    if (draft) {
      await ticketRepository.updateAiFields(ticketId, {
        ai_draft:               draft,
        ai_draft_generated_at:  new Date(),
        ai_status:              AI_STATUS.DONE,
      });
      emitToAdmins(SOCKET_EVENTS.TICKET_AI_COMPLETED, { ticketId });
      return draft;
    }

    await ticketRepository.updateAiFields(ticketId, { ai_status: AI_STATUS.FAILED });
    emitToAdmins(SOCKET_EVENTS.TICKET_AI_FAILED, { ticketId });
    return null;
  },
};

// ── Background AI classification (called after ticket creation) ────────────
const runAiClassification = async (ticket) => {
  try {
    const result = await classifyTicket(ticket);

    if (result) {
      await ticketRepository.updateAiFields(ticket.id, {
        ai_category: result.category,
        ai_priority: result.priority,
        ai_reason:   result.reason,
        category:    result.category,
        priority:    result.priority,
        ai_status:   AI_STATUS.DONE,
      });
      emitToAdmins(SOCKET_EVENTS.TICKET_AI_COMPLETED, {
        ticketId:  ticket.id,
        category:  result.category,
        priority:  result.priority,
      });
    } else {
      // AI failed — use keyword fallback
      const fallback = fallbackClassify(ticket.subject, ticket.description);
      await ticketRepository.updateAiFields(ticket.id, {
        ai_category: fallback.category,
        ai_priority: fallback.priority,
        ai_reason:   fallback.reason,
        category:    fallback.category,
        priority:    fallback.priority,
        ai_status:   AI_STATUS.FAILED,
      });

      // Import lazily to avoid circular imports
      const ns = await import('./notification.service.js');
      ns.default.notifyAdminsAiFailed(ticket).catch(() => {});
      emitToAdmins(SOCKET_EVENTS.TICKET_AI_FAILED, { ticketId: ticket.id });
    }
  } catch (err) {
    logger.error('Background AI classification error', { error: err.message, ticketId: ticket.id });
  }
};

export default ticketService;

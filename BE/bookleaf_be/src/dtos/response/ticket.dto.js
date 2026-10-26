import { CATEGORY_LABELS, BOOK_STATUS_LABELS } from '../../constants/index.js';

export const toTicketDTO = (ticket, includeInternalNotes = false) => ({
  id:                  ticket.id,
  ticketCode:          ticket.ticket_code,
  subject:             ticket.subject,
  description:         ticket.description,
  status:              ticket.status,
  category:            ticket.category,
  categoryLabel:       CATEGORY_LABELS[ticket.category] || ticket.category,
  aiCategory:          ticket.ai_category,
  categoryOverridden:  !!ticket.category_overridden,
  priority:            ticket.priority,
  aiPriority:          ticket.ai_priority,
  priorityOverridden:  !!ticket.priority_overridden,
  aiStatus:            ticket.ai_status,
  aiReason:            ticket.ai_reason,
  assignedTo:          ticket.assignedTo
    ? { id: ticket.assignedTo.id, name: ticket.assignedTo.name }
    : null,
  author:              ticket.author
    ? { id: ticket.author.id, name: ticket.author.name, email: ticket.author.email }
    : null,
  book:                ticket.books
    ? {
        id:          ticket.books.id,
        bookCode:    ticket.books.book_code,
        title:       ticket.books.title,
        status:      ticket.books.status,
        statusLabel: BOOK_STATUS_LABELS[ticket.books.status],
      }
    : null,
  messages:            (ticket.ticket_messages || []).map(toMessageDTO),
  internalNotes:       includeInternalNotes
    ? (ticket.internal_notes || []).map(toNoteDTO)
    : undefined,
  firstResponseAt:     ticket.first_response_at,
  resolvedAt:          ticket.resolved_at,
  closedAt:            ticket.closed_at,
  lastActivityAt:      ticket.last_activity_at,
  createdAt:           ticket.created_at,
  updatedAt:           ticket.updated_at,
});

export const toTicketListDTO = (ticket) => ({
  id:                 ticket.id,
  ticketCode:         ticket.ticket_code,
  subject:            ticket.subject,
  status:             ticket.status,
  category:           ticket.category,
  categoryLabel:      CATEGORY_LABELS[ticket.category] || ticket.category,
  priority:           ticket.priority,
  aiStatus:           ticket.ai_status,
  assignedTo:         ticket.assignedTo
    ? { id: ticket.assignedTo.id, name: ticket.assignedTo.name }
    : null,
  author:             ticket.author
    ? { id: ticket.author.id, name: ticket.author.name }
    : null,
  book:               ticket.books
    ? { id: ticket.books.id, title: ticket.books.title }
    : null,
  firstResponseAt:    ticket.first_response_at,
  lastActivityAt:     ticket.last_activity_at,
  createdAt:          ticket.created_at,
  isOverdue:          !ticket.first_response_at &&
                      ticket.status === 'OPEN' &&
                      new Date() - new Date(ticket.created_at) > 24 * 60 * 60 * 1000,
});

export const toMessageDTO = (msg) => ({
  id:           msg.id,
  body:         msg.body,
  senderRole:   msg.sender_role,
  senderName:   msg.users?.name || null,
  wasAiDrafted: !!msg.was_ai_drafted,
  createdAt:    msg.created_at,
});

export const toNoteDTO = (note) => ({
  id:        note.id,
  body:      note.body,
  adminName: note.users?.name || null,
  createdAt: note.created_at,
});

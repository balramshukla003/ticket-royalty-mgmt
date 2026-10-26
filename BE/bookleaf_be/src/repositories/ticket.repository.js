import prisma from '../config/db.js';

const TICKET_INCLUDES = {
  author:           { select: { id: true, name: true, email: true } },
  assignedTo:       { select: { id: true, name: true } },
  books:            { select: { id: true, book_code: true, title: true, status: true } },
  ticket_messages:  {
    include: { users: { select: { id: true, name: true } } },
    orderBy: { created_at: 'asc' },
  },
};

const TICKET_INCLUDES_WITH_NOTES = {
  ...TICKET_INCLUDES,
  internal_notes: {
    include: { users: { select: { id: true, name: true } } },
    orderBy: { created_at: 'asc' },
  },
};

const ticketRepository = {
  // ── Author side ──────────────────────────────────────────
  create: (data) =>
    prisma.tickets.create({ data, include: TICKET_INCLUDES }),

  updateTicketCode: (id, ticketCode) =>
    prisma.tickets.update({ where: { id }, data: { ticket_code: ticketCode } }),

  findByAuthor: (authorId, { skip, limit, status }) =>
    prisma.$transaction([
      prisma.tickets.findMany({
        where:   { author_id: authorId, ...(status ? { status } : {}) },
        include: TICKET_INCLUDES,
        orderBy: { created_at: 'desc' },
        skip,
        take:    limit,
      }),
      prisma.tickets.count({
        where: { author_id: authorId, ...(status ? { status } : {}) },
      }),
    ]),

  findByIdAndAuthor: (id, authorId) =>
    prisma.tickets.findFirst({
      where:   { id, author_id: authorId },
      include: TICKET_INCLUDES,
    }),

  // ── Admin side ────────────────────────────────────────────
  adminFindAll: (where, { skip, limit }) =>
    prisma.$transaction([
      prisma.tickets.findMany({
        where,
        include: TICKET_INCLUDES,
        orderBy: [{ priority: 'asc' }, { created_at: 'asc' }],
        skip,
        take:    limit,
      }),
      prisma.tickets.count({ where }),
    ]),

  findByIdAdmin: (id) =>
    prisma.tickets.findUnique({
      where:   { id },
      include: TICKET_INCLUDES_WITH_NOTES,
    }),

  update: (id, data) =>
    prisma.tickets.update({ where: { id }, data }),

  // ── Messages ──────────────────────────────────────────────
  addMessage: (data) =>
    prisma.ticket_messages.create({
      data,
      include: { users: { select: { id: true, name: true } } },
    }),

  // ── Internal notes ────────────────────────────────────────
  addNote: (data) =>
    prisma.internal_notes.create({
      data,
      include: { users: { select: { id: true, name: true } } },
    }),

  // ── AI fields ─────────────────────────────────────────────
  updateAiFields: (id, data) =>
    prisma.tickets.update({ where: { id }, data }),
};

export default ticketRepository;

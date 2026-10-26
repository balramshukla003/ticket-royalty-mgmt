import { z } from 'zod';
import { TICKET_STATUS, TICKET_CATEGORY, TICKET_PRIORITY } from '../../constants/index.js';

export const createTicketSchema = z.object({
  bookId:      z.number().int().positive().optional().nullable(),
  subject:     z.string().min(5, 'Subject must be at least 5 characters').max(200),
  description: z.string().min(20, 'Description must be at least 20 characters'),
});

export const authorReplySchema = z.object({
  body: z.string().min(1, 'Reply cannot be empty').max(5000),
});

export const ticketQuerySchema = z.object({
  page:   z.string().optional(),
  limit:  z.string().optional(),
  status: z.enum(Object.values(TICKET_STATUS)).optional(),
}).optional();

export const adminTicketQuerySchema = z.object({
  page:          z.string().optional(),
  limit:         z.string().optional(),
  status:        z.enum(Object.values(TICKET_STATUS)).optional(),
  category:      z.enum(Object.values(TICKET_CATEGORY)).optional(),
  priority:      z.enum(Object.values(TICKET_PRIORITY)).optional(),
  assignedToMe:  z.string().optional(),
  search:        z.string().optional(),
  dateFrom:      z.string().optional(),
  dateTo:        z.string().optional(),
}).optional();

export const updateTicketStatusSchema = z.object({
  status: z.enum(Object.values(TICKET_STATUS)),
});

export const overrideCategorySchema = z.object({
  category: z.enum(Object.values(TICKET_CATEGORY)),
});

export const overridePrioritySchema = z.object({
  priority: z.enum(Object.values(TICKET_PRIORITY)),
});

export const assignTicketSchema = z.object({
  adminId: z.number().int().positive(),
});

export const adminReplySchema = z.object({
  body:          z.string().min(1, 'Reply cannot be empty').max(5000),
  wasAiDrafted:  z.boolean().optional().default(false),
});

export const addNoteSchema = z.object({
  body: z.string().min(1, 'Note cannot be empty').max(5000),
});

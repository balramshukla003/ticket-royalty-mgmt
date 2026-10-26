import { z } from 'zod';

export const bookQuerySchema = z.object({
  page:   z.string().optional(),
  limit:  z.string().optional(),
  status: z.string().optional(),
}).optional();

import { z } from 'zod';

const transactionTypes = ['income', 'expense', 'debt', 'receivable', 'asset'] as const;
const transactionStatuses = ['completed', 'pending', 'cancelled'] as const;

export const createTransactionSchema = z.object({
  type: z.enum(transactionTypes),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('VND'),
  description: z.string().optional(),
  date: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  categoryId: z.string().uuid().optional(),
  note: z.string().optional(),
  status: z.enum(transactionStatuses).default('completed'),
  metadata: z.string().optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const transactionFilterSchema = z.object({
  type: z.enum(transactionTypes).optional(),
  categoryId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(transactionStatuses).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionFilterInput = z.infer<typeof transactionFilterSchema>;

import { z } from "zod";

export const createTransactionSchema = z.object({
  body: z.object({
    amount: z.number().positive("Amount must be positive"),
    type: z.enum(["income", "expense"]),
    categoryId: z.string().min(1, "Category is required"),
    date: z.string().datetime({ message: "Invalid date format" }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    note: z.string().max(500).optional(),
  }),
});

export const updateTransactionSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    amount: z.number().positive().optional(),
    type: z.enum(["income", "expense"]).optional(),
    categoryId: z.string().min(1).optional(),
    date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
    note: z.string().max(500).optional(),
  }),
});

export const listTransactionsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    type: z.enum(["income", "expense"]).optional(),
    categoryId: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    search: z.string().optional(),
  }),
});

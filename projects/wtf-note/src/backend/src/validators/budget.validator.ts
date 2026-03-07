import { z } from "zod";

export const createBudgetSchema = z.object({
  body: z.object({
    categoryId: z.string().min(1, "Category is required"),
    amount: z.number().positive("Amount must be positive"),
    month: z.number().int().min(1).max(12),
    year: z.number().int().min(2020).max(2100),
  }),
});

export const updateBudgetSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    amount: z.number().positive().optional(),
  }),
});

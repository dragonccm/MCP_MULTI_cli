import { z } from "zod";

export const createDebtSchema = z.object({
  body: z.object({
    creditorDebtor: z.string().min(1, "Creditor/debtor name is required").max(100),
    amount: z.number().positive("Amount must be positive"),
    type: z.enum(["owed", "owing"]),
    dueDate: z.string().optional(),
    isRecurring: z.boolean().optional(),
    recurringSchedule: z.enum(["weekly", "monthly"]).optional(),
    note: z.string().max(500).optional(),
  }),
});

export const updateDebtSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    creditorDebtor: z.string().min(1).max(100).optional(),
    amount: z.number().positive().optional(),
    dueDate: z.string().optional(),
    isRecurring: z.boolean().optional(),
    recurringSchedule: z.enum(["weekly", "monthly"]).nullable().optional(),
    note: z.string().max(500).optional(),
  }),
});

export const createDebtPaymentSchema = z.object({
  params: z.object({ debtId: z.string().min(1) }),
  body: z.object({
    amount: z.number().positive("Amount must be positive"),
    date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    note: z.string().max(500).optional(),
  }),
});

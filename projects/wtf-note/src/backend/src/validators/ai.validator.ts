import { z } from 'zod';

export const spendingInsightsSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  question: z.string().optional(),
});

export const investmentAdviceSchema = z.object({
  portfolioId: z.string().uuid().optional(),
  question: z.string().optional(),
});

export const budgetPlanningSchema = z.object({
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().min(2000).max(2100).optional(),
  question: z.string().optional(),
});

export type SpendingInsightsInput = z.infer<typeof spendingInsightsSchema>;
export type InvestmentAdviceInput = z.infer<typeof investmentAdviceSchema>;
export type BudgetPlanningInput = z.infer<typeof budgetPlanningSchema>;

import { describe, it, expect } from 'vitest';
import {
  spendingInsightsSchema,
  investmentAdviceSchema,
  budgetPlanningSchema,
} from '../../src/validators/ai.validator';

describe('AI Validators', () => {
  describe('spendingInsightsSchema', () => {
    it('should accept empty input', () => {
      const input = {};
      const result = spendingInsightsSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept valid date range', () => {
      const input = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };
      const result = spendingInsightsSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept custom question', () => {
      const input = {
        question: 'What are my biggest spending categories?',
      };
      const result = spendingInsightsSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept all fields', () => {
      const input = {
        startDate: '2024-01-01',
        endDate: '2024-03-31',
        question: 'Analyze my Q1 spending patterns',
      };
      const result = spendingInsightsSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe('investmentAdviceSchema', () => {
    it('should accept empty input', () => {
      const input = {};
      const result = investmentAdviceSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept valid portfolioId', () => {
      const input = {
        portfolioId: '550e8400-e29b-41d4-a716-446655440000',
      };
      const result = investmentAdviceSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept custom investment question', () => {
      const input = {
        question: 'Should I diversify my tech-heavy portfolio?',
      };
      const result = investmentAdviceSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept both portfolioId and question', () => {
      const input = {
        portfolioId: '550e8400-e29b-41d4-a716-446655440000',
        question: 'How can I improve my portfolio diversification?',
      };
      const result = investmentAdviceSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID format', () => {
      const input = {
        portfolioId: 'invalid-uuid-format',
      };
      const result = investmentAdviceSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('budgetPlanningSchema', () => {
    it('should accept empty input', () => {
      const input = {};
      const result = budgetPlanningSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept valid month and year', () => {
      const input = {
        month: 1,
        year: 2024,
      };
      const result = budgetPlanningSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept month 12', () => {
      const input = {
        month: 12,
        year: 2024,
      };
      const result = budgetPlanningSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept minimum year 2000', () => {
      const input = {
        month: 1,
        year: 2000,
      };
      const result = budgetPlanningSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept maximum year 2100', () => {
      const input = {
        month: 1,
        year: 2100,
      };
      const result = budgetPlanningSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept custom budget question', () => {
      const input = {
        question: 'How much should I budget for groceries?',
      };
      const result = budgetPlanningSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject month 0', () => {
      const input = {
        month: 0,
        year: 2024,
      };
      const result = budgetPlanningSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject month 13', () => {
      const input = {
        month: 13,
        year: 2024,
      };
      const result = budgetPlanningSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject year below 2000', () => {
      const input = {
        month: 1,
        year: 1999,
      };
      const result = budgetPlanningSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject year above 2100', () => {
      const input = {
        month: 1,
        year: 2101,
      };
      const result = budgetPlanningSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should accept all fields together', () => {
      const input = {
        month: 6,
        year: 2024,
        question: 'Create a summer vacation budget',
      };
      const result = budgetPlanningSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });
});

import { describe, it, expect } from 'vitest';
import {
  updateProfileSchema,
  createCategorySchema,
  updateCategorySchema,
  createBudgetSchema,
  updateBudgetSchema,
} from '../../src/validators/profile.validator';

describe('Profile Validators', () => {
  describe('updateProfileSchema', () => {
    it('should accept valid profile update with name', () => {
      const input = {
        name: 'John Doe',
      };
      const result = updateProfileSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept valid profile update with currency', () => {
      const input = {
        currency: 'USD',
      };
      const result = updateProfileSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept valid profile update with both fields', () => {
      const input = {
        name: 'Jane Smith',
        currency: 'EUR',
      };
      const result = updateProfileSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept empty update', () => {
      const input = {};
      const result = updateProfileSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept name at minimum length', () => {
      const input = {
        name: 'J',
      };
      const result = updateProfileSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept name at maximum length', () => {
      const input = {
        name: 'a'.repeat(100),
      };
      const result = updateProfileSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject name longer than 100 characters', () => {
      const input = {
        name: 'a'.repeat(101),
      };
      const result = updateProfileSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should accept currency up to 10 characters', () => {
      const input = {
        currency: 'CRYPTO123',
      };
      const result = updateProfileSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject currency longer than 10 characters', () => {
      const input = {
        currency: 'a'.repeat(11),
      };
      const result = updateProfileSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('createCategorySchema', () => {
    it('should accept valid category creation', () => {
      const input = {
        name: 'Food & Dining',
        type: 'expense' as const,
      };
      const result = createCategorySchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept income category type', () => {
      const input = {
        name: 'Salary',
        type: 'income' as const,
      };
      const result = createCategorySchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject empty category name', () => {
      const input = {
        name: '',
        type: 'expense' as const,
      };
      const result = createCategorySchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject category name over 50 characters', () => {
      const input = {
        name: 'a'.repeat(51),
        type: 'expense' as const,
      };
      const result = createCategorySchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject invalid category type', () => {
      const input = {
        name: 'Test Category',
        type: 'invalid_type',
      };
      const result = createCategorySchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should accept optional icon and color', () => {
      const input = {
        name: 'Shopping',
        type: 'expense' as const,
        icon: 'shopping-cart',
        color: '#FF5733',
      };
      const result = createCategorySchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe('updateCategorySchema', () => {
    it('should accept partial update', () => {
      const input = {
        name: 'Updated Category',
      };
      const result = updateCategorySchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept empty update', () => {
      const input = {};
      const result = updateCategorySchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe('createBudgetSchema', () => {
    it('should accept valid budget creation', () => {
      const input = {
        amount: 2000000,
        month: 1,
        year: 2024,
      };
      const result = createBudgetSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept budget with categoryId', () => {
      const input = {
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 2000000,
        month: 1,
        year: 2024,
      };
      const result = createBudgetSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject negative budget amount', () => {
      const input = {
        amount: -1000000,
        month: 1,
        year: 2024,
      };
      const result = createBudgetSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject zero budget amount', () => {
      const input = {
        amount: 0,
        month: 1,
        year: 2024,
      };
      const result = createBudgetSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject month 0', () => {
      const input = {
        amount: 1000000,
        month: 0,
        year: 2024,
      };
      const result = createBudgetSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject month 13', () => {
      const input = {
        amount: 1000000,
        month: 13,
        year: 2024,
      };
      const result = createBudgetSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject year below 2000', () => {
      const input = {
        amount: 1000000,
        month: 1,
        year: 1999,
      };
      const result = createBudgetSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject year above 2100', () => {
      const input = {
        amount: 1000000,
        month: 1,
        year: 2101,
      };
      const result = createBudgetSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should accept month 1 (January)', () => {
      const input = {
        amount: 1000000,
        month: 1,
        year: 2024,
      };
      const result = createBudgetSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept month 12 (December)', () => {
      const input = {
        amount: 1000000,
        month: 12,
        year: 2024,
      };
      const result = createBudgetSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe('updateBudgetSchema', () => {
    it('should accept partial update', () => {
      const input = {
        amount: 3000000,
      };
      const result = updateBudgetSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept empty update', () => {
      const input = {};
      const result = updateBudgetSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });
});

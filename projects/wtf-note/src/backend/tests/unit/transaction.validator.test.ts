import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionFilterSchema,
} from '../../src/validators/transaction.validator';

describe('Transaction Validators', () => {
  describe('createTransactionSchema', () => {
    it('should accept valid income transaction', () => {
      const input = {
        type: 'income' as const,
        amount: 1000000,
        currency: 'VND',
        description: 'Salary',
        date: '2024-01-15',
        status: 'completed' as const,
      };
      const result = createTransactionSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept valid expense transaction', () => {
      const input = {
        type: 'expense' as const,
        amount: 500000,
        currency: 'VND',
        description: 'Groceries',
        date: '2024-01-16',
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
        status: 'completed' as const,
      };
      const result = createTransactionSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept debt transaction', () => {
      const input = {
        type: 'debt' as const,
        amount: 5000000,
        currency: 'VND',
        description: 'Borrowed from friend',
        date: '2024-01-17',
        note: 'Return by end of month',
        status: 'pending' as const,
      };
      const result = createTransactionSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept receivable transaction', () => {
      const input = {
        type: 'receivable' as const,
        amount: 2000000,
        currency: 'VND',
        description: 'Lent to colleague',
        date: '2024-01-18',
        status: 'completed' as const,
      };
      const result = createTransactionSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject negative amount', () => {
      const input = {
        type: 'expense' as const,
        amount: -100000,
        currency: 'VND',
        date: '2024-01-15',
      };
      const result = createTransactionSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('positive');
      }
    });

    it('should reject zero amount', () => {
      const input = {
        type: 'income' as const,
        amount: 0,
        currency: 'VND',
        date: '2024-01-15',
      };
      const result = createTransactionSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject invalid transaction type', () => {
      const input = {
        type: 'invalid_type',
        amount: 100000,
        currency: 'VND',
        date: '2024-01-15',
      };
      const result = createTransactionSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject invalid status', () => {
      const input = {
        type: 'expense' as const,
        amount: 100000,
        currency: 'VND',
        date: '2024-01-15',
        status: 'invalid_status',
      };
      const result = createTransactionSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should default currency to VND if not provided', () => {
      const input = {
        type: 'expense' as const,
        amount: 100000,
        date: '2024-01-15',
      };
      const result = createTransactionSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currency).toBe('VND');
      }
    });

    it('should default status to completed if not provided', () => {
      const input = {
        type: 'expense' as const,
        amount: 100000,
        currency: 'VND',
        date: '2024-01-15',
      };
      const result = createTransactionSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('completed');
      }
    });
  });

  describe('updateTransactionSchema', () => {
    it('should accept partial updates', () => {
      const input = {
        amount: 1500000,
        description: 'Updated description',
      };
      const result = updateTransactionSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept empty object', () => {
      const input = {};
      const result = updateTransactionSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject invalid amount in update', () => {
      const input = {
        amount: -100,
      };
      const result = updateTransactionSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('transactionFilterSchema', () => {
    it('should accept valid filter with all fields', () => {
      const input = {
        type: 'expense',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        page: 1,
        limit: 20,
      };
      const result = transactionFilterSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept empty filter', () => {
      const input = {};
      const result = transactionFilterSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it('should coerce page and limit to numbers', () => {
      const input = {
        page: '2',
        limit: '50',
      };
      const result = transactionFilterSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(50);
      }
    });

    it('should reject limit over 100', () => {
      const input = {
        limit: 150,
      };
      const result = transactionFilterSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject negative page', () => {
      const input = {
        page: -1,
      };
      const result = transactionFilterSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });
});

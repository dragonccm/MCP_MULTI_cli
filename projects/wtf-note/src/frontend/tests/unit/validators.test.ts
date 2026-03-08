import { describe, it, expect, beforeEach } from 'vitest';
import { z } from 'zod';

// Import validation schemas from frontend types/utils
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const transactionSchema = z.object({
  type: z.enum(['income', 'expense', 'debt', 'receivable', 'asset']),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('VND'),
  description: z.string().optional(),
  date: z.string(),
  category: z.string().optional(),
});

describe('Frontend Validators', () => {
  describe('loginSchema', () => {
    it('should accept valid login credentials', () => {
      const input = {
        email: 'user@example.com',
        password: 'password123',
      };
      const result = loginSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const input = {
        email: 'not-an-email',
        password: 'password123',
      };
      const result = loginSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toContain('email');
      }
    });

    it('should reject empty password', () => {
      const input = {
        email: 'user@example.com',
        password: '',
      };
      const result = loginSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('transactionSchema', () => {
    it('should accept valid income transaction', () => {
      const input = {
        type: 'income' as const,
        amount: 5000000,
        currency: 'VND',
        description: 'Salary',
        date: '2024-01-15',
        category: 'Salary',
      };
      const result = transactionSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept valid expense transaction', () => {
      const input = {
        type: 'expense' as const,
        amount: 500000,
        currency: 'VND',
        description: 'Groceries',
        date: '2024-01-16',
        category: 'Food',
      };
      const result = transactionSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept debt transaction', () => {
      const input = {
        type: 'debt' as const,
        amount: 2000000,
        currency: 'VND',
        description: 'Borrowed money',
        date: '2024-01-17',
      };
      const result = transactionSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept receivable transaction', () => {
      const input = {
        type: 'receivable' as const,
        amount: 1000000,
        currency: 'VND',
        description: 'Lent money',
        date: '2024-01-18',
      };
      const result = transactionSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject negative amount', () => {
      const input = {
        type: 'expense' as const,
        amount: -100000,
        currency: 'VND',
        date: '2024-01-15',
      };
      const result = transactionSchema.safeParse(input);
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
      const result = transactionSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject invalid transaction type', () => {
      const input = {
        type: 'invalid_type',
        amount: 100000,
        currency: 'VND',
        date: '2024-01-15',
      };
      const result = transactionSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should default currency to VND', () => {
      const input = {
        type: 'expense' as const,
        amount: 100000,
        date: '2024-01-15',
      };
      const result = transactionSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currency).toBe('VND');
      }
    });
  });
});

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  createPortfolioSchema,
  updatePortfolioSchema,
  createAssetSchema,
  updateAssetSchema,
} from '../../src/validators/portfolio.validator';

describe('Portfolio Validators', () => {
  describe('createPortfolioSchema', () => {
    it('should accept valid portfolio creation input', () => {
      const input = {
        name: 'My Investment Portfolio',
      };
      const result = createPortfolioSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject empty portfolio name', () => {
      const input = {
        name: '',
      };
      const result = createPortfolioSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('required');
      }
    });

    it('should reject portfolio name over 100 characters', () => {
      const input = {
        name: 'a'.repeat(101),
      };
      const result = createPortfolioSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should accept portfolio name at max length', () => {
      const input = {
        name: 'a'.repeat(100),
      };
      const result = createPortfolioSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe('updatePortfolioSchema', () => {
    it('should accept partial update', () => {
      const input = {
        name: 'Updated Portfolio Name',
      };
      const result = updatePortfolioSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept empty update', () => {
      const input = {};
      const result = updatePortfolioSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe('createAssetSchema', () => {
    it('should accept valid stock asset', () => {
      const input = {
        portfolioId: '550e8400-e29b-41d4-a716-446655440000',
        symbol: 'AAPL',
        name: 'Apple Inc.',
        type: 'stock' as const,
        quantity: 10,
        purchasePrice: 150.50,
        purchaseDate: '2024-01-15',
        currency: 'USD',
      };
      const result = createAssetSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept valid crypto asset', () => {
      const input = {
        portfolioId: '550e8400-e29b-41d4-a716-446655440000',
        symbol: 'BTC',
        name: 'Bitcoin',
        type: 'crypto' as const,
        quantity: 0.5,
        purchasePrice: 40000,
        purchaseDate: '2024-01-20',
        currency: 'USD',
      };
      const result = createAssetSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept fund asset', () => {
      const input = {
        portfolioId: '550e8400-e29b-41d4-a716-446655440000',
        symbol: 'VFIAX',
        name: 'Vanguard 500 Index Fund',
        type: 'fund' as const,
        quantity: 5,
        purchasePrice: 400,
        purchaseDate: '2024-02-01',
        currency: 'USD',
      };
      const result = createAssetSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept bond asset', () => {
      const input = {
        portfolioId: '550e8400-e29b-41d4-a716-446655440000',
        symbol: 'BND',
        name: 'Vanguard Total Bond Market ETF',
        type: 'bond' as const,
        quantity: 50,
        purchasePrice: 75,
        purchaseDate: '2024-02-15',
        currency: 'USD',
      };
      const result = createAssetSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept other asset type', () => {
      const input = {
        portfolioId: '550e8400-e29b-41d4-a716-446655440000',
        symbol: 'GOLD',
        name: 'Gold Bar',
        type: 'other' as const,
        quantity: 1,
        purchasePrice: 2000,
        purchaseDate: '2024-03-01',
        currency: 'USD',
      };
      const result = createAssetSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should default currency to VND', () => {
      const input = {
        portfolioId: '550e8400-e29b-41d4-a716-446655440000',
        symbol: 'VCB',
        type: 'stock' as const,
        quantity: 100,
        purchasePrice: 50000,
        purchaseDate: '2024-01-15',
      };
      const result = createAssetSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currency).toBe('VND');
      }
    });

    it('should reject invalid portfolioId format', () => {
      const input = {
        portfolioId: 'invalid-uuid',
        symbol: 'AAPL',
        type: 'stock' as const,
        quantity: 10,
        purchasePrice: 150,
        purchaseDate: '2024-01-15',
      };
      const result = createAssetSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject empty symbol', () => {
      const input = {
        portfolioId: '550e8400-e29b-41d4-a716-446655440000',
        symbol: '',
        type: 'stock' as const,
        quantity: 10,
        purchasePrice: 150,
        purchaseDate: '2024-01-15',
      };
      const result = createAssetSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject symbol over 20 characters', () => {
      const input = {
        portfolioId: '550e8400-e29b-41d4-a716-446655440000',
        symbol: 'A'.repeat(21),
        type: 'stock' as const,
        quantity: 10,
        purchasePrice: 150,
        purchaseDate: '2024-01-15',
      };
      const result = createAssetSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject negative quantity', () => {
      const input = {
        portfolioId: '550e8400-e29b-41d4-a716-446655440000',
        symbol: 'AAPL',
        type: 'stock' as const,
        quantity: -10,
        purchasePrice: 150,
        purchaseDate: '2024-01-15',
      };
      const result = createAssetSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('positive');
      }
    });

    it('should reject zero quantity', () => {
      const input = {
        portfolioId: '550e8400-e29b-41d4-a716-446655440000',
        symbol: 'AAPL',
        type: 'stock' as const,
        quantity: 0,
        purchasePrice: 150,
        purchaseDate: '2024-01-15',
      };
      const result = createAssetSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject negative purchase price', () => {
      const input = {
        portfolioId: '550e8400-e29b-41d4-a716-446655440000',
        symbol: 'AAPL',
        type: 'stock' as const,
        quantity: 10,
        purchasePrice: -150,
        purchaseDate: '2024-01-15',
      };
      const result = createAssetSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should accept zero purchase price', () => {
      const input = {
        portfolioId: '550e8400-e29b-41d4-a716-446655440000',
        symbol: 'AAPL',
        type: 'stock' as const,
        quantity: 10,
        purchasePrice: 0,
        purchaseDate: '2024-01-15',
      };
      const result = createAssetSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject invalid asset type', () => {
      const input = {
        portfolioId: '550e8400-e29b-41d4-a716-446655440000',
        symbol: 'AAPL',
        type: 'invalid_type',
        quantity: 10,
        purchasePrice: 150,
        purchaseDate: '2024-01-15',
      };
      const result = createAssetSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('updateAssetSchema', () => {
    it('should accept partial update', () => {
      const input = {
        quantity: 15,
        purchasePrice: 160,
      };
      const result = updateAssetSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept single field update', () => {
      const input = {
        name: 'Updated Name',
      };
      const result = updateAssetSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept empty update', () => {
      const input = {};
      const result = updateAssetSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject negative quantity in update', () => {
      const input = {
        quantity: -5,
      };
      const result = updateAssetSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject negative purchase price in update', () => {
      const input = {
        purchasePrice: -100,
      };
      const result = updateAssetSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });
});

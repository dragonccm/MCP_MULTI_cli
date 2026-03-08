import { z } from 'zod';

const assetTypes = ['stock', 'crypto', 'fund', 'bond', 'other'] as const;

export const createPortfolioSchema = z.object({
  name: z.string().min(1, 'Portfolio name is required').max(100),
});

export const updatePortfolioSchema = createPortfolioSchema.partial();

export const createAssetSchema = z.object({
  portfolioId: z.string().uuid(),
  symbol: z.string().min(1, 'Symbol is required').max(20),
  name: z.string().optional(),
  type: z.enum(assetTypes),
  quantity: z.number().positive('Quantity must be positive'),
  purchasePrice: z.number().nonnegative('Purchase price cannot be negative'),
  purchaseDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  currency: z.string().default('VND'),
});

// Schema for adding asset to portfolio via URL (portfolioId in URL, not body)
export const createAssetToPortfolioSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required').max(20),
  name: z.string().optional(),
  type: z.enum(assetTypes),
  quantity: z.number().positive('Quantity must be positive'),
  purchasePrice: z.number().nonnegative('Purchase price cannot be negative'),
  purchaseDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  currency: z.string().default('VND'),
});

export const updateAssetSchema = createAssetSchema.partial().omit({ portfolioId: true });

export type CreatePortfolioInput = z.infer<typeof createPortfolioSchema>;
export type UpdatePortfolioInput = z.infer<typeof updatePortfolioSchema>;
export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;

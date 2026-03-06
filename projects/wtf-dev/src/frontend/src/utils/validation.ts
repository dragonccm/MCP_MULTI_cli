import { z } from 'zod';
import { AssetType, TransactionType } from '../types';

export const assetSchema = z.object({
  name: z.string().min(1, 'Asset name is required').max(50, 'Name too long'),
  type: z.nativeEnum(AssetType, { error: 'Select an asset type' }),
  balance: z.number({ error: 'Balance must be a number' }),
  currency: z.string().min(1, 'Currency is required').max(10),
});

export type AssetFormData = z.infer<typeof assetSchema>;

export const transactionSchema = z.object({
  type: z.nativeEnum(TransactionType),
  amount: z.number({ error: 'Amount must be a number' }).positive('Amount must be positive'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required').max(200),
  assetId: z.string().min(1, 'Select an asset'),
  date: z.string().min(1, 'Date is required'),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;

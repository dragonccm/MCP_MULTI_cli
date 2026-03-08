import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export type TransactionType = 'income' | 'expense' | 'debt' | 'receivable' | 'asset';
export type TransactionStatus = 'completed' | 'pending' | 'cancelled';
export type CategoryType = 'income' | 'expense';
export type AssetType = 'stock' | 'crypto' | 'fund' | 'bond' | 'other';
export type SyncAction = 'create' | 'update' | 'delete';
export type SyncEntityType = 'transaction' | 'category' | 'budget' | 'asset';
export type SyncStatus = 'pending' | 'synced' | 'conflict' | 'failed';

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface TransactionFilter extends PaginationQuery {
  type?: TransactionType;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  status?: TransactionStatus;
}

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

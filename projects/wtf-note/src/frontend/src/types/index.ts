export type TransactionType = 'income' | 'expense' | 'debt' | 'receivable' | 'asset';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  category: string;
  description?: string;
  date: string;
  creditorDebtor?: string;
  isRecurring: boolean;
  recurringInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  userId: string;
  symbol: string;
  name: string;
  assetType: 'stock' | 'crypto' | 'fund' | 'bond' | 'other';
  quantity: number;
  purchasePrice: number;
  currentPrice?: number;
  purchaseDate: string;
  currency: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  gainLossPercentage: number;
  assets: AssetWithValue[];
}

export interface AssetWithValue extends Asset {
  currentValue: number;
  gainLoss: number;
  gainLossPercentage: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  amount: number;
  month: number;
  year: number;
  spent: number;
  createdAt: string;
  updatedAt: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  source: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  relevanceScore?: number;
}

export interface AIInsight {
  id: string;
  type: 'spending' | 'investment' | 'budget';
  title: string;
  summary: string;
  details: string[];
  recommendations: string[];
  confidence: number;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TransactionFilter {
  type?: TransactionType;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

export type SyncStatus = 'synced' | 'pending' | 'error';

export interface SyncQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  entity: string;
  data: Record<string, unknown>;
  status: SyncStatus;
  retryCount: number;
  createdAt: string;
}

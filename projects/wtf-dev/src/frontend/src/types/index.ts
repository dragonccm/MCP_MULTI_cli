export enum AssetType {
  CASH = 'CASH',
  E_WALLET = 'E_WALLET',
  CRYPTO = 'CRYPTO',
  STOCK = 'STOCK',
  DEBT = 'DEBT',
}

export interface Asset {
  id: string;
  userId?: string;
  name: string;
  type: AssetType;
  balance: number;
  currency: string;
  symbol?: string | null;
  metadata?: string | null;
  icon?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export interface Transaction {
  id: string;
  userId?: string;
  type: TransactionType;
  amount: number;
  currency?: string;
  category?: string;
  categoryId?: string | null;
  description?: string;
  note?: string | null;
  assetId: string;
  assetName?: string;
  asset?: Asset;
  date: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ApiCategory {
  id: string;
  userId?: string | null;
  name: string;
  icon: string | null;
  color: string | null;
  type: TransactionType;
  isSystem: boolean;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface AssetGroup {
  type: AssetType;
  label: string;
  total: number;
  assets: Asset[];
  color: string;
}

export interface InsightData {
  title: string;
  description: string;
  type: 'tip' | 'warning' | 'achievement';
  icon: string;
}

export interface BudgetSuggestion {
  category: string;
  suggested: number;
  current: number;
  currency: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  baseCurrency: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardData {
  totalNetWorth: number;
  totalAssets: number;
  byType: Array<{
    type: AssetType;
    count: number;
    totalBalance: number;
    assets: Asset[];
  }>;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  netFlow: number;
  categories: Array<{
    categoryId: string;
    type: TransactionType;
    total: number;
    count: number;
  }>;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  spent: number;
  period: 'WEEKLY' | 'MONTHLY';
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export type BudgetPeriod = 'WEEKLY' | 'MONTHLY';

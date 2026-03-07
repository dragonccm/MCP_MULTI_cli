import { apiClient } from './api';
import type {
  Transaction,
  Category,
  Debt,
  DebtPayment,
  Asset,
  Budget,
  PortfolioSummary,
  DashboardOverview,
  SpendingAnalytics,
  AIInsight,
  NetWorthProjection,
} from '../types';

export const transactionService = {
  list: (params?: {
    page?: number;
    type?: string;
    categoryId?: string;
    startDate?: string;
    endDate?: string;
  }) => apiClient.get<Transaction[]>('/transactions', params as Record<string, unknown>),

  get: (id: string) => apiClient.get<Transaction>(`/transactions/${id}`),

  create: (data: Omit<Transaction, 'id' | 'userId' | 'synced' | 'createdAt' | 'updatedAt'>) =>
    apiClient.post<Transaction>('/transactions', data),

  update: (id: string, data: Partial<Transaction>) =>
    apiClient.put<Transaction>(`/transactions/${id}`, data),

  remove: (id: string) => apiClient.del<void>(`/transactions/${id}`),
};

export const categoryService = {
  list: () => apiClient.get<Category[]>('/categories'),

  create: (data: { name: string; icon?: string; color?: string }) =>
    apiClient.post<Category>('/categories', data),

  update: (id: string, data: Partial<Category>) =>
    apiClient.put<Category>(`/categories/${id}`, data),

  remove: (id: string) => apiClient.del<void>(`/categories/${id}`),
};

export const debtService = {
  list: () => apiClient.get<Debt[]>('/debts'),

  get: (id: string) => apiClient.get<Debt>(`/debts/${id}`),

  create: (data: Omit<Debt, 'id' | 'userId' | 'status' | 'createdAt' | 'paidDate'>) =>
    apiClient.post<Debt>('/debts', data),

  update: (id: string, data: Partial<Debt>) =>
    apiClient.put<Debt>(`/debts/${id}`, data),

  remove: (id: string) => apiClient.del<void>(`/debts/${id}`),

  addPayment: (debtId: string, data: { amount: number; paymentDate: string; note?: string }) =>
    apiClient.post<DebtPayment>(`/debts/${debtId}/payments`, data),

  getPayments: (debtId: string) =>
    apiClient.get<DebtPayment[]>(`/debts/${debtId}/payments`),
};

export const assetService = {
  list: () => apiClient.get<Asset[]>('/assets'),

  get: (id: string) => apiClient.get<Asset>(`/assets/${id}`),

  create: (data: Omit<Asset, 'id' | 'userId' | 'currentValue' | 'lastPriceUpdate' | 'createdAt' | 'updatedAt'>) =>
    apiClient.post<Asset>('/assets', data),

  update: (id: string, data: Partial<Asset>) =>
    apiClient.put<Asset>(`/assets/${id}`, data),

  remove: (id: string) => apiClient.del<void>(`/assets/${id}`),

  getPortfolio: () => apiClient.get<PortfolioSummary>('/assets/portfolio'),
};

export const budgetService = {
  list: () => apiClient.get<Budget[]>('/budgets'),

  create: (data: { categoryId: string; monthlyLimit: number }) =>
    apiClient.post<Budget>('/budgets', data),

  update: (id: string, data: Partial<Budget>) =>
    apiClient.put<Budget>(`/budgets/${id}`, data),
};

export const dashboardService = {
  getOverview: () => apiClient.get<DashboardOverview>('/dashboard/overview'),

  getSpendingAnalytics: (params?: { period?: string; startDate?: string; endDate?: string }) =>
    apiClient.get<SpendingAnalytics>('/analytics/spending', params as Record<string, unknown>),
};

export const aiService = {
  getSpendingInsights: () =>
    apiClient.get<AIInsight[]>('/ai/insights/spending'),

  getBudgetRecommendations: () =>
    apiClient.get<AIInsight[]>('/ai/insights/budget-recommendations'),

  getNetWorthProjection: (params?: { inflationRate?: number; returnRate?: number }) =>
    apiClient.post<NetWorthProjection[]>('/ai/insights/net-worth-projection', params),
};

export const marketService = {
  getStockPrice: (ticker: string) =>
    apiClient.get<{ price: number; change: number; changePercent: number }>(`/market/stocks/${ticker}`),

  getCryptoPrice: (symbol: string) =>
    apiClient.get<{ price: number; change24h: number; changePercent24h: number }>(`/market/crypto/${symbol}`),

  refreshPrices: () => apiClient.post<void>('/market/refresh'),
};

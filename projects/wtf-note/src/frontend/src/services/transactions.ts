import apiClient from './apiClient';
import type { ApiResponse, Transaction, TransactionFilter, PaginationInfo } from '../types';

interface TransactionListResponse {
  transactions: Transaction[];
  pagination: PaginationInfo;
}

export const transactionService = {
  async getAll(filter?: TransactionFilter, page = 1, limit = 20): Promise<TransactionListResponse> {
    const params: Record<string, string | number> = { page, limit };
    if (filter?.type) params.type = filter.type;
    if (filter?.category) params.category = filter.category;
    if (filter?.dateFrom) params.dateFrom = filter.dateFrom;
    if (filter?.dateTo) params.dateTo = filter.dateTo;
    if (filter?.minAmount) params.minAmount = filter.minAmount;
    if (filter?.maxAmount) params.maxAmount = filter.maxAmount;
    if (filter?.search) params.search = filter.search;

    const { data } = await apiClient.get<ApiResponse<Transaction[]>>('/transactions', { params });
    return {
      transactions: data.data,
      pagination: data.pagination ?? { page, limit, total: 0, totalPages: 0 },
    };
  },

  async getById(id: string): Promise<Transaction> {
    const { data } = await apiClient.get<ApiResponse<Transaction>>(`/transactions/${id}`);
    return data.data;
  },

  async create(transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const { data } = await apiClient.post<ApiResponse<Transaction>>('/transactions', transaction);
    return data.data;
  },

  async update(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    const { data } = await apiClient.put<ApiResponse<Transaction>>(`/transactions/${id}`, updates);
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/transactions/${id}`);
  },

  async getSummary(month?: number, year?: number): Promise<{
    totalIncome: number;
    totalExpense: number;
    balance: number;
    byCategory: Record<string, number>;
  }> {
    const params: Record<string, number> = {};
    if (month) params.month = month;
    if (year) params.year = year;
    const { data } = await apiClient.get<ApiResponse<{
      totalIncome: number;
      totalExpense: number;
      balance: number;
      byCategory: Record<string, number>;
    }>>('/transactions/summary', { params });
    return data.data;
  },
};

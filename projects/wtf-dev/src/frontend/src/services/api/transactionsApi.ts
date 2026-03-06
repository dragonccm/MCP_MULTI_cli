import { apiRequest } from './client';
import { Transaction, TransactionType, TransactionSummary } from '../../types';

interface TransactionListResponse {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ListParams {
  page?: number;
  limit?: number;
  type?: TransactionType;
  assetId?: string;
  categoryId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'date' | 'amount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export const transactionsApi = {
  async getAll(params?: ListParams): Promise<Transaction[]> {
    const result = await apiRequest<TransactionListResponse | Transaction[]>('/transactions', {
      params: params as Record<string, string | number | boolean | undefined>,
    });
    if (Array.isArray(result)) return result;
    return result.transactions ?? [];
  },

  async getById(id: string): Promise<Transaction> {
    return apiRequest<Transaction>(`/transactions/${id}`);
  },

  async getSummary(startDate: string, endDate: string): Promise<TransactionSummary> {
    return apiRequest<TransactionSummary>('/transactions/summary', {
      params: { startDate, endDate },
    });
  },

  async create(data: {
    assetId: string;
    categoryId?: string;
    type: TransactionType;
    amount: number;
    description?: string;
    note?: string;
    date?: string;
  }): Promise<Transaction> {
    return apiRequest<Transaction>('/transactions', {
      method: 'POST',
      body: data,
    });
  },

  async update(
    id: string,
    data: {
      categoryId?: string;
      amount?: number;
      description?: string;
      note?: string;
      date?: string;
    },
  ): Promise<Transaction> {
    return apiRequest<Transaction>(`/transactions/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  async delete(id: string): Promise<void> {
    return apiRequest<void>(`/transactions/${id}`, {
      method: 'DELETE',
    });
  },
};

import { create } from 'zustand';
import type { Transaction, TransactionFilter, PaginationInfo } from '../types';
import { transactionService } from '../services/transactions';

interface TransactionState {
  transactions: Transaction[];
  pagination: PaginationInfo | null;
  filter: TransactionFilter;
  isLoading: boolean;
  error: string | null;
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    byCategory: Record<string, number>;
  } | null;
  fetchTransactions: (page?: number) => Promise<void>;
  setFilter: (filter: TransactionFilter) => void;
  createTransaction: (tx: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  fetchSummary: (month?: number, year?: number) => Promise<void>;
  clearError: () => void;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  pagination: null,
  filter: {},
  isLoading: false,
  error: null,
  summary: null,

  fetchTransactions: async (page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const { transactions, pagination } = await transactionService.getAll(get().filter, page);
      set({ transactions, pagination, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải giao dịch';
      set({ error: message, isLoading: false });
    }
  },

  setFilter: (filter) => {
    set({ filter });
  },

  createTransaction: async (tx) => {
    set({ isLoading: true, error: null });
    try {
      await transactionService.create(tx);
      await get().fetchTransactions();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Tạo giao dịch thất bại';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  updateTransaction: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      await transactionService.update(id, updates);
      await get().fetchTransactions();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cập nhật giao dịch thất bại';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  deleteTransaction: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await transactionService.delete(id);
      await get().fetchTransactions();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Xóa giao dịch thất bại';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  fetchSummary: async (month, year) => {
    try {
      const summary = await transactionService.getSummary(month, year);
      set({ summary });
    } catch {
      // Silently fail for summary
    }
  },

  clearError: () => set({ error: null }),
}));

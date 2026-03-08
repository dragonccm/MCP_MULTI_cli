import { create } from 'zustand';
import type { Budget } from '../types';
import { budgetService } from '../services/budget';

interface BudgetState {
  budgets: Budget[];
  isLoading: boolean;
  error: string | null;
  fetchBudgets: (month?: number, year?: number) => Promise<void>;
  createBudget: (budget: Pick<Budget, 'category' | 'amount' | 'month' | 'year'>) => Promise<void>;
  updateBudget: (id: string, updates: Partial<Pick<Budget, 'category' | 'amount'>>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  budgets: [],
  isLoading: false,
  error: null,

  fetchBudgets: async (month?, year?) => {
    set({ isLoading: true, error: null });
    try {
      const budgets = await budgetService.getAll(month, year);
      set({ budgets, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải ngân sách';
      set({ error: message, isLoading: false });
    }
  },

  createBudget: async (budget) => {
    set({ isLoading: true, error: null });
    try {
      await budgetService.create(budget);
      await get().fetchBudgets(budget.month, budget.year);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Tạo ngân sách thất bại';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  updateBudget: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      await budgetService.update(id, updates);
      await get().fetchBudgets();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cập nhật ngân sách thất bại';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  deleteBudget: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await budgetService.delete(id);
      await get().fetchBudgets();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Xóa ngân sách thất bại';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));

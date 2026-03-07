import { create } from 'zustand';
import type {
  Transaction,
  Category,
  Debt,
  Asset,
  Budget,
  DashboardOverview,
  SpendingAnalytics,
  PortfolioSummary,
  AIInsight,
  NetWorthProjection,
} from '../types';
import {
  transactionService,
  categoryService,
  debtService,
  assetService,
  budgetService,
  dashboardService,
  aiService,
} from '../services/data';

interface AppState {
  // Transactions
  transactions: Transaction[];
  categories: Category[];
  transactionsLoading: boolean;

  // Debts
  debts: Debt[];
  debtsLoading: boolean;

  // Assets
  assets: Asset[];
  portfolio: PortfolioSummary | null;
  assetsLoading: boolean;

  // Budget
  budgets: Budget[];
  budgetsLoading: boolean;

  // Dashboard
  dashboard: DashboardOverview | null;
  analytics: SpendingAnalytics | null;
  dashboardLoading: boolean;

  // AI
  insights: AIInsight[];
  projections: NetWorthProjection[];
  aiLoading: boolean;

  // Actions - Transactions
  fetchTransactions: (params?: Record<string, unknown>) => Promise<void>;
  fetchCategories: () => Promise<void>;
  addTransaction: (data: Omit<Transaction, 'id' | 'userId' | 'synced' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;

  // Actions - Debts
  fetchDebts: () => Promise<void>;
  addDebt: (data: Omit<Debt, 'id' | 'userId' | 'status' | 'createdAt' | 'paidDate'>) => Promise<void>;
  removeDebt: (id: string) => Promise<void>;

  // Actions - Assets
  fetchAssets: () => Promise<void>;
  fetchPortfolio: () => Promise<void>;
  addAsset: (data: Omit<Asset, 'id' | 'userId' | 'currentValue' | 'lastPriceUpdate' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  removeAsset: (id: string) => Promise<void>;

  // Actions - Budget
  fetchBudgets: () => Promise<void>;
  addBudget: (data: { categoryId: string; monthlyLimit: number }) => Promise<void>;

  // Actions - Dashboard
  fetchDashboard: () => Promise<void>;
  fetchAnalytics: (params?: Record<string, unknown>) => Promise<void>;

  // Actions - AI
  fetchInsights: () => Promise<void>;
  fetchProjections: (params?: { inflationRate?: number; returnRate?: number }) => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  transactions: [],
  categories: [],
  transactionsLoading: false,
  debts: [],
  debtsLoading: false,
  assets: [],
  portfolio: null,
  assetsLoading: false,
  budgets: [],
  budgetsLoading: false,
  dashboard: null,
  analytics: null,
  dashboardLoading: false,
  insights: [],
  projections: [],
  aiLoading: false,

  fetchTransactions: async (params) => {
    set({ transactionsLoading: true });
    try {
      const data = await transactionService.list(params as Record<string, string>);
      set({ transactions: data, transactionsLoading: false });
    } catch {
      set({ transactionsLoading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const data = await categoryService.list();
      set({ categories: data });
    } catch {
      // Use defaults on error
    }
  },

  addTransaction: async (data) => {
    try {
      const tx = await transactionService.create(data);
      set((s) => ({ transactions: [tx, ...s.transactions] }));
    } catch (err) {
      throw err;
    }
  },

  removeTransaction: async (id) => {
    try {
      await transactionService.remove(id);
      set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) }));
    } catch (err) {
      throw err;
    }
  },

  fetchDebts: async () => {
    set({ debtsLoading: true });
    try {
      const data = await debtService.list();
      set({ debts: data, debtsLoading: false });
    } catch {
      set({ debtsLoading: false });
    }
  },

  addDebt: async (data) => {
    try {
      const debt = await debtService.create(data);
      set((s) => ({ debts: [debt, ...s.debts] }));
    } catch (err) {
      throw err;
    }
  },

  removeDebt: async (id) => {
    try {
      await debtService.remove(id);
      set((s) => ({ debts: s.debts.filter((d) => d.id !== id) }));
    } catch (err) {
      throw err;
    }
  },

  fetchAssets: async () => {
    set({ assetsLoading: true });
    try {
      const data = await assetService.list();
      set({ assets: data, assetsLoading: false });
    } catch {
      set({ assetsLoading: false });
    }
  },

  fetchPortfolio: async () => {
    try {
      const data = await assetService.getPortfolio();
      set({ portfolio: data });
    } catch {
      // Silently fail
    }
  },

  addAsset: async (data) => {
    try {
      const asset = await assetService.create(data);
      set((s) => ({ assets: [asset, ...s.assets] }));
    } catch (err) {
      throw err;
    }
  },

  removeAsset: async (id) => {
    try {
      await assetService.remove(id);
      set((s) => ({ assets: s.assets.filter((a) => a.id !== id) }));
    } catch (err) {
      throw err;
    }
  },

  fetchBudgets: async () => {
    set({ budgetsLoading: true });
    try {
      const data = await budgetService.list();
      set({ budgets: data, budgetsLoading: false });
    } catch {
      set({ budgetsLoading: false });
    }
  },

  addBudget: async (data) => {
    try {
      const budget = await budgetService.create(data);
      set((s) => ({ budgets: [...s.budgets, budget] }));
    } catch (err) {
      throw err;
    }
  },

  fetchDashboard: async () => {
    set({ dashboardLoading: true });
    try {
      const data = await dashboardService.getOverview();
      set({ dashboard: data, dashboardLoading: false });
    } catch {
      set({ dashboardLoading: false });
    }
  },

  fetchAnalytics: async (params) => {
    set({ dashboardLoading: true });
    try {
      const data = await dashboardService.getSpendingAnalytics(params as Record<string, string>);
      set({ analytics: data, dashboardLoading: false });
    } catch {
      set({ dashboardLoading: false });
    }
  },

  fetchInsights: async () => {
    set({ aiLoading: true });
    try {
      const data = await aiService.getSpendingInsights();
      set({ insights: data, aiLoading: false });
    } catch {
      set({ aiLoading: false });
    }
  },

  fetchProjections: async (params) => {
    set({ aiLoading: true });
    try {
      const data = await aiService.getNetWorthProjection(params);
      set({ projections: data, aiLoading: false });
    } catch {
      set({ aiLoading: false });
    }
  },
}));

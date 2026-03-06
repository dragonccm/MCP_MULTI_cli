import { Asset, Transaction, AssetType, TransactionType, AssetGroup, Budget, BudgetPeriod } from '../types';
import { getAssetTypeLabel, getAssetTypeColor } from '../utils/format';
import { assetsApi, transactionsApi, budgetsApi } from './api';

// In-memory cache for synchronous access from existing components
let cachedAssets: Asset[] = [];
let cachedTransactions: Transaction[] = [];
let cachedBudgets: Budget[] = [];

export function setCachedAssets(assets: Asset[]): void {
  cachedAssets = [...assets];
}

export function setCachedTransactions(transactions: Transaction[]): void {
  cachedTransactions = [...transactions];
}

export const assetService = {
  getAll(): Asset[] {
    return [...cachedAssets];
  },

  getById(id: string): Asset | undefined {
    return cachedAssets.find((a) => a.id === id);
  },

  async fetchAll(): Promise<Asset[]> {
    try {
      const data = await assetsApi.getAll();
      cachedAssets = data;
      return data;
    } catch {
      return cachedAssets;
    }
  },

  async fetchById(id: string): Promise<Asset | undefined> {
    try {
      return await assetsApi.getById(id);
    } catch {
      return cachedAssets.find((a) => a.id === id);
    }
  },

  async apiCreate(data: {
    name: string;
    type: AssetType;
    balance?: number;
    currency?: string;
  }): Promise<Asset> {
    const asset = await assetsApi.create(data);
    cachedAssets = [asset, ...cachedAssets];
    return asset;
  },

  async apiUpdate(
    id: string,
    data: { name?: string; balance?: number; currency?: string },
  ): Promise<Asset> {
    const updated = await assetsApi.update(id, data);
    cachedAssets = cachedAssets.map((a) => (a.id === id ? updated : a));
    return updated;
  },

  async apiDelete(id: string): Promise<void> {
    await assetsApi.delete(id);
    cachedAssets = cachedAssets.filter((a) => a.id !== id);
  },

  getGrouped(): AssetGroup[] {
    const groups: AssetGroup[] = [];
    const typeSet = new Set(cachedAssets.map((a) => a.type));

    for (const type of typeSet) {
      const typeAssets = cachedAssets.filter((a) => a.type === type);
      const total = typeAssets.reduce((sum, a) => sum + a.balance, 0);
      groups.push({
        type,
        label: getAssetTypeLabel(type),
        total,
        assets: typeAssets,
        color: getAssetTypeColor(type),
      });
    }

    return groups;
  },

  getNetWorth(): number {
    return cachedAssets.reduce((sum, a) => sum + a.balance, 0);
  },
};

export const transactionService = {
  getAll(): Transaction[] {
    return [...cachedTransactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  },

  getRecent(limit: number = 5): Transaction[] {
    return this.getAll().slice(0, limit);
  },

  async fetchAll(params?: {
    search?: string;
    type?: TransactionType;
    assetId?: string;
  }): Promise<Transaction[]> {
    try {
      const data = await transactionsApi.getAll(params);
      if (!params?.search && !params?.type && !params?.assetId) {
        cachedTransactions = data;
      }
      return data;
    } catch {
      return cachedTransactions;
    }
  },

  async apiCreate(data: {
    assetId: string;
    categoryId?: string;
    type: TransactionType;
    amount: number;
    description?: string;
    date?: string;
  }): Promise<Transaction> {
    const tx = await transactionsApi.create(data);
    cachedTransactions = [tx, ...cachedTransactions];
    // Refresh assets since balance changes
    await assetService.fetchAll();
    return tx;
  },

  async apiDelete(id: string): Promise<void> {
    await transactionsApi.delete(id);
    cachedTransactions = cachedTransactions.filter((t) => t.id !== id);
    await assetService.fetchAll();
  },

  search(query: string): Transaction[] {
    const lower = query.toLowerCase();
    return this.getAll().filter(
      (t) =>
        (t.description ?? '').toLowerCase().includes(lower) ||
        (t.category ?? '').toLowerCase().includes(lower) ||
        (t.assetName ?? '').toLowerCase().includes(lower),
    );
  },

  getByCategory(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const tx of cachedTransactions) {
      if (tx.type === TransactionType.EXPENSE) {
        const cat = tx.category ?? 'other';
        result[cat] = (result[cat] ?? 0) + tx.amount;
      }
    }
    return result;
  },

  getTotalExpense(): number {
    return cachedTransactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
  },

  getTotalIncome(): number {
    return cachedTransactions
      .filter((t) => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
  },
};

export function setCachedBudgets(budgets: Budget[]): void {
  cachedBudgets = [...budgets];
}

export const budgetService = {
  getAll(): Budget[] {
    return [...cachedBudgets];
  },

  getById(id: string): Budget | undefined {
    return cachedBudgets.find((b) => b.id === id);
  },

  async fetchAll(): Promise<Budget[]> {
    try {
      const data = await budgetsApi.getAll();
      cachedBudgets = data;
      return data;
    } catch {
      return cachedBudgets;
    }
  },

  async apiCreate(data: {
    categoryId: string;
    amount: number;
    period?: BudgetPeriod;
    startDate: string;
    endDate: string;
  }): Promise<Budget> {
    const budget = await budgetsApi.create(data);
    cachedBudgets = [budget, ...cachedBudgets];
    return budget;
  },

  async apiUpdate(
    id: string,
    data: { amount?: number; period?: BudgetPeriod; startDate?: string; endDate?: string },
  ): Promise<Budget> {
    const updated = await budgetsApi.update(id, data);
    cachedBudgets = cachedBudgets.map((b) => (b.id === id ? updated : b));
    return updated;
  },

  async apiDelete(id: string): Promise<void> {
    await budgetsApi.delete(id);
    cachedBudgets = cachedBudgets.filter((b) => b.id !== id);
  },

  getActiveBudgets(): Budget[] {
    const now = new Date();
    return cachedBudgets.filter((b) => {
      const end = new Date(b.endDate);
      return end >= now;
    });
  },

  getTotalBudgeted(): number {
    return this.getActiveBudgets().reduce((sum, b) => sum + b.amount, 0);
  },

  getTotalSpent(): number {
    return this.getActiveBudgets().reduce((sum, b) => sum + b.spent, 0);
  },

  getBudgetProgress(budget: Budget): number {
    if (budget.amount <= 0) return 0;
    return Math.min((budget.spent / budget.amount) * 100, 100);
  },
};

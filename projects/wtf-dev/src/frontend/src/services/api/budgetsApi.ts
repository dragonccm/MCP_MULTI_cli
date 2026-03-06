import { apiRequest } from './client';
import { Budget, BudgetPeriod } from '../../types';

export const budgetsApi = {
  async getAll(active?: boolean): Promise<Budget[]> {
    return apiRequest<Budget[]>('/budgets', {
      params: active !== undefined ? { active: active.toString() } : undefined,
    });
  },

  async getById(id: string): Promise<Budget> {
    return apiRequest<Budget>(`/budgets/${id}`);
  },

  async create(data: {
    categoryId: string;
    amount: number;
    period?: BudgetPeriod;
    startDate: string;
    endDate: string;
  }): Promise<Budget> {
    return apiRequest<Budget>('/budgets', {
      method: 'POST',
      body: data,
    });
  },

  async update(
    id: string,
    data: {
      amount?: number;
      period?: BudgetPeriod;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<Budget> {
    return apiRequest<Budget>(`/budgets/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  async delete(id: string): Promise<void> {
    return apiRequest<void>(`/budgets/${id}`, {
      method: 'DELETE',
    });
  },
};

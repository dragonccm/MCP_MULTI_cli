import apiClient from './apiClient';
import type { ApiResponse, Budget } from '../types';

export const budgetService = {
  async getAll(month?: number, year?: number): Promise<Budget[]> {
    const params: Record<string, number> = {};
    if (month) params.month = month;
    if (year) params.year = year;
    const { data } = await apiClient.get<ApiResponse<Budget[]>>('/profile/budgets', { params });
    return data.data;
  },

  async create(budget: Pick<Budget, 'category' | 'amount' | 'month' | 'year'>): Promise<Budget> {
    const { data } = await apiClient.post<ApiResponse<Budget>>('/profile/budgets', budget);
    return data.data;
  },

  async update(id: string, updates: Partial<Pick<Budget, 'category' | 'amount'>>): Promise<Budget> {
    const { data } = await apiClient.put<ApiResponse<Budget>>(`/profile/budgets/${id}`, updates);
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/profile/budgets/${id}`);
  },
};

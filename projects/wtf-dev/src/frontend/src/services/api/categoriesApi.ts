import { apiRequest } from './client';
import { ApiCategory, TransactionType } from '../../types';

export const categoriesApi = {
  async getAll(type?: TransactionType): Promise<ApiCategory[]> {
    return apiRequest<ApiCategory[]>('/categories', {
      params: type ? { type } : undefined,
    });
  },

  async getById(id: string): Promise<ApiCategory> {
    return apiRequest<ApiCategory>(`/categories/${id}`);
  },

  async create(data: {
    name: string;
    icon?: string;
    color?: string;
    type: TransactionType;
  }): Promise<ApiCategory> {
    return apiRequest<ApiCategory>('/categories', {
      method: 'POST',
      body: data,
    });
  },

  async update(
    id: string,
    data: { name?: string; icon?: string; color?: string },
  ): Promise<ApiCategory> {
    return apiRequest<ApiCategory>(`/categories/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  async delete(id: string): Promise<void> {
    return apiRequest<void>(`/categories/${id}`, {
      method: 'DELETE',
    });
  },
};

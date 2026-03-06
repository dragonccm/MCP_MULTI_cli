import { apiRequest } from './client';
import { Asset, AssetType, DashboardData } from '../../types';

export const assetsApi = {
  async getAll(type?: AssetType): Promise<Asset[]> {
    return apiRequest<Asset[]>('/assets', {
      params: type ? { type } : undefined,
    });
  },

  async getById(id: string): Promise<Asset> {
    return apiRequest<Asset>(`/assets/${id}`);
  },

  async getDashboard(): Promise<DashboardData> {
    return apiRequest<DashboardData>('/assets/dashboard');
  },

  async create(data: {
    name: string;
    type: AssetType;
    balance?: number;
    currency?: string;
    symbol?: string;
    metadata?: string;
  }): Promise<Asset> {
    return apiRequest<Asset>('/assets', {
      method: 'POST',
      body: data,
    });
  },

  async update(
    id: string,
    data: {
      name?: string;
      balance?: number;
      currency?: string;
      symbol?: string;
      metadata?: string;
    },
  ): Promise<Asset> {
    return apiRequest<Asset>(`/assets/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  async delete(id: string): Promise<void> {
    return apiRequest<void>(`/assets/${id}`, {
      method: 'DELETE',
    });
  },
};

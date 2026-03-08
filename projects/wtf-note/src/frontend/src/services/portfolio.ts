import apiClient from './apiClient';
import type { ApiResponse, Asset, PortfolioSummary, NewsArticle } from '../types';

export const portfolioService = {
  async getAssets(): Promise<Asset[]> {
    const { data } = await apiClient.get<ApiResponse<Asset[]>>('/portfolios/assets');
    return data.data;
  },

  async addAsset(asset: Omit<Asset, 'id' | 'userId' | 'currentPrice' | 'createdAt' | 'updatedAt'>): Promise<Asset> {
    const { data } = await apiClient.post<ApiResponse<Asset>>('/portfolios/assets', asset);
    return data.data;
  },

  async updateAsset(id: string, updates: Partial<Asset>): Promise<Asset> {
    const { data } = await apiClient.put<ApiResponse<Asset>>(`/portfolios/assets/${id}`, updates);
    return data.data;
  },

  async deleteAsset(id: string): Promise<void> {
    await apiClient.delete(`/portfolios/assets/${id}`);
  },

  async getPortfolioSummary(): Promise<PortfolioSummary> {
    const { data } = await apiClient.get<ApiResponse<PortfolioSummary>>('/portfolios');
    return data.data;
  },

  async getNews(page = 1): Promise<NewsArticle[]> {
    const { data } = await apiClient.get<ApiResponse<NewsArticle[]>>('/news', { params: { page } });
    return data.data;
  },
};

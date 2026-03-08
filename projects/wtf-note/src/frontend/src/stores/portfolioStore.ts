import { create } from 'zustand';
import type { Asset, PortfolioSummary, NewsArticle } from '../types';
import { portfolioService } from '../services/portfolio';

interface PortfolioState {
  assets: Asset[];
  summary: PortfolioSummary | null;
  news: NewsArticle[];
  isLoading: boolean;
  newsLoading: boolean;
  error: string | null;
  fetchAssets: () => Promise<void>;
  addAsset: (asset: Omit<Asset, 'id' | 'userId' | 'currentPrice' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAsset: (id: string, updates: Partial<Asset>) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  fetchSummary: () => Promise<void>;
  fetchNews: (page?: number) => Promise<void>;
  clearError: () => void;
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  assets: [],
  summary: null,
  news: [],
  isLoading: false,
  newsLoading: false,
  error: null,

  fetchAssets: async () => {
    set({ isLoading: true, error: null });
    try {
      const assets = await portfolioService.getAssets();
      set({ assets, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải danh mục';
      set({ error: message, isLoading: false });
    }
  },

  addAsset: async (asset) => {
    set({ isLoading: true, error: null });
    try {
      await portfolioService.addAsset(asset);
      await get().fetchAssets();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Thêm tài sản thất bại';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  updateAsset: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      await portfolioService.updateAsset(id, updates);
      await get().fetchAssets();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cập nhật tài sản thất bại';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  deleteAsset: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await portfolioService.deleteAsset(id);
      await get().fetchAssets();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Xóa tài sản thất bại';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  fetchSummary: async () => {
    try {
      const summary = await portfolioService.getPortfolioSummary();
      set({ summary });
    } catch {
      // Silently fail for summary
    }
  },

  fetchNews: async (page = 1) => {
    set({ newsLoading: true });
    try {
      const news = await portfolioService.getNews(page);
      set({ news, newsLoading: false });
    } catch {
      set({ newsLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

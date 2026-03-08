import { describe, it, expect, beforeEach, vi } from 'vitest';
import { portfolioService } from '../../src/services/portfolio';
import apiClient from '../../src/services/apiClient';
import type { Asset, PortfolioSummary, NewsArticle } from '../../src/types';

vi.mock('../../src/services/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Portfolio Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockAssets: Asset[] = [
    {
      id: 'asset-1',
      userId: 'user-1',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      assetType: 'stock',
      quantity: 10,
      purchasePrice: 150,
      purchaseDate: '2024-01-10',
      currency: 'USD',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'asset-2',
      userId: 'user-1',
      symbol: 'BTC',
      name: 'Bitcoin',
      assetType: 'crypto',
      quantity: 0.5,
      purchasePrice: 40000,
      purchaseDate: '2024-01-15',
      currency: 'USD',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  describe('getAssets', () => {
    it('should fetch all assets', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: mockAssets,
        },
      });

      const result = await portfolioService.getAssets();

      expect(apiClient.get).toHaveBeenCalledWith('/portfolios/assets');
      expect(result).toEqual(mockAssets);
    });

    it('should handle empty asset list', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: [],
        },
      });

      const result = await portfolioService.getAssets();

      expect(result).toEqual([]);
    });
  });

  describe('addAsset', () => {
    it('should add a new stock asset', async () => {
      const newAsset: Omit<Asset, 'id' | 'userId' | 'currentPrice' | 'createdAt' | 'updatedAt'> = {
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        assetType: 'stock',
        quantity: 5,
        purchasePrice: 140,
        purchaseDate: '2024-01-20',
        currency: 'USD',
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: {
          success: true,
          data: { ...newAsset, id: 'asset-new', userId: 'user-1' },
        },
      });

      const result = await portfolioService.addAsset(newAsset);

      expect(apiClient.post).toHaveBeenCalledWith('/portfolios/assets', newAsset);
      expect(result.symbol).toBe('GOOGL');
    });

    it('should add a crypto asset', async () => {
      const newAsset: Omit<Asset, 'id' | 'userId' | 'currentPrice' | 'createdAt' | 'updatedAt'> = {
        symbol: 'ETH',
        name: 'Ethereum',
        assetType: 'crypto',
        quantity: 2,
        purchasePrice: 2500,
        purchaseDate: '2024-01-21',
        currency: 'USD',
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: {
          success: true,
          data: { ...newAsset, id: 'asset-eth', userId: 'user-1' },
        },
      });

      const result = await portfolioService.addAsset(newAsset);

      expect(result.assetType).toBe('crypto');
    });

    it('should throw error on invalid asset data', async () => {
      const invalidAsset = {
        symbol: '',
        assetType: 'invalid',
        quantity: -1,
        purchasePrice: 100,
        purchaseDate: '2024-01-20',
        currency: 'USD',
      };

      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Invalid asset data'));

      await expect(portfolioService.addAsset(invalidAsset as any)).rejects.toThrow('Invalid asset data');
    });
  });

  describe('updateAsset', () => {
    it('should update an asset', async () => {
      const updates = {
        quantity: 15,
        purchasePrice: 155,
      };

      vi.mocked(apiClient.put).mockResolvedValueOnce({
        data: {
          success: true,
          data: { ...mockAssets[0], ...updates },
        },
      });

      const result = await portfolioService.updateAsset('asset-1', updates);

      expect(apiClient.put).toHaveBeenCalledWith('/portfolios/assets/asset-1', updates);
      expect(result.quantity).toBe(15);
    });

    it('should throw error for non-existent asset', async () => {
      vi.mocked(apiClient.put).mockRejectedValueOnce(new Error('Asset not found'));

      await expect(portfolioService.updateAsset('non-existent', { quantity: 10 })).rejects.toThrow('Asset not found');
    });
  });

  describe('deleteAsset', () => {
    it('should delete an asset', async () => {
      vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: { success: true } });

      await expect(portfolioService.deleteAsset('asset-1')).resolves.toBeUndefined();

      expect(apiClient.delete).toHaveBeenCalledWith('/portfolios/assets/asset-1');
    });

    it('should throw error for non-existent asset', async () => {
      vi.mocked(apiClient.delete).mockRejectedValueOnce(new Error('Asset not found'));

      await expect(portfolioService.deleteAsset('non-existent')).rejects.toThrow('Asset not found');
    });
  });

  describe('getPortfolioSummary', () => {
    it('should get portfolio summary', async () => {
      const mockSummary: PortfolioSummary = {
        totalValue: 50000,
        totalCost: 45000,
        totalGainLoss: 5000,
        gainLossPercentage: 11.11,
        assets: [],
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: mockSummary,
        },
      });

      const result = await portfolioService.getPortfolioSummary();

      expect(apiClient.get).toHaveBeenCalledWith('/portfolios');
      expect(result).toEqual(mockSummary);
      expect(result.totalGainLoss).toBe(5000);
    });

    it('should throw error when summary fetch fails', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'));

      await expect(portfolioService.getPortfolioSummary()).rejects.toThrow('Network error');
    });
  });

  describe('getNews', () => {
    it('should get financial news', async () => {
      const mockNews: NewsArticle[] = [
        {
          id: 'news-1',
          title: 'Market Update',
          description: 'Stock market rises',
          source: 'Financial Times',
          url: 'https://example.com/news/1',
          publishedAt: new Date().toISOString(),
        },
      ];

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: mockNews,
        },
      });

      const result = await portfolioService.getNews(1);

      expect(apiClient.get).toHaveBeenCalledWith('/news', { params: { page: 1 } });
      expect(result).toEqual(mockNews);
    });

    it('should handle empty news list', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: [],
        },
      });

      const result = await portfolioService.getNews();

      expect(result).toEqual([]);
    });
  });
});

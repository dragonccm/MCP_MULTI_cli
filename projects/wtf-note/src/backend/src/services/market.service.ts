import { marketPriceRepository } from "../repositories/aiInsight.repository";
import { assetRepository } from "../repositories/asset.repository";
import { logger } from "../utils/logger";

export const marketService = {
  async refreshStockPrices(userId: string) {
    const assets = await assetRepository.findByUser(userId, "stock");
    const tickers = [...new Set(assets.map((a) => a.ticker).filter(Boolean))] as string[];
    const results: { symbol: string; price: number; change24h: number | null; source: string }[] = [];

    for (const ticker of tickers) {
      try {
        const mockPrice = generateMockPrice(ticker, "stock");
        await marketPriceRepository.upsert(ticker, "stock", mockPrice.price, mockPrice.change24h);
        results.push({ symbol: ticker, ...mockPrice, source: "mock" });
      } catch (error) {
        logger.error(`Failed to fetch price for ${ticker}`, { error });
        const cached = await marketPriceRepository.findBySymbol(ticker, "stock");
        if (cached) {
          results.push({ symbol: ticker, price: cached.price, change24h: cached.change24h, source: "cache" });
        }
      }
    }

    return results;
  },

  async refreshCryptoPrices(userId: string) {
    const assets = await assetRepository.findByUser(userId, "crypto");
    const symbols = [...new Set(assets.map((a) => a.coinSymbol).filter(Boolean))] as string[];
    const results: { symbol: string; price: number; change24h: number | null; source: string }[] = [];

    for (const symbol of symbols) {
      try {
        const mockPrice = generateMockPrice(symbol, "crypto");
        await marketPriceRepository.upsert(symbol, "crypto", mockPrice.price, mockPrice.change24h);
        results.push({ symbol, ...mockPrice, source: "mock" });
      } catch (error) {
        logger.error(`Failed to fetch crypto price for ${symbol}`, { error });
        const cached = await marketPriceRepository.findBySymbol(symbol, "crypto");
        if (cached) {
          results.push({ symbol, price: cached.price, change24h: cached.change24h, source: "cache" });
        }
      }
    }

    return results;
  },

  async getCachedPrices(type?: string) {
    return marketPriceRepository.findAll(type);
  },

  async getPriceBySymbol(symbol: string, type: string) {
    return marketPriceRepository.findBySymbol(symbol, type);
  },
};

// Mock price generator - replace with real API calls in production
function generateMockPrice(symbol: string, type: string): { price: number; change24h: number } {
  const basePrices: Record<string, number> = {
    AAPL: 178.5, GOOGL: 141.2, MSFT: 378.9, AMZN: 186.3, TSLA: 248.7,
    BTC: 67500, ETH: 3450, SOL: 142.8, BNB: 612.5, ADA: 0.62,
  };
  const base = basePrices[symbol.toUpperCase()] || (type === "crypto" ? 1.5 : 50);
  const variance = base * 0.02;
  const price = base + (Math.random() * variance * 2 - variance);
  const change24h = (Math.random() * 10 - 5);
  return { price: Math.round(price * 100) / 100, change24h: Math.round(change24h * 100) / 100 };
}

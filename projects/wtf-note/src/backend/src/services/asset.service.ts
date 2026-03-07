import { assetRepository } from "../repositories/asset.repository";
import { marketPriceRepository } from "../repositories/aiInsight.repository";
import { createAppError } from "../middleware/errorHandler";

export const assetService = {
  async list(userId: string, type?: string) {
    const assets = await assetRepository.findByUser(userId, type);
    return enrichAssetsWithMarketData(assets);
  },

  async getById(userId: string, id: string) {
    const asset = await assetRepository.findById(id, userId);
    if (!asset) {
      throw createAppError("Asset not found", 404);
    }
    return enrichSingleAsset(asset);
  },

  async create(userId: string, data: Record<string, unknown> & { type: string }) {
    return assetRepository.create({ ...data, userId });
  },

  async update(userId: string, id: string, data: Record<string, unknown>) {
    const asset = await assetRepository.findById(id, userId);
    if (!asset) {
      throw createAppError("Asset not found", 404);
    }
    return assetRepository.update(id, data);
  },

  async delete(userId: string, id: string) {
    const asset = await assetRepository.findById(id, userId);
    if (!asset) {
      throw createAppError("Asset not found", 404);
    }
    return assetRepository.softDelete(id);
  },

  async getPortfolioOverview(userId: string) {
    const assets = await assetRepository.getPortfolioSummary(userId);
    let totalValue = 0;
    let totalInvested = 0;
    const breakdown: Record<string, { value: number; invested: number; count: number }> = {
      stock: { value: 0, invested: 0, count: 0 },
      crypto: { value: 0, invested: 0, count: 0 },
      real_estate: { value: 0, invested: 0, count: 0 },
    };

    for (const asset of assets) {
      const { currentValue, investedValue } = await calculateAssetValues(asset);
      totalValue += currentValue;
      totalInvested += investedValue;
      breakdown[asset.type].value += currentValue;
      breakdown[asset.type].invested += investedValue;
      breakdown[asset.type].count += 1;
    }

    return {
      totalValue,
      totalInvested,
      totalGainLoss: totalValue - totalInvested,
      totalGainLossPercent: totalInvested > 0
        ? ((totalValue - totalInvested) / totalInvested) * 100
        : 0,
      breakdown,
      assetCount: assets.length,
    };
  },
};

async function calculateAssetValues(asset: Record<string, unknown>): Promise<{
  currentValue: number;
  investedValue: number;
}> {
  if (asset.type === "stock" && asset.ticker) {
    const marketPrice = await marketPriceRepository.findBySymbol(asset.ticker as string, "stock");
    const quantity = (asset.stockQuantity as number) || 0;
    const purchasePrice = (asset.purchasePrice as number) || 0;
    const currentPrice = marketPrice?.price || purchasePrice;
    return {
      currentValue: quantity * currentPrice,
      investedValue: quantity * purchasePrice,
    };
  }

  if (asset.type === "crypto" && asset.coinSymbol) {
    const marketPrice = await marketPriceRepository.findBySymbol(asset.coinSymbol as string, "crypto");
    const quantity = (asset.cryptoQuantity as number) || 0;
    const avgBuyPrice = (asset.avgBuyPrice as number) || 0;
    const currentPrice = marketPrice?.price || avgBuyPrice;
    return {
      currentValue: quantity * currentPrice,
      investedValue: quantity * avgBuyPrice,
    };
  }

  if (asset.type === "real_estate") {
    const purchasePrice = (asset.realEstatePurchasePrice as number) || 0;
    const estimatedValue = (asset.estimatedValue as number) || purchasePrice;
    const ownershipPct = (asset.ownershipPercentage as number) || 100;
    return {
      currentValue: (estimatedValue * ownershipPct) / 100,
      investedValue: (purchasePrice * ownershipPct) / 100,
    };
  }

  return { currentValue: 0, investedValue: 0 };
}

async function enrichAssetsWithMarketData(assets: Record<string, unknown>[]) {
  return Promise.all(assets.map(enrichSingleAsset));
}

async function enrichSingleAsset(asset: Record<string, unknown>) {
  const { currentValue, investedValue } = await calculateAssetValues(asset);
  return {
    ...asset,
    currentValue,
    investedValue,
    gainLoss: currentValue - investedValue,
    gainLossPercent: investedValue > 0 ? ((currentValue - investedValue) / investedValue) * 100 : 0,
  };
}

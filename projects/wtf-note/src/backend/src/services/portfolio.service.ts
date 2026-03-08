import { portfolioRepository } from '../repositories/portfolio.repository';
import { assetRepository } from '../repositories/asset.repository';
import { AppError } from '../types';
import { CreatePortfolioInput, UpdatePortfolioInput, CreateAssetInput, UpdateAssetInput } from '../validators/portfolio.validator';
import logger from '../utils/logger';

export class PortfolioService {
  async createPortfolio(userId: string, input: CreatePortfolioInput) {
    const portfolio = await portfolioRepository.create({
      user: { connect: { id: userId } },
      name: input.name,
    });
    logger.info('Portfolio created', { portfolioId: portfolio.id, userId });
    return portfolio;
  }

  async getPortfolios(userId: string) {
    const portfolios = await portfolioRepository.findMany(userId);

    return portfolios.map((portfolio) => {
      const totalValue = portfolio.assets.reduce((sum, asset) => {
        const currentValue = (asset.currentPrice || asset.purchasePrice) * asset.quantity;
        return sum + currentValue;
      }, 0);

      const totalCost = portfolio.assets.reduce((sum, asset) => {
        return sum + asset.purchasePrice * asset.quantity;
      }, 0);

      return {
        ...portfolio,
        totalValue,
        totalCost,
        totalGainLoss: totalValue - totalCost,
        totalGainLossPercent: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0,
      };
    });
  }

  async getPortfolioById(userId: string, portfolioId: string) {
    const portfolio = await portfolioRepository.findById(portfolioId, userId);
    if (!portfolio) {
      throw new AppError('Portfolio not found', 404);
    }

    const assetsWithMetrics = portfolio.assets.map((asset) => {
      const currentValue = (asset.currentPrice || asset.purchasePrice) * asset.quantity;
      const costBasis = asset.purchasePrice * asset.quantity;
      return {
        ...asset,
        currentValue,
        costBasis,
        gainLoss: currentValue - costBasis,
        gainLossPercent: costBasis > 0 ? ((currentValue - costBasis) / costBasis) * 100 : 0,
      };
    });

    const totalValue = assetsWithMetrics.reduce((sum, a) => sum + a.currentValue, 0);
    const totalCost = assetsWithMetrics.reduce((sum, a) => sum + a.costBasis, 0);

    return {
      ...portfolio,
      assets: assetsWithMetrics,
      totalValue,
      totalCost,
      totalGainLoss: totalValue - totalCost,
      totalGainLossPercent: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0,
    };
  }

  async updatePortfolio(userId: string, portfolioId: string, input: UpdatePortfolioInput) {
    const existing = await portfolioRepository.findById(portfolioId, userId);
    if (!existing) {
      throw new AppError('Portfolio not found', 404);
    }

    const portfolio = await portfolioRepository.update(portfolioId, { name: input.name });
    logger.info('Portfolio updated', { portfolioId, userId });
    return portfolio;
  }

  async deletePortfolio(userId: string, portfolioId: string) {
    const existing = await portfolioRepository.findById(portfolioId, userId);
    if (!existing) {
      throw new AppError('Portfolio not found', 404);
    }
    await portfolioRepository.softDelete(portfolioId);
    logger.info('Portfolio deleted', { portfolioId, userId });
  }

  async addAsset(userId: string, input: CreateAssetInput) {
    const portfolio = await portfolioRepository.findById(input.portfolioId, userId);
    if (!portfolio) {
      throw new AppError('Portfolio not found', 404);
    }

    const existingAsset = await assetRepository.findBySymbol(input.portfolioId, input.symbol);
    if (existingAsset) {
      throw new AppError(`Asset with symbol ${input.symbol} already exists in this portfolio. Consider updating the existing holding.`, 409);
    }

    const asset = await assetRepository.create({
      portfolio: { connect: { id: input.portfolioId } },
      symbol: input.symbol.toUpperCase(),
      name: input.name,
      type: input.type,
      quantity: input.quantity,
      purchasePrice: input.purchasePrice,
      purchaseDate: new Date(input.purchaseDate),
      currency: input.currency || 'VND',
    });

    logger.info('Asset added', { assetId: asset.id, portfolioId: input.portfolioId });
    return asset;
  }

  async addAssetToPortfolio(userId: string, portfolioId: string, input: Omit<CreateAssetInput, 'portfolioId'>) {
    const portfolio = await portfolioRepository.findById(portfolioId, userId);
    if (!portfolio) {
      throw new AppError('Portfolio not found', 404);
    }

    const existingAsset = await assetRepository.findBySymbol(portfolioId, input.symbol);
    if (existingAsset) {
      throw new AppError(`Asset with symbol ${input.symbol} already exists in this portfolio. Consider updating the existing holding.`, 409);
    }

    const asset = await assetRepository.create({
      portfolio: { connect: { id: portfolioId } },
      symbol: input.symbol.toUpperCase(),
      name: input.name,
      type: input.type,
      quantity: input.quantity,
      purchasePrice: input.purchasePrice,
      purchaseDate: new Date(input.purchaseDate),
      currency: input.currency || 'VND',
    });

    logger.info('Asset added', { assetId: asset.id, portfolioId });
    return asset;
  }

  async getAssetsByPortfolio(userId: string, portfolioId: string) {
    const portfolio = await portfolioRepository.findById(portfolioId, userId);
    if (!portfolio) {
      throw new AppError('Portfolio not found', 404);
    }
    return portfolio.assets;
  }

  async getPortfolioSummary(userId: string) {
    const portfolios = await portfolioRepository.findMany(userId);
    
    const totalValue = portfolios.reduce((sum, p) => {
      return sum + p.assets.reduce((assetSum, asset) => {
        return assetSum + (asset.currentPrice || asset.purchasePrice) * asset.quantity;
      }, 0);
    }, 0);

    const totalCost = portfolios.reduce((sum, p) => {
      return sum + p.assets.reduce((assetSum, asset) => {
        return assetSum + asset.purchasePrice * asset.quantity;
      }, 0);
    }, 0);

    return {
      totalPortfolios: portfolios.length,
      totalAssets: portfolios.reduce((sum, p) => sum + p.assets.length, 0),
      totalValue,
      totalCost,
      totalGainLoss: totalValue - totalCost,
      totalGainLossPercent: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0,
    };
  }

  async updateAsset(userId: string, assetId: string, input: UpdateAssetInput) {
    const asset = await assetRepository.findById(assetId);
    if (!asset) {
      throw new AppError('Asset not found', 404);
    }

    const portfolio = await portfolioRepository.findById(asset.portfolioId, userId);
    if (!portfolio) {
      throw new AppError('Portfolio not found', 404);
    }

    const updateData: Record<string, unknown> = {};
    if (input.symbol !== undefined) updateData.symbol = input.symbol.toUpperCase();
    if (input.name !== undefined) updateData.name = input.name;
    if (input.type !== undefined) updateData.type = input.type;
    if (input.quantity !== undefined) updateData.quantity = input.quantity;
    if (input.purchasePrice !== undefined) updateData.purchasePrice = input.purchasePrice;
    if (input.purchaseDate !== undefined) updateData.purchaseDate = new Date(input.purchaseDate);
    if (input.currency !== undefined) updateData.currency = input.currency;

    const updated = await assetRepository.update(assetId, updateData);
    logger.info('Asset updated', { assetId, userId });
    return updated;
  }

  async deleteAsset(userId: string, assetId: string) {
    const asset = await assetRepository.findById(assetId);
    if (!asset) {
      throw new AppError('Asset not found', 404);
    }

    const portfolio = await portfolioRepository.findById(asset.portfolioId, userId);
    if (!portfolio) {
      throw new AppError('Portfolio not found', 404);
    }

    await assetRepository.softDelete(assetId);
    logger.info('Asset deleted', { assetId, userId });
  }
}

export const portfolioService = new PortfolioService();

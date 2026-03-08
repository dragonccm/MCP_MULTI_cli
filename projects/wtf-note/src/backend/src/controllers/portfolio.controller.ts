import { Response, NextFunction } from 'express';
import { portfolioService } from '../services/portfolio.service';
import { sendSuccess } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../types';

export class PortfolioController {
  async createPortfolio(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const portfolio = await portfolioService.createPortfolio(userId, req.body);
      sendSuccess(res, portfolio, 'Portfolio created', 201);
    } catch (error) {
      next(error);
    }
  }

  async getPortfolios(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const portfolios = await portfolioService.getPortfolios(userId);
      sendSuccess(res, portfolios, 'Portfolios retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getPortfolioById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const portfolio = await portfolioService.getPortfolioById(userId, req.params.id as string);
      sendSuccess(res, portfolio, 'Portfolio retrieved');
    } catch (error) {
      next(error);
    }
  }

  async updatePortfolio(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const portfolio = await portfolioService.updatePortfolio(userId, req.params.id as string, req.body);
      sendSuccess(res, portfolio, 'Portfolio updated');
    } catch (error) {
      next(error);
    }
  }

  async deletePortfolio(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      await portfolioService.deletePortfolio(userId, req.params.id as string);
      sendSuccess(res, null, 'Portfolio deleted');
    } catch (error) {
      next(error);
    }
  }

  async addAsset(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const asset = await portfolioService.addAsset(userId, req.body);
      sendSuccess(res, asset, 'Asset added', 201);
    } catch (error) {
      next(error);
    }
  }

  async addAssetToPortfolio(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const portfolioId = req.params.id as string;
      const asset = await portfolioService.addAssetToPortfolio(userId, portfolioId, req.body);
      sendSuccess(res, asset, 'Asset added', 201);
    } catch (error) {
      next(error);
    }
  }

  async getAssetsByPortfolio(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const portfolioId = req.params.id as string;
      const assets = await portfolioService.getAssetsByPortfolio(userId, portfolioId);
      sendSuccess(res, assets, 'Assets retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getPortfolioSummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const summary = await portfolioService.getPortfolioSummary(userId);
      sendSuccess(res, summary, 'Portfolio summary retrieved');
    } catch (error) {
      next(error);
    }
  }

  async updateAsset(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const asset = await portfolioService.updateAsset(userId, req.params.assetId as string, req.body);
      sendSuccess(res, asset, 'Asset updated');
    } catch (error) {
      next(error);
    }
  }

  async deleteAsset(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      await portfolioService.deleteAsset(userId, req.params.assetId as string);
      sendSuccess(res, null, 'Asset deleted');
    } catch (error) {
      next(error);
    }
  }
}

export const portfolioController = new PortfolioController();

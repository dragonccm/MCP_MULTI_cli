import { Response, NextFunction } from "express";
import { assetService } from "../services/asset.service";
import { sendSuccess } from "../utils/apiResponse";
import { AuthRequest } from "../types";

export const assetController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const type = req.query.type as string | undefined;
      const assets = await assetService.list(req.user!.userId, type);
      sendSuccess(res, assets, "Assets retrieved");
    } catch (error) {
      next(error);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const asset = await assetService.getById(req.user!.userId, req.params.id as string);
      sendSuccess(res, asset, "Asset retrieved");
    } catch (error) {
      next(error);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const asset = await assetService.create(req.user!.userId, req.body);
      sendSuccess(res, asset, "Asset created", 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const asset = await assetService.update(req.user!.userId, req.params.id as string, req.body);
      sendSuccess(res, asset, "Asset updated");
    } catch (error) {
      next(error);
    }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await assetService.delete(req.user!.userId, req.params.id as string);
      sendSuccess(res, null, "Asset deleted");
    } catch (error) {
      next(error);
    }
  },

  async getPortfolioOverview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const overview = await assetService.getPortfolioOverview(req.user!.userId);
      sendSuccess(res, overview, "Portfolio overview retrieved");
    } catch (error) {
      next(error);
    }
  },
};

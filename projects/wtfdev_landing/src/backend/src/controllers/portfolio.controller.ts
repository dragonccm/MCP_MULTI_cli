import type { Request, Response } from "express";
import { portfolioService } from "../services/portfolio.service.js";
import { portfolioQuerySchema, uuidParamSchema } from "../utils/validators.js";

export const portfolioController = {
  async getAll(req: Request, res: Response): Promise<void> {
    const filters = portfolioQuerySchema.parse(req.query);
    const result = await portfolioService.getProjects(filters);
    res.status(200).json({
      success: true,
      ...result,
    });
  },

  async getById(req: Request, res: Response): Promise<void> {
    const { id } = uuidParamSchema.parse(req.params);
    const project = await portfolioService.getProjectById(id);
    res.status(200).json({
      success: true,
      data: project,
    });
  },

  async getCategories(_req: Request, res: Response): Promise<void> {
    const result = await portfolioService.getCategories();
    res.status(200).json({
      success: true,
      ...result,
    });
  },
};

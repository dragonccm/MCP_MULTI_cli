import { Response, NextFunction } from "express";
import { budgetService } from "../services/budget.service";
import { sendSuccess } from "../utils/apiResponse";
import { AuthRequest } from "../types";

export const budgetController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const month = req.query.month ? parseInt(req.query.month as string) : undefined;
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      const budgets = await budgetService.list(req.user!.userId, month, year);
      sendSuccess(res, budgets, "Budgets retrieved");
    } catch (error) {
      next(error);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const budget = await budgetService.getById(req.user!.userId, req.params.id as string);
      sendSuccess(res, budget, "Budget retrieved");
    } catch (error) {
      next(error);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const budget = await budgetService.create(req.user!.userId, req.body);
      sendSuccess(res, budget, "Budget created", 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const budget = await budgetService.update(req.user!.userId, req.params.id as string, req.body);
      sendSuccess(res, budget, "Budget updated");
    } catch (error) {
      next(error);
    }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await budgetService.delete(req.user!.userId, req.params.id as string);
      sendSuccess(res, null, "Budget deleted");
    } catch (error) {
      next(error);
    }
  },
};

import { Response, NextFunction } from "express";
import { aiService } from "../services/ai.service";
import { sendSuccess } from "../utils/apiResponse";
import { AuthRequest } from "../types";

export const aiController = {
  async getSpendingInsights(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const insights = await aiService.getSpendingInsights(req.user!.userId);
      sendSuccess(res, insights, "Spending insights generated");
    } catch (error) {
      next(error);
    }
  },

  async getBudgetRecommendations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const recommendations = await aiService.getBudgetRecommendations(req.user!.userId);
      sendSuccess(res, recommendations, "Budget recommendations generated");
    } catch (error) {
      next(error);
    }
  },

  async getNetWorthProjection(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const savingsRate = req.query.savingsRate ? parseFloat(req.query.savingsRate as string) : undefined;
      const years = req.query.years ? parseInt(req.query.years as string) : undefined;
      const projection = await aiService.getNetWorthProjection(req.user!.userId, savingsRate, years);
      sendSuccess(res, projection, "Net worth projection generated");
    } catch (error) {
      next(error);
    }
  },

  async getInsightHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const type = req.query.type as string | undefined;
      const insights = await aiService.getInsightHistory(req.user!.userId, type);
      sendSuccess(res, insights, "Insight history retrieved");
    } catch (error) {
      next(error);
    }
  },
};

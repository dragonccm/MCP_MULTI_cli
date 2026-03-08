import { Response, NextFunction } from 'express';
import { aiService } from '../services/ai.service';
import { sendSuccess } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../types';

export class AiController {
  async getSpendingInsights(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await aiService.getSpendingInsights(userId, req.body);
      sendSuccess(res, result, 'Spending insights generated');
    } catch (error) {
      next(error);
    }
  }

  async getInvestmentAdvice(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await aiService.getInvestmentAdvice(userId, req.body);
      sendSuccess(res, result, 'Investment advice generated');
    } catch (error) {
      next(error);
    }
  }

  async getBudgetPlanning(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await aiService.getBudgetPlanning(userId, req.body);
      sendSuccess(res, result, 'Budget plan generated');
    } catch (error) {
      next(error);
    }
  }
}

export const aiController = new AiController();

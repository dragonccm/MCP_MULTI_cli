import { Response, NextFunction } from 'express';
import { transactionService } from '../services/transaction.service';
import { sendSuccess } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../types';

export class TransactionController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const transaction = await transactionService.create(userId, req.body);
      sendSuccess(res, transaction, 'Transaction created', 201);
    } catch (error) {
      next(error);
    }
  }

  async getMany(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await transactionService.getMany(userId, req.query as never);
      sendSuccess(res, result.transactions, 'Transactions retrieved', 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const transaction = await transactionService.getById(userId, req.params.id as string);
      sendSuccess(res, transaction, 'Transaction retrieved');
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const transaction = await transactionService.update(userId, req.params.id as string, req.body);
      sendSuccess(res, transaction, 'Transaction updated');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      await transactionService.delete(userId, req.params.id as string);
      sendSuccess(res, null, 'Transaction deleted');
    } catch (error) {
      next(error);
    }
  }

  async getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
      const summary = await transactionService.getSummary(userId, startDate, endDate);
      sendSuccess(res, summary, 'Transaction summary retrieved');
    } catch (error) {
      next(error);
    }
  }
}

export const transactionController = new TransactionController();

import { Response, NextFunction } from "express";
import { transactionService } from "../services/transaction.service";
import { sendSuccess, sendPaginated } from "../utils/apiResponse";
import { AuthRequest } from "../types";

export const transactionController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await transactionService.list(req.user!.userId, req.query as Record<string, string>);
      sendPaginated(res, result.data, result.total, result.page, result.limit, "Transactions retrieved");
    } catch (error) {
      next(error);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const transaction = await transactionService.getById(req.user!.userId, req.params.id as string);
      sendSuccess(res, transaction, "Transaction retrieved");
    } catch (error) {
      next(error);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { transaction, isDuplicate } = await transactionService.create(req.user!.userId, req.body);
      const message = isDuplicate
        ? "Transaction created (possible duplicate detected)"
        : "Transaction created";
      sendSuccess(res, transaction, message, 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const transaction = await transactionService.update(req.user!.userId, req.params.id as string, req.body);
      sendSuccess(res, transaction, "Transaction updated");
    } catch (error) {
      next(error);
    }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await transactionService.delete(req.user!.userId, req.params.id as string);
      sendSuccess(res, null, "Transaction deleted");
    } catch (error) {
      next(error);
    }
  },

  async bulkDelete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { ids } = req.body;
      const result = await transactionService.bulkDelete(req.user!.userId, ids);
      sendSuccess(res, { deleted: result.count }, "Transactions deleted");
    } catch (error) {
      next(error);
    }
  },
};

import { Response, NextFunction } from "express";
import { debtService } from "../services/debt.service";
import { sendSuccess } from "../utils/apiResponse";
import { AuthRequest } from "../types";

export const debtController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as string | undefined;
      const type = req.query.type as string | undefined;
      const debts = await debtService.list(req.user!.userId, status, type);
      sendSuccess(res, debts, "Debts retrieved");
    } catch (error) {
      next(error);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const debt = await debtService.getById(req.user!.userId, req.params.id as string);
      sendSuccess(res, debt, "Debt retrieved");
    } catch (error) {
      next(error);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const debt = await debtService.create(req.user!.userId, req.body);
      sendSuccess(res, debt, "Debt created", 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const debt = await debtService.update(req.user!.userId, req.params.id as string, req.body);
      sendSuccess(res, debt, "Debt updated");
    } catch (error) {
      next(error);
    }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await debtService.delete(req.user!.userId, req.params.id as string);
      sendSuccess(res, null, "Debt deleted");
    } catch (error) {
      next(error);
    }
  },

  async addPayment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const debt = await debtService.addPayment(req.user!.userId, req.params.debtId as string, req.body);
      sendSuccess(res, debt, "Payment recorded", 201);
    } catch (error) {
      next(error);
    }
  },

  async getOverview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const overview = await debtService.getOverview(req.user!.userId);
      sendSuccess(res, overview, "Debt overview retrieved");
    } catch (error) {
      next(error);
    }
  },
};

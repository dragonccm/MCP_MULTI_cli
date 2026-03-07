import { Response, NextFunction } from "express";
import { dashboardService } from "../services/dashboard.service";
import { sendSuccess } from "../utils/apiResponse";
import { AuthRequest } from "../types";

export const dashboardController = {
  async getHome(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const dashboard = await dashboardService.getHomeDashboard(req.user!.userId);
      sendSuccess(res, dashboard, "Dashboard data retrieved");
    } catch (error) {
      next(error);
    }
  },

  async getAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        res.status(400).json({ success: false, message: "startDate and endDate are required" });
        return;
      }
      const analytics = await dashboardService.getSpendingAnalytics(
        req.user!.userId,
        startDate as string,
        endDate as string
      );
      sendSuccess(res, analytics, "Analytics retrieved");
    } catch (error) {
      next(error);
    }
  },

  async getBudgetOverview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const overview = await dashboardService.getBudgetOverview(req.user!.userId, month, year);
      sendSuccess(res, overview, "Budget overview retrieved");
    } catch (error) {
      next(error);
    }
  },
};

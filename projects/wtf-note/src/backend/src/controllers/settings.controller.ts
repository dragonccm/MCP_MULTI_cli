import { Response, NextFunction } from "express";
import { settingsService } from "../services/settings.service";
import { sendSuccess } from "../utils/apiResponse";
import { AuthRequest } from "../types";

export const settingsController = {
  async exportData(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const data = await settingsService.exportData(req.user!.userId, {
        startDate: startDate as string,
        endDate: endDate as string,
      });
      sendSuccess(res, data, "Data exported");
    } catch (error) {
      next(error);
    }
  },

  async importTransactions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { csvData } = req.body;
      if (!csvData) {
        res.status(400).json({ success: false, message: "csvData is required" });
        return;
      }
      const result = await settingsService.importTransactions(req.user!.userId, csvData);
      sendSuccess(res, result, "Import completed");
    } catch (error) {
      next(error);
    }
  },

  async getBackup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await settingsService.getBackupData(req.user!.userId);
      sendSuccess(res, data, "Backup data retrieved");
    } catch (error) {
      next(error);
    }
  },
};

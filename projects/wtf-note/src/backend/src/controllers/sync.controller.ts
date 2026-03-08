import { Response, NextFunction } from 'express';
import { syncService } from '../services/sync.service';
import { sendSuccess } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../types';

export class SyncController {
  async pushChanges(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await syncService.pushChanges(userId, req.body);
      sendSuccess(res, result, 'Changes synced');
    } catch (error) {
      next(error);
    }
  }

  async pullChanges(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const lastSyncedAt = req.query.lastSyncedAt as string | undefined;
      const result = await syncService.pullChanges(userId, lastSyncedAt);
      sendSuccess(res, result, 'Changes retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const status = await syncService.getStatus(userId);
      sendSuccess(res, status, 'Sync status retrieved');
    } catch (error) {
      next(error);
    }
  }
}

export const syncController = new SyncController();

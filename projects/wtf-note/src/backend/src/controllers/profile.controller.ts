import { Response, NextFunction } from 'express';
import { profileService } from '../services/profile.service';
import { sendSuccess } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../types';

export class ProfileController {
  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const profile = await profileService.updateProfile(userId, req.body);
      sendSuccess(res, profile, 'Profile updated');
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      await profileService.changePassword(userId, req.body);
      sendSuccess(res, null, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteAccount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      await profileService.deleteAccount(userId);
      sendSuccess(res, null, 'Account deleted');
    } catch (error) {
      next(error);
    }
  }

  // Category endpoints
  async getCategories(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const type = req.query.type as string | undefined;
      const categories = await profileService.getCategories(userId, type);
      sendSuccess(res, categories, 'Categories retrieved');
    } catch (error) {
      next(error);
    }
  }

  async createCategory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const category = await profileService.createCategory(userId, req.body);
      sendSuccess(res, category, 'Category created', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const category = await profileService.updateCategory(userId, req.params.id as string, req.body);
      sendSuccess(res, category, 'Category updated');
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      await profileService.deleteCategory(userId, req.params.id as string);
      sendSuccess(res, null, 'Category deleted');
    } catch (error) {
      next(error);
    }
  }

  // Budget endpoints
  async getBudgets(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const month = req.query.month ? parseInt(req.query.month as string) : undefined;
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      const budgets = await profileService.getBudgets(userId, month, year);
      sendSuccess(res, budgets, 'Budgets retrieved');
    } catch (error) {
      next(error);
    }
  }

  async createBudget(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const budget = await profileService.createBudget(userId, req.body);
      sendSuccess(res, budget, 'Budget created', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateBudget(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const budget = await profileService.updateBudget(userId, req.params.id as string, req.body);
      sendSuccess(res, budget, 'Budget updated');
    } catch (error) {
      next(error);
    }
  }

  async deleteBudget(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      await profileService.deleteBudget(userId, req.params.id as string);
      sendSuccess(res, null, 'Budget deleted');
    } catch (error) {
      next(error);
    }
  }
}

export const profileController = new ProfileController();

import { Response, NextFunction } from "express";
import { categoryService } from "../services/category.service";
import { sendSuccess } from "../utils/apiResponse";
import { AuthRequest } from "../types";

export const categoryController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const type = req.query.type as string | undefined;
      const categories = await categoryService.getCategories(req.user!.userId, type);
      sendSuccess(res, categories, "Categories retrieved");
    } catch (error) {
      next(error);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.createCategory(req.user!.userId, req.body);
      sendSuccess(res, category, "Category created", 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.updateCategory(req.user!.userId, req.params.id as string, req.body);
      sendSuccess(res, category, "Category updated");
    } catch (error) {
      next(error);
    }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const reassignToId = req.query.reassignToId as string | undefined;
      await categoryService.deleteCategory(req.user!.userId, req.params.id as string, reassignToId);
      sendSuccess(res, null, "Category deleted");
    } catch (error) {
      next(error);
    }
  },

  async reassign(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const oldCategoryId = req.params.id as string;
      const { newCategoryId } = req.body;
      const result = await categoryService.reassignCategory(req.user!.userId, oldCategoryId, newCategoryId);
      sendSuccess(res, result, "Transactions reassigned");
    } catch (error) {
      next(error);
    }
  },
};

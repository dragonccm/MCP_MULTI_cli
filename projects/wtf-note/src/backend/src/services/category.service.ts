import { categoryRepository } from "../repositories/category.repository";
import { createAppError } from "../middleware/errorHandler";

export const categoryService = {
  async getCategories(userId: string, type?: string) {
    return categoryRepository.findByUser(userId, type);
  },

  async createCategory(userId: string, data: { name: string; type: string; icon?: string; color?: string }) {
    const existing = await categoryRepository.findByNameAndUser(data.name, userId, data.type);
    if (existing) {
      throw createAppError("Category already exists", 409);
    }
    return categoryRepository.create({ ...data, userId });
  },

  async updateCategory(userId: string, id: string, data: { name?: string; icon?: string; color?: string }) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw createAppError("Category not found", 404);
    }
    if (category.isDefault) {
      throw createAppError("Cannot modify default categories", 403);
    }
    if (category.userId !== userId) {
      throw createAppError("Not authorized", 403);
    }
    return categoryRepository.update(id, data);
  },

  async deleteCategory(userId: string, id: string, reassignToId?: string) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw createAppError("Category not found", 404);
    }
    if (category.isDefault) {
      throw createAppError("Cannot delete default categories", 403);
    }
    if (category.userId !== userId) {
      throw createAppError("Not authorized", 403);
    }

    const txCount = await categoryRepository.countTransactions(id);
    if (txCount > 0 && !reassignToId) {
      throw createAppError("Category has transactions. Provide reassignToId to reassign them.", 400);
    }

    if (txCount > 0 && reassignToId) {
      const targetCategory = await categoryRepository.findById(reassignToId);
      if (!targetCategory) {
        throw createAppError("Target category not found", 404);
      }
      await categoryRepository.reassignTransactions(id, reassignToId);
    }

    return categoryRepository.softDelete(id);
  },

  async reassignCategory(userId: string, oldCategoryId: string, newCategoryId: string) {
    const oldCategory = await categoryRepository.findById(oldCategoryId);
    if (!oldCategory) {
      throw createAppError("Source category not found", 404);
    }
    if (oldCategory.userId !== userId && !oldCategory.isDefault) {
      throw createAppError("Not authorized", 403);
    }

    const newCategory = await categoryRepository.findById(newCategoryId);
    if (!newCategory) {
      throw createAppError("Target category not found", 404);
    }

    const count = await categoryRepository.reassignTransactions(oldCategoryId, newCategoryId);
    return { reassignedCount: count, fromCategory: oldCategoryId, toCategory: newCategoryId };
  },

  async initDefaults() {
    return categoryRepository.createDefaults();
  },
};

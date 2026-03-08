import { userRepository } from '../repositories/user.repository';
import { categoryRepository } from '../repositories/category.repository';
import { budgetRepository } from '../repositories/budget.repository';
import { hashPassword, comparePassword } from '../utils/password';
import { AppError } from '../types';
import { UpdateProfileInput, CreateCategoryInput, UpdateCategoryInput, CreateBudgetInput, UpdateBudgetInput } from '../validators/profile.validator';
import { ChangePasswordInput } from '../validators/auth.validator';
import logger from '../utils/logger';

export class ProfileService {
  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const updated = await userRepository.update(userId, input);
    logger.info('Profile updated', { userId });
    return { id: updated.id, email: updated.email, name: updated.name, currency: updated.currency };
  }

  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isValid = await comparePassword(input.currentPassword, user.password);
    if (!isValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    const hashedPassword = await hashPassword(input.newPassword);
    await userRepository.update(userId, { password: hashedPassword });
    logger.info('Password changed', { userId });
  }

  async deleteAccount(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    await userRepository.softDelete(userId);
    logger.info('Account deleted', { userId });
  }

  // Category management
  async getCategories(userId: string, type?: string) {
    return categoryRepository.findMany(userId, type);
  }

  async createCategory(userId: string, input: CreateCategoryInput) {
    const category = await categoryRepository.create({
      user: { connect: { id: userId } },
      name: input.name,
      type: input.type,
      icon: input.icon,
      color: input.color,
    });
    logger.info('Category created', { categoryId: category.id, userId });
    return category;
  }

  async updateCategory(userId: string, categoryId: string, input: UpdateCategoryInput) {
    const existing = await categoryRepository.findById(categoryId, userId);
    if (!existing) {
      throw new AppError('Category not found', 404);
    }

    const category = await categoryRepository.update(categoryId, input);
    logger.info('Category updated', { categoryId, userId });
    return category;
  }

  async deleteCategory(userId: string, categoryId: string) {
    const existing = await categoryRepository.findById(categoryId, userId);
    if (!existing) {
      throw new AppError('Category not found', 404);
    }
    await categoryRepository.softDelete(categoryId);
    logger.info('Category deleted', { categoryId, userId });
  }

  // Budget management
  async getBudgets(userId: string, month?: number, year?: number) {
    return budgetRepository.findMany(userId, month, year);
  }

  async createBudget(userId: string, input: CreateBudgetInput) {
    const budget = await budgetRepository.create({
      user: { connect: { id: userId } },
      ...(input.categoryId && { category: { connect: { id: input.categoryId } } }),
      amount: input.amount,
      month: input.month,
      year: input.year,
    });
    logger.info('Budget created', { budgetId: budget.id, userId });
    return budget;
  }

  async updateBudget(userId: string, budgetId: string, input: UpdateBudgetInput) {
    const existing = await budgetRepository.findById(budgetId, userId);
    if (!existing) {
      throw new AppError('Budget not found', 404);
    }

    const updateData: Record<string, unknown> = {};
    if (input.amount !== undefined) updateData.amount = input.amount;
    if (input.month !== undefined) updateData.month = input.month;
    if (input.year !== undefined) updateData.year = input.year;
    if (input.categoryId !== undefined) {
      updateData.category = { connect: { id: input.categoryId } };
    }

    const budget = await budgetRepository.update(budgetId, updateData);
    logger.info('Budget updated', { budgetId, userId });
    return budget;
  }

  async deleteBudget(userId: string, budgetId: string) {
    const existing = await budgetRepository.findById(budgetId, userId);
    if (!existing) {
      throw new AppError('Budget not found', 404);
    }
    await budgetRepository.softDelete(budgetId);
    logger.info('Budget deleted', { budgetId, userId });
  }
}

export const profileService = new ProfileService();

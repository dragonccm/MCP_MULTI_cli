import { budgetRepository } from "../repositories/budget.repository";
import { transactionRepository } from "../repositories/transaction.repository";
import { createAppError } from "../middleware/errorHandler";

export const budgetService = {
  async list(userId: string, month?: number, year?: number) {
    const budgets = await budgetRepository.findByUser(userId, month, year);
    if (!month || !year) return budgets;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    const categoryTotals = await transactionRepository.getCategoryTotals(userId, startDate, endDate);

    const spentMap = new Map<string, number>();
    for (const ct of categoryTotals) {
      if (ct.type === "expense") {
        spentMap.set(ct.categoryId, (spentMap.get(ct.categoryId) || 0) + (ct._sum.amount || 0));
      }
    }

    return budgets.map((budget) => {
      const spent = spentMap.get(budget.categoryId) || 0;
      const remaining = budget.amount - spent;
      const percentUsed = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      return {
        ...budget,
        spent,
        remaining,
        percentUsed,
        isOverBudget: spent > budget.amount,
        isWarning: percentUsed >= 80 && percentUsed < 100,
      };
    });
  },

  async getById(userId: string, id: string) {
    const budget = await budgetRepository.findById(id, userId);
    if (!budget) {
      throw createAppError("Budget not found", 404);
    }

    const startDate = new Date(budget.year, budget.month - 1, 1);
    const endDate = new Date(budget.year, budget.month, 0, 23, 59, 59);
    const categoryTotals = await transactionRepository.getCategoryTotals(userId, startDate, endDate);

    let spent = 0;
    for (const ct of categoryTotals) {
      if (ct.type === "expense" && ct.categoryId === budget.categoryId) {
        spent += ct._sum.amount || 0;
      }
    }

    const remaining = budget.amount - spent;
    const percentUsed = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
    return {
      ...budget,
      spent,
      remaining,
      percentUsed,
      isOverBudget: spent > budget.amount,
      isWarning: percentUsed >= 80 && percentUsed < 100,
    };
  },

  async create(userId: string, data: { categoryId: string; amount: number; month: number; year: number }) {
    const existing = await budgetRepository.findByCategoryAndPeriod(
      data.categoryId, data.month, data.year, userId
    );
    if (existing) {
      throw createAppError("Budget already exists for this category and period", 409);
    }
    return budgetRepository.create({ ...data, userId });
  },

  async update(userId: string, id: string, data: { amount?: number }) {
    const budget = await budgetRepository.findById(id, userId);
    if (!budget) {
      throw createAppError("Budget not found", 404);
    }
    return budgetRepository.update(id, data);
  },

  async delete(userId: string, id: string) {
    const budget = await budgetRepository.findById(id, userId);
    if (!budget) {
      throw createAppError("Budget not found", 404);
    }
    return budgetRepository.softDelete(id);
  },
};

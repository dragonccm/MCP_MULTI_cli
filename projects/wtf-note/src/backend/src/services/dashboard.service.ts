import { transactionRepository } from "../repositories/transaction.repository";
import { debtRepository } from "../repositories/debt.repository";
import { assetService } from "./asset.service";
import { budgetService } from "./budget.service";
import { categoryRepository } from "../repositories/category.repository";

export const dashboardService = {
  async getHomeDashboard(userId: string) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [monthlyTotals, recentTransactions, debtSummary, portfolio] = await Promise.all([
      transactionRepository.getMonthlyTotals(userId, monthStart, monthEnd),
      transactionRepository.getRecentTransactions(userId, 5),
      debtRepository.getSummary(userId),
      assetService.getPortfolioOverview(userId),
    ]);

    let monthlyIncome = 0;
    let monthlyExpense = 0;
    for (const total of monthlyTotals) {
      if (total.type === "income") monthlyIncome = total._sum.amount || 0;
      if (total.type === "expense") monthlyExpense = total._sum.amount || 0;
    }

    let totalDebt = 0;
    for (const group of debtSummary) {
      if (group.type === "owed" && group.status !== "paid") {
        totalDebt += group._sum.remainingBalance || 0;
      }
    }

    const netWorth = portfolio.totalValue - totalDebt;

    return {
      totalBalance: monthlyIncome - monthlyExpense,
      monthlyIncome,
      monthlyExpense,
      netWorth,
      portfolioValue: portfolio.totalValue,
      totalDebt,
      recentTransactions,
    };
  },

  async getSpendingAnalytics(userId: string, startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const [categoryTotals, categories] = await Promise.all([
      transactionRepository.getCategoryTotals(userId, start, end),
      categoryRepository.findByUser(userId),
    ]);

    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    const byCategory = categoryTotals
      .filter((ct) => ct.type === "expense")
      .map((ct) => ({
        categoryId: ct.categoryId,
        category: categoryMap.get(ct.categoryId),
        total: ct._sum.amount || 0,
      }))
      .sort((a, b) => b.total - a.total);

    const totalExpense = byCategory.reduce((sum, c) => sum + c.total, 0);

    return {
      byCategory: byCategory.map((c) => ({
        ...c,
        percentage: totalExpense > 0 ? (c.total / totalExpense) * 100 : 0,
      })),
      totalExpense,
      totalIncome: categoryTotals
        .filter((ct) => ct.type === "income")
        .reduce((sum, ct) => sum + (ct._sum.amount || 0), 0),
      period: { startDate, endDate },
    };
  },

  async getBudgetOverview(userId: string, month: number, year: number) {
    return budgetService.list(userId, month, year);
  },
};

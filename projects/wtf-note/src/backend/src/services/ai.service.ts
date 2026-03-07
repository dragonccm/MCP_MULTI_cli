import { aiInsightRepository } from "../repositories/aiInsight.repository";
import { transactionRepository } from "../repositories/transaction.repository";
import { debtRepository } from "../repositories/debt.repository";
import { assetService } from "./asset.service";
import { categoryRepository } from "../repositories/category.repository";
import { createAppError } from "../middleware/errorHandler";

export const aiService = {
  async getSpendingInsights(userId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const now = new Date();

    const [transactions, categoryTotals, categories] = await Promise.all([
      transactionRepository.findByUser(
        { userId, startDate: thirtyDaysAgo.toISOString(), endDate: now.toISOString() },
        0,
        1000
      ),
      transactionRepository.getCategoryTotals(userId, thirtyDaysAgo, now),
      categoryRepository.findByUser(userId),
    ]);

    if (transactions.length < 5) {
      throw createAppError("Need at least 5 transactions for spending insights", 400);
    }

    const categoryMap = new Map(categories.map((c) => [c.id, c]));
    const expenseByCategory = categoryTotals
      .filter((ct) => ct.type === "expense")
      .map((ct) => ({
        category: categoryMap.get(ct.categoryId)?.name || "Unknown",
        total: ct._sum.amount || 0,
      }))
      .sort((a, b) => b.total - a.total);

    const totalExpense = expenseByCategory.reduce((sum, c) => sum + c.total, 0);
    const totalIncome = categoryTotals
      .filter((ct) => ct.type === "income")
      .reduce((sum, ct) => sum + (ct._sum.amount || 0), 0);

    const topCategories = expenseByCategory.slice(0, 3);
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

    const insights = {
      period: "Last 30 days",
      totalIncome,
      totalExpense,
      savingsRate: Math.round(savingsRate * 100) / 100,
      topSpendingCategories: topCategories,
      tips: generateSpendingTips(topCategories, savingsRate, totalExpense),
      estimatedMonthlySavings: Math.round(totalExpense * 0.1),
    };

    await aiInsightRepository.create({
      type: "spending_insight",
      content: JSON.stringify(insights),
      userId,
    });
    await aiInsightRepository.deleteOld(userId, "spending_insight", 10);

    return insights;
  },

  async getBudgetRecommendations(userId: string) {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const now = new Date();

    const [categoryTotals, categories, monthlyTotals] = await Promise.all([
      transactionRepository.getCategoryTotals(userId, threeMonthsAgo, now),
      categoryRepository.findByUser(userId),
      transactionRepository.getMonthlyTotals(userId, threeMonthsAgo, now),
    ]);

    const categoryMap = new Map(categories.map((c) => [c.id, c]));
    const totalIncome = monthlyTotals
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + (t._sum.amount || 0), 0) / 3;

    const recommendations = categoryTotals
      .filter((ct) => ct.type === "expense")
      .map((ct) => {
        const monthlyAvg = (ct._sum.amount || 0) / 3;
        const category = categoryMap.get(ct.categoryId);
        return {
          categoryId: ct.categoryId,
          categoryName: category?.name || "Unknown",
          monthlyAverage: Math.round(monthlyAvg),
          conservative: Math.round(monthlyAvg * 0.85),
          moderate: Math.round(monthlyAvg),
          aggressive: Math.round(monthlyAvg * 1.15),
        };
      })
      .sort((a, b) => b.monthlyAverage - a.monthlyAverage);

    const result = {
      averageMonthlyIncome: Math.round(totalIncome),
      recommendations,
      suggestedSavingsTarget: Math.round(totalIncome * 0.2),
    };

    await aiInsightRepository.create({
      type: "budget_recommendation",
      content: JSON.stringify(result),
      userId,
    });
    await aiInsightRepository.deleteOld(userId, "budget_recommendation", 10);

    return result;
  },

  async getNetWorthProjection(userId: string, savingsRate?: number, years?: number) {
    const projectionYears = years || 10;

    const [portfolio, debts] = await Promise.all([
      assetService.getPortfolioOverview(userId),
      debtRepository.getSummary(userId),
    ]);

    let totalDebt = 0;
    for (const group of debts) {
      if (group.type === "owed" && group.status !== "paid") {
        totalDebt += group._sum.remainingBalance || 0;
      }
    }

    const currentNetWorth = portfolio.totalValue - totalDebt;
    const monthlySavings = savingsRate || currentNetWorth * 0.005;
    const inflationRate = 0.03;
    const investmentReturn = 0.08;

    const projections = {
      currentNetWorth,
      assumptions: { inflationRate, investmentReturn, monthlySavings },
      scenarios: {
        conservative: projectNetWorth(currentNetWorth, monthlySavings, 0.04, inflationRate, projectionYears),
        base: projectNetWorth(currentNetWorth, monthlySavings, investmentReturn, inflationRate, projectionYears),
        optimistic: projectNetWorth(currentNetWorth, monthlySavings, 0.12, inflationRate, projectionYears),
      },
    };

    await aiInsightRepository.create({
      type: "net_worth_projection",
      content: JSON.stringify(projections),
      userId,
    });
    await aiInsightRepository.deleteOld(userId, "net_worth_projection", 10);

    return projections;
  },

  async getInsightHistory(userId: string, type?: string) {
    return aiInsightRepository.findByUser(userId, type);
  },
};

function projectNetWorth(
  current: number,
  monthlySavings: number,
  annualReturn: number,
  inflation: number,
  years: number
): { year: number; nominal: number; real: number }[] {
  const monthlyReturn = annualReturn / 12;
  const points: { year: number; nominal: number; real: number }[] = [];
  let balance = current;

  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      balance = balance * (1 + monthlyReturn) + monthlySavings;
    }
    const realValue = balance / Math.pow(1 + inflation, y);
    points.push({
      year: y,
      nominal: Math.round(balance),
      real: Math.round(realValue),
    });
  }
  return points;
}

function generateSpendingTips(
  topCategories: { category: string; total: number }[],
  savingsRate: number,
  totalExpense: number
): string[] {
  const tips: string[] = [];

  if (savingsRate < 10) {
    tips.push("Your savings rate is below 10%. Consider reviewing non-essential expenses.");
  } else if (savingsRate < 20) {
    tips.push("Good savings rate! Aim for 20% to build a stronger financial cushion.");
  } else {
    tips.push("Excellent savings rate! You're on track for strong financial health.");
  }

  if (topCategories.length > 0) {
    const topCat = topCategories[0];
    const pct = totalExpense > 0 ? (topCat.total / totalExpense) * 100 : 0;
    if (pct > 40) {
      tips.push(`${topCat.category} accounts for ${Math.round(pct)}% of spending. Consider setting a budget limit.`);
    }
  }

  tips.push("Track daily expenses consistently for more accurate insights.");
  return tips;
}

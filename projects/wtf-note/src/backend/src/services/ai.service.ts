import { transactionRepository } from '../repositories/transaction.repository';
import { portfolioRepository } from '../repositories/portfolio.repository';
import { budgetRepository } from '../repositories/budget.repository';
import { AppError } from '../types';
import { SpendingInsightsInput, InvestmentAdviceInput, BudgetPlanningInput } from '../validators/ai.validator';
import logger from '../utils/logger';
import { env } from '../config/env';

export class AiService {
  private async callGemini(prompt: string): Promise<string> {
    if (!env.GEMINI_API_KEY) {
      throw new AppError('AI service is not configured. Please set GEMINI_API_KEY.', 503);
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json() as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
    } catch (error) {
      logger.error('Gemini API call failed', { error: (error as Error).message });
      throw new AppError('AI service temporarily unavailable. Please try again later.', 503);
    }
  }

  async getSpendingInsights(userId: string, input: SpendingInsightsInput) {
    const startDate = input.startDate ? new Date(input.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = input.endDate ? new Date(input.endDate) : new Date();

    const transactions = await transactionRepository.getSummary(userId, startDate, endDate);

    if (transactions.length < 5) {
      return {
        insights: 'You need at least 5 transactions for meaningful spending analysis. Keep tracking your finances and check back soon!',
        dataPoints: transactions.length,
      };
    }

    const summary = {
      totalIncome: 0,
      totalExpense: 0,
      categories: {} as Record<string, number>,
    };

    for (const tx of transactions) {
      if (tx.type === 'income') summary.totalIncome += tx.amount;
      if (tx.type === 'expense') summary.totalExpense += tx.amount;
      const cat = tx.category?.name || 'Uncategorized';
      summary.categories[cat] = (summary.categories[cat] || 0) + tx.amount;
    }

    const prompt = `You are a professional financial advisor. Analyze this spending data and provide actionable insights in a friendly, concise manner.

Spending Data (${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}):
- Total Income: ${summary.totalIncome}
- Total Expense: ${summary.totalExpense}
- Savings Rate: ${summary.totalIncome > 0 ? ((summary.totalIncome - summary.totalExpense) / summary.totalIncome * 100).toFixed(1) : 0}%
- Categories: ${JSON.stringify(summary.categories)}
- Transaction Count: ${transactions.length}

${input.question ? `User Question: ${input.question}` : ''}

Provide:
1. Key spending patterns and trends
2. Areas where spending could be optimized
3. Actionable recommendations
Keep response concise (under 500 words).`;

    const insights = await this.callGemini(prompt);
    return { insights, dataPoints: transactions.length, period: { startDate, endDate } };
  }

  async getInvestmentAdvice(userId: string, input: InvestmentAdviceInput) {
    const portfolios = await portfolioRepository.findMany(userId);

    if (portfolios.length === 0) {
      return {
        advice: 'You haven\'t added any portfolios yet. Start by creating a portfolio and adding your investment assets to get personalized advice.',
        dataPoints: 0,
      };
    }

    const targetPortfolio = input.portfolioId
      ? portfolios.find((p) => p.id === input.portfolioId)
      : portfolios[0];

    if (!targetPortfolio) {
      throw new AppError('Portfolio not found', 404);
    }

    const assetSummary = targetPortfolio.assets.map((a) => ({
      symbol: a.symbol,
      type: a.type,
      quantity: a.quantity,
      purchasePrice: a.purchasePrice,
      currentPrice: a.currentPrice || a.purchasePrice,
      gainLoss: ((a.currentPrice || a.purchasePrice) - a.purchasePrice) * a.quantity,
    }));

    const totalValue = assetSummary.reduce((sum, a) => sum + (a.currentPrice * a.quantity), 0);

    const prompt = `You are a professional investment advisor. Analyze this portfolio and provide insights.

Portfolio: ${targetPortfolio.name}
Total Value: ${totalValue}
Assets:
${assetSummary.map((a) => `- ${a.symbol} (${a.type}): ${a.quantity} units, bought at ${a.purchasePrice}, current ${a.currentPrice}, P/L: ${a.gainLoss.toFixed(2)}`).join('\n')}

${input.question ? `User Question: ${input.question}` : ''}

Provide:
1. Portfolio diversification assessment
2. Risk analysis
3. Recommendations for improvement
Note: This is general educational information, not financial advice. Keep under 500 words.`;

    const advice = await this.callGemini(prompt);
    return { advice, portfolio: targetPortfolio.name, assetCount: assetSummary.length };
  }

  async getBudgetPlanning(userId: string, input: BudgetPlanningInput) {
    const now = new Date();
    const month = input.month || now.getMonth() + 1;
    const year = input.year || now.getFullYear();

    const budgets = await budgetRepository.findMany(userId, month, year);
    const transactions = await transactionRepository.getSummary(userId);

    const expenseByCategory: Record<string, number> = {};
    const incomeTotal = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    for (const tx of transactions.filter((t) => t.type === 'expense')) {
      const cat = tx.category?.name || 'Uncategorized';
      expenseByCategory[cat] = (expenseByCategory[cat] || 0) + tx.amount;
    }

    const prompt = `You are a professional budget planner. Create a budget plan based on this data.

Monthly Data for ${month}/${year}:
- Total Income: ${incomeTotal}
- Current Budgets: ${budgets.length > 0 ? budgets.map((b) => `${b.category?.name || 'General'}: ${b.amount}`).join(', ') : 'None set'}
- Actual Spending by Category: ${JSON.stringify(expenseByCategory)}

${input.question ? `User Question: ${input.question}` : ''}

Provide:
1. Suggested budget allocation by category
2. Areas where current spending exceeds recommended limits
3. Savings strategies
Keep under 500 words.`;

    const plan = await this.callGemini(prompt);
    return { plan, month, year, currentBudgets: budgets.length };
  }
}

export const aiService = new AiService();

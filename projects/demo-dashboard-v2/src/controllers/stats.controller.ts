import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

export const getSummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      include: { category: true },
    });

    const income = transactions
      .filter((t) => t.category.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expense = transactions
      .filter((t) => t.category.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const balance = income - expense;

    res.json({
      totalIncome: income,
      totalExpense: expense,
      balance: balance,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getChartData = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const categoriesWithSum = await prisma.category.findMany({
      where: { userId, type: 'EXPENSE' },
      include: {
        transactions: true,
      },
    });

    const chartData = categoriesWithSum
      .map((cat) => ({
        name: cat.name,
        value: cat.transactions.reduce((sum, t) => sum + Number(t.amount), 0),
      }))
      .filter((data) => data.value > 0);

    res.json(chartData);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

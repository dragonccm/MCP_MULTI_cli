import prisma from './prisma';
import { Transaction, CategoryType, Prisma } from '@prisma/client';

export class TransactionRepository {
  async getAllByUserId(userId: string, filter?: { startDate?: Date; endDate?: Date; categoryId?: string }) {
    const where: Prisma.TransactionWhereInput = { userId };
    if (filter) {
      if (filter.startDate || filter.endDate) {
        where.date = {};
        if (filter.startDate) (where.date as Prisma.DateTimeFilter).gte = filter.startDate;
        if (filter.endDate) (where.date as Prisma.DateTimeFilter).lte = filter.endDate;
      }
      if (filter.categoryId) {
        where.categoryId = filter.categoryId;
      }
    }
    return prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { date: 'desc' }
    });
  }

  async create(data: Omit<Transaction, 'id'>) {
    return prisma.transaction.create({ data });
  }

  async getStats(userId: string) {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      include: { category: true }
    });

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
      const amount = Number(t.amount);
      if (t.category.type === CategoryType.INCOME) {
        totalIncome += amount;
      } else {
        totalExpense += amount;
      }
    });

    return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
  }
}

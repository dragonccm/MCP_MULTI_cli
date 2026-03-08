import prisma from '../config/database';
import { Prisma } from '@prisma/client';

export class TransactionRepository {
  async findById(id: string, userId: string) {
    return prisma.transaction.findFirst({
      where: { id, userId, deletedAt: null },
      include: { category: true },
    });
  }

  async findMany(
    userId: string,
    filters: {
      type?: string;
      categoryId?: string;
      startDate?: Date;
      endDate?: Date;
      status?: string;
    },
    page: number,
    limit: number
  ) {
    const where: Prisma.TransactionWhereInput = {
      userId,
      deletedAt: null,
      ...(filters.type && { type: filters.type }),
      ...(filters.categoryId && { categoryId: filters.categoryId }),
      ...(filters.status && { status: filters.status }),
      ...((filters.startDate || filters.endDate) && {
        date: {
          ...(filters.startDate && { gte: filters.startDate }),
          ...(filters.endDate && { lte: filters.endDate }),
        },
      }),
    };

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { category: true },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return { transactions, total };
  }

  async create(data: Prisma.TransactionCreateInput) {
    return prisma.transaction.create({
      data,
      include: { category: true },
    });
  }

  async update(id: string, data: Prisma.TransactionUpdateInput) {
    return prisma.transaction.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
      include: { category: true },
    });
  }

  async softDelete(id: string) {
    return prisma.transaction.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getSummary(userId: string, startDate?: Date, endDate?: Date) {
    const where: Prisma.TransactionWhereInput = {
      userId,
      deletedAt: null,
      status: 'completed',
      ...(startDate && endDate && {
        date: { gte: startDate, lte: endDate },
      }),
    };

    const transactions = await prisma.transaction.findMany({
      where,
      include: { category: true },
    });

    return transactions;
  }
}

export const transactionRepository = new TransactionRepository();

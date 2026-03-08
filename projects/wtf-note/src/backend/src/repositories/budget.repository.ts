import prisma from '../config/database';
import { Prisma } from '@prisma/client';

export class BudgetRepository {
  async findById(id: string, userId: string) {
    return prisma.budget.findFirst({
      where: { id, userId, deletedAt: null },
      include: { category: true },
    });
  }

  async findMany(userId: string, month?: number, year?: number) {
    return prisma.budget.findMany({
      where: {
        userId,
        deletedAt: null,
        ...(month && { month }),
        ...(year && { year }),
      },
      include: { category: true },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async create(data: Prisma.BudgetCreateInput) {
    return prisma.budget.create({
      data,
      include: { category: true },
    });
  }

  async update(id: string, data: Prisma.BudgetUpdateInput) {
    return prisma.budget.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
      include: { category: true },
    });
  }

  async softDelete(id: string) {
    return prisma.budget.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

export const budgetRepository = new BudgetRepository();

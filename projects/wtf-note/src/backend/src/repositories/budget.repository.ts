import { prisma } from "../config/database";

export const budgetRepository = {
  findByUser(userId: string, month?: number, year?: number) {
    return prisma.budget.findMany({
      where: {
        userId,
        deletedAt: null,
        ...(month ? { month } : {}),
        ...(year ? { year } : {}),
      },
      include: { category: { select: { id: true, name: true, icon: true, color: true } } },
      orderBy: { category: { name: "asc" } },
    });
  },

  findById(id: string, userId: string) {
    return prisma.budget.findFirst({
      where: { id, userId, deletedAt: null },
      include: { category: true },
    });
  },

  findByCategoryAndPeriod(categoryId: string, month: number, year: number, userId: string) {
    return prisma.budget.findFirst({
      where: { categoryId, month, year, userId, deletedAt: null },
    });
  },

  create(data: { categoryId: string; amount: number; month: number; year: number; userId: string }) {
    return prisma.budget.create({
      data,
      include: { category: true },
    });
  },

  update(id: string, data: { amount?: number }) {
    return prisma.budget.update({
      where: { id },
      data,
      include: { category: true },
    });
  },

  softDelete(id: string) {
    return prisma.budget.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};

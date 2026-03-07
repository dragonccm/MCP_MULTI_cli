import { prisma } from "../config/database";

interface TransactionFilters {
  userId: string;
  type?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export const transactionRepository = {
  findByUser(filters: TransactionFilters, skip: number, take: number) {
    const where = buildWhere(filters);
    return prisma.transaction.findMany({
      where,
      include: { category: { select: { id: true, name: true, icon: true, color: true } } },
      orderBy: { date: "desc" },
      skip,
      take,
    });
  },

  count(filters: TransactionFilters) {
    return prisma.transaction.count({ where: buildWhere(filters) });
  },

  findById(id: string, userId: string) {
    return prisma.transaction.findFirst({
      where: { id, userId, deletedAt: null },
      include: { category: true },
    });
  },

  findSimilar(userId: string, amount: number, date: Date) {
    const oneHourAgo = new Date(date.getTime() - 60 * 60 * 1000);
    const oneHourLater = new Date(date.getTime() + 60 * 60 * 1000);
    return prisma.transaction.findFirst({
      where: {
        userId,
        amount,
        deletedAt: null,
        date: { gte: oneHourAgo, lte: oneHourLater },
      },
    });
  },

  create(data: {
    amount: number;
    type: string;
    categoryId: string;
    date: Date;
    note?: string;
    userId: string;
  }) {
    return prisma.transaction.create({
      data,
      include: { category: true },
    });
  },

  update(id: string, data: {
    amount?: number;
    type?: string;
    categoryId?: string;
    date?: Date;
    note?: string;
  }) {
    return prisma.transaction.update({
      where: { id },
      data,
      include: { category: true },
    });
  },

  softDelete(id: string) {
    return prisma.transaction.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  bulkSoftDelete(ids: string[], userId: string) {
    return prisma.transaction.updateMany({
      where: { id: { in: ids }, userId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  },

  getMonthlyTotals(userId: string, startDate: Date, endDate: Date) {
    return prisma.transaction.groupBy({
      by: ["type"],
      where: { userId, deletedAt: null, date: { gte: startDate, lte: endDate } },
      _sum: { amount: true },
    });
  },

  getCategoryTotals(userId: string, startDate: Date, endDate: Date) {
    return prisma.transaction.groupBy({
      by: ["categoryId", "type"],
      where: { userId, deletedAt: null, date: { gte: startDate, lte: endDate } },
      _sum: { amount: true },
    });
  },

  getRecentTransactions(userId: string, limit: number) {
    return prisma.transaction.findMany({
      where: { userId, deletedAt: null },
      include: { category: { select: { id: true, name: true, icon: true, color: true } } },
      orderBy: { date: "desc" },
      take: limit,
    });
  },

  getAllForExport(userId: string, startDate?: Date, endDate?: Date) {
    return prisma.transaction.findMany({
      where: {
        userId,
        deletedAt: null,
        ...(startDate && endDate ? { date: { gte: startDate, lte: endDate } } : {}),
      },
      include: { category: { select: { name: true } } },
      orderBy: { date: "desc" },
    });
  },
};

function buildWhere(filters: TransactionFilters) {
  const where: Record<string, unknown> = {
    userId: filters.userId,
    deletedAt: null,
  };
  if (filters.type) where.type = filters.type;
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.startDate || filters.endDate) {
    where.date = {
      ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
      ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
    };
  }
  if (filters.search) {
    where.note = { contains: filters.search };
  }
  return where;
}

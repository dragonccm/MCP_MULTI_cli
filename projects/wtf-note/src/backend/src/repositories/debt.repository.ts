import { prisma } from "../config/database";

export const debtRepository = {
  findByUser(userId: string, status?: string, type?: string) {
    return prisma.debt.findMany({
      where: {
        userId,
        deletedAt: null,
        ...(status ? { status } : {}),
        ...(type ? { type } : {}),
      },
      include: { payments: { orderBy: { date: "desc" } } },
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id: string, userId: string) {
    return prisma.debt.findFirst({
      where: { id, userId, deletedAt: null },
      include: { payments: { orderBy: { date: "desc" } } },
    });
  },

  create(data: {
    creditorDebtor: string;
    amount: number;
    type: string;
    dueDate?: Date;
    isRecurring?: boolean;
    recurringSchedule?: string;
    note?: string;
    userId: string;
  }) {
    return prisma.debt.create({
      data: { ...data, remainingBalance: data.amount },
      include: { payments: true },
    });
  },

  update(id: string, data: Record<string, unknown>) {
    return prisma.debt.update({
      where: { id },
      data,
      include: { payments: true },
    });
  },

  softDelete(id: string) {
    return prisma.debt.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  addPayment(data: { debtId: string; amount: number; date: Date; note?: string }) {
    return prisma.debtPayment.create({ data });
  },

  updateBalance(id: string, remainingBalance: number, status: string) {
    return prisma.debt.update({
      where: { id },
      data: { remainingBalance, status },
    });
  },

  getSummary(userId: string) {
    return prisma.debt.groupBy({
      by: ["type", "status"],
      where: { userId, deletedAt: null },
      _sum: { amount: true, remainingBalance: true },
      _count: true,
    });
  },

  getOverdueDebts(userId: string) {
    return prisma.debt.findMany({
      where: {
        userId,
        deletedAt: null,
        status: "active",
        dueDate: { lt: new Date() },
      },
    });
  },

  getAllForExport(userId: string) {
    return prisma.debt.findMany({
      where: { userId, deletedAt: null },
      include: { payments: true },
      orderBy: { createdAt: "desc" },
    });
  },
};

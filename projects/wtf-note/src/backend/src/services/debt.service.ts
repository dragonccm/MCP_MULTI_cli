import { debtRepository } from "../repositories/debt.repository";
import { createAppError } from "../middleware/errorHandler";

export const debtService = {
  async list(userId: string, status?: string, type?: string) {
    return debtRepository.findByUser(userId, status, type);
  },

  async getById(userId: string, id: string) {
    const debt = await debtRepository.findById(id, userId);
    if (!debt) {
      throw createAppError("Debt not found", 404);
    }
    return debt;
  },

  async create(userId: string, data: {
    creditorDebtor: string;
    amount: number;
    type: string;
    dueDate?: string;
    isRecurring?: boolean;
    recurringSchedule?: string;
    note?: string;
  }) {
    return debtRepository.create({
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      userId,
    });
  },

  async update(userId: string, id: string, data: Record<string, unknown>) {
    const debt = await debtRepository.findById(id, userId);
    if (!debt) {
      throw createAppError("Debt not found", 404);
    }
    if (data.dueDate) data.dueDate = new Date(data.dueDate as string);
    return debtRepository.update(id, data);
  },

  async delete(userId: string, id: string) {
    const debt = await debtRepository.findById(id, userId);
    if (!debt) {
      throw createAppError("Debt not found", 404);
    }
    return debtRepository.softDelete(id);
  },

  async addPayment(userId: string, debtId: string, data: { amount: number; date: string; note?: string }) {
    const debt = await debtRepository.findById(debtId, userId);
    if (!debt) {
      throw createAppError("Debt not found", 404);
    }
    if (debt.status === "paid") {
      throw createAppError("Debt is already fully paid", 400);
    }

    const newBalance = debt.remainingBalance - data.amount;

    if (newBalance < 0) {
      throw createAppError(
        `Payment of ${data.amount} exceeds remaining balance of ${debt.remainingBalance}. Overpayment not allowed.`,
        400
      );
    }

    await debtRepository.addPayment({
      debtId,
      amount: data.amount,
      date: new Date(data.date),
      note: data.note,
    });

    const status = newBalance === 0 ? "paid" : "active";
    await debtRepository.updateBalance(debtId, newBalance, status);

    return debtRepository.findById(debtId, userId);
  },

  async getOverview(userId: string) {
    const summary = await debtRepository.getSummary(userId);
    const overdue = await debtRepository.getOverdueDebts(userId);

    let totalOwed = 0;
    let totalOwing = 0;

    for (const group of summary) {
      if (group.status === "active" || group.status === "overdue") {
        if (group.type === "owed") totalOwed += group._sum.remainingBalance || 0;
        else totalOwing += group._sum.remainingBalance || 0;
      }
    }

    return {
      totalOwed,
      totalOwing,
      netDebt: totalOwed - totalOwing,
      overdueCount: overdue.length,
      overdueDebts: overdue,
    };
  },
};

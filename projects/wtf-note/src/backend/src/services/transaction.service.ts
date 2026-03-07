import { transactionRepository } from "../repositories/transaction.repository";
import { createAppError } from "../middleware/errorHandler";
import { parsePagination } from "../utils/pagination";

interface CreateTransactionData {
  amount: number;
  type: string;
  categoryId: string;
  date: string;
  note?: string;
}

interface ListTransactionFilters {
  page?: string;
  limit?: string;
  type?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export const transactionService = {
  async list(userId: string, filters: ListTransactionFilters) {
    const { page, limit, skip } = parsePagination(filters.page, filters.limit);
    const [data, total] = await Promise.all([
      transactionRepository.findByUser({ userId, ...filters }, skip, limit),
      transactionRepository.count({ userId, ...filters }),
    ]);
    return { data, total, page, limit };
  },

  async getById(userId: string, id: string) {
    const transaction = await transactionRepository.findById(id, userId);
    if (!transaction) {
      throw createAppError("Transaction not found", 404);
    }
    return transaction;
  },

  async create(userId: string, data: CreateTransactionData) {
    const date = new Date(data.date);

    const duplicate = await transactionRepository.findSimilar(userId, data.amount, date);
    const isDuplicate = !!duplicate;

    const transaction = await transactionRepository.create({
      ...data,
      date,
      userId,
    });

    return { transaction, isDuplicate };
  },

  async update(userId: string, id: string, data: Partial<CreateTransactionData>) {
    const existing = await transactionRepository.findById(id, userId);
    if (!existing) {
      throw createAppError("Transaction not found", 404);
    }

    const updateData: Record<string, unknown> = { ...data };
    if (data.date) updateData.date = new Date(data.date);

    return transactionRepository.update(id, updateData as never);
  },

  async delete(userId: string, id: string) {
    const existing = await transactionRepository.findById(id, userId);
    if (!existing) {
      throw createAppError("Transaction not found", 404);
    }
    return transactionRepository.softDelete(id);
  },

  async bulkDelete(userId: string, ids: string[]) {
    return transactionRepository.bulkSoftDelete(ids, userId);
  },

  async getMonthlyTotals(userId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    return transactionRepository.getMonthlyTotals(userId, startDate, endDate);
  },

  async getCategoryTotals(userId: string, startDate: string, endDate: string) {
    return transactionRepository.getCategoryTotals(
      userId,
      new Date(startDate),
      new Date(endDate)
    );
  },
};

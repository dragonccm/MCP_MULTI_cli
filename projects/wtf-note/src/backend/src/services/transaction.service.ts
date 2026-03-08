import { transactionRepository } from '../repositories/transaction.repository';
import { AppError } from '../types';
import { CreateTransactionInput, UpdateTransactionInput, TransactionFilterInput } from '../validators/transaction.validator';
import { buildPagination } from '../utils/apiResponse';
import logger from '../utils/logger';

export class TransactionService {
  async create(userId: string, input: CreateTransactionInput) {
    const transaction = await transactionRepository.create({
      user: { connect: { id: userId } },
      ...(input.categoryId && { category: { connect: { id: input.categoryId } } }),
      type: input.type,
      amount: input.amount,
      currency: input.currency || 'VND',
      description: input.description,
      date: new Date(input.date),
      note: input.note,
      status: input.status || 'completed',
      metadata: input.metadata,
    });

    logger.info('Transaction created', { transactionId: transaction.id, userId });
    return transaction;
  }

  async getById(userId: string, transactionId: string) {
    const transaction = await transactionRepository.findById(transactionId, userId);
    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }
    return transaction;
  }

  async getMany(userId: string, filters: TransactionFilterInput) {
    const { page, limit, startDate, endDate, ...filterParams } = filters;

    const parsedFilters: {
      type?: string;
      categoryId?: string;
      status?: string;
      startDate?: Date;
      endDate?: Date;
    } = { ...filterParams };

    if (startDate) parsedFilters.startDate = new Date(startDate);
    if (endDate) parsedFilters.endDate = new Date(endDate);

    const { transactions, total } = await transactionRepository.findMany(
      userId,
      parsedFilters,
      page,
      limit
    );

    return {
      transactions,
      pagination: buildPagination(page, limit, total),
    };
  }

  async update(userId: string, transactionId: string, input: UpdateTransactionInput) {
    const existing = await transactionRepository.findById(transactionId, userId);
    if (!existing) {
      throw new AppError('Transaction not found', 404);
    }

    const updateData: Record<string, unknown> = {};
    if (input.type !== undefined) updateData.type = input.type;
    if (input.amount !== undefined) updateData.amount = input.amount;
    if (input.currency !== undefined) updateData.currency = input.currency;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.date !== undefined) updateData.date = new Date(input.date);
    if (input.note !== undefined) updateData.note = input.note;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.metadata !== undefined) updateData.metadata = input.metadata;
    if (input.categoryId !== undefined) {
      updateData.category = { connect: { id: input.categoryId } };
    }

    const transaction = await transactionRepository.update(transactionId, updateData);
    logger.info('Transaction updated', { transactionId, userId });
    return transaction;
  }

  async delete(userId: string, transactionId: string) {
    const existing = await transactionRepository.findById(transactionId, userId);
    if (!existing) {
      throw new AppError('Transaction not found', 404);
    }

    await transactionRepository.softDelete(transactionId);
    logger.info('Transaction deleted', { transactionId, userId });
  }

  async getSummary(userId: string, startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    const transactions = await transactionRepository.getSummary(userId, start, end);

    const summary: {
      totalIncome: number;
      totalExpense: number;
      totalDebt: number;
      totalReceivable: number;
      totalAsset: number;
      netBalance: number;
      balance: number;
      byCategory: Record<string, { amount: number; count: number }>;
      transactionCount: number;
    } = {
      totalIncome: 0,
      totalExpense: 0,
      totalDebt: 0,
      totalReceivable: 0,
      totalAsset: 0,
      netBalance: 0,
      balance: 0,
      byCategory: {},
      transactionCount: transactions.length,
    };

    for (const tx of transactions) {
      const categoryName = tx.category?.name || 'Uncategorized';

      switch (tx.type) {
        case 'income':
          summary.totalIncome += tx.amount;
          break;
        case 'expense':
          summary.totalExpense += tx.amount;
          break;
        case 'debt':
          summary.totalDebt += tx.amount;
          break;
        case 'receivable':
          summary.totalReceivable += tx.amount;
          break;
        case 'asset':
          summary.totalAsset += tx.amount;
          break;
      }

      if (!summary.byCategory[categoryName]) {
        summary.byCategory[categoryName] = { amount: 0, count: 0 };
      }
      summary.byCategory[categoryName].amount += tx.amount;
      summary.byCategory[categoryName].count += 1;
    }

    summary.netBalance = summary.totalIncome - summary.totalExpense;
    summary.balance = summary.netBalance;
    return summary;
  }
}

export const transactionService = new TransactionService();

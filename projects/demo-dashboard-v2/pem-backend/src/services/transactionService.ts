import { TransactionRepository } from '../repositories';
import { Transaction } from '@prisma/client';

export class TransactionService {
  private transactionRepository = new TransactionRepository();

  async getTransactions(userId: string, filter?: { startDate?: string; endDate?: string; categoryId?: string }) {
    const formattedFilter: { startDate?: Date; endDate?: Date; categoryId?: string } = {};
    if (filter?.startDate) formattedFilter.startDate = new Date(filter.startDate);
    if (filter?.endDate) formattedFilter.endDate = new Date(filter.endDate);
    if (filter?.categoryId) formattedFilter.categoryId = filter.categoryId;

    return this.transactionRepository.getAllByUserId(userId, formattedFilter);
  }

  async createTransaction(data: Omit<Transaction, 'id'>) {
    return this.transactionRepository.create(data);
  }

  async getStats(userId: string) {
    return this.transactionRepository.getStats(userId);
  }
}

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { transactionService } from '../../src/services/transactions';
import apiClient from '../../src/services/apiClient';
import type { Transaction } from '../../src/types';

vi.mock('../../src/services/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Transaction Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockTransactions: Transaction[] = [
    {
      id: 'tx-1',
      userId: 'user-1',
      type: 'income',
      amount: 5000000,
      currency: 'VND',
      category: 'Salary',
      description: 'Monthly salary',
      date: '2024-01-15',
      isRecurring: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tx-2',
      userId: 'user-1',
      type: 'expense',
      amount: 500000,
      currency: 'VND',
      category: 'Food',
      description: 'Groceries',
      date: '2024-01-16',
      isRecurring: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  describe('getAll', () => {
    it('should fetch all transactions without filter', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: mockTransactions,
          pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
        },
      });

      const result = await transactionService.getAll();

      expect(apiClient.get).toHaveBeenCalledWith('/transactions', {
        params: { page: 1, limit: 20 },
      });
      expect(result.transactions).toEqual(mockTransactions);
      expect(result.pagination).toEqual({ page: 1, limit: 20, total: 2, totalPages: 1 });
    });

    it('should fetch transactions with filter', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: [mockTransactions[0]],
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
        },
      });

      const result = await transactionService.getAll({ type: 'income' }, 1, 20);

      expect(apiClient.get).toHaveBeenCalledWith('/transactions', {
        params: {
          page: 1,
          limit: 20,
          type: 'income',
        },
      });
      expect(result.transactions.length).toBe(1);
    });

    it('should handle empty transaction list', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        },
      });

      const result = await transactionService.getAll();

      expect(result.transactions).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe('getById', () => {
    it('should fetch a single transaction by ID', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: mockTransactions[0],
        },
      });

      const result = await transactionService.getById('tx-1');

      expect(apiClient.get).toHaveBeenCalledWith('/transactions/tx-1');
      expect(result).toEqual(mockTransactions[0]);
    });

    it('should throw error for non-existent transaction', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Transaction not found'));

      await expect(transactionService.getById('non-existent')).rejects.toThrow('Transaction not found');
    });
  });

  describe('create', () => {
    it('should create a new income transaction', async () => {
      const newTransaction: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
        type: 'income',
        amount: 10000000,
        currency: 'VND',
        category: 'Salary',
        description: 'Bonus',
        date: '2024-01-20',
        isRecurring: false,
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: {
          success: true,
          data: { ...newTransaction, id: 'tx-new', userId: 'user-1' },
        },
      });

      const result = await transactionService.create(newTransaction);

      expect(apiClient.post).toHaveBeenCalledWith('/transactions', newTransaction);
      expect(result.type).toBe('income');
      expect(result.amount).toBe(10000000);
    });

    it('should create an expense transaction', async () => {
      const newTransaction: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
        type: 'expense',
        amount: 200000,
        currency: 'VND',
        category: 'Transport',
        description: 'Taxi',
        date: '2024-01-21',
        isRecurring: false,
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: {
          success: true,
          data: { ...newTransaction, id: 'tx-new', userId: 'user-1' },
        },
      });

      const result = await transactionService.create(newTransaction);

      expect(result.type).toBe('expense');
    });

    it('should throw error on invalid amount', async () => {
      const invalidTransaction = {
        type: 'expense',
        amount: -100000,
        currency: 'VND',
        date: '2024-01-21',
      };

      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Amount must be positive'));

      await expect(transactionService.create(invalidTransaction as any)).rejects.toThrow('Amount must be positive');
    });
  });

  describe('update', () => {
    it('should update a transaction', async () => {
      const updates = {
        amount: 6000000,
        description: 'Updated salary',
      };

      vi.mocked(apiClient.put).mockResolvedValueOnce({
        data: {
          success: true,
          data: { ...mockTransactions[0], ...updates },
        },
      });

      const result = await transactionService.update('tx-1', updates);

      expect(apiClient.put).toHaveBeenCalledWith('/transactions/tx-1', updates);
      expect(result.amount).toBe(6000000);
    });

    it('should throw error for non-existent transaction', async () => {
      vi.mocked(apiClient.put).mockRejectedValueOnce(new Error('Transaction not found'));

      await expect(transactionService.update('non-existent', { amount: 1000 })).rejects.toThrow(
        'Transaction not found'
      );
    });
  });

  describe('delete', () => {
    it('should delete a transaction', async () => {
      vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: { success: true } });

      await expect(transactionService.delete('tx-1')).resolves.toBeUndefined();

      expect(apiClient.delete).toHaveBeenCalledWith('/transactions/tx-1');
    });

    it('should throw error for non-existent transaction', async () => {
      vi.mocked(apiClient.delete).mockRejectedValueOnce(new Error('Transaction not found'));

      await expect(transactionService.delete('non-existent')).rejects.toThrow('Transaction not found');
    });
  });

  describe('getSummary', () => {
    it('should get transaction summary without month/year', async () => {
      const mockSummary = {
        totalIncome: 5000000,
        totalExpense: 500000,
        balance: 4500000,
        byCategory: {
          Salary: 5000000,
          Food: 500000,
        },
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: mockSummary,
        },
      });

      const result = await transactionService.getSummary();

      expect(apiClient.get).toHaveBeenCalledWith('/transactions/summary', { params: {} });
      expect(result).toEqual(mockSummary);
    });

    it('should get transaction summary with month and year', async () => {
      const mockSummary = {
        totalIncome: 5000000,
        totalExpense: 500000,
        balance: 4500000,
        byCategory: {},
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: mockSummary,
        },
      });

      const result = await transactionService.getSummary(1, 2024);

      expect(apiClient.get).toHaveBeenCalledWith('/transactions/summary', {
        params: { month: 1, year: 2024 },
      });
    });
  });
});

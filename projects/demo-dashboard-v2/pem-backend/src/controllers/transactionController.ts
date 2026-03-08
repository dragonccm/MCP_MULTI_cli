import { Response } from 'express';
import { TransactionService } from '../services';
import { AuthRequest } from '../middlewares/auth';

export class TransactionController {
  private transactionService = new TransactionService();

  getAll = async (req: AuthRequest, res: Response) => {
    try {
      const { startDate, endDate, categoryId } = req.query;
      const transactions = await this.transactionService.getTransactions(req.user!.id, {
        startDate: startDate as string,
        endDate: endDate as string,
        categoryId: categoryId as string
      });
      res.json(transactions);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message });
    }
  };

  create = async (req: AuthRequest, res: Response) => {
    try {
      const amount = Number(req.body.amount);
      if (isNaN(amount) || amount <= 0) {
        res.status(400).json({ message: 'Amount must be a positive number' });
        return;
      }

      const transaction = await this.transactionService.createTransaction({
        ...req.body,
        amount,
        date: new Date(req.body.date || Date.now()),
        userId: req.user!.id
      });
      res.status(201).json(transaction);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ message });
    }
  };

  getStats = async (req: AuthRequest, res: Response) => {
    try {
      const stats = await this.transactionService.getStats(req.user!.id);
      res.json(stats);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message });
    }
  };
}

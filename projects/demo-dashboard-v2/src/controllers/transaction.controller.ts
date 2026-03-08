import { Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

const transactionSchema = z.object({
  amount: z.number().positive(),
  description: z.string().optional(),
  date: z.string().transform((str) => new Date(str)),
  categoryId: z.string(),
});

export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const month = req.query['month'];
    const year = req.query['year'];

    let whereClause: any = { userId };

    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0);
      whereClause.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { amount, description, date, categoryId } = transactionSchema.parse(req.body);

    // Verify category belongs to user
    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId },
    });

    if (!category) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount,
        description,
        date,
        categoryId,
        userId,
      },
      include: {
        category: true,
      },
    });

    res.status(201).json(transaction);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.format() });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const id = req.params['id'] as string;
    if (!id) return res.status(400).json({ message: 'ID required' });

    const { amount, description, date, categoryId } = transactionSchema.parse(req.body);

    const existingTransaction = await prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!existingTransaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: categoryId, userId },
      });
      if (!category) {
        return res.status(400).json({ message: 'Invalid category' });
      }
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        amount,
        description,
        date,
        categoryId,
      },
      include: {
        category: true,
      },
    });

    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.format() });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const id = req.params['id'] as string;
    if (!id) return res.status(400).json({ message: 'ID required' });

    const existingTransaction = await prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!existingTransaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    await prisma.transaction.delete({
      where: { id },
    });

    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

import { Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

const categorySchema = z.object({
  name: z.string().min(1),
  type: z.enum(['INCOME', 'EXPENSE']),
});

export const getCategories = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const categories = await prisma.category.findMany({
      where: { userId },
    });

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { name, type } = categorySchema.parse(req.body);

    const existing = await prisma.category.findUnique({
      where: {
        name_userId_type: {
          name,
          userId,
          type,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await prisma.category.create({
      data: {
        name,
        type,
        userId,
      },
    });

    res.status(201).json(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.format() });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

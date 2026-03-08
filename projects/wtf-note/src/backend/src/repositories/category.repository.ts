import prisma from '../config/database';
import { Prisma } from '@prisma/client';

export class CategoryRepository {
  async findById(id: string, userId: string) {
    return prisma.category.findFirst({
      where: { id, userId, deletedAt: null },
    });
  }

  async findMany(userId: string, type?: string) {
    return prisma.category.findMany({
      where: {
        userId,
        deletedAt: null,
        ...(type && { type }),
      },
      orderBy: { name: 'asc' },
    });
  }

  async create(data: Prisma.CategoryCreateInput) {
    return prisma.category.create({ data });
  }

  async update(id: string, data: Prisma.CategoryUpdateInput) {
    return prisma.category.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });
  }

  async softDelete(id: string) {
    return prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

export const categoryRepository = new CategoryRepository();

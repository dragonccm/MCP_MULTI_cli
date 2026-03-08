import prisma from './prisma';
import { Category } from '@prisma/client';

export class CategoryRepository {
  async getAllByUserId(userId: string) {
    return prisma.category.findMany({ where: { userId } });
  }

  async create(data: Omit<Category, 'id'>) {
    return prisma.category.create({ data });
  }

  async findById(id: string) {
    return prisma.category.findUnique({ where: { id } });
  }
}

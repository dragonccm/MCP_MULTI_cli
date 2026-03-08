import prisma from '../config/database';
import { Prisma } from '@prisma/client';

export class PortfolioRepository {
  async findById(id: string, userId: string) {
    return prisma.portfolio.findFirst({
      where: { id, userId, deletedAt: null },
      include: { assets: { where: { deletedAt: null } } },
    });
  }

  async findMany(userId: string) {
    return prisma.portfolio.findMany({
      where: { userId, deletedAt: null },
      include: { assets: { where: { deletedAt: null } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: Prisma.PortfolioCreateInput) {
    return prisma.portfolio.create({
      data,
      include: { assets: true },
    });
  }

  async update(id: string, data: Prisma.PortfolioUpdateInput) {
    return prisma.portfolio.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
      include: { assets: { where: { deletedAt: null } } },
    });
  }

  async softDelete(id: string) {
    return prisma.portfolio.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

export const portfolioRepository = new PortfolioRepository();

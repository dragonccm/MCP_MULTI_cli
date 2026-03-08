import prisma from '../config/database';
import { Prisma } from '@prisma/client';

export class AssetRepository {
  async findById(id: string) {
    return prisma.asset.findFirst({
      where: { id, deletedAt: null },
      include: { portfolio: true },
    });
  }

  async findByPortfolio(portfolioId: string) {
    return prisma.asset.findMany({
      where: { portfolioId, deletedAt: null },
      orderBy: { symbol: 'asc' },
    });
  }

  async findBySymbol(portfolioId: string, symbol: string) {
    return prisma.asset.findFirst({
      where: { portfolioId, symbol, deletedAt: null },
    });
  }

  async create(data: Prisma.AssetCreateInput) {
    return prisma.asset.create({
      data,
      include: { portfolio: true },
    });
  }

  async update(id: string, data: Prisma.AssetUpdateInput) {
    return prisma.asset.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
      include: { portfolio: true },
    });
  }

  async softDelete(id: string) {
    return prisma.asset.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async updatePrice(id: string, currentPrice: number) {
    return prisma.asset.update({
      where: { id },
      data: { currentPrice, lastUpdated: new Date() },
    });
  }
}

export const assetRepository = new AssetRepository();

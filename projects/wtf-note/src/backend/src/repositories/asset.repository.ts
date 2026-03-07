import { prisma } from "../config/database";

export const assetRepository = {
  findByUser(userId: string, type?: string) {
    return prisma.asset.findMany({
      where: {
        userId,
        deletedAt: null,
        ...(type ? { type } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id: string, userId: string) {
    return prisma.asset.findFirst({
      where: { id, userId, deletedAt: null },
    });
  },

  create(data: Record<string, unknown> & { type: string; userId: string }) {
    return prisma.asset.create({ data: data as never });
  },

  update(id: string, data: Record<string, unknown>) {
    return prisma.asset.update({ where: { id }, data: data as never });
  },

  softDelete(id: string) {
    return prisma.asset.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  getPortfolioSummary(userId: string) {
    return prisma.asset.findMany({
      where: { userId, deletedAt: null },
      select: {
        id: true,
        type: true,
        ticker: true,
        stockQuantity: true,
        purchasePrice: true,
        coinSymbol: true,
        cryptoQuantity: true,
        avgBuyPrice: true,
        propertyName: true,
        realEstatePurchasePrice: true,
        estimatedValue: true,
        ownershipPercentage: true,
      },
    });
  },

  getAllForExport(userId: string) {
    return prisma.asset.findMany({
      where: { userId, deletedAt: null },
      orderBy: { type: "asc" },
    });
  },
};

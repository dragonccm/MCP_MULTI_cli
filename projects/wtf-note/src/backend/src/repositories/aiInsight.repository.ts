import { prisma } from "../config/database";

export const aiInsightRepository = {
  findByUser(userId: string, type?: string) {
    return prisma.aiInsight.findMany({
      where: {
        userId,
        ...(type ? { type } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  },

  findLatest(userId: string, type: string) {
    return prisma.aiInsight.findFirst({
      where: { userId, type },
      orderBy: { createdAt: "desc" },
    });
  },

  create(data: { type: string; content: string; userId: string }) {
    return prisma.aiInsight.create({ data });
  },

  deleteOld(userId: string, type: string, keepCount: number) {
    return prisma.$transaction(async (tx) => {
      const toKeep = await tx.aiInsight.findMany({
        where: { userId, type },
        orderBy: { createdAt: "desc" },
        take: keepCount,
        select: { id: true },
      });
      const keepIds = toKeep.map((i) => i.id);
      await tx.aiInsight.deleteMany({
        where: { userId, type, id: { notIn: keepIds } },
      });
    });
  },
};

export const marketPriceRepository = {
  findBySymbol(symbol: string, type: string) {
    return prisma.marketPrice.findFirst({
      where: { symbol: symbol.toUpperCase(), type },
    });
  },

  upsert(symbol: string, type: string, price: number, change24h?: number) {
    return prisma.marketPrice.upsert({
      where: { symbol_type: { symbol: symbol.toUpperCase(), type } },
      update: { price, change24h, lastUpdated: new Date() },
      create: { symbol: symbol.toUpperCase(), type, price, change24h },
    });
  },

  findAll(type?: string) {
    return prisma.marketPrice.findMany({
      where: type ? { type } : {},
      orderBy: { symbol: "asc" },
    });
  },
};

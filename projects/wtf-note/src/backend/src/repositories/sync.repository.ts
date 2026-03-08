import prisma from '../config/database';
import { Prisma } from '@prisma/client';

export class SyncRepository {
  async findPending(userId: string) {
    return prisma.syncLog.findMany({
      where: { userId, status: 'pending' },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findSince(userId: string, since: Date) {
    return prisma.syncLog.findMany({
      where: {
        userId,
        status: 'synced',
        syncedAt: { gte: since },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(data: Prisma.SyncLogCreateInput) {
    return prisma.syncLog.create({ data });
  }

  async createMany(logs: Prisma.SyncLogCreateInput[]) {
    const results = [];
    for (const log of logs) {
      const result = await prisma.syncLog.create({ data: log });
      results.push(result);
    }
    return results;
  }

  async markSynced(id: string) {
    return prisma.syncLog.update({
      where: { id },
      data: { status: 'synced', syncedAt: new Date() },
    });
  }

  async markFailed(id: string) {
    return prisma.syncLog.update({
      where: { id },
      data: { status: 'failed' },
    });
  }
}

export const syncRepository = new SyncRepository();

import { syncRepository } from '../repositories/sync.repository';
import { AppError } from '../types';
import { SyncPushInput } from '../validators/sync.validator';
import logger from '../utils/logger';

export class SyncService {
  async pushChanges(userId: string, input: SyncPushInput) {
    const results = [];

    for (const change of input.changes) {
      try {
        const log = await syncRepository.create({
          user: { connect: { id: userId } },
          action: change.action,
          entityType: change.entityType,
          entityId: change.entityId,
          payload: change.payload,
          status: 'synced',
          syncedAt: new Date(),
        });
        results.push({ id: log.id, entityId: change.entityId, status: 'synced' });
      } catch (error) {
        logger.error('Sync push failed for entity', {
          entityId: change.entityId,
          error: (error as Error).message,
        });
        results.push({ entityId: change.entityId, status: 'failed', error: (error as Error).message });
      }
    }

    logger.info('Sync push completed', { userId, total: input.changes.length });
    return { results, synced: results.filter((r) => r.status === 'synced').length };
  }

  async pullChanges(userId: string, lastSyncedAt?: string) {
    if (!lastSyncedAt) {
      const pending = await syncRepository.findPending(userId);
      return { changes: pending, hasMore: false };
    }

    const since = new Date(lastSyncedAt);
    const changes = await syncRepository.findSince(userId, since);
    return { changes, hasMore: false };
  }

  async getStatus(userId: string) {
    const pending = await syncRepository.findPending(userId);
    return {
      pendingCount: pending.length,
      lastSync: pending.length > 0 ? pending[pending.length - 1].createdAt : null,
    };
  }
}

export const syncService = new SyncService();

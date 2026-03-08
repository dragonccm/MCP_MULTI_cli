import { z } from 'zod';

export const syncPushSchema = z.object({
  changes: z.array(z.object({
    action: z.enum(['create', 'update', 'delete']),
    entityType: z.enum(['transaction', 'category', 'budget', 'asset']),
    entityId: z.string(),
    payload: z.string(),
    createdAt: z.string().datetime({ offset: true }).optional(),
  })),
});

export const syncPullSchema = z.object({
  lastSyncedAt: z.string().datetime({ offset: true }).optional(),
});

export type SyncPushInput = z.infer<typeof syncPushSchema>;
export type SyncPullInput = z.infer<typeof syncPullSchema>;

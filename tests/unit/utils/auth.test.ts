import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authOptions } from '@/lib/auth';

describe('Auth Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('callbacks', () => {
    it('jwt callback adds role to token', async () => {
      const token = { name: 'test' };
      const user = { role: 'admin' } as any;
      const result = await authOptions.callbacks?.jwt?.({ token, user, account: {} as any, profile: {} as any, trigger: 'signIn' });
      expect(result?.role).toBe('admin');
    });

    it('session callback adds role to session', async () => {
      const session = { user: { name: 'test' } } as any;
      const token = { role: 'admin' } as any;
      const result = await authOptions.callbacks?.session?.({ session, token, user: {} as any, newSession: {} as any, trigger: 'update' });
      expect(result?.user?.role).toBe('admin');
    });
  });
});

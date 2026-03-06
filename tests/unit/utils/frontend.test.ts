import { describe, it, expect } from 'vitest';
import { cn } from '@frontend/lib/utils';

describe('Frontend Utils', () => {
  describe('cn', () => {
    it('should merge tailwind classes', () => {
      const result = cn('px-2 py-2', 'bg-blue-500');
      expect(result).toBe('px-2 py-2 bg-blue-500');
    });

    it('should merge tailwind classes with conditional', () => {
      const result = cn('px-2 py-2', true && 'bg-blue-500', false && 'text-white');
      expect(result).toBe('px-2 py-2 bg-blue-500');
    });

    it('should handle tailwind conflicts', () => {
      const result = cn('px-2 p-4');
      expect(result).toBe('p-4');
    });
  });
});

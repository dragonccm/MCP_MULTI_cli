import { describe, it, expect, beforeEach, vi } from 'vitest';
import { hashPassword, comparePassword } from '../../src/utils/password';

describe('Password Utils', () => {
  describe('hashPassword', () => {
    it('should hash a plain text password', async () => {
      const password = 'securePassword123';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'samePassword';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
    });

    it('should handle special characters in password', async () => {
      const password = 'P@$$w0rd!#$%^&*()';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
    });

    it('should handle long passwords', async () => {
      const password = 'a'.repeat(100);
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash.length).toBeGreaterThan(50);
    });
  });

  describe('comparePassword', () => {
    it('should return true for correct password', async () => {
      const password = 'correctPassword123';
      const hash = await hashPassword(password);
      
      const isValid = await comparePassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const password = 'correctPassword123';
      const wrongPassword = 'wrongPassword456';
      const hash = await hashPassword(password);
      
      const isValid = await comparePassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });

    it('should return false for empty password', async () => {
      const password = 'somePassword123';
      const hash = await hashPassword(password);
      
      const isValid = await comparePassword('', hash);
      expect(isValid).toBe(false);
    });

    it('should handle case sensitivity', async () => {
      const password = 'Password123';
      const hash = await hashPassword(password);
      
      const isValidLower = await comparePassword('password123', hash);
      const isValidUpper = await comparePassword('PASSWORD123', hash);
      
      expect(isValidLower).toBe(false);
      expect(isValidUpper).toBe(false);
    });
  });
});

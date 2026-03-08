import { describe, it, expect, beforeEach } from 'vitest';
import { z } from 'zod';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
} from '../../src/validators/auth.validator';

describe('Auth Validators', () => {
  describe('registerSchema', () => {
    it('should accept valid registration input', () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        currency: 'VND',
      };
      const result = registerSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const input = {
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User',
      };
      const result = registerSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toContain('email');
      }
    });

    it('should reject weak password (less than 8 chars)', () => {
      const input = {
        email: 'test@example.com',
        password: 'weak',
        name: 'Test User',
      };
      const result = registerSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('8 characters');
      }
    });

    it('should reject empty name', () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
        name: '',
      };
      const result = registerSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should default currency to VND if not provided', () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };
      const result = registerSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currency).toBe('VND');
      }
    });
  });

  describe('loginSchema', () => {
    it('should accept valid login credentials', () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
      };
      const result = loginSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject empty email', () => {
      const input = {
        email: '',
        password: 'password123',
      };
      const result = loginSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const input = {
        email: 'test@example.com',
        password: '',
      };
      const result = loginSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject invalid email format', () => {
      const input = {
        email: 'not-an-email',
        password: 'password123',
      };
      const result = loginSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('refreshTokenSchema', () => {
    it('should accept valid refresh token', () => {
      const input = {
        refreshToken: 'valid-refresh-token-123',
      };
      const result = refreshTokenSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject empty refresh token', () => {
      const input = {
        refreshToken: '',
      };
      const result = refreshTokenSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('changePasswordSchema', () => {
    it('should accept valid password change input', () => {
      const input = {
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword123',
      };
      const result = changePasswordSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject weak new password', () => {
      const input = {
        currentPassword: 'oldPassword123',
        newPassword: 'weak',
      };
      const result = changePasswordSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('8 characters');
      }
    });

    it('should reject empty current password', () => {
      const input = {
        currentPassword: '',
        newPassword: 'newPassword123',
      };
      const result = changePasswordSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });
});

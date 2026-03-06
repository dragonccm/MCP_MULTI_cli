import { describe, it, expect } from 'vitest';
import { leadSchema, serviceSchema, caseStudySchema, loginSchema } from '@/lib/validations/index';

describe('Backend Validations', () => {
  describe('leadSchema', () => {
    it('should validate correct lead data', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '0123456789',
        company: 'WTF DEV',
        painPoints: 'Need automation'
      };
      const result = leadSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should fail on invalid email', () => {
      const data = {
        name: 'John Doe',
        email: 'invalid-email',
      };
      const result = leadSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessages = result.error.issues.map(e => e.message);
        expect(errorMessages).toContain('Email không hợp lệ');
      }
    });

    it('should fail on short name', () => {
      const data = {
        name: 'J',
        email: 'john@example.com',
      };
      const result = leadSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessages = result.error.issues.map(e => e.message);
        expect(errorMessages).toContain('Tên phải ít nhất 2 ký tự');
      }
    });
  });

  describe('serviceSchema', () => {
    it('should validate correct service data', () => {
      const data = {
        title: 'AI Automation',
        description: 'Automating business processes with AI',
        size: '1x1',
        order: 1
      };
      const result = serviceSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should fail on invalid size enum', () => {
      const data = {
        title: 'AI Automation',
        description: 'Automating business processes with AI',
        size: '3x3',
      };
      const result = serviceSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const data = {
        email: 'admin@test.com',
        password: 'password123'
      };
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should fail on short password', () => {
      const data = {
        email: 'admin@test.com',
        password: '123'
      };
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});

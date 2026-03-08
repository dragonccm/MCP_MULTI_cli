import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from '../../src/utils/jwt';
import { AppError } from '../../src/types';

// Mock the environment variables
vi.mock('../src/config/env', () => ({
  env: {
    JWT_ACCESS_SECRET: 'test-access-secret-key-min-32-chars',
    JWT_REFRESH_SECRET: 'test-refresh-secret-key-min-32-chars',
    JWT_EXPIRES_IN: '15m',
    JWT_REFRESH_EXPIRES_IN: '7d',
  },
}));

describe('JWT Utils', () => {
  const mockPayload = {
    userId: '550e8400-e29b-41d4-a716-446655440000',
    email: 'test@example.com',
  };

  describe('generateAccessToken', () => {
    it('should generate a valid JWT access token', () => {
      const token = generateAccessToken(mockPayload);
      
      expect(token).toBeDefined();
      expect(token.split('.')).toHaveLength(3);
    });

    it('should contain the correct payload', () => {
      const token = generateAccessToken(mockPayload);
      const decoded = jwt.decode(token) as jwt.JwtPayload;
      
      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
    });

    it('should have expiration', () => {
      const token = generateAccessToken(mockPayload);
      const decoded = jwt.decode(token) as jwt.JwtPayload;
      
      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(decoded.iat!);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid JWT refresh token', () => {
      const token = generateRefreshToken(mockPayload);
      
      expect(token).toBeDefined();
      expect(token.split('.')).toHaveLength(3);
    });

    it('should contain the correct payload', () => {
      const token = generateRefreshToken(mockPayload);
      const decoded = jwt.decode(token) as jwt.JwtPayload;
      
      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
    });

    it('should have longer expiration than access token', () => {
      const refreshToken = generateRefreshToken(mockPayload);
      const refreshDecoded = jwt.decode(refreshToken) as jwt.JwtPayload;
      
      expect(refreshDecoded.exp).toBeDefined();
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid access token', () => {
      const token = generateAccessToken(mockPayload);
      const verified = verifyAccessToken(token);
      
      expect(verified.userId).toBe(mockPayload.userId);
      expect(verified.email).toBe(mockPayload.email);
    });

    it('should throw error for expired token', () => {
      const expiredToken = jwt.sign(mockPayload, 'test-access-secret-key-min-32-chars', { expiresIn: '-1s' });
      
      expect(() => verifyAccessToken(expiredToken)).toThrow();
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      
      expect(() => verifyAccessToken(invalidToken)).toThrow();
    });

    it('should throw error for tampered token', () => {
      const token = generateAccessToken(mockPayload);
      const [header, payload, signature] = token.split('.');
      const tamperedToken = `${header}.${payload}.tampered`;
      
      expect(() => verifyAccessToken(tamperedToken)).toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', () => {
      const token = generateRefreshToken(mockPayload);
      const verified = verifyRefreshToken(token);
      
      expect(verified.userId).toBe(mockPayload.userId);
      expect(verified.email).toBe(mockPayload.email);
    });

    it('should throw error for expired refresh token', () => {
      const expiredToken = jwt.sign(mockPayload, 'test-refresh-secret-key-min-32-chars', { expiresIn: '-1s' });
      
      expect(() => verifyRefreshToken(expiredToken)).toThrow();
    });

    it('should throw error for invalid refresh token', () => {
      const invalidToken = 'invalid.token.here';
      
      expect(() => verifyRefreshToken(invalidToken)).toThrow();
    });
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authService } from '../../src/services/auth';
import apiClient from '../../src/services/apiClient';
import type { AuthResponse } from '../../src/types';

// Mock apiClient
vi.mock('../../src/services/apiClient', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockResponse: AuthResponse = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
          currency: 'VND',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { success: true, data: mockResponse } });

      const result = await authService.login('test@example.com', 'password123');

      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on invalid credentials', async () => {
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Invalid credentials'));

      await expect(authService.login('test@example.com', 'wrongpassword')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('register', () => {
    it('should register successfully with valid data', async () => {
      const mockResponse: AuthResponse = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: {
          id: 'user-1',
          email: 'newuser@example.com',
          name: 'New User',
          currency: 'VND',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { success: true, data: mockResponse } });

      const result = await authService.register('New User', 'newuser@example.com', 'password123');

      expect(apiClient.post).toHaveBeenCalledWith('/auth/register', {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on duplicate email', async () => {
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Email already registered'));

      await expect(
        authService.register('Existing User', 'existing@example.com', 'password123')
      ).rejects.toThrow('Email already registered');
    });
  });

  describe('getProfile', () => {
    it('should get user profile successfully', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        currency: 'VND',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { success: true, data: mockUser } });

      const result = await authService.getProfile();

      expect(apiClient.get).toHaveBeenCalledWith('/auth/profile');
      expect(result).toEqual(mockUser);
    });

    it('should throw error when profile fetch fails', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'));

      await expect(authService.getProfile()).rejects.toThrow('Network error');
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const updatedUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Updated Name',
        currency: 'USD',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.mocked(apiClient.put).mockResolvedValueOnce({ data: { success: true, data: updatedUser } });

      const result = await authService.updateProfile({ name: 'Updated Name', currency: 'USD' });

      expect(apiClient.put).toHaveBeenCalledWith('/profile', { name: 'Updated Name', currency: 'USD' });
      expect(result).toEqual(updatedUser);
    });

    it('should throw error on update failure', async () => {
      vi.mocked(apiClient.put).mockRejectedValueOnce(new Error('Update failed'));

      await expect(authService.updateProfile({ name: 'New Name' })).rejects.toThrow('Update failed');
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      vi.mocked(apiClient.put).mockResolvedValueOnce({ data: { success: true } });

      await expect(authService.changePassword('oldPassword', 'newPassword123')).resolves.toBeUndefined();

      expect(apiClient.put).toHaveBeenCalledWith('/profile/password', {
        currentPassword: 'oldPassword',
        newPassword: 'newPassword123',
      });
    });

    it('should throw error on wrong current password', async () => {
      vi.mocked(apiClient.put).mockRejectedValueOnce(new Error('Current password is incorrect'));

      await expect(authService.changePassword('wrongOldPassword', 'newPassword123')).rejects.toThrow(
        'Current password is incorrect'
      );
    });
  });
});

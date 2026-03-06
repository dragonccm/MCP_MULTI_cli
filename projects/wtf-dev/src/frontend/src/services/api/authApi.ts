import { apiRequest } from './client';
import { AuthResponse, User } from '../../types';

export const authApi = {
  async register(data: {
    email: string;
    password: string;
    displayName: string;
    baseCurrency?: string;
  }): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: data,
      requiresAuth: false,
    });
  },

  async login(data: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: data,
      requiresAuth: false,
    });
  },

  async logout(refreshToken: string): Promise<void> {
    return apiRequest<void>('/auth/logout', {
      method: 'POST',
      body: { refreshToken },
    });
  },

  async getProfile(): Promise<User> {
    return apiRequest<User>('/auth/profile');
  },
};

import apiClient from './apiClient';
import type { ApiResponse, AuthResponse, User } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', { email, password });
    return data.data;
  },

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', { name, email, password });
    return data.data;
  },

  async getProfile(): Promise<User> {
    const { data } = await apiClient.get<ApiResponse<User>>('/auth/profile');
    return data.data;
  },

  async updateProfile(updates: Partial<Pick<User, 'name' | 'currency'>>): Promise<User> {
    const { data } = await apiClient.put<ApiResponse<User>>('/profile', updates);
    return data.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.put('/profile/password', { currentPassword, newPassword });
  },
};

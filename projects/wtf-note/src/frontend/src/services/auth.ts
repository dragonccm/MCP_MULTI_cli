import { apiClient } from './api';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from '../types';

export const authService = {
  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>('/auth/login', data),

  register: (data: RegisterRequest) =>
    apiClient.post<AuthResponse>('/auth/register', data),

  logout: () => apiClient.post<void>('/auth/logout'),

  refreshToken: () => apiClient.post<AuthResponse>('/auth/refresh'),

  getProfile: () => apiClient.get<User>('/users/profile'),

  updateProfile: (data: Partial<User>) =>
    apiClient.put<User>('/users/profile', data),
};

import { create } from 'zustand';
import type { User } from '../types';
import { authService } from '../services/auth';
import { saveToken, saveRefreshToken, clearAuth } from '../utils/storage';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<User, 'name' | 'currency'>>) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(email, password);
      await saveToken(response.accessToken);
      await saveRefreshToken(response.refreshToken);
      set({ user: response.user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đăng nhập thất bại';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register(name, email, password);
      await saveToken(response.accessToken);
      await saveRefreshToken(response.refreshToken);
      set({ user: response.user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đăng ký thất bại';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    await clearAuth();
    set({ user: null, isAuthenticated: false, error: null });
  },

  loadProfile: async () => {
    set({ isLoading: true });
    try {
      const user = await authService.getProfile();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ isAuthenticated: false, isLoading: false });
    }
  },

  updateProfile: async (updates) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.updateProfile(updates);
      set({ user, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cập nhật thất bại';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));

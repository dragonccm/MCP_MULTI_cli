import React, { createContext, useState, useCallback, useEffect, useRef } from 'react';
import { User } from '../types';
import { authApi, setTokens, clearTokens, setOnTokenRefreshFailed } from '../services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
});

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): React.JSX.Element {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });

  const refreshTokenRef = useRef<string | null>(null);

  const handleLogout = useCallback(async () => {
    try {
      if (refreshTokenRef.current) {
        await authApi.logout(refreshTokenRef.current);
      }
    } catch {
      // Ignore logout errors
    } finally {
      clearTokens();
      refreshTokenRef.current = null;
      setState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  useEffect(() => {
    setOnTokenRefreshFailed(() => {
      handleLogout();
    });
  }, [handleLogout]);

  const login = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await authApi.login({ email, password });
      setTokens(response.accessToken, response.refreshToken);
      refreshTokenRef.current = response.refreshToken;
      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const register = useCallback(async (email: string, password: string, displayName: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await authApi.register({ email, password, displayName });
      setTokens(response.accessToken, response.refreshToken);
      refreshTokenRef.current = response.refreshToken;
      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const user = await authApi.getProfile();
      setState((prev) => ({ ...prev, user }));
    } catch {
      // Silently fail
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout: handleLogout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

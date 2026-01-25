/**
 * Auth Context
 *
 * Provides shared authentication state across the app.
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api, APIError } from '../lib/api';

interface User {
  id: string;
  email: string;
  name?: string;
  apiKey: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  register: (email: string, password: string, name?: string) => Promise<User>;
  login: (apiKey: string) => Promise<User>;
  loginWithEmail: (email: string, password: string) => Promise<User>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('aixord_token'));
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Validate token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('aixord_token');
    if (storedToken) {
      api.auth
        .me(storedToken)
        .then((userData) => {
          setUser(userData);
          setToken(storedToken);
          setIsLoading(false);
        })
        .catch(() => {
          localStorage.removeItem('aixord_token');
          setToken(null);
          setUser(null);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = await api.auth.register(email, password, name);
      const newToken = userData.apiKey;
      localStorage.setItem('aixord_token', newToken);
      setToken(newToken);
      setUser(userData);
      setIsLoading(false);
      return userData;
    } catch (err) {
      const message = err instanceof APIError ? err.message : 'Registration failed';
      setError(message);
      setIsLoading(false);
      throw err;
    }
  }, []);

  const login = useCallback(async (apiKey: string) => {
    setIsLoading(true);
    setError(null);
    try {
      localStorage.setItem('aixord_token', apiKey);
      const userData = await api.auth.me(apiKey);
      setToken(apiKey);
      setUser(userData);
      setIsLoading(false);
      return userData;
    } catch (err) {
      localStorage.removeItem('aixord_token');
      setToken(null);
      setUser(null);
      const message = err instanceof APIError ? err.message : 'Login failed';
      setError(message);
      setIsLoading(false);
      throw err;
    }
  }, []);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = await api.auth.login(email, password);
      const newToken = userData.apiKey;
      localStorage.setItem('aixord_token', newToken);
      setToken(newToken);
      setUser(userData);
      setIsLoading(false);
      return userData;
    } catch (err) {
      const message = err instanceof APIError ? err.message : 'Login failed';
      setError(message);
      setIsLoading(false);
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('aixord_token');
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    token,
    user,
    isLoading,
    error,
    isAuthenticated: !!token && !!user,
    register,
    login,
    loginWithEmail,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

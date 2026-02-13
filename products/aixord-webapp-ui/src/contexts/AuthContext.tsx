/**
 * Auth Context
 *
 * Provides shared authentication state across the app.
 *
 * RC-4 FIX: localStorage is now primary storage (cookies have failed 3 times)
 * with cookies as fallback for edge cases.
 *
 * D-003 FIX: Enhanced persistence to survive rapid Ctrl+R refreshes
 * - Synchronous state initialization from storage
 * - Dual storage (localStorage + cookie) for redundancy
 * - Immediate state restoration before React hydration
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { api, APIError } from '../lib/api';

// Token storage utilities - RC-4: localStorage as primary (cookies have failed repeatedly), cookie as backup
const TOKEN_KEY = 'aixord_token';
const USER_KEY = 'aixord_user';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

function setCookie(name: string, value: string, maxAge: number): void {
  // NOTE: document.cookie cannot set HttpOnly flag (requires server-side Set-Cookie header)
  // Cookie is backup storage only; localStorage is primary (RC-4 FIX)
  // Only use Secure flag on HTTPS (production), allow HTTP for localhost development
  const isSecure = window.location.protocol === 'https:';
  const secureFlag = isSecure ? '; Secure' : '';
  // D-003 FIX: Use SameSite=Strict for better cookie persistence on same-origin refreshes
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Strict${secureFlag}`;
}

function getCookie(name: string): string | null {
  try {
    // More robust cookie parsing
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [cookieName, ...cookieValueParts] = cookie.trim().split('=');
      if (cookieName === name) {
        const cookieValue = cookieValueParts.join('='); // Handle values with = signs
        return decodeURIComponent(cookieValue);
      }
    }
    return null;
  } catch (error) {
    console.warn('[AuthContext] Failed to read cookie:', error);
    return null;
  }
}

function deleteCookie(name: string): void {
  document.cookie = `${name}=; path=/; max-age=0`;
}

function storeToken(token: string): void {
  // Store in both cookie and localStorage for redundancy
  setCookie(TOKEN_KEY, token, COOKIE_MAX_AGE);
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    console.warn('[AuthContext] localStorage not available');
  }
}

function getToken(): string | null {
  // RC-4 FIX: localStorage is primary (more reliable across browser configs)
  // Cookies have failed 3 times - switching priority
  try {
    const localToken = localStorage.getItem(TOKEN_KEY);
    if (localToken) {
      return localToken;
    }
  } catch {
    // localStorage might be blocked in some contexts
  }
  // Fall back to cookie if localStorage fails
  return getCookie(TOKEN_KEY);
}

function removeToken(): void {
  deleteCookie(TOKEN_KEY);
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // Ignore localStorage errors
  }
}

function storeUser(user: User): void {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // Ignore localStorage errors
  }
}

function getCachedUser(): User | null {
  try {
    const cached = localStorage.getItem(USER_KEY);
    if (cached) {
      return JSON.parse(cached) as User;
    }
  } catch {
    // Ignore errors
  }
  return null;
}

interface User {
  id: string;
  email: string;
  name?: string;
  apiKey: string;
  emailVerified?: boolean;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  register: (email: string, password: string, name?: string, username?: string) => Promise<User>;
  login: (apiKey: string) => Promise<User>;
  loginWithEmail: (email: string, password: string) => Promise<User>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // D-003 FIX: Track if we've already validated this session to prevent race conditions
  const validationInProgress = useRef(false);
  const hasValidated = useRef(false);

  // Initialize state from storage immediately (no async wait)
  // D-003 FIX: Synchronous initialization is critical for surviving rapid refreshes
  const [token, setToken] = useState<string | null>(() => {
    const t = getToken();
    // CRIT-04 FIX: Remove token fragment logging — never log token presence to console
    return t;
  });
  const [user, setUser] = useState<User | null>(() => {
    const u = getCachedUser();
    return u;
  });
  const [isLoading, setIsLoading] = useState(() => {
    // Only loading if we have a token but no cached user
    const hasToken = !!getToken();
    const hasCachedUser = !!getCachedUser();
    return hasToken && !hasCachedUser;
  });
  const [error, setError] = useState<string | null>(null);

  // D-003 FIX: Validate token on mount (background validation)
  // Using refs to prevent race conditions during rapid refreshes
  useEffect(() => {
    const validateToken = async () => {
      // Prevent concurrent validation attempts
      if (validationInProgress.current || hasValidated.current) {
        return;
      }
      validationInProgress.current = true;

      const storedToken = getToken();
      const cookieToken = getCookie(TOKEN_KEY);
      const cachedUser = getCachedUser();
      let localToken: string | null = null;
      try {
        localToken = localStorage.getItem(TOKEN_KEY);
      } catch {
        // localStorage might be blocked in some contexts
      }

      // CRIT-04 FIX: Removed token presence logging from mount check

      if (storedToken) {
        // D-003 FIX: If we have a cached user, show them immediately while validating
        // This prevents the "logged out" flash on refresh
        if (cachedUser && !user) {
          setUser(cachedUser);
          setToken(storedToken);
        }

        try {
          const userData = await api.auth.me(storedToken);
          // CRIT-04 FIX: No longer logging user email on validation success
          // Re-store to ensure both storage mechanisms are synced
          storeToken(storedToken);
          storeUser(userData);
          setUser(userData);
          setToken(storedToken);
          hasValidated.current = true;
        } catch (err) {
          // FIX 2: Only clear token on 401 Unauthorized, not on network errors
          const isUnauthorized = err instanceof APIError && err.statusCode === 401;
          console.error('[AuthContext] Token validation FAILED:', err instanceof Error ? err.message : err, 'isUnauthorized:', isUnauthorized);

          if (isUnauthorized) {
            // Token is definitely invalid - clear it
            removeToken();
            setToken(null);
            setUser(null);
          } else {
            // Network error or other issue - keep the cached user logged in
            // They'll get re-validated on next successful request
            if (cachedUser) {
              setUser(cachedUser);
              setToken(storedToken);
            }
          }
        }
      } else {
        // No stored token found — clear any stale cached user
        setUser(null);
      }
      setIsLoading(false);
      validationInProgress.current = false;
    };

    validateToken();
  // FIX 2: Empty dependency - run ONLY on mount, not when user changes
  // The [user] dependency was causing re-validation loops
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const register = useCallback(async (email: string, password: string, name?: string, username?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = await api.auth.register(email, password, name, username);
      const newToken = userData.apiKey;
      storeToken(newToken);
      storeUser(userData);
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
      storeToken(apiKey);
      const userData = await api.auth.me(apiKey);
      storeUser(userData);
      setToken(apiKey);
      setUser(userData);
      setIsLoading(false);
      return userData;
    } catch (err) {
      removeToken();
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
      storeToken(newToken);
      storeUser(userData);
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
    removeToken();
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

/**
 * Shared Test Mocks
 *
 * CRITICAL: These mocks must be set up with vi.mock() BEFORE importing
 * any component that transitively imports from ../../src/lib/api or
 * ../../src/contexts/AuthContext.
 *
 * The API barrel (lib/api/index.ts → lib/api/config.ts) uses import.meta.env
 * which hangs in jsdom if not mocked.
 */

import { vi } from 'vitest';

// Default auth mock values
export const defaultAuthMock = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  token: null,
  error: null,
  login: vi.fn(),
  loginWithEmail: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  clearError: vi.fn(),
};

export function createAuthMock(overrides: Partial<typeof defaultAuthMock> = {}) {
  return { ...defaultAuthMock, ...overrides };
}

export const authenticatedUser = {
  id: 'test-user-1',
  email: 'test@example.com',
  name: 'Test User',
  apiKey: 'aixord_test123',
  emailVerified: true,
};

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from '../../src/components/ProtectedRoute';

// Mock the auth context
vi.mock('../../src/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../../src/contexts/AuthContext';
const mockUseAuth = vi.mocked(useAuth);

describe('ProtectedRoute', () => {
  it('shows loading spinner when auth is loading', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
      login: vi.fn(),
      loginWithEmail: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    } as any);

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    // Loading state should show spinner, not content
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders children when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 'test-id', email: 'test@test.com' },
      login: vi.fn(),
      loginWithEmail: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    } as any);

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      login: vi.fn(),
      loginWithEmail: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    } as any);

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    // Should redirect, not show protected content
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});

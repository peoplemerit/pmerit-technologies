/**
 * Login Page Tests
 *
 * Tests form rendering, validation, tab switching, and submission.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// Mock API barrel to prevent import.meta.env hang
vi.mock('../../src/lib/api', () => ({
  api: {},
  APIError: class extends Error {},
  API_BASE: 'http://localhost:8787/api/v1',
}));

// Mock AuthContext
const mockLoginWithEmail = vi.fn();
const mockLogin = vi.fn();
vi.mock('../../src/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    isAuthenticated: false,
    isLoading: false,
    user: null,
    error: null,
    login: mockLogin,
    loginWithEmail: mockLoginWithEmail,
    register: vi.fn(),
    logout: vi.fn(),
    clearError: vi.fn(),
  })),
}));

import { Login } from '../../src/pages/Login';
import { useAuth } from '../../src/contexts/AuthContext';
const mockUseAuth = vi.mocked(useAuth);

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Login />
    </MemoryRouter>
  );
}

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: null,
      login: mockLogin,
      loginWithEmail: mockLoginWithEmail,
      register: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
    } as any);
  });

  it('renders heading and form fields', () => {
    renderLogin();
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('renders email login tab as default', () => {
    renderLogin();
    expect(screen.getByText('Email & Password')).toBeInTheDocument();
    expect(screen.getByText('API Key')).toBeInTheDocument();
    // Email fields should be visible by default
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
  });

  it('switches to API Key tab and shows API key field', async () => {
    renderLogin();
    const apiKeyTab = screen.getByText('API Key');
    await userEvent.click(apiKeyTab);

    expect(screen.getByLabelText('API Key')).toBeInTheDocument();
    // Email/password fields should be hidden
    expect(screen.queryByLabelText('Email address')).not.toBeInTheDocument();
  });

  it('calls loginWithEmail on email form submission', async () => {
    mockLoginWithEmail.mockResolvedValue({ id: '1', email: 'a@b.com', apiKey: 'k' });
    renderLogin();

    await userEvent.type(screen.getByLabelText('Email address'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    fireEvent.submit(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(mockLoginWithEmail).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('calls login on API key form submission', async () => {
    mockLogin.mockResolvedValue({ id: '1', email: 'a@b.com', apiKey: 'k' });
    renderLogin();

    // Switch to API key tab
    await userEvent.click(screen.getByText('API Key'));
    await userEvent.type(screen.getByLabelText('API Key'), 'aixord_test123');
    fireEvent.submit(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('aixord_test123');
    });
  });

  it('shows loading state when isLoading is true', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
      error: null,
      login: mockLogin,
      loginWithEmail: mockLoginWithEmail,
      register: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
    } as any);

    renderLogin();
    expect(screen.getByText('Signing in...')).toBeInTheDocument();
  });

  it('shows error message when error exists', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: 'Invalid credentials',
      login: mockLogin,
      loginWithEmail: mockLoginWithEmail,
      register: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
    } as any);

    renderLogin();
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  it('has a link to signup page', () => {
    renderLogin();
    const signupLink = screen.getByText('Create one');
    expect(signupLink).toHaveAttribute('href', '/signup');
  });

  it('has a forgot password link', () => {
    renderLogin();
    const forgotLink = screen.getByText('Forgot password?');
    expect(forgotLink).toHaveAttribute('href', '/forgot-password');
  });

  it('disables submit button when loading', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
      error: null,
      login: mockLogin,
      loginWithEmail: mockLoginWithEmail,
      register: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
    } as any);

    renderLogin();
    const button = screen.getByRole('button', { name: 'Signing in...' });
    expect(button).toBeDisabled();
  });
});

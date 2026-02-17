/**
 * Signup Page Tests
 *
 * Tests form rendering, client-side validation, submission, and success screen.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// Mock API barrel
vi.mock('../../src/lib/api', () => ({
  api: {},
  APIError: class extends Error {},
  API_BASE: 'http://localhost:8787/api/v1',
}));

// Mock AuthContext
const mockRegister = vi.fn();
vi.mock('../../src/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    isAuthenticated: false,
    isLoading: false,
    user: null,
    error: null,
    login: vi.fn(),
    loginWithEmail: vi.fn(),
    register: mockRegister,
    logout: vi.fn(),
    clearError: vi.fn(),
  })),
}));

import { Signup } from '../../src/pages/Signup';
import { useAuth } from '../../src/contexts/AuthContext';
const mockUseAuth = vi.mocked(useAuth);

function renderSignup() {
  return render(
    <MemoryRouter initialEntries={['/signup']}>
      <Signup />
    </MemoryRouter>
  );
}

describe('Signup Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: null,
      login: vi.fn(),
      loginWithEmail: vi.fn(),
      register: mockRegister,
      logout: vi.fn(),
      clearError: vi.fn(),
    } as any);
  });

  it('renders heading and all form fields', () => {
    renderSignup();
    expect(screen.getByText('Create your account')).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Name/)).toBeInTheDocument();
  });

  it('shows client-side error for invalid email', async () => {
    renderSignup();
    await userEvent.type(screen.getByLabelText('Email address'), 'notanemail');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    fireEvent.submit(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows client-side error for short password', async () => {
    renderSignup();
    await userEvent.type(screen.getByLabelText('Email address'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'short');
    fireEvent.submit(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters.')).toBeInTheDocument();
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows client-side error for invalid username format', async () => {
    renderSignup();
    await userEvent.type(screen.getByLabelText('Email address'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.type(screen.getByLabelText(/Username/), 'a b'); // spaces not allowed
    fireEvent.submit(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => {
      expect(screen.getByText(/Username must be 3-30 characters/)).toBeInTheDocument();
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('calls register on valid form submission', async () => {
    mockRegister.mockResolvedValue({ id: '1', email: 'test@example.com', apiKey: 'k' });
    renderSignup();

    await userEvent.type(screen.getByLabelText('Email address'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.type(screen.getByLabelText(/Name/), 'Test User');
    fireEvent.submit(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('test@example.com', 'password123', 'Test User', undefined);
    });
  });

  it('shows success screen after registration', async () => {
    mockRegister.mockResolvedValue({ id: '1', email: 'test@example.com', apiKey: 'k' });
    renderSignup();

    await userEvent.type(screen.getByLabelText('Email address'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    fireEvent.submit(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => {
      expect(screen.getByText('Account created!')).toBeInTheDocument();
    });
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Continue to Login')).toBeInTheDocument();
  });

  it('shows context error when register fails', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: 'Email already exists',
      login: vi.fn(),
      loginWithEmail: vi.fn(),
      register: mockRegister,
      logout: vi.fn(),
      clearError: vi.fn(),
    } as any);

    renderSignup();
    expect(screen.getByText('Email already exists')).toBeInTheDocument();
  });

  it('shows loading state during registration', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
      error: null,
      login: vi.fn(),
      loginWithEmail: vi.fn(),
      register: mockRegister,
      logout: vi.fn(),
      clearError: vi.fn(),
    } as any);

    renderSignup();
    expect(screen.getByText('Creating account...')).toBeInTheDocument();
  });

  it('has a link to login page', () => {
    renderSignup();
    const loginLink = screen.getByText('Login');
    expect(loginLink).toHaveAttribute('href', '/login');
  });
});

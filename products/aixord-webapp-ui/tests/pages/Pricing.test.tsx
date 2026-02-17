/**
 * Pricing Page Tests
 *
 * Tests plan rendering, pricing display, and CTA behavior.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock API barrel
vi.mock('../../src/lib/api', () => ({
  api: {},
  billingApi: {
    createCheckout: vi.fn(),
    activateTrial: vi.fn(),
  },
  APIError: class extends Error {},
  API_BASE: 'http://localhost:8787/api/v1',
}));

// Mock AuthContext
vi.mock('../../src/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    isAuthenticated: false,
    isLoading: false,
    user: null,
    error: null,
    login: vi.fn(),
    loginWithEmail: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    clearError: vi.fn(),
  })),
}));

// Mock UserSettingsContext
vi.mock('../../src/contexts/UserSettingsContext', () => ({
  useUserSettings: vi.fn(() => ({
    settings: { subscription_tier: 'NONE' },
  })),
  // Re-export the type so Pricing.tsx can import it
  SubscriptionTier: {},
}));

import { Pricing } from '../../src/pages/Pricing';
import { useAuth } from '../../src/contexts/AuthContext';
const mockUseAuth = vi.mocked(useAuth);

function renderPricing() {
  return render(
    <MemoryRouter initialEntries={['/pricing']}>
      <Pricing />
    </MemoryRouter>
  );
}

describe('Pricing Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: null,
      login: vi.fn(),
      loginWithEmail: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
    } as any);
  });

  it('renders all plan names', () => {
    renderPricing();
    expect(screen.getByText('Free Trial')).toBeInTheDocument();
    expect(screen.getByText('Manuscript')).toBeInTheDocument();
    expect(screen.getByText('Standard (BYOK)')).toBeInTheDocument();
    expect(screen.getByText('Standard')).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByText('Enterprise')).toBeInTheDocument();
  });

  it('displays prices for each plan', () => {
    renderPricing();
    expect(screen.getByText('$0')).toBeInTheDocument();
    expect(screen.getByText('$14.99')).toBeInTheDocument();
    expect(screen.getByText('$9.99')).toBeInTheDocument();
    expect(screen.getByText('$19.99')).toBeInTheDocument();
    expect(screen.getByText('$49.99')).toBeInTheDocument();
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  it('shows key features across plans', () => {
    renderPricing();
    // "500 AI requests/month" appears in both MANUSCRIPT_BYOK and PLATFORM_STANDARD
    const fiveHundredRequests = screen.getAllByText('500 AI requests/month');
    expect(fiveHundredRequests.length).toBeGreaterThanOrEqual(2);
    // "2,000 AI requests/month" is unique to Pro
    expect(screen.getByText('2,000 AI requests/month')).toBeInTheDocument();
    // "Unlimited projects" appears in both PRO and ENTERPRISE
    const unlimitedProjects = screen.getAllByText('Unlimited projects');
    expect(unlimitedProjects.length).toBeGreaterThanOrEqual(2);
  });

  it('renders CTA buttons for each plan', () => {
    renderPricing();
    expect(screen.getByText('Start Free')).toBeInTheDocument();
    expect(screen.getByText('Redeem Code')).toBeInTheDocument();
    // Subscribe buttons for BYOK_STANDARD, PLATFORM_STANDARD, and PLATFORM_PRO
    const subscribeButtons = screen.getAllByText('Subscribe');
    expect(subscribeButtons).toHaveLength(3);
    expect(screen.getByText('Contact Sales')).toBeInTheDocument();
  });
});

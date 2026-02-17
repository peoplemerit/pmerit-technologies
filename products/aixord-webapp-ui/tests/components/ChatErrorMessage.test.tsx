/**
 * ChatErrorMessage Component Tests
 *
 * Tests error code extraction, guidance display, and action rendering.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock lucide-react icons to simple spans
vi.mock('lucide-react', () => ({
  AlertCircle: (props: any) => <span data-testid="icon-alert" {...props} />,
  Key: (props: any) => <span data-testid="icon-key" {...props} />,
  Clock: (props: any) => <span data-testid="icon-clock" {...props} />,
  RefreshCw: (props: any) => <span data-testid="icon-refresh" {...props} />,
  Settings: (props: any) => <span data-testid="icon-settings" {...props} />,
}));

import { ChatErrorMessage } from '../../src/components/ChatErrorMessage';

function renderError(message: string, onRetry?: () => void) {
  return render(
    <MemoryRouter>
      <ChatErrorMessage message={message} onRetry={onRetry} />
    </MemoryRouter>
  );
}

describe('ChatErrorMessage', () => {
  it('shows fallback for unknown error messages', () => {
    renderError('Something completely unexpected happened');
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Something completely unexpected happened')).toBeInTheDocument();
  });

  it('shows retry button in fallback when onRetry provided', () => {
    const onRetry = vi.fn();
    renderError('Unknown error', onRetry);
    const retryBtn = screen.getByText('Try Again');
    fireEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('maps BYOK_KEY_MISSING to API Key Required guidance', () => {
    renderError('BYOK_KEY_MISSING: Provider key not configured');
    expect(screen.getByText('API Key Required')).toBeInTheDocument();
    expect(screen.getByText('Add API Key in Settings')).toBeInTheDocument();
  });

  it('maps TRIAL_EXPIRED to trial expired guidance with pricing link', () => {
    renderError('Error: TRIAL_EXPIRED');
    expect(screen.getByText('Trial Expired')).toBeInTheDocument();
    expect(screen.getByText('Upgrade Plan')).toBeInTheDocument();
    // Action link should point to /pricing
    const link = screen.getByText('Upgrade Plan').closest('a');
    expect(link).toHaveAttribute('href', '/pricing');
  });

  it('maps RATE_LIMIT to rate limited guidance', () => {
    renderError('RATE_LIMIT: Too many requests');
    expect(screen.getByText('Rate Limited')).toBeInTheDocument();
  });

  it('maps ALL_PROVIDERS_FAILED to appropriate guidance', () => {
    renderError('ALL_PROVIDERS_FAILED: No response from any provider');
    expect(screen.getByText('All Providers Failed')).toBeInTheDocument();
  });

  it('maps LIMIT_EXCEEDED to usage limit guidance', () => {
    renderError('LIMIT_EXCEEDED: Monthly limit reached');
    expect(screen.getByText('Usage Limit Reached')).toBeInTheDocument();
    expect(screen.getByText('View Pricing')).toBeInTheDocument();
  });

  it('maps status 401 to AUTH_EXPIRED', () => {
    renderError('Request failed with status 401');
    expect(screen.getByText('Session Expired')).toBeInTheDocument();
    expect(screen.getByText('Log In')).toBeInTheDocument();
  });

  it('maps status 429 to RATE_LIMIT', () => {
    renderError('Request failed with status 429');
    expect(screen.getByText('Rate Limited')).toBeInTheDocument();
  });

  it('maps "rate limit exceeded" text to RATE_LIMIT', () => {
    renderError('Rate limit exceeded, please wait');
    expect(screen.getByText('Rate Limited')).toBeInTheDocument();
  });

  it('maps INVALID_API_KEY to appropriate guidance', () => {
    renderError('Error: INVALID_API_KEY');
    expect(screen.getByText('Invalid API Key')).toBeInTheDocument();
    expect(screen.getByText('Update API Key')).toBeInTheDocument();
  });

  it('maps NETWORK_ERROR to connection error guidance', () => {
    renderError('NETWORK_ERROR: Failed to fetch');
    expect(screen.getByText('Connection Error')).toBeInTheDocument();
  });
});

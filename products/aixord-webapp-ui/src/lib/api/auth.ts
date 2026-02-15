/**
 * AIXORD Web App API Client - Authentication
 */

import { request, type User } from './core';

export const authApi = {
  /**
   * Register a new user
   * Backend returns: { user: { id, email, emailVerified }, token, expires_at, message }
   */
  async register(email: string, password: string, name?: string, username?: string): Promise<User> {
    const response = await request<{
      user: { id: string; email: string; emailVerified?: boolean };
      token: string;
      expires_at: string;
      message?: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, username, name }),
    });
    return {
      id: response.user.id,
      email: response.user.email,
      name: name,
      apiKey: response.token,
      emailVerified: response.user.emailVerified ?? true,
    };
  },

  /**
   * Login with email and password
   * Backend returns: { user: { id, email }, token, expires_at }
   */
  async login(email: string, password: string): Promise<User> {
    const response = await request<{
      user: { id: string; email: string; emailVerified?: boolean };
      token: string;
      expires_at: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return {
      id: response.user.id,
      email: response.user.email,
      name: undefined,
      apiKey: response.token,
      emailVerified: response.user.emailVerified ?? true,
    };
  },

  /**
   * Get current user info (validates API key)
   * Backend returns: { user: { id, email, emailVerified } }
   */
  async me(token: string): Promise<User> {
    const response = await request<{
      user: { id: string; email: string; emailVerified?: boolean };
    }>('/auth/me', {}, token);
    return {
      id: response.user.id,
      email: response.user.email,
      name: undefined,
      apiKey: token,
      emailVerified: response.user.emailVerified ?? false,
    };
  },

  /**
   * Get current user's subscription from backend
   * Returns subscription tier, status, and billing info
   */
  async getSubscription(token: string): Promise<{
    tier: string;
    status: string;
    keyMode: 'PLATFORM' | 'BYOK';
    periodEnd: string | null;
    stripeCustomerId: string | null;
  }> {
    return request<{
      tier: string;
      status: string;
      keyMode: 'PLATFORM' | 'BYOK';
      periodEnd: string | null;
      stripeCustomerId: string | null;
    }>('/auth/subscription', {}, token);
  },

  /**
   * Logout — invalidate session server-side (HANDOFF-COPILOT-AUDIT-01)
   * Best-effort: errors are caught by caller, local state is always cleared
   */
  async logout(token: string): Promise<void> {
    await request<{ success: boolean }>('/auth/logout', {
      method: 'POST',
    }, token);
  },
};

/**
 * Circuit Breaker Tests — Phase 1.4
 *
 * Tests the per-provider circuit breaker state machine:
 * CLOSED → OPEN (after N failures) → HALF_OPEN (after cooldown) → CLOSED (on success)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  isCircuitClosed,
  recordSuccess,
  recordFailure,
  getProviderHealth,
  resetCircuit,
} from '../../src/routing/circuit-breaker';

// Reset all circuits before each test to prevent state leaking between tests
beforeEach(() => {
  resetCircuit('anthropic');
  resetCircuit('openai');
  resetCircuit('google');
  resetCircuit('deepseek');
});

// ============================================================================
// Basic State: All circuits start CLOSED
// ============================================================================
describe('initial state', () => {
  it('all providers start with CLOSED circuits', () => {
    expect(isCircuitClosed('anthropic')).toBe(true);
    expect(isCircuitClosed('openai')).toBe(true);
    expect(isCircuitClosed('google')).toBe(true);
    expect(isCircuitClosed('deepseek')).toBe(true);
  });

  it('getProviderHealth reports CLOSED with zero failures', () => {
    const health = getProviderHealth();
    expect(health.anthropic.state).toBe('CLOSED');
    expect(health.anthropic.failureCount).toBe(0);
    expect(health.openai.state).toBe('CLOSED');
  });
});

// ============================================================================
// CLOSED → OPEN transition (after failureThreshold failures)
// ============================================================================
describe('CLOSED → OPEN', () => {
  it('stays CLOSED after fewer than threshold failures', () => {
    recordFailure('anthropic');
    recordFailure('anthropic');
    // Default threshold is 3, so 2 failures should keep it CLOSED
    expect(isCircuitClosed('anthropic')).toBe(true);
  });

  it('opens circuit after reaching failure threshold', () => {
    recordFailure('openai');
    recordFailure('openai');
    recordFailure('openai');
    // 3 failures (threshold) → OPEN
    expect(isCircuitClosed('openai')).toBe(false);
  });

  it('getProviderHealth shows OPEN state after threshold failures', () => {
    recordFailure('google');
    recordFailure('google');
    recordFailure('google');
    const health = getProviderHealth();
    expect(health.google.state).toBe('OPEN');
    expect(health.google.failureCount).toBe(3);
  });
});

// ============================================================================
// Success resets failure count in CLOSED state
// ============================================================================
describe('success in CLOSED state', () => {
  it('resets failure count on success', () => {
    recordFailure('anthropic');
    recordFailure('anthropic');
    recordSuccess('anthropic');
    // Failure count should be 0 now
    const health = getProviderHealth();
    expect(health.anthropic.failureCount).toBe(0);
    expect(health.anthropic.state).toBe('CLOSED');
  });

  it('prevents opening by interleaving successes', () => {
    recordFailure('anthropic');
    recordFailure('anthropic');
    recordSuccess('anthropic'); // resets to 0
    recordFailure('anthropic');
    recordFailure('anthropic');
    // Only 2 consecutive failures → still CLOSED
    expect(isCircuitClosed('anthropic')).toBe(true);
  });
});

// ============================================================================
// Provider isolation: one provider's state doesn't affect others
// ============================================================================
describe('provider isolation', () => {
  it('opening one provider does not affect others', () => {
    recordFailure('deepseek');
    recordFailure('deepseek');
    recordFailure('deepseek');
    // deepseek is OPEN
    expect(isCircuitClosed('deepseek')).toBe(false);
    // others remain CLOSED
    expect(isCircuitClosed('anthropic')).toBe(true);
    expect(isCircuitClosed('openai')).toBe(true);
    expect(isCircuitClosed('google')).toBe(true);
  });
});

// ============================================================================
// resetCircuit
// ============================================================================
describe('resetCircuit', () => {
  it('resets an OPEN circuit back to CLOSED', () => {
    recordFailure('anthropic');
    recordFailure('anthropic');
    recordFailure('anthropic');
    expect(isCircuitClosed('anthropic')).toBe(false);

    resetCircuit('anthropic');
    expect(isCircuitClosed('anthropic')).toBe(true);

    const health = getProviderHealth();
    expect(health.anthropic.state).toBe('CLOSED');
    expect(health.anthropic.failureCount).toBe(0);
  });
});

// ============================================================================
// getProviderHealth shape
// ============================================================================
describe('getProviderHealth', () => {
  it('returns all 4 providers', () => {
    const health = getProviderHealth();
    expect(Object.keys(health)).toEqual(
      expect.arrayContaining(['anthropic', 'openai', 'google', 'deepseek'])
    );
  });

  it('each entry has expected shape', () => {
    const health = getProviderHealth();
    for (const entry of Object.values(health)) {
      expect(entry).toHaveProperty('state');
      expect(entry).toHaveProperty('failureCount');
      expect(entry).toHaveProperty('lastFailureAgo');
      expect(entry).toHaveProperty('lastSuccessAgo');
      expect(['CLOSED', 'OPEN', 'HALF_OPEN']).toContain(entry.state);
    }
  });

  it('tracks lastFailureAgo after a failure', () => {
    recordFailure('anthropic');
    const health = getProviderHealth();
    // lastFailureAgo should be a small string like "0s" or "1s"
    expect(health.anthropic.lastFailureAgo).not.toBeNull();
  });

  it('tracks lastSuccessAgo after a success', () => {
    recordSuccess('openai');
    const health = getProviderHealth();
    expect(health.openai.lastSuccessAgo).not.toBeNull();
  });
});

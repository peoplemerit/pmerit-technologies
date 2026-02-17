/**
 * Circuit Breaker for AI Provider Health — Phase 1.4
 *
 * Tracks per-provider failure rates and short-circuits requests to unhealthy
 * providers. Uses a simple in-memory state machine (CLOSED → OPEN → HALF_OPEN).
 *
 * State Machine:
 *   CLOSED   — Normal operation. Requests flow through. Track failures.
 *   OPEN     — Provider is unhealthy. All requests short-circuited.
 *              After cooldown, transitions to HALF_OPEN.
 *   HALF_OPEN — One probe request allowed through. If it succeeds → CLOSED.
 *              If it fails → OPEN (reset cooldown).
 *
 * IMPORTANT: This is Worker-level in-memory state. It resets on cold starts
 * (which is acceptable for Workers — cold starts are ~5ms and rare under load).
 * For multi-isolate consistency, providers that fail will be re-discovered quickly
 * because the failure threshold is low (3 failures).
 */

import type { Provider } from '../types';

// =============================================================================
// Types
// =============================================================================

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerEntry {
  state: CircuitState;
  failureCount: number;
  lastFailureTime: number;  // epoch ms
  lastSuccessTime: number;  // epoch ms
  consecutiveSuccesses: number;
}

interface CircuitBreakerConfig {
  /** Number of consecutive failures to trip the circuit (default: 3) */
  failureThreshold: number;
  /** Cooldown before allowing a probe request in ms (default: 30000 = 30s) */
  cooldownMs: number;
  /** Number of consecutive successes in HALF_OPEN to close circuit (default: 1) */
  successThreshold: number;
}

// =============================================================================
// Configuration
// =============================================================================

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 3,
  cooldownMs: 30_000,  // 30 seconds before probing
  successThreshold: 1,  // 1 success in half-open closes the circuit
};

// =============================================================================
// In-Memory State (per-isolate, resets on cold start)
// =============================================================================

const circuitState = new Map<Provider, CircuitBreakerEntry>();

function getOrCreate(provider: Provider): CircuitBreakerEntry {
  let entry = circuitState.get(provider);
  if (!entry) {
    entry = {
      state: 'CLOSED',
      failureCount: 0,
      lastFailureTime: 0,
      lastSuccessTime: 0,
      consecutiveSuccesses: 0,
    };
    circuitState.set(provider, entry);
  }
  return entry;
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Check if a provider is available (circuit not OPEN).
 *
 * Returns true if requests should be sent to this provider.
 * Returns false if the circuit is OPEN and cooldown hasn't elapsed.
 *
 * If the circuit is OPEN but cooldown has elapsed, transitions to HALF_OPEN
 * and returns true (allowing one probe request).
 */
export function isCircuitClosed(
  provider: Provider,
  config: CircuitBreakerConfig = DEFAULT_CONFIG
): boolean {
  const entry = getOrCreate(provider);

  switch (entry.state) {
    case 'CLOSED':
      return true;

    case 'HALF_OPEN':
      // Allow the probe request through
      return true;

    case 'OPEN': {
      const elapsed = Date.now() - entry.lastFailureTime;
      if (elapsed >= config.cooldownMs) {
        // Cooldown elapsed — transition to HALF_OPEN, allow one probe
        entry.state = 'HALF_OPEN';
        entry.consecutiveSuccesses = 0;
        console.log(`[CIRCUIT] ${provider}: OPEN → HALF_OPEN (cooldown elapsed, allowing probe)`);
        return true;
      }
      // Still in cooldown
      return false;
    }
  }
}

/**
 * Record a successful request to a provider.
 *
 * In HALF_OPEN: increments success count, closes circuit if threshold met.
 * In CLOSED: resets failure count.
 */
export function recordSuccess(
  provider: Provider,
  config: CircuitBreakerConfig = DEFAULT_CONFIG
): void {
  const entry = getOrCreate(provider);
  entry.lastSuccessTime = Date.now();

  switch (entry.state) {
    case 'HALF_OPEN':
      entry.consecutiveSuccesses++;
      if (entry.consecutiveSuccesses >= config.successThreshold) {
        entry.state = 'CLOSED';
        entry.failureCount = 0;
        entry.consecutiveSuccesses = 0;
        console.log(`[CIRCUIT] ${provider}: HALF_OPEN → CLOSED (probe succeeded)`);
      }
      break;

    case 'CLOSED':
      // Reset failure count on success
      entry.failureCount = 0;
      entry.consecutiveSuccesses++;
      break;

    case 'OPEN':
      // Shouldn't happen (requests are blocked), but handle gracefully
      break;
  }
}

/**
 * Record a failed request to a provider.
 *
 * In CLOSED: increments failure count, trips circuit if threshold met.
 * In HALF_OPEN: immediately trips back to OPEN.
 */
export function recordFailure(
  provider: Provider,
  config: CircuitBreakerConfig = DEFAULT_CONFIG
): void {
  const entry = getOrCreate(provider);
  entry.lastFailureTime = Date.now();
  entry.consecutiveSuccesses = 0;

  switch (entry.state) {
    case 'CLOSED':
      entry.failureCount++;
      if (entry.failureCount >= config.failureThreshold) {
        entry.state = 'OPEN';
        console.log(`[CIRCUIT] ${provider}: CLOSED → OPEN (${entry.failureCount} consecutive failures)`);
      }
      break;

    case 'HALF_OPEN':
      // Probe failed — back to OPEN
      entry.state = 'OPEN';
      console.log(`[CIRCUIT] ${provider}: HALF_OPEN → OPEN (probe failed)`);
      break;

    case 'OPEN':
      // Already open — update timestamp to extend cooldown
      break;
  }
}

/**
 * Get health status for all providers (for /health endpoint).
 */
export function getProviderHealth(): Record<Provider, {
  state: CircuitState;
  failureCount: number;
  lastFailureAgo: number | null;
  lastSuccessAgo: number | null;
}> {
  const now = Date.now();
  const providers: Provider[] = ['anthropic', 'openai', 'google', 'deepseek'];
  const result: Record<string, {
    state: CircuitState;
    failureCount: number;
    lastFailureAgo: number | null;
    lastSuccessAgo: number | null;
  }> = {};

  for (const p of providers) {
    const entry = getOrCreate(p);
    result[p] = {
      state: entry.state,
      failureCount: entry.failureCount,
      lastFailureAgo: entry.lastFailureTime ? now - entry.lastFailureTime : null,
      lastSuccessAgo: entry.lastSuccessTime ? now - entry.lastSuccessTime : null,
    };
  }

  return result as Record<Provider, typeof result[string]>;
}

/**
 * Reset circuit breaker for a specific provider (for testing / manual recovery).
 */
export function resetCircuit(provider: Provider): void {
  circuitState.delete(provider);
  console.log(`[CIRCUIT] ${provider}: Reset to CLOSED`);
}

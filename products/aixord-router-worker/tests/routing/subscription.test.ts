/**
 * Subscription Validation Tests
 *
 * Tests the subscription validation and usage tracking logic:
 * - Tier validation (TRIAL, BYOK_STANDARD, MANUSCRIPT_BYOK, PLATFORM_STANDARD, PLATFORM_PRO, ENTERPRISE)
 * - BYOK vs PLATFORM key_mode enforcement
 * - Active subscription lookup from database
 * - Tier mismatch detection
 * - Usage limit checking per tier
 * - Unlimited tier handling (ENTERPRISE with -1 maxRequests)
 * - Usage increment (create and update paths)
 * - getUsage retrieval
 *
 * Covers: validateSubscription, incrementUsage, getUsage
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { type MockQueryResult } from '../helpers';
import { createMockDB } from '../helpers';
import type { RouterRequest, Subscription, SubscriptionTier, KeyMode } from '../../src/types';

// ---------------------------------------------------------------------------
// Mock the logger to silence output during tests
// ---------------------------------------------------------------------------
vi.mock('../../src/utils/logger', () => ({
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import {
  validateSubscription,
  incrementUsage,
  getUsage,
} from '../../src/routing/subscription';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TEST_USER_ID = 'user_sub_test_001';
const TEST_PROJECT_ID = 'proj_sub_test_001';
const TEST_SESSION_ID = 'sess_sub_test_001';
const TEST_REQUEST_ID = 'req_sub_test_001';

/**
 * Build a minimal RouterRequest with the given subscription and trace.
 * Only the fields accessed by validateSubscription / incrementUsage are required.
 */
function makeRouterRequest(
  tier: SubscriptionTier,
  keyMode: KeyMode,
  userId: string = TEST_USER_ID
): RouterRequest {
  return {
    product: 'AIXORD_COPILOT',
    intent: 'CHAT',
    mode: 'BALANCED',
    subscription: { tier, key_mode: keyMode },
    capsule: {
      objective: 'test',
      phase: 'B',
      constraints: [],
      decisions: [],
      open_questions: [],
    },
    delta: { user_input: 'test' },
    budget: {},
    policy_flags: {},
    trace: {
      project_id: TEST_PROJECT_ID,
      session_id: TEST_SESSION_ID,
      request_id: TEST_REQUEST_ID,
      user_id: userId,
    },
  };
}

function makeDB(queries: MockQueryResult[] = []) {
  return createMockDB(queries);
}

// ---------------------------------------------------------------------------
// Test Suite
// ---------------------------------------------------------------------------

describe('subscription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================================================
  // 1. BYOK key_mode enforcement
  // ==========================================================================
  describe('BYOK key_mode enforcement', () => {
    it('throws BYOK_REQUIRED when BYOK_STANDARD tier has PLATFORM key_mode', async () => {
      const db = makeDB();
      const request = makeRouterRequest('BYOK_STANDARD', 'PLATFORM');

      await expect(
        validateSubscription(request, db as unknown as D1Database)
      ).rejects.toMatchObject({
        code: 'BYOK_REQUIRED',
        statusCode: 403,
      });
    });

    it('throws BYOK_REQUIRED when MANUSCRIPT_BYOK tier has PLATFORM key_mode', async () => {
      const db = makeDB();
      const request = makeRouterRequest('MANUSCRIPT_BYOK', 'PLATFORM');

      await expect(
        validateSubscription(request, db as unknown as D1Database)
      ).rejects.toMatchObject({
        code: 'BYOK_REQUIRED',
        statusCode: 403,
      });
    });

    it('includes tier name in BYOK_REQUIRED error message', async () => {
      const db = makeDB();
      const request = makeRouterRequest('BYOK_STANDARD', 'PLATFORM');

      await expect(
        validateSubscription(request, db as unknown as D1Database)
      ).rejects.toThrow(/BYOK_STANDARD/);
    });

    it('does NOT throw BYOK_REQUIRED for BYOK_STANDARD with BYOK key_mode', async () => {
      const db = makeDB([
        {
          pattern: 'subscriptions',
          result: { tier: 'BYOK_STANDARD', status: 'active', user_id: TEST_USER_ID },
        },
        {
          pattern: 'usage',
          result: null, // No usage record yet
        },
      ]);
      const request = makeRouterRequest('BYOK_STANDARD', 'BYOK');

      // Should not throw — passes BYOK check
      await expect(
        validateSubscription(request, db as unknown as D1Database)
      ).resolves.toBeUndefined();
    });

    it('does NOT throw BYOK_REQUIRED for MANUSCRIPT_BYOK with BYOK key_mode', async () => {
      const db = makeDB([
        {
          pattern: 'subscriptions',
          result: { tier: 'MANUSCRIPT_BYOK', status: 'active', user_id: TEST_USER_ID },
        },
        {
          pattern: 'usage',
          result: null,
        },
      ]);
      const request = makeRouterRequest('MANUSCRIPT_BYOK', 'BYOK');

      await expect(
        validateSubscription(request, db as unknown as D1Database)
      ).resolves.toBeUndefined();
    });
  });

  // ==========================================================================
  // 2. TRIAL tier — dual-mode (no BYOK enforcement, no subscription lookup)
  // ==========================================================================
  describe('TRIAL tier handling', () => {
    it('allows TRIAL tier with PLATFORM key_mode', async () => {
      const db = makeDB([
        {
          pattern: 'usage',
          result: null, // No usage record
        },
      ]);
      const request = makeRouterRequest('TRIAL', 'PLATFORM');

      await expect(
        validateSubscription(request, db as unknown as D1Database)
      ).resolves.toBeUndefined();
    });

    it('allows TRIAL tier with BYOK key_mode (dual-mode)', async () => {
      const db = makeDB([
        {
          pattern: 'usage',
          result: null,
        },
      ]);
      const request = makeRouterRequest('TRIAL', 'BYOK');

      await expect(
        validateSubscription(request, db as unknown as D1Database)
      ).resolves.toBeUndefined();
    });

    it('does NOT query the subscriptions table for TRIAL tier', async () => {
      const db = makeDB([
        {
          pattern: 'usage',
          result: null,
        },
      ]);
      const request = makeRouterRequest('TRIAL', 'PLATFORM');

      await validateSubscription(request, db as unknown as D1Database);

      // Verify no subscriptions query was made
      const subscriptionQueries = db._executions.filter(
        (e) => e.sql.includes('subscriptions')
      );
      expect(subscriptionQueries).toHaveLength(0);
    });

    it('still checks usage limits for TRIAL tier', async () => {
      const db = makeDB([
        {
          pattern: 'usage',
          result: { requests_used: 50 }, // At the 50-request TRIAL limit
        },
      ]);
      const request = makeRouterRequest('TRIAL', 'PLATFORM');

      await expect(
        validateSubscription(request, db as unknown as D1Database)
      ).rejects.toMatchObject({
        code: 'LIMIT_EXCEEDED',
        statusCode: 429,
      });
    });

    it('passes TRIAL tier when usage is below limit', async () => {
      const db = makeDB([
        {
          pattern: 'usage',
          result: { requests_used: 49 }, // One below the 50 TRIAL limit
        },
      ]);
      const request = makeRouterRequest('TRIAL', 'PLATFORM');

      await expect(
        validateSubscription(request, db as unknown as D1Database)
      ).resolves.toBeUndefined();
    });
  });

  // ==========================================================================
  // 3. Active subscription lookup (non-TRIAL tiers)
  // ==========================================================================
  describe('active subscription lookup', () => {
    it('throws NO_ACTIVE_SUBSCRIPTION when no subscription row exists', async () => {
      const db = makeDB([
        {
          pattern: 'subscriptions',
          result: null, // No active subscription found
        },
      ]);
      const request = makeRouterRequest('PLATFORM_STANDARD', 'PLATFORM');

      await expect(
        validateSubscription(request, db as unknown as D1Database)
      ).rejects.toMatchObject({
        code: 'NO_ACTIVE_SUBSCRIPTION',
        statusCode: 403,
      });
    });

    it('NO_ACTIVE_SUBSCRIPTION error includes guidance message', async () => {
      const db = makeDB([
        { pattern: 'subscriptions', result: null },
      ]);
      const request = makeRouterRequest('PLATFORM_PRO', 'PLATFORM');

      await expect(
        validateSubscription(request, db as unknown as D1Database)
      ).rejects.toThrow(/subscribe|TRIAL/i);
    });

    it('passes the correct user_id to the subscriptions query', async () => {
      const customUserId = 'user_custom_123';
      const db = makeDB([
        {
          pattern: 'subscriptions',
          result: { tier: 'PLATFORM_STANDARD', status: 'active', user_id: customUserId },
        },
        {
          pattern: 'usage',
          result: null,
        },
      ]);
      const request = makeRouterRequest('PLATFORM_STANDARD', 'PLATFORM', customUserId);

      await validateSubscription(request, db as unknown as D1Database);

      // Find the subscriptions query and check its params
      const subQuery = db._executions.find((e) => e.sql.includes('subscriptions'));
      expect(subQuery).toBeDefined();
      expect(subQuery!.params).toEqual([customUserId]);
    });

    it('passes when active subscription exists with matching tier', async () => {
      const db = makeDB([
        {
          pattern: 'subscriptions',
          result: { tier: 'PLATFORM_STANDARD', status: 'active', user_id: TEST_USER_ID },
        },
        {
          pattern: 'usage',
          result: null,
        },
      ]);
      const request = makeRouterRequest('PLATFORM_STANDARD', 'PLATFORM');

      await expect(
        validateSubscription(request, db as unknown as D1Database)
      ).resolves.toBeUndefined();
    });
  });

  // ==========================================================================
  // 4. Tier mismatch detection
  // ==========================================================================
  describe('tier mismatch', () => {
    it('throws TIER_MISMATCH when DB tier differs from requested tier', async () => {
      const db = makeDB([
        {
          pattern: 'subscriptions',
          result: { tier: 'PLATFORM_STANDARD', status: 'active', user_id: TEST_USER_ID },
        },
      ]);
      // Request says PLATFORM_PRO but DB says PLATFORM_STANDARD
      const request = makeRouterRequest('PLATFORM_PRO', 'PLATFORM');

      await expect(
        validateSubscription(request, db as unknown as D1Database)
      ).rejects.toMatchObject({
        code: 'TIER_MISMATCH',
        statusCode: 403,
      });
    });

    it('TIER_MISMATCH error includes both tier names', async () => {
      const db = makeDB([
        {
          pattern: 'subscriptions',
          result: { tier: 'BYOK_STANDARD', status: 'active', user_id: TEST_USER_ID },
        },
      ]);
      const request = makeRouterRequest('ENTERPRISE', 'PLATFORM');

      try {
        await validateSubscription(request, db as unknown as D1Database);
        expect.unreachable('Should have thrown');
      } catch (err: any) {
        expect(err.code).toBe('TIER_MISMATCH');
        expect(err.message).toContain('BYOK_STANDARD');
        expect(err.message).toContain('ENTERPRISE');
      }
    });

    it('does NOT throw TIER_MISMATCH when tiers match', async () => {
      const db = makeDB([
        {
          pattern: 'subscriptions',
          result: { tier: 'PLATFORM_PRO', status: 'active', user_id: TEST_USER_ID },
        },
        {
          pattern: 'usage',
          result: null,
        },
      ]);
      const request = makeRouterRequest('PLATFORM_PRO', 'PLATFORM');

      await expect(
        validateSubscription(request, db as unknown as D1Database)
      ).resolves.toBeUndefined();
    });
  });

  // ==========================================================================
  // 5. Usage limit checking per tier
  // ==========================================================================
  describe('usage limit checking', () => {
    it('throws LIMIT_EXCEEDED when TRIAL usage hits 50', async () => {
      const db = makeDB([
        {
          pattern: 'usage',
          result: { requests_used: 50 },
        },
      ]);
      const request = makeRouterRequest('TRIAL', 'PLATFORM');

      await expect(
        validateSubscription(request, db as unknown as D1Database)
      ).rejects.toMatchObject({
        code: 'LIMIT_EXCEEDED',
        statusCode: 429,
      });
    });

    it('throws LIMIT_EXCEEDED when MANUSCRIPT_BYOK usage hits 500', async () => {
      const db = makeDB([
        {
          pattern: 'subscriptions',
          result: { tier: 'MANUSCRIPT_BYOK', status: 'active', user_id: TEST_USER_ID },
        },
        {
          pattern: 'usage',
          result: { requests_used: 500 },
        },
      ]);
      const request = makeRouterRequest('MANUSCRIPT_BYOK', 'BYOK');

      await expect(
        validateSubscription(request, db as unknown as D1Database)
      ).rejects.toMatchObject({
        code: 'LIMIT_EXCEEDED',
        statusCode: 429,
      });
    });

    it('throws LIMIT_EXCEEDED when BYOK_STANDARD usage hits 1000', async () => {
      const db = makeDB([
        {
          pattern: 'subscriptions',
          result: { tier: 'BYOK_STANDARD', status: 'active', user_id: TEST_USER_ID },
        },
        {
          pattern: 'usage',
          result: { requests_used: 1000 },
        },
      ]);
      const request = makeRouterRequest('BYOK_STANDARD', 'BYOK');

      await expect(
        validateSubscription(request, db as unknown as D1Database)
      ).rejects.toMatchObject({
        code: 'LIMIT_EXCEEDED',
        statusCode: 429,
      });
    });

    it('throws LIMIT_EXCEEDED when PLATFORM_STANDARD usage hits 500', async () => {
      const db = makeDB([
        {
          pattern: 'subscriptions',
          result: { tier: 'PLATFORM_STANDARD', status: 'active', user_id: TEST_USER_ID },
        },
        {
          pattern: 'usage',
          result: { requests_used: 500 },
        },
      ]);
      const request = makeRouterRequest('PLATFORM_STANDARD', 'PLATFORM');

      await expect(
        validateSubscription(request, db as unknown as D1Database)
      ).rejects.toMatchObject({
        code: 'LIMIT_EXCEEDED',
        statusCode: 429,
      });
    });

    it('throws LIMIT_EXCEEDED when PLATFORM_PRO usage hits 2000', async () => {
      const db = makeDB([
        {
          pattern: 'subscriptions',
          result: { tier: 'PLATFORM_PRO', status: 'active', user_id: TEST_USER_ID },
        },
        {
          pattern: 'usage',
          result: { requests_used: 2000 },
        },
      ]);
      const request = makeRouterRequest('PLATFORM_PRO', 'PLATFORM');

      await expect(
        validateSubscription(request, db as unknown as D1Database)
      ).rejects.toMatchObject({
        code: 'LIMIT_EXCEEDED',
        statusCode: 429,
      });
    });

    it('LIMIT_EXCEEDED error includes the limit number in message', async () => {
      const db = makeDB([
        {
          pattern: 'usage',
          result: { requests_used: 50 },
        },
      ]);
      const request = makeRouterRequest('TRIAL', 'PLATFORM');

      await expect(
        validateSubscription(request, db as unknown as D1Database)
      ).rejects.toThrow(/50/);
    });

    it('passes when usage is exactly one below the limit', async () => {
      const db = makeDB([
        {
          pattern: 'subscriptions',
          result: { tier: 'PLATFORM_STANDARD', status: 'active', user_id: TEST_USER_ID },
        },
        {
          pattern: 'usage',
          result: { requests_used: 499 }, // One below 500 limit
        },
      ]);
      const request = makeRouterRequest('PLATFORM_STANDARD', 'PLATFORM');

      await expect(
        validateSubscription(request, db as unknown as D1Database)
      ).resolves.toBeUndefined();
    });

    it('passes when no usage record exists (first request)', async () => {
      const db = makeDB([
        {
          pattern: 'subscriptions',
          result: { tier: 'BYOK_STANDARD', status: 'active', user_id: TEST_USER_ID },
        },
        {
          pattern: 'usage',
          result: null, // No usage record yet
        },
      ]);
      const request = makeRouterRequest('BYOK_STANDARD', 'BYOK');

      await expect(
        validateSubscription(request, db as unknown as D1Database)
      ).resolves.toBeUndefined();
    });
  });

  // ==========================================================================
  // 6. ENTERPRISE tier — unlimited requests (maxRequests = -1)
  // ==========================================================================
  describe('ENTERPRISE unlimited requests', () => {
    it('never checks usage for ENTERPRISE tier (maxRequests = -1)', async () => {
      const db = makeDB([
        {
          pattern: 'subscriptions',
          result: { tier: 'ENTERPRISE', status: 'active', user_id: TEST_USER_ID },
        },
      ]);
      const request = makeRouterRequest('ENTERPRISE', 'PLATFORM');

      await validateSubscription(request, db as unknown as D1Database);

      // Verify no usage query was made
      const usageQueries = db._executions.filter((e) => e.sql.includes('usage'));
      expect(usageQueries).toHaveLength(0);
    });

    it('passes even with extremely high usage for ENTERPRISE', async () => {
      // ENTERPRISE should skip the usage check entirely (maxRequests = -1),
      // so even if a usage record exists with a huge number, it should pass.
      const db = makeDB([
        {
          pattern: 'subscriptions',
          result: { tier: 'ENTERPRISE', status: 'active', user_id: TEST_USER_ID },
        },
        // This usage record should never be queried for ENTERPRISE
        {
          pattern: 'usage',
          result: { requests_used: 999999 },
        },
      ]);
      const request = makeRouterRequest('ENTERPRISE', 'PLATFORM');

      await expect(
        validateSubscription(request, db as unknown as D1Database)
      ).resolves.toBeUndefined();
    });
  });

  // ==========================================================================
  // 7. Platform tier key_mode — no BYOK enforcement
  // ==========================================================================
  describe('platform tier key_mode acceptance', () => {
    it('accepts PLATFORM_STANDARD with PLATFORM key_mode', async () => {
      const db = makeDB([
        {
          pattern: 'subscriptions',
          result: { tier: 'PLATFORM_STANDARD', status: 'active', user_id: TEST_USER_ID },
        },
        { pattern: 'usage', result: null },
      ]);
      const request = makeRouterRequest('PLATFORM_STANDARD', 'PLATFORM');

      await expect(
        validateSubscription(request, db as unknown as D1Database)
      ).resolves.toBeUndefined();
    });

    it('accepts PLATFORM_PRO with PLATFORM key_mode', async () => {
      const db = makeDB([
        {
          pattern: 'subscriptions',
          result: { tier: 'PLATFORM_PRO', status: 'active', user_id: TEST_USER_ID },
        },
        { pattern: 'usage', result: null },
      ]);
      const request = makeRouterRequest('PLATFORM_PRO', 'PLATFORM');

      await expect(
        validateSubscription(request, db as unknown as D1Database)
      ).resolves.toBeUndefined();
    });

    it('accepts ENTERPRISE with PLATFORM key_mode', async () => {
      const db = makeDB([
        {
          pattern: 'subscriptions',
          result: { tier: 'ENTERPRISE', status: 'active', user_id: TEST_USER_ID },
        },
      ]);
      const request = makeRouterRequest('ENTERPRISE', 'PLATFORM');

      await expect(
        validateSubscription(request, db as unknown as D1Database)
      ).resolves.toBeUndefined();
    });
  });

  // ==========================================================================
  // 8. All six tiers — full validation pass (happy path)
  // ==========================================================================
  describe('full validation pass for all tiers', () => {
    const tierConfigs: Array<{
      tier: SubscriptionTier;
      keyMode: KeyMode;
      skipSubscriptionLookup: boolean;
    }> = [
      { tier: 'TRIAL', keyMode: 'PLATFORM', skipSubscriptionLookup: true },
      { tier: 'MANUSCRIPT_BYOK', keyMode: 'BYOK', skipSubscriptionLookup: false },
      { tier: 'BYOK_STANDARD', keyMode: 'BYOK', skipSubscriptionLookup: false },
      { tier: 'PLATFORM_STANDARD', keyMode: 'PLATFORM', skipSubscriptionLookup: false },
      { tier: 'PLATFORM_PRO', keyMode: 'PLATFORM', skipSubscriptionLookup: false },
      { tier: 'ENTERPRISE', keyMode: 'PLATFORM', skipSubscriptionLookup: false },
    ];

    for (const { tier, keyMode, skipSubscriptionLookup } of tierConfigs) {
      it(`validates ${tier} tier successfully`, async () => {
        const queries: MockQueryResult[] = [];

        if (!skipSubscriptionLookup) {
          queries.push({
            pattern: 'subscriptions',
            result: { tier, status: 'active', user_id: TEST_USER_ID },
          });
        }

        // ENTERPRISE has unlimited requests, so usage is not checked
        if (tier !== 'ENTERPRISE') {
          queries.push({
            pattern: 'usage',
            result: { requests_used: 0 },
          });
        }

        const db = makeDB(queries);
        const request = makeRouterRequest(tier, keyMode);

        await expect(
          validateSubscription(request, db as unknown as D1Database)
        ).resolves.toBeUndefined();
      });
    }
  });

  // ==========================================================================
  // 9. incrementUsage — update existing record
  // ==========================================================================
  describe('incrementUsage', () => {
    it('updates existing usage record when run() returns changes > 0', async () => {
      const db = makeDB([
        {
          pattern: 'UPDATE usage',
          runResult: { success: true, changes: 1 },
        },
      ]);
      const request = makeRouterRequest('PLATFORM_STANDARD', 'PLATFORM');

      await incrementUsage(request, 100, 200, 0.005, db as unknown as D1Database);

      // Should have exactly 1 execution (UPDATE only, no INSERT)
      expect(db._executions).toHaveLength(1);
      expect(db._executions[0].sql).toContain('UPDATE usage');
    });

    it('passes token counts and cost to the UPDATE query', async () => {
      const db = makeDB([
        {
          pattern: 'UPDATE usage',
          runResult: { success: true, changes: 1 },
        },
      ]);
      const request = makeRouterRequest('TRIAL', 'PLATFORM');

      await incrementUsage(request, 150, 300, 0.01, db as unknown as D1Database);

      const params = db._executions[0].params;
      // First three params are inputTokens, outputTokens, costUsd
      expect(params[0]).toBe(150);
      expect(params[1]).toBe(300);
      expect(params[2]).toBe(0.01);
      // Fourth param is user_id
      expect(params[3]).toBe(TEST_USER_ID);
    });

    it('creates new usage record when UPDATE returns 0 changes', async () => {
      const db = makeDB([
        {
          pattern: 'UPDATE usage',
          runResult: { success: true, changes: 0 }, // No existing row
        },
        {
          pattern: 'INSERT INTO usage',
          runResult: { success: true, changes: 1 },
        },
      ]);
      const request = makeRouterRequest('BYOK_STANDARD', 'BYOK');

      await incrementUsage(request, 50, 100, 0.002, db as unknown as D1Database);

      // Should have 2 executions: UPDATE (0 changes) then INSERT
      expect(db._executions).toHaveLength(2);
      expect(db._executions[0].sql).toContain('UPDATE usage');
      expect(db._executions[1].sql).toContain('INSERT INTO usage');
    });

    it('INSERT includes all required fields', async () => {
      const db = makeDB([
        {
          pattern: 'UPDATE usage',
          runResult: { success: true, changes: 0 },
        },
        {
          pattern: 'INSERT INTO usage',
          runResult: { success: true, changes: 1 },
        },
      ]);
      const request = makeRouterRequest('MANUSCRIPT_BYOK', 'BYOK');

      await incrementUsage(request, 75, 150, 0.003, db as unknown as D1Database);

      const insertExec = db._executions[1];
      expect(insertExec.sql).toContain('INSERT INTO usage');
      // Params: id, user_id, period_start, period_end, inputTokens, outputTokens, costUsd
      expect(insertExec.params).toHaveLength(7);
      // params[1] should be user_id
      expect(insertExec.params[1]).toBe(TEST_USER_ID);
      // params[4] = inputTokens, params[5] = outputTokens, params[6] = costUsd
      expect(insertExec.params[4]).toBe(75);
      expect(insertExec.params[5]).toBe(150);
      expect(insertExec.params[6]).toBe(0.003);
    });
  });

  // ==========================================================================
  // 10. getUsage — retrieval
  // ==========================================================================
  describe('getUsage', () => {
    it('returns usage data when a current period record exists', async () => {
      const db = makeDB([
        {
          pattern: 'usage',
          result: {
            requests_used: 42,
            tokens_input: 10000,
            tokens_output: 20000,
            cost_usd: 0.50,
          },
        },
      ]);

      const usage = await getUsage(TEST_USER_ID, db as unknown as D1Database);
      expect(usage).toEqual({
        requests_used: 42,
        tokens_input: 10000,
        tokens_output: 20000,
        cost_usd: 0.50,
      });
    });

    it('returns null when no usage record exists for the user', async () => {
      const db = makeDB([
        {
          pattern: 'usage',
          result: null,
        },
      ]);

      const usage = await getUsage(TEST_USER_ID, db as unknown as D1Database);
      expect(usage).toBeNull();
    });

    it('passes the correct userId to the query', async () => {
      const customUserId = 'user_usage_custom_999';
      const db = makeDB([
        {
          pattern: 'usage',
          result: null,
        },
      ]);

      await getUsage(customUserId, db as unknown as D1Database);

      expect(db._executions).toHaveLength(1);
      expect(db._executions[0].params).toEqual([customUserId]);
    });
  });

  // ==========================================================================
  // 11. Validation order — BYOK check before subscription lookup
  // ==========================================================================
  describe('validation order', () => {
    it('BYOK check fires before subscription lookup (no DB query on BYOK_REQUIRED)', async () => {
      const db = makeDB();
      const request = makeRouterRequest('BYOK_STANDARD', 'PLATFORM');

      try {
        await validateSubscription(request, db as unknown as D1Database);
        expect.unreachable('Should have thrown BYOK_REQUIRED');
      } catch (err: any) {
        expect(err.code).toBe('BYOK_REQUIRED');
      }

      // No database queries should have been made — BYOK check happens first
      expect(db._executions).toHaveLength(0);
    });
  });

  // ==========================================================================
  // 12. Usage limit boundary conditions
  // ==========================================================================
  describe('usage limit boundary conditions', () => {
    it('passes at usage = 0 for TRIAL (limit 50)', async () => {
      const db = makeDB([
        { pattern: 'usage', result: { requests_used: 0 } },
      ]);
      const request = makeRouterRequest('TRIAL', 'PLATFORM');

      await expect(
        validateSubscription(request, db as unknown as D1Database)
      ).resolves.toBeUndefined();
    });

    it('passes at usage = 49 for TRIAL (limit 50)', async () => {
      const db = makeDB([
        { pattern: 'usage', result: { requests_used: 49 } },
      ]);
      const request = makeRouterRequest('TRIAL', 'PLATFORM');

      await expect(
        validateSubscription(request, db as unknown as D1Database)
      ).resolves.toBeUndefined();
    });

    it('rejects at usage = 50 for TRIAL (limit 50)', async () => {
      const db = makeDB([
        { pattern: 'usage', result: { requests_used: 50 } },
      ]);
      const request = makeRouterRequest('TRIAL', 'PLATFORM');

      await expect(
        validateSubscription(request, db as unknown as D1Database)
      ).rejects.toMatchObject({
        code: 'LIMIT_EXCEEDED',
      });
    });

    it('rejects at usage = 51 for TRIAL (above limit)', async () => {
      const db = makeDB([
        { pattern: 'usage', result: { requests_used: 51 } },
      ]);
      const request = makeRouterRequest('TRIAL', 'PLATFORM');

      await expect(
        validateSubscription(request, db as unknown as D1Database)
      ).rejects.toMatchObject({
        code: 'LIMIT_EXCEEDED',
      });
    });

    it('passes at usage = 999 for BYOK_STANDARD (limit 1000)', async () => {
      const db = makeDB([
        {
          pattern: 'subscriptions',
          result: { tier: 'BYOK_STANDARD', status: 'active', user_id: TEST_USER_ID },
        },
        { pattern: 'usage', result: { requests_used: 999 } },
      ]);
      const request = makeRouterRequest('BYOK_STANDARD', 'BYOK');

      await expect(
        validateSubscription(request, db as unknown as D1Database)
      ).resolves.toBeUndefined();
    });

    it('rejects at usage = 1000 for BYOK_STANDARD (limit 1000)', async () => {
      const db = makeDB([
        {
          pattern: 'subscriptions',
          result: { tier: 'BYOK_STANDARD', status: 'active', user_id: TEST_USER_ID },
        },
        { pattern: 'usage', result: { requests_used: 1000 } },
      ]);
      const request = makeRouterRequest('BYOK_STANDARD', 'BYOK');

      await expect(
        validateSubscription(request, db as unknown as D1Database)
      ).rejects.toMatchObject({
        code: 'LIMIT_EXCEEDED',
      });
    });
  });

  // ==========================================================================
  // 13. Error type verification — RouterError structure
  // ==========================================================================
  describe('error structure', () => {
    it('BYOK_REQUIRED is a RouterError with correct properties', async () => {
      const db = makeDB();
      const request = makeRouterRequest('MANUSCRIPT_BYOK', 'PLATFORM');

      try {
        await validateSubscription(request, db as unknown as D1Database);
        expect.unreachable('Should have thrown');
      } catch (err: any) {
        expect(err.name).toBe('RouterError');
        expect(err.code).toBe('BYOK_REQUIRED');
        expect(err.statusCode).toBe(403);
        expect(err.message).toBeDefined();
      }
    });

    it('NO_ACTIVE_SUBSCRIPTION is a RouterError with correct properties', async () => {
      const db = makeDB([
        { pattern: 'subscriptions', result: null },
      ]);
      const request = makeRouterRequest('PLATFORM_STANDARD', 'PLATFORM');

      try {
        await validateSubscription(request, db as unknown as D1Database);
        expect.unreachable('Should have thrown');
      } catch (err: any) {
        expect(err.name).toBe('RouterError');
        expect(err.code).toBe('NO_ACTIVE_SUBSCRIPTION');
        expect(err.statusCode).toBe(403);
      }
    });

    it('TIER_MISMATCH is a RouterError with correct properties', async () => {
      const db = makeDB([
        {
          pattern: 'subscriptions',
          result: { tier: 'PLATFORM_STANDARD', status: 'active' },
        },
      ]);
      const request = makeRouterRequest('PLATFORM_PRO', 'PLATFORM');

      try {
        await validateSubscription(request, db as unknown as D1Database);
        expect.unreachable('Should have thrown');
      } catch (err: any) {
        expect(err.name).toBe('RouterError');
        expect(err.code).toBe('TIER_MISMATCH');
        expect(err.statusCode).toBe(403);
      }
    });

    it('LIMIT_EXCEEDED is a RouterError with 429 status', async () => {
      const db = makeDB([
        { pattern: 'usage', result: { requests_used: 50 } },
      ]);
      const request = makeRouterRequest('TRIAL', 'PLATFORM');

      try {
        await validateSubscription(request, db as unknown as D1Database);
        expect.unreachable('Should have thrown');
      } catch (err: any) {
        expect(err.name).toBe('RouterError');
        expect(err.code).toBe('LIMIT_EXCEEDED');
        expect(err.statusCode).toBe(429);
      }
    });
  });
});

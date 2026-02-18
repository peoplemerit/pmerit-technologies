/**
 * Key Resolver Tests
 *
 * Tests the API key resolution logic for the hybrid BYOK/Platform model:
 * - BYOK tiers: User provides keys stored encrypted in D1
 * - Platform tiers: PMERIT provides keys from environment secrets
 *
 * Covers: resolveApiKey, isProviderAvailable, invalidateKeyCache,
 * AES decryption, caching, error handling, and cache eviction.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { type MockQueryResult } from '../helpers';
import { createMockDB } from '../helpers';
import type { Env, Subscription, Provider } from '../../src/types';

// ---------------------------------------------------------------------------
// Mock the crypto module so we control decryption behaviour
// ---------------------------------------------------------------------------
vi.mock('../../src/utils/crypto', () => ({
  decryptAESGCM: vi.fn(),
}));

// Mock the logger to silence output during tests
vi.mock('../../src/utils/logger', () => ({
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { decryptAESGCM } from '../../src/utils/crypto';
import {
  resolveApiKey,
  isProviderAvailable,
  invalidateKeyCache,
} from '../../src/routing/key-resolver';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TEST_USER_ID = 'user_test_00001111';
const ENCRYPTION_KEY = 'test-encryption-key-32bytes!!!!';

function makeEnv(overrides: Partial<Env> = {}): Env {
  return {
    PLATFORM_ANTHROPIC_KEY: 'pk-ant-platform-key',
    PLATFORM_OPENAI_KEY: 'pk-oai-platform-key',
    PLATFORM_GOOGLE_KEY: 'pk-ggl-platform-key',
    PLATFORM_DEEPSEEK_KEY: 'pk-ds-platform-key',
    API_KEY_ENCRYPTION_KEY: ENCRYPTION_KEY,
    DB: createMockDB() as unknown as D1Database,
    IMAGES: {} as R2Bucket,
    ENVIRONMENT: 'test',
    ...overrides,
  } as unknown as Env;
}

function byokSubscription(tier: 'MANUSCRIPT_BYOK' | 'BYOK_STANDARD' = 'BYOK_STANDARD'): Subscription {
  return { tier, key_mode: 'BYOK' };
}

function platformSubscription(
  tier: 'TRIAL' | 'PLATFORM_STANDARD' | 'PLATFORM_PRO' | 'ENTERPRISE' = 'PLATFORM_STANDARD'
): Subscription {
  return { tier, key_mode: 'PLATFORM' };
}

function envWithDB(queries: MockQueryResult[], envOverrides: Partial<Env> = {}): Env {
  const db = createMockDB(queries);
  return makeEnv({ DB: db as unknown as D1Database, ...envOverrides });
}

// ---------------------------------------------------------------------------
// Test Suite
// ---------------------------------------------------------------------------

describe('key-resolver', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // By default the mock decrypts to a predictable value
    (decryptAESGCM as ReturnType<typeof vi.fn>).mockImplementation(
      async (ciphertext: string, _key: string) => `decrypted:${ciphertext}`
    );

    // Invalidate all cache entries for the test user between tests
    invalidateKeyCache(TEST_USER_ID);
  });

  afterEach(() => {
    // Clean up any lingering cache entries
    invalidateKeyCache(TEST_USER_ID);
  });

  // ==========================================================================
  // 1. BYOK key resolution — Anthropic
  // ==========================================================================
  describe('BYOK key resolution — Anthropic', () => {
    it('resolves a stored Anthropic BYOK key from the database', async () => {
      const env = envWithDB([
        {
          pattern: 'user_api_keys',
          result: { api_key: 'encrypted-ant-key', updated_at: '2026-01-15T00:00:00Z' },
        },
      ]);

      const key = await resolveApiKey(byokSubscription(), 'anthropic', env, TEST_USER_ID);
      expect(key).toBe('decrypted:encrypted-ant-key');
      expect(decryptAESGCM).toHaveBeenCalledWith('encrypted-ant-key', ENCRYPTION_KEY);
    });

    it('passes the correct userId and provider to the DB query', async () => {
      const db = createMockDB([
        {
          pattern: 'user_api_keys',
          result: { api_key: 'enc-key', updated_at: '2026-01-15T00:00:00Z' },
        },
      ]);
      const env = makeEnv({ DB: db as unknown as D1Database });

      await resolveApiKey(byokSubscription(), 'anthropic', env, TEST_USER_ID);

      // The mock DB records executions with params
      expect(db._executions.length).toBeGreaterThanOrEqual(1);
      const execution = db._executions[0];
      expect(execution.params).toEqual([TEST_USER_ID, 'anthropic']);
    });
  });

  // ==========================================================================
  // 2. BYOK key resolution — OpenAI
  // ==========================================================================
  describe('BYOK key resolution — OpenAI', () => {
    it('resolves a stored OpenAI BYOK key from the database', async () => {
      const env = envWithDB([
        {
          pattern: 'user_api_keys',
          result: { api_key: 'encrypted-oai-key', updated_at: '2026-02-01T00:00:00Z' },
        },
      ]);

      const key = await resolveApiKey(byokSubscription(), 'openai', env, TEST_USER_ID);
      expect(key).toBe('decrypted:encrypted-oai-key');
    });

    it('works with MANUSCRIPT_BYOK tier', async () => {
      const env = envWithDB([
        {
          pattern: 'user_api_keys',
          result: { api_key: 'enc-manuscript-key', updated_at: '2026-01-01T00:00:00Z' },
        },
      ]);

      const key = await resolveApiKey(byokSubscription('MANUSCRIPT_BYOK'), 'openai', env, TEST_USER_ID);
      expect(key).toBe('decrypted:enc-manuscript-key');
    });
  });

  // ==========================================================================
  // 3. Platform key fallback
  // ==========================================================================
  describe('Platform key resolution (fallback)', () => {
    it('returns platform Anthropic key for PLATFORM_STANDARD tier', async () => {
      const env = makeEnv();
      const key = await resolveApiKey(platformSubscription('PLATFORM_STANDARD'), 'anthropic', env, TEST_USER_ID);
      expect(key).toBe('pk-ant-platform-key');
    });

    it('returns platform OpenAI key for TRIAL tier', async () => {
      const env = makeEnv();
      const key = await resolveApiKey(platformSubscription('TRIAL'), 'openai', env, TEST_USER_ID);
      expect(key).toBe('pk-oai-platform-key');
    });

    it('returns platform Google key for PLATFORM_PRO tier', async () => {
      const env = makeEnv();
      const key = await resolveApiKey(platformSubscription('PLATFORM_PRO'), 'google', env, TEST_USER_ID);
      expect(key).toBe('pk-ggl-platform-key');
    });

    it('returns platform Deepseek key for ENTERPRISE tier', async () => {
      const env = makeEnv();
      const key = await resolveApiKey(platformSubscription('ENTERPRISE'), 'deepseek', env, TEST_USER_ID);
      expect(key).toBe('pk-ds-platform-key');
    });

    it('throws PLATFORM_KEY_MISSING when platform key is not configured', async () => {
      const env = makeEnv({ PLATFORM_DEEPSEEK_KEY: undefined } as unknown as Partial<Env>);
      // Remove the deepseek key entirely
      delete (env as any).PLATFORM_DEEPSEEK_KEY;

      await expect(
        resolveApiKey(platformSubscription(), 'deepseek', env, TEST_USER_ID)
      ).rejects.toMatchObject({
        code: 'PLATFORM_KEY_MISSING',
        statusCode: 503,
      });
    });

    it('does not call the database for platform tiers', async () => {
      const db = createMockDB();
      const env = makeEnv({ DB: db as unknown as D1Database });

      await resolveApiKey(platformSubscription(), 'anthropic', env, TEST_USER_ID);
      expect(db._executions).toHaveLength(0);
    });
  });

  // ==========================================================================
  // 4. AES decryption of stored key
  // ==========================================================================
  describe('AES decryption', () => {
    it('decrypts the stored key using API_KEY_ENCRYPTION_KEY', async () => {
      const env = envWithDB([
        {
          pattern: 'user_api_keys',
          result: { api_key: 'aes-encrypted-blob', updated_at: '2026-01-15T00:00:00Z' },
        },
      ]);

      await resolveApiKey(byokSubscription(), 'anthropic', env, TEST_USER_ID);

      expect(decryptAESGCM).toHaveBeenCalledWith('aes-encrypted-blob', ENCRYPTION_KEY);
    });

    it('uses decrypted value as the returned key', async () => {
      (decryptAESGCM as ReturnType<typeof vi.fn>).mockResolvedValueOnce('sk-ant-real-api-key');

      const env = envWithDB([
        {
          pattern: 'user_api_keys',
          result: { api_key: 'aes-encrypted-blob', updated_at: '2026-01-15T00:00:00Z' },
        },
      ]);

      const key = await resolveApiKey(byokSubscription(), 'anthropic', env, TEST_USER_ID);
      expect(key).toBe('sk-ant-real-api-key');
    });
  });

  // ==========================================================================
  // 5. Error handling — decryption failure (fallback to raw key)
  // ==========================================================================
  describe('decryption failure fallback', () => {
    it('falls back to raw stored key when decryption throws', async () => {
      (decryptAESGCM as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Decryption failed — invalid ciphertext')
      );

      const env = envWithDB([
        {
          pattern: 'user_api_keys',
          result: { api_key: 'plaintext-legacy-key', updated_at: '2026-01-15T00:00:00Z' },
        },
      ]);

      const key = await resolveApiKey(byokSubscription(), 'anthropic', env, TEST_USER_ID);
      // Should fall back to the raw stored value
      expect(key).toBe('plaintext-legacy-key');
    });

    it('caches the fallback raw key after decryption failure', async () => {
      (decryptAESGCM as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Decryption failed')
      );

      const db = createMockDB([
        {
          pattern: 'user_api_keys',
          result: { api_key: 'plaintext-legacy-key', updated_at: '2026-01-15T00:00:00Z' },
        },
      ]);
      const env = makeEnv({ DB: db as unknown as D1Database });

      // First call — DB hit
      await resolveApiKey(byokSubscription(), 'anthropic', env, TEST_USER_ID);
      // Second call — should use cache, no additional DB query
      const key = await resolveApiKey(byokSubscription(), 'anthropic', env, TEST_USER_ID);

      expect(key).toBe('plaintext-legacy-key');
      // Only one DB execution (second call used cache)
      expect(db._executions).toHaveLength(1);
    });
  });

  // ==========================================================================
  // 6. Error handling — DB query failure
  // ==========================================================================
  describe('DB query failure', () => {
    it('throws BYOK_KEY_MISSING when no key is found in database', async () => {
      const env = envWithDB([
        {
          pattern: 'user_api_keys',
          result: null, // No row returned
        },
      ]);

      await expect(
        resolveApiKey(byokSubscription(), 'anthropic', env, TEST_USER_ID)
      ).rejects.toMatchObject({
        code: 'BYOK_KEY_MISSING',
        statusCode: 400,
      });
    });

    it('includes provider and action in BYOK_KEY_MISSING error details', async () => {
      const env = envWithDB([
        { pattern: 'user_api_keys', result: null },
      ]);

      try {
        await resolveApiKey(byokSubscription(), 'openai', env, TEST_USER_ID);
        expect.unreachable('Should have thrown');
      } catch (err: any) {
        expect(err.code).toBe('BYOK_KEY_MISSING');
        expect(err.details).toMatchObject({
          provider: 'openai',
          mode: 'BYOK',
          action: 'add_key',
          settings_url: '/settings?tab=api-keys',
        });
      }
    });

    it('includes provider name in error message', async () => {
      const env = envWithDB([
        { pattern: 'user_api_keys', result: null },
      ]);

      await expect(
        resolveApiKey(byokSubscription(), 'google', env, TEST_USER_ID)
      ).rejects.toThrow(/google/i);
    });
  });

  // ==========================================================================
  // 7. Missing encryption key handling
  // ==========================================================================
  describe('missing encryption key', () => {
    it('returns raw stored key when API_KEY_ENCRYPTION_KEY is undefined', async () => {
      const env = envWithDB(
        [
          {
            pattern: 'user_api_keys',
            result: { api_key: 'raw-plaintext-key', updated_at: '2026-01-15T00:00:00Z' },
          },
        ],
        { API_KEY_ENCRYPTION_KEY: undefined }
      );

      const key = await resolveApiKey(byokSubscription(), 'anthropic', env, TEST_USER_ID);
      expect(key).toBe('raw-plaintext-key');
      // decryptAESGCM should NOT be called when encryption key is missing
      expect(decryptAESGCM).not.toHaveBeenCalled();
    });

    it('returns raw stored key when API_KEY_ENCRYPTION_KEY is empty string', async () => {
      const env = envWithDB(
        [
          {
            pattern: 'user_api_keys',
            result: { api_key: 'raw-key-no-enc', updated_at: '2026-01-10T00:00:00Z' },
          },
        ],
        { API_KEY_ENCRYPTION_KEY: '' }
      );

      const key = await resolveApiKey(byokSubscription(), 'openai', env, TEST_USER_ID);
      expect(key).toBe('raw-key-no-enc');
      expect(decryptAESGCM).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // 8. Multiple provider key resolution
  // ==========================================================================
  describe('multiple provider resolution', () => {
    it('resolves different keys for different providers from the same user', async () => {
      const dbQueries: MockQueryResult[] = [
        {
          pattern: 'user_api_keys',
          result: { api_key: 'enc-anthropic-key', updated_at: '2026-01-15T00:00:00Z' },
        },
      ];

      // Since the mock DB pattern matches any SQL containing 'user_api_keys',
      // we need separate envs or verify via call order
      const env1 = envWithDB(dbQueries);
      const key1 = await resolveApiKey(byokSubscription(), 'anthropic', env1, TEST_USER_ID);

      // Invalidate cache for second provider test
      invalidateKeyCache(TEST_USER_ID, 'openai');

      const env2 = envWithDB([
        {
          pattern: 'user_api_keys',
          result: { api_key: 'enc-openai-key', updated_at: '2026-01-15T00:00:00Z' },
        },
      ]);
      const key2 = await resolveApiKey(byokSubscription(), 'openai', env2, TEST_USER_ID);

      expect(key1).toBe('decrypted:enc-anthropic-key');
      expect(key2).toBe('decrypted:enc-openai-key');
      expect(key1).not.toBe(key2);
    });

    it('resolves all four providers for platform tiers', async () => {
      const env = makeEnv();
      const providers: Provider[] = ['anthropic', 'openai', 'google', 'deepseek'];
      const expectedKeys = [
        'pk-ant-platform-key',
        'pk-oai-platform-key',
        'pk-ggl-platform-key',
        'pk-ds-platform-key',
      ];

      for (let i = 0; i < providers.length; i++) {
        const key = await resolveApiKey(platformSubscription(), providers[i], env, TEST_USER_ID);
        expect(key).toBe(expectedKeys[i]);
      }
    });
  });

  // ==========================================================================
  // 9. Unknown tier handling
  // ==========================================================================
  describe('unknown tier', () => {
    it('throws UNKNOWN_TIER for an unrecognized subscription tier', async () => {
      const env = makeEnv();
      const badSubscription = { tier: 'SUPER_MEGA_PLAN' as any, key_mode: 'BYOK' as any };

      await expect(
        resolveApiKey(badSubscription, 'anthropic', env, TEST_USER_ID)
      ).rejects.toMatchObject({
        code: 'UNKNOWN_TIER',
        statusCode: 500,
      });
    });
  });

  // ==========================================================================
  // 10. BYOK caching behaviour
  // ==========================================================================
  describe('BYOK key caching', () => {
    it('serves cached key on second call without hitting DB again', async () => {
      const db = createMockDB([
        {
          pattern: 'user_api_keys',
          result: { api_key: 'enc-cached-key', updated_at: '2026-01-15T00:00:00Z' },
        },
      ]);
      const env = makeEnv({ DB: db as unknown as D1Database });

      const key1 = await resolveApiKey(byokSubscription(), 'anthropic', env, TEST_USER_ID);
      const key2 = await resolveApiKey(byokSubscription(), 'anthropic', env, TEST_USER_ID);

      expect(key1).toBe(key2);
      // Only one DB query — second was served from cache
      expect(db._executions).toHaveLength(1);
    });

    it('re-fetches from DB after cache is invalidated', async () => {
      const db = createMockDB([
        {
          pattern: 'user_api_keys',
          result: { api_key: 'enc-key-v1', updated_at: '2026-01-15T00:00:00Z' },
        },
      ]);
      const env = makeEnv({ DB: db as unknown as D1Database });

      await resolveApiKey(byokSubscription(), 'anthropic', env, TEST_USER_ID);
      expect(db._executions).toHaveLength(1);

      // Invalidate the cache for this provider
      invalidateKeyCache(TEST_USER_ID, 'anthropic');

      await resolveApiKey(byokSubscription(), 'anthropic', env, TEST_USER_ID);
      // Should have made a second DB query
      expect(db._executions).toHaveLength(2);
    });

    it('invalidateKeyCache with no provider clears all keys for user', async () => {
      const db = createMockDB([
        {
          pattern: 'user_api_keys',
          result: { api_key: 'enc-key', updated_at: '2026-01-15T00:00:00Z' },
        },
      ]);
      const env = makeEnv({ DB: db as unknown as D1Database });

      // Populate cache for two providers
      await resolveApiKey(byokSubscription(), 'anthropic', env, TEST_USER_ID);
      // Invalidate cache to force second provider fetch
      invalidateKeyCache(TEST_USER_ID, 'openai');
      await resolveApiKey(byokSubscription(), 'openai', env, TEST_USER_ID);
      expect(db._executions).toHaveLength(2);

      // Clear ALL cached keys for user
      invalidateKeyCache(TEST_USER_ID);

      // Both should re-fetch
      await resolveApiKey(byokSubscription(), 'anthropic', env, TEST_USER_ID);
      await resolveApiKey(byokSubscription(), 'openai', env, TEST_USER_ID);
      expect(db._executions).toHaveLength(4);
    });
  });

  // ==========================================================================
  // 11. isProviderAvailable
  // ==========================================================================
  describe('isProviderAvailable', () => {
    it('returns true when BYOK key exists in database', async () => {
      const env = envWithDB([
        {
          pattern: 'user_api_keys',
          result: { api_key: 'enc-key', updated_at: '2026-01-15T00:00:00Z' },
        },
      ]);

      const available = await isProviderAvailable(byokSubscription(), 'anthropic', env, TEST_USER_ID);
      expect(available).toBe(true);
    });

    it('returns false when BYOK key is missing', async () => {
      const env = envWithDB([
        { pattern: 'user_api_keys', result: null },
      ]);

      const available = await isProviderAvailable(byokSubscription(), 'openai', env, TEST_USER_ID);
      expect(available).toBe(false);
    });

    it('returns true when platform key is configured', async () => {
      const env = makeEnv();
      const available = await isProviderAvailable(platformSubscription(), 'anthropic', env, TEST_USER_ID);
      expect(available).toBe(true);
    });

    it('returns false when platform key is missing', async () => {
      const env = makeEnv({ PLATFORM_DEEPSEEK_KEY: undefined } as unknown as Partial<Env>);
      delete (env as any).PLATFORM_DEEPSEEK_KEY;

      const available = await isProviderAvailable(platformSubscription(), 'deepseek', env, TEST_USER_ID);
      expect(available).toBe(false);
    });
  });

  // ==========================================================================
  // 12. Cache invalidation specificity
  // ==========================================================================
  describe('invalidateKeyCache specificity', () => {
    it('invalidating one provider does not affect another provider cache', async () => {
      const db = createMockDB([
        {
          pattern: 'user_api_keys',
          result: { api_key: 'enc-key', updated_at: '2026-01-15T00:00:00Z' },
        },
      ]);
      const env = makeEnv({ DB: db as unknown as D1Database });

      // Populate cache for anthropic
      await resolveApiKey(byokSubscription(), 'anthropic', env, TEST_USER_ID);
      expect(db._executions).toHaveLength(1);

      // Invalidate only openai
      invalidateKeyCache(TEST_USER_ID, 'openai');

      // Anthropic should still be cached
      await resolveApiKey(byokSubscription(), 'anthropic', env, TEST_USER_ID);
      expect(db._executions).toHaveLength(1); // No new DB query
    });
  });

  // ==========================================================================
  // 13. Error details structure
  // ==========================================================================
  describe('error details structure', () => {
    it('PLATFORM_KEY_MISSING includes provider, mode, and suggestion', async () => {
      const env = makeEnv();
      // Remove the Google key
      (env as any).PLATFORM_GOOGLE_KEY = undefined;

      try {
        await resolveApiKey(platformSubscription(), 'google', env, TEST_USER_ID);
        expect.unreachable('Should have thrown');
      } catch (err: any) {
        expect(err.code).toBe('PLATFORM_KEY_MISSING');
        expect(err.statusCode).toBe(503);
        expect(err.details).toMatchObject({
          provider: 'google',
          mode: 'PLATFORM',
          action: 'contact_support',
        });
        expect(err.details.suggestion).toBeDefined();
      }
    });

    it('UNKNOWN_TIER error includes the tier name in the message', async () => {
      const env = makeEnv();
      const badSubscription = { tier: 'ALPHA_BETA' as any, key_mode: 'BYOK' as any };

      try {
        await resolveApiKey(badSubscription, 'anthropic', env, TEST_USER_ID);
        expect.unreachable('Should have thrown');
      } catch (err: any) {
        expect(err.message).toContain('ALPHA_BETA');
      }
    });
  });

  // ==========================================================================
  // 14. Google and Deepseek BYOK resolution
  // ==========================================================================
  describe('BYOK key resolution — Google and Deepseek', () => {
    it('resolves a stored Google BYOK key', async () => {
      const env = envWithDB([
        {
          pattern: 'user_api_keys',
          result: { api_key: 'enc-google-key', updated_at: '2026-02-10T00:00:00Z' },
        },
      ]);

      const key = await resolveApiKey(byokSubscription(), 'google', env, TEST_USER_ID);
      expect(key).toBe('decrypted:enc-google-key');
    });

    it('resolves a stored Deepseek BYOK key', async () => {
      const env = envWithDB([
        {
          pattern: 'user_api_keys',
          result: { api_key: 'enc-ds-key', updated_at: '2026-02-10T00:00:00Z' },
        },
      ]);

      const key = await resolveApiKey(byokSubscription(), 'deepseek', env, TEST_USER_ID);
      expect(key).toBe('decrypted:enc-ds-key');
    });
  });

  // ==========================================================================
  // 15. Platform key — does not trigger decryption
  // ==========================================================================
  describe('platform key does not decrypt', () => {
    it('never calls decryptAESGCM for platform tier resolution', async () => {
      const env = makeEnv();
      const providers: Provider[] = ['anthropic', 'openai', 'google', 'deepseek'];

      for (const provider of providers) {
        await resolveApiKey(platformSubscription(), provider, env, TEST_USER_ID);
      }

      expect(decryptAESGCM).not.toHaveBeenCalled();
    });
  });
});

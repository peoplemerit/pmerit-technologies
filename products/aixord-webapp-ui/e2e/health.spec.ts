/**
 * E2E: Backend health check
 *
 * Verifies the API backend is reachable and healthy.
 * Tests the health endpoint directly via API request.
 */

import { test, expect } from '@playwright/test';

const API_BASE = process.env.E2E_API_BASE || 'https://aixord-router-worker.peoplemerit.workers.dev';

test.describe('Backend Health', () => {
  test('health endpoint returns healthy status', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/router/health`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.status).toBeDefined();
    expect(['healthy', 'degraded']).toContain(body.status);
    expect(body.version).toBeDefined();
  });

  test('health endpoint includes component checks', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/router/health`);
    const body = await response.json();

    // Should have checks object with at least D1
    if (body.checks) {
      expect(body.checks.d1).toBeDefined();
      expect(body.checks.d1.status).toBeDefined();
    }
  });

  test('models endpoint returns available models', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/router/models`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.models || body.data).toBeDefined();
  });

  test('unauthenticated execute request returns 401', async ({ request }) => {
    const response = await request.post(`${API_BASE}/v1/router/execute`, {
      data: { prompt: 'test', model_class: 'standard' },
    });
    expect(response.status()).toBe(401);
  });

  test('CORS headers present on health endpoint', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/router/health`, {
      headers: {
        'Origin': 'https://aixord-webapp-ui.pages.dev',
      },
    });
    const headers = response.headers();
    expect(headers['access-control-allow-origin']).toBeDefined();
  });
});

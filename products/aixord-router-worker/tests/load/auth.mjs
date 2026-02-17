#!/usr/bin/env node

/**
 * Load Test: Authentication Endpoints
 *
 * Tests /api/v1/auth/login under concurrent load.
 * Target: 100 concurrent requests with no 5xx errors.
 * Expects 401/400 responses (invalid credentials) — tests server stability, not auth success.
 *
 * Usage:
 *   node tests/load/auth.mjs [url]
 */

const BASE_URL = process.argv[2] || 'https://aixord-router-worker.peoplemerit.workers.dev';
const ENDPOINT = `${BASE_URL}/api/v1/auth/login`;
const DURATION_MS = 15_000;
const CONCURRENCY = 10;
const BATCH_SIZE = 10;
const BATCH_DELAY_MS = 100;

const stats = {
  total: 0,
  expected_errors: 0, // 401, 400 — expected
  rate_limited: 0,    // 429 — expected under load
  server_errors: 0,   // 5xx — unexpected
  latencies: [],
  statusCodes: {},
};

async function sendLoginRequest() {
  const start = Date.now();
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `loadtest-${Math.random().toString(36).slice(2)}@test.invalid`,
        password: 'loadtest12345678',
      }),
    });
    const latency = Date.now() - start;
    stats.total++;
    stats.latencies.push(latency);
    stats.statusCodes[res.status] = (stats.statusCodes[res.status] || 0) + 1;

    if (res.status === 429) {
      stats.rate_limited++;
    } else if (res.status >= 500) {
      stats.server_errors++;
    } else {
      stats.expected_errors++; // 400, 401 are expected
    }
  } catch (err) {
    stats.total++;
    stats.server_errors++;
    stats.statusCodes['NETWORK_ERROR'] = (stats.statusCodes['NETWORK_ERROR'] || 0) + 1;
  }
}

function percentile(arr, p) {
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.ceil(sorted.length * (p / 100)) - 1;
  return sorted[Math.max(0, idx)];
}

async function main() {
  console.log(`\n🔥 Load Test: Auth (Login) Endpoint`);
  console.log(`   Target: ${ENDPOINT}`);
  console.log(`   Duration: ${DURATION_MS / 1000}s`);
  console.log(`   Concurrency: ${CONCURRENCY} workers × ${BATCH_SIZE} per batch\n`);

  const startTime = Date.now();
  const workers = [];

  for (let i = 0; i < CONCURRENCY; i++) {
    workers.push(
      (async () => {
        while (Date.now() - startTime < DURATION_MS) {
          const batch = [];
          for (let j = 0; j < BATCH_SIZE; j++) {
            batch.push(sendLoginRequest());
          }
          await Promise.all(batch);
          await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
        }
      })()
    );
  }

  const progressInterval = setInterval(() => {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    process.stdout.write(
      `\r   [${elapsed}s] ${stats.total} requests, ${stats.server_errors} server errors, ${stats.rate_limited} rate-limited`
    );
  }, 1000);

  await Promise.all(workers);
  clearInterval(progressInterval);

  const elapsed = (Date.now() - startTime) / 1000;
  const rps = Math.round(stats.total / elapsed);

  console.log(`\n\n📊 Results:`);
  console.log(`   Total Requests:   ${stats.total}`);
  console.log(`   Expected Errors:  ${stats.expected_errors} (401/400 — correct behavior)`);
  console.log(`   Rate Limited:     ${stats.rate_limited} (429 — expected under load)`);
  console.log(`   Server Errors:    ${stats.server_errors} (5xx — should be 0)`);
  console.log(`   Duration:         ${elapsed.toFixed(1)}s`);
  console.log(`   Throughput:       ${rps} req/s`);
  console.log(`   Status Codes:     ${JSON.stringify(stats.statusCodes)}`);

  if (stats.latencies.length > 0) {
    const avg = Math.round(stats.latencies.reduce((a, b) => a + b, 0) / stats.latencies.length);
    console.log(`\n⏱  Latency:`);
    console.log(`   Avg:    ${avg}ms`);
    console.log(`   p50:    ${percentile(stats.latencies, 50)}ms`);
    console.log(`   p90:    ${percentile(stats.latencies, 90)}ms`);
    console.log(`   p99:    ${percentile(stats.latencies, 99)}ms`);
    console.log(`   Max:    ${Math.max(...stats.latencies)}ms`);
  }

  const pass = stats.server_errors === 0;
  console.log(`\n${pass ? '✅ PASS' : '❌ FAIL'}: Auth load test (0 server errors)`);
  process.exit(pass ? 0 : 1);
}

main().catch(console.error);

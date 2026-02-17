#!/usr/bin/env node

/**
 * Load Test: Health Endpoint
 *
 * Tests the /v1/router/health endpoint under sustained load.
 * Target: 1000 req/s for 30 seconds with zero errors.
 *
 * Usage:
 *   node tests/load/health.mjs [url]
 *
 * Default URL: https://aixord-router-worker.peoplemerit.workers.dev
 */

const BASE_URL = process.argv[2] || 'https://aixord-router-worker.peoplemerit.workers.dev';
const ENDPOINT = `${BASE_URL}/v1/router/health`;
const DURATION_MS = 30_000;
const CONCURRENCY = 50;
const REQUESTS_PER_BATCH = 20;
const BATCH_DELAY_MS = 50; // ~400 req/s sustained

const stats = {
  total: 0,
  success: 0,
  errors: 0,
  latencies: [],
  statusCodes: {},
};

async function sendRequest() {
  const start = Date.now();
  try {
    const res = await fetch(ENDPOINT);
    const latency = Date.now() - start;
    stats.total++;
    stats.latencies.push(latency);
    stats.statusCodes[res.status] = (stats.statusCodes[res.status] || 0) + 1;
    if (res.ok) {
      stats.success++;
    } else {
      stats.errors++;
    }
  } catch (err) {
    stats.total++;
    stats.errors++;
    stats.statusCodes['NETWORK_ERROR'] = (stats.statusCodes['NETWORK_ERROR'] || 0) + 1;
  }
}

async function runBatch() {
  const promises = [];
  for (let i = 0; i < REQUESTS_PER_BATCH; i++) {
    promises.push(sendRequest());
  }
  await Promise.all(promises);
}

function percentile(arr, p) {
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.ceil(sorted.length * (p / 100)) - 1;
  return sorted[Math.max(0, idx)];
}

async function main() {
  console.log(`\n🔥 Load Test: Health Endpoint`);
  console.log(`   Target: ${ENDPOINT}`);
  console.log(`   Duration: ${DURATION_MS / 1000}s`);
  console.log(`   Concurrency: ${REQUESTS_PER_BATCH} per batch, ${BATCH_DELAY_MS}ms interval`);
  console.log(`   Expected: ~${Math.round(REQUESTS_PER_BATCH * (1000 / BATCH_DELAY_MS))} req/s\n`);

  const startTime = Date.now();
  const workers = [];

  for (let i = 0; i < CONCURRENCY; i++) {
    workers.push(
      (async () => {
        while (Date.now() - startTime < DURATION_MS) {
          await runBatch();
          await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
        }
      })()
    );
  }

  // Progress indicator
  const progressInterval = setInterval(() => {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const rps = Math.round(stats.total / ((Date.now() - startTime) / 1000));
    process.stdout.write(`\r   [${elapsed}s] ${stats.total} requests, ${rps} req/s, ${stats.errors} errors`);
  }, 1000);

  await Promise.all(workers);
  clearInterval(progressInterval);

  const elapsed = (Date.now() - startTime) / 1000;
  const rps = Math.round(stats.total / elapsed);

  console.log(`\n\n📊 Results:`);
  console.log(`   Total Requests: ${stats.total}`);
  console.log(`   Success:        ${stats.success} (${((stats.success / stats.total) * 100).toFixed(1)}%)`);
  console.log(`   Errors:         ${stats.errors} (${((stats.errors / stats.total) * 100).toFixed(1)}%)`);
  console.log(`   Duration:       ${elapsed.toFixed(1)}s`);
  console.log(`   Throughput:     ${rps} req/s`);
  console.log(`   Status Codes:   ${JSON.stringify(stats.statusCodes)}`);

  if (stats.latencies.length > 0) {
    const avg = Math.round(stats.latencies.reduce((a, b) => a + b, 0) / stats.latencies.length);
    console.log(`\n⏱  Latency:`);
    console.log(`   Min:    ${Math.min(...stats.latencies)}ms`);
    console.log(`   Avg:    ${avg}ms`);
    console.log(`   p50:    ${percentile(stats.latencies, 50)}ms`);
    console.log(`   p90:    ${percentile(stats.latencies, 90)}ms`);
    console.log(`   p99:    ${percentile(stats.latencies, 99)}ms`);
    console.log(`   Max:    ${Math.max(...stats.latencies)}ms`);
  }

  const pass = stats.errors === 0 && rps >= 100;
  console.log(`\n${pass ? '✅ PASS' : '❌ FAIL'}: Health endpoint load test`);
  process.exit(pass ? 0 : 1);
}

main().catch(console.error);

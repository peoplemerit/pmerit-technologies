# Load Tests

Lightweight load testing scripts using Node.js native `fetch`. No external dependencies required.

## Scripts

| Script | Target | Baseline |
|--------|--------|----------|
| `health.mjs` | `/v1/router/health` | 400+ req/s sustained, 0 errors |
| `auth.mjs` | `/api/v1/auth/login` | 100 concurrent, 0 server errors (5xx) |

## Usage

```bash
# Against production
node tests/load/health.mjs

# Against staging
node tests/load/health.mjs https://aixord-router-worker-staging.peoplemerit.workers.dev

# Against local dev
node tests/load/health.mjs http://localhost:8787
```

## Interpreting Results

- **Health test**: Should achieve 400+ req/s with zero errors. Any 5xx or network error is a failure.
- **Auth test**: Expects 401/400 responses (invalid credentials by design). 429 (rate limited) is expected under load. Any 5xx response is a failure.

## Performance Baselines (2026-02-17)

| Metric | Health | Auth |
|--------|--------|------|
| Target RPS | 400+ | N/A (concurrency test) |
| p50 Latency | < 50ms | < 200ms |
| p99 Latency | < 200ms | < 1000ms |
| Error Rate | 0% | 0% (5xx only) |

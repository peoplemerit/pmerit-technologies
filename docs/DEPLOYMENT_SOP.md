# D4-CHAT Deployment Standard Operating Procedure

**Version:** 2.0
**Created:** 2026-02-17
**Updated:** 2026-02-17
**Baseline Tag:** `v1.0.0-beta.1`
**Current Head:** Phase 3 — Provider Analytics + Observability

---

## Architecture Overview

| Component | Platform | URL |
|-----------|----------|-----|
| **Backend Worker** | Cloudflare Workers | `aixord-router-worker.peoplemerit.workers.dev` |
| **Frontend UI** | Cloudflare Pages | `aixord.pmerit.com` |
| **Database** | Cloudflare D1 | `aixord-db` (prod) / `aixord-db-staging` (staging) |
| **Object Storage** | Cloudflare R2 | `aixord-images` (prod) / `aixord-images-staging` (staging) |

---

## Infrastructure Bindings (Verified 2026-02-17)

### Production

| Binding | Type | ID / Name |
|---------|------|-----------|
| `DB` | D1 | `4222a800-ec94-479b-94d2-f1beaa7d01d9` (`aixord-db`) |
| `IMAGES` | R2 | `aixord-images` |
| `ENVIRONMENT` | var | `production` |
| `AUTH_SALT` | var | `aixord-d4-backend-salt-2026` |
| `FRONTEND_URL` | var | `https://aixord.pmerit.com` |

### Staging

| Binding | Type | ID / Name |
|---------|------|-----------|
| `DB` | D1 | `e7604a7b-a496-4bc5-b7c1-8c1b8bf64ba9` (`aixord-db-staging`) |
| `IMAGES` | R2 | `aixord-images-staging` |
| `ENVIRONMENT` | var | `staging` |
| `AUTH_SALT` | var | `aixord-d4-backend-salt-2026-staging` |
| `FRONTEND_URL` | var | `https://staging.aixord.pmerit.com` |

### Secrets (set via `wrangler secret put`)

| Secret | Purpose |
|--------|---------|
| `PLATFORM_ANTHROPIC_KEY` | Anthropic API (platform tier) |
| `PLATFORM_OPENAI_KEY` | OpenAI API (platform tier) |
| `PLATFORM_GOOGLE_KEY` | Google AI API (platform tier) |
| `PLATFORM_DEEPSEEK_KEY` | DeepSeek API (platform tier) |
| `STRIPE_SECRET_KEY` | Stripe billing |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signature verification |
| `GUMROAD_PRODUCT_ID` | Gumroad product validation |
| `KDP_CODE_SECRET` | KDP code validation |
| `GITHUB_CLIENT_ID` | GitHub OAuth app ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app secret |
| `GITHUB_TOKEN_ENCRYPTION_KEY` | Encrypts stored GitHub tokens |
| `RESEND_API_KEY` | Transactional emails (verification, password reset) |

---

## Deployment Procedures

### 1. Backend Worker Deployment

```bash
# From: products/aixord-router-worker/

# Staging first
wrangler deploy --env staging

# Run smoke test against staging
curl https://aixord-router-worker-staging.peoplemerit.workers.dev/v1/router/health

# Production (no --env flag for default/production)
wrangler deploy

# Verify
curl https://aixord-router-worker.peoplemerit.workers.dev/v1/router/health
```

### 2. D1 Database Migrations

```bash
# From: products/aixord-router-worker/

# Apply to staging first
wrangler d1 migrations apply --env staging

# Verify staging
wrangler d1 execute aixord-db-staging --env staging --command "SELECT name FROM d1_migrations ORDER BY id DESC LIMIT 5;"

# Apply to production
wrangler d1 migrations apply

# Verify production
wrangler d1 execute aixord-db --command "SELECT name FROM d1_migrations ORDER BY id DESC LIMIT 5;"
```

**RESOLVED (2026-02-17):** Production `d1_migrations` tracking gap has been backfilled. Production now has 48 entries matching staging. All future migrations should apply cleanly via `wrangler d1 migrations apply`.

### 3. Frontend Deployment

```bash
# From: products/aixord-webapp-ui/

# Build
npm run build

# Deploy via Cloudflare Pages (automatic on git push to main)
# OR manual: wrangler pages deploy dist
```

### 4. Secrets Management

```bash
# Set a secret for production
wrangler secret put SECRET_NAME

# Set a secret for staging
wrangler secret put SECRET_NAME --env staging

# List secrets
wrangler secret list
wrangler secret list --env staging
```

---

## Pre-Deployment Checklist

- [ ] All tests pass: `npm run test:run` (450+ tests across 22 files)
- [ ] TypeScript compiles: `tsc -b` (both packages)
- [ ] No uncommitted changes: `git status` is clean
- [ ] Staging deployed and smoke-tested first
- [ ] Health check passes: `curl .../v1/router/health` returns `{"status":"healthy"}`
- [ ] D1 migrations applied to staging before production
- [ ] Tag release: `git tag -a vX.Y.Z -m "Release description"`

---

## Rollback Procedure

### Worker Rollback

```bash
# View deployment history
wrangler deployments list

# Rollback to previous version
wrangler rollback
```

### D1 Rollback

D1 migrations are forward-only. To reverse a migration:
1. Create a new migration that undoes the change
2. Apply via `wrangler d1 migrations apply`
3. Never manually DROP tables in production without a backup

---

## Database Audit (Updated 2026-02-17)

### Production (`aixord-db`)
- **Tables:** 72 (68 baseline + 4 reconciled via migration 046)
- **Size:** ~2 MB
- **Users:** 8
- **Region:** ENAM
- **Migration tracking:** 48 entries (backfilled from 3 → 48)

### Staging (`aixord-db-staging`)
- **Tables:** 72
- **Size:** ~1.5 MB
- **Users:** 0 (fresh)
- **Region:** ENAM
- **Migration tracking:** 48 entries (fully tracked)

### Schema Reconciliation (Completed 2026-02-17)

Migration `046_schema_reconciliation_prod.sql` added 4 missing tables to production:
- `agent_instances` — agent state tracking
- `agent_tasks` — task queue
- `secret_access_log` — security governance audit
- `security_classifications` — security classification levels

Production `d1_migrations` table was backfilled with 45 missing entries to match staging. Both environments are now schema-aligned.

---

## Release History

### Phase 1 — Resilience & Reliability (2026-02-17)

| Phase | Commit | Changes |
|-------|--------|---------|
| **1.1** | `e639319` | Deployment audit, SOP, baseline tag `v1.0.0-beta.1` |
| **1.2** | `e890a3e` | Subscription polling, webhook batch atomicity |
| **1.3** | `2c9da14` | Exponential backoff with jitter, `Retry-After` support |
| **1.4** | `8d90cbb` | Circuit breaker (CLOSED→OPEN→HALF_OPEN), provider health probing |
| **Tests** | `174912e` | Circuit breaker tests (13), mock DB `batch()` fix, migration 046 |

### Phase 2 — Observability & Monitoring (2026-02-17)

| Commit | Changes |
|--------|---------|
| `f652397` | Structured JSON logging in fallback chain, circuit breaker, and selection log |

**Structured Log Events:**

| Event | Level | When | Key Fields |
|-------|-------|------|------------|
| `provider_skipped` | info | Circuit open, provider bypassed | `request_id`, `provider`, `model`, `reason` |
| `provider_success` | info | Provider returned successfully | `request_id`, `provider`, `model`, `latency_ms`, `tokens`, `cost_usd` |
| `provider_failure` | warn | Provider call failed | `request_id`, `provider`, `model`, `latency_ms`, `error`, `will_retry` |
| `all_providers_failed` | error | All fallback candidates exhausted | `request_id`, `model_class`, `total_candidates`, `provider_errors` |
| `circuit_transition` | warn/info | Circuit state change | `provider`, `from`, `to`, `reason`, `failure_count` |
| `circuit_reset` | info | Circuit manually reset | `provider` |
| `selection_log_failed` | error | Audit log write failed | `request_id`, `error` |

All logs emit as JSON via `utils/logger.ts` → compatible with Cloudflare Logpush, `wrangler tail`, Datadog, LogTail.

### Phase 3 — Analytics & Governance (2026-02-17)

| Commit | Changes |
|--------|---------|
| `6ef98b4` | Provider analytics endpoints, observability integration tests (10 new) |

**New API Endpoints:**

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `GET /api/v1/analytics/providers` | Required | Per-provider request counts, model distribution, affinity rates, circuit breaker state |
| `GET /api/v1/analytics/intents` | Required | Per-intent routing patterns with provider/mode breakdown |

**Query Parameters:** `?since=ISO_DATE` (default: last 30 days), `?limit=N` (max: 5000)

---

## Environment Variables Reference

| Variable | Production | Staging |
|----------|-----------|---------|
| `ENVIRONMENT` | `production` | `staging` |
| `AUTH_SALT` | `aixord-d4-backend-salt-2026` | `...-staging` |
| `GITHUB_REDIRECT_URI` | `...workers.dev/api/v1/github/callback` | `...-staging.../callback` |
| `FRONTEND_URL` | `https://aixord.pmerit.com` | `https://staging.aixord.pmerit.com` |

---

## Test Coverage Summary

| Area | Tests | Files |
|------|-------|-------|
| Routing (circuit breaker, fallback, model selection) | ~30 | 4 |
| API endpoints (chat, usage, engineering, analytics) | ~80 | 6 |
| Auth & middleware | ~40 | 3 |
| Observability (structured log verification) | 10 | 1 |
| Other (subscriptions, webhooks, KDP, etc.) | ~290 | 8 |
| **Total** | **450+** | **22** |

---

*PMERIT TECHNOLOGIES LLC — AIXORD v2.1*
*Created: 2026-02-17 | Updated: 2026-02-17 | Baseline: v1.0.0-beta.1*

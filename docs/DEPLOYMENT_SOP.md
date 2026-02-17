# D4-CHAT Deployment Standard Operating Procedure

**Version:** 1.0
**Created:** 2026-02-17
**Baseline Tag:** `v1.0.0-beta.1`

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
curl https://aixord-router-worker-staging.peoplemerit.workers.dev/health

# Production
wrangler deploy

# Verify
curl https://aixord-router-worker.peoplemerit.workers.dev/health
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

**IMPORTANT:** Production DB has migration tracking gaps (many tables created via direct SQL before migration tracking was set up). Staging DB is fully tracked (46 migrations applied 2026-02-17). Future migrations MUST go through `wrangler d1 migrations apply`.

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

- [ ] All tests pass: `npm run test:run` (backend + frontend)
- [ ] TypeScript compiles: `tsc -b` (both packages)
- [ ] No uncommitted changes: `git status` is clean
- [ ] Staging deployed and smoke-tested first
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

## Database Audit (Baseline 2026-02-17)

### Production (`aixord-db`)
- **Tables:** 68
- **Size:** 1.8 MB
- **Users:** 8
- **Region:** ENAM
- **Migration tracking:** 3 entries (historical gap — many tables pre-date tracking)

### Staging (`aixord-db-staging`)
- **Tables:** 70
- **Size:** 1.3 MB
- **Users:** 0 (fresh)
- **Region:** ENAM
- **Migration tracking:** 46 entries (fully tracked)

### Schema Delta (Staging vs Production)

Staging has 4 extra tables not in production:
- `agent_instances` — from migration 035 (agent_state.sql), prod uses different naming
- `agent_tasks` — from migration 036 (task_queue.sql), prod uses different naming
- `secret_access_log` — from migration 009 (security governance)
- `security_classifications` — from migration 009 (security governance)

These discrepancies exist because production schema was built incrementally via direct SQL, while staging received all 46 migrations cleanly. **Action needed:** Reconcile by adding missing tables to production in a future migration.

---

## Environment Variables Reference

| Variable | Production | Staging |
|----------|-----------|---------|
| `ENVIRONMENT` | `production` | `staging` |
| `AUTH_SALT` | `aixord-d4-backend-salt-2026` | `...-staging` |
| `GITHUB_REDIRECT_URI` | `...workers.dev/api/v1/github/callback` | `...-staging.../callback` |
| `FRONTEND_URL` | `https://aixord.pmerit.com` | `https://staging.aixord.pmerit.com` |

---

*PMERIT TECHNOLOGIES LLC — AIXORD v2.1*
*Created: 2026-02-17 | Baseline: v1.0.0-beta.1*

# Contributing to D4-CHAT

Welcome to the D4-CHAT development guide. This document covers everything you need to set up your development environment, understand the architecture, write tests, and deploy changes.

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | v20.18.1 LTS | Runtime (use project-local install below) |
| npm | v10.8.2 | Package manager |
| Wrangler | v4.x | Cloudflare Workers CLI |
| Git | Latest | Version control |

---

## Repository Structure

```
pmerit-technologies/
├── products/
│   ├── aixord-router-worker/     # Backend — Cloudflare Workers + Hono
│   │   ├── src/
│   │   │   ├── index.ts          # Main entry, middleware, routes
│   │   │   ├── types.ts          # Shared TypeScript types
│   │   │   ├── api/              # Route handlers (25 modules)
│   │   │   ├── billing/          # Stripe + Gumroad integrations
│   │   │   ├── config/           # Tier definitions, model affinities
│   │   │   ├── governance/       # Phase contracts, gate rules
│   │   │   ├── middleware/       # Auth, rate limit, validation, entitlement
│   │   │   ├── providers/        # AI provider adapters (Anthropic, OpenAI, Google, DeepSeek)
│   │   │   ├── routing/          # Intent mapping, fallback, subscription
│   │   │   ├── schemas/          # Request validation schemas
│   │   │   ├── services/         # Business logic (readiness, evidence, gates)
│   │   │   └── utils/            # Crypto, cost estimation, logging
│   │   ├── migrations/           # 45 D1 SQL migration files
│   │   ├── tests/                # Backend test suite (427 tests)
│   │   ├── wrangler.toml         # Cloudflare Workers config
│   │   └── vitest.config.ts      # Test configuration
│   │
│   └── aixord-webapp-ui/         # Frontend — React 19 + Vite + Tailwind
│       ├── src/
│       │   ├── App.tsx           # Router + layout
│       │   ├── main.tsx          # Entry point
│       │   ├── pages/            # Route pages (Dashboard, Chat, Login, etc.)
│       │   ├── components/       # Reusable UI (60+ components)
│       │   ├── contexts/         # React contexts (Auth, Disclaimer, UserSettings)
│       │   ├── hooks/            # Custom hooks (useApi, useSessions, etc.)
│       │   └── lib/              # API client, utilities
│       ├── tests/                # Frontend test suite (62 tests)
│       ├── public/_headers       # Security headers for Cloudflare Pages
│       └── vitest.config.ts      # Test configuration
│
├── docs/
│   └── d4-modules/               # Modular documentation
│       ├── ARCHITECTURE.md       # Directory structure + tech stack
│       ├── API-REFERENCE.md      # Endpoint documentation
│       ├── API-VERSIONING.md     # Versioning strategy
│       ├── DATABASE.md           # Schema documentation
│       ├── DEPLOYMENT.md         # Deploy procedures
│       ├── SECURITY-AUDIT.md     # Security posture review
│       ├── STATUS.md             # Project completion status
│       └── ROADMAP.md            # Feature roadmap
│
└── CONTRIBUTING.md               # This file
```

---

## Development Setup

### 1. Clone and Install

```bash
git clone https://github.com/peoplemerit/pmerit-technologies.git
cd pmerit-technologies
```

### 2. Backend Setup

```bash
cd products/aixord-router-worker
npm install
```

Create a `.dev.vars` file for local secrets:

```env
AUTH_SALT=your-dev-salt
API_KEY_ENCRYPTION_KEY=your-32-byte-hex-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=AIzaSy...
```

### 3. Run Backend Locally

```bash
npx wrangler dev
```

This starts the Workers dev server at `http://localhost:8787` with a local D1 database.

### 4. Frontend Setup

```bash
cd products/aixord-webapp-ui
npm install
```

Create a `.env.local` file:

```env
VITE_API_BASE=http://localhost:8787/api/v1
```

### 5. Run Frontend Locally

```bash
npm run dev
```

Opens at `http://localhost:5173`.

---

## Running Tests

### Backend Tests

```bash
cd products/aixord-router-worker
npm test              # Watch mode
npx vitest run        # Single run
```

**427 tests** across 20 test files covering:
- Auth endpoints (register, login, logout, password reset, email verify)
- Billing (Stripe webhooks, Gumroad activation, checkout)
- Router execution (model selection, subscription validation, BYOK)
- Projects & governance (CRUD, phase transitions, gates)
- Middleware (CORS, entitlement, rate limiting)
- Crypto utilities (PBKDF2, AES-GCM, masking)

### Frontend Tests

```bash
cd products/aixord-webapp-ui
npm test              # Watch mode
npx vitest run        # Single run
npm run test:coverage # With coverage report
```

**62 tests** across 7 test files covering:
- Auth components (Login, Signup forms)
- Dashboard (project list, navigation)
- Chat components (input, messages)
- Pricing page (plan rendering, CTAs)
- Protected routes (auth guard behavior)
- Auth context (state management)

### Writing Tests

**Backend pattern:**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';

// Create test app with mock environment
const app = new Hono<{ Bindings: Env }>();
// ... mount routes

describe('Feature', () => {
  it('does something', async () => {
    const res = await app.request('/path', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'value' }),
    }, mockEnv);

    expect(res.status).toBe(200);
  });
});
```

**Frontend pattern:**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock API and contexts BEFORE component imports
vi.mock('../../src/lib/api', () => ({ api: {}, billingApi: {} }));
vi.mock('../../src/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({ isAuthenticated: false })),
}));

import { MyComponent } from '../../src/components/MyComponent';

function renderComponent() {
  return render(
    <MemoryRouter>
      <MyComponent />
    </MemoryRouter>
  );
}
```

**Important:** `vi.mock()` calls must appear before component imports due to Vitest hoisting.

---

## Architecture Overview

### Backend (Cloudflare Workers + Hono)

```
Request → CORS → Rate Limit → Auth Middleware → Route Handler → Response
                                    ↓
                              D1 (SQLite)
                              R2 (Object Storage)
                              Provider APIs (Anthropic, OpenAI, Google, DeepSeek)
```

**Key concepts:**
- **Hono** — Lightweight web framework for Cloudflare Workers
- **D1** — Cloudflare's serverless SQLite database
- **R2** — Cloudflare's S3-compatible object storage (images)
- **Subscription tiers** — TRIAL, MANUSCRIPT_BYOK, BYOK_STANDARD, PLATFORM_STANDARD, PLATFORM_PRO, ENTERPRISE
- **BYOK** — Bring Your Own Key — users can provide their own API keys

### Frontend (React 19 + Vite + Tailwind)

```
App.tsx (Router)
├── Landing.tsx          (public)
├── Login.tsx / Signup.tsx (public)
├── ProtectedRoute
│   ├── Dashboard.tsx    (project list)
│   ├── Chat.tsx         (AI conversation)
│   ├── Analytics.tsx    (usage stats)
│   └── Settings.tsx     (API keys, profile)
└── Pricing.tsx          (public)
```

**Key concepts:**
- **AuthContext** — Manages session state, token storage, user profile
- **UserSettingsContext** — Subscription tier, feature flags
- **API client** (`src/lib/api.ts`) — Centralized fetch wrapper with auth headers

---

## Database Migrations

Migrations live in `products/aixord-router-worker/migrations/` and are numbered sequentially (0001 through 0045).

### Applying Migrations Locally

```bash
# Apply all migrations to local D1
npx wrangler d1 migrations apply aixord-db --local
```

### Applying Migrations to Staging

```bash
npx wrangler d1 migrations apply aixord-db --env staging --remote
```

### Creating a New Migration

```bash
# Create a new migration file
npx wrangler d1 migrations create aixord-db "description_of_change"

# Edit the generated file in migrations/
# Then apply locally and test
```

### Schema Conventions

- UUIDs as primary keys (generated via `lower(hex(randomblob(16)))`)
- `created_at` / `updated_at` with `datetime('now')` defaults
- Foreign keys reference `users(id)` with `ON DELETE SET NULL` for GDPR compatibility
- Index naming: `idx_{table}_{column}`

---

## Deployment

### Environments

| Environment | Backend | Frontend | Database |
|-------------|---------|----------|----------|
| **Local** | `wrangler dev` (localhost:8787) | `vite dev` (localhost:5173) | Local D1 |
| **Staging** | `wrangler deploy --env staging` | Cloudflare Pages preview | Staging D1 |
| **Production** | `wrangler deploy` | Cloudflare Pages (main) | Production D1 |

### CI/CD

GitHub Actions runs on every PR and push to main:
1. **Checkout** → **Node 20 setup** → **Install deps**
2. **Typecheck** (both products)
3. **Test** (both products)
4. **Lint** (frontend)
5. **Build** (frontend)

### Manual Deploy

```bash
# Backend to production
cd products/aixord-router-worker
npx wrangler deploy

# Frontend auto-deploys via Cloudflare Pages on push to main
```

---

## Code Conventions

### TypeScript

- Strict mode enabled in both products
- Prefer `interface` over `type` for object shapes
- Use `Env` type from `src/types.ts` for Worker environment bindings
- No `any` — use `unknown` with type narrowing

### API Endpoints

- All routes under `/api/v1/` for application API
- Router endpoints under `/v1/router/`
- Use `requireAuth` middleware for protected routes
- Return structured errors with `error_code` field

### Commits

Follow conventional commits:

```
feat: add new billing endpoint
fix: resolve session expiration race condition
test: add auth middleware tests
docs: update API reference
refactor: extract crypto utilities
```

### Error Handling

Backend errors use `RouterError` for typed error propagation:

```typescript
throw new RouterError('TRIAL_EXPIRED', 'Your trial has expired', 403);
```

Frontend maps error codes to recovery actions via `ChatErrorMessage.tsx`.

---

## Need Help?

- **Architecture questions**: See `docs/d4-modules/ARCHITECTURE.md`
- **API endpoints**: See `docs/d4-modules/API-REFERENCE.md`
- **Database schema**: See `docs/d4-modules/DATABASE.md`
- **Security concerns**: See `docs/d4-modules/SECURITY-AUDIT.md`
- **Deployment**: See `docs/d4-modules/DEPLOYMENT.md`

---

*D4-CHAT Contributing Guide — Phase 6.4 Enterprise Hardening*
*Last Updated: 2026-02-17*

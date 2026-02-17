# D4-CHAT: API Versioning Strategy

**Module:** API versioning approach, rate limit review, and deprecation policy
**Parent Manifest:** `docs/D4-CHAT_PROJECT_PLAN.md`
**Growth Class:** SEMI-STATIC
**Last Updated:** 2026-02-17 (Phase 6.3 — Enterprise Hardening)

---

## 1. Current Versioning Scheme

### 1.1 URL Path Versioning

All API endpoints use URL path versioning with the `v1` prefix:

```
https://aixord-router-worker.peoplemerit.workers.dev/api/v1/{resource}
https://aixord-router-worker.peoplemerit.workers.dev/v1/router/{action}
```

**Two route families exist:**

| Family | Pattern | Purpose |
|--------|---------|---------|
| Application API | `/api/v1/{resource}` | Auth, projects, billing, governance, CRUD |
| Router API | `/v1/router/{action}` | AI model execution, health, models list |

### 1.2 Why URL Path Versioning

- **Explicit**: Version is visible in every request URL
- **Cacheable**: Different versions resolve to different cache keys on Cloudflare
- **Simple routing**: Hono route groups handle versioning natively
- **Client clarity**: No header negotiation required

---

## 2. Endpoint Inventory (v1)

### 2.1 Authentication (`/api/v1/auth`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/register` | Create account |
| POST | `/login` | Authenticate |
| POST | `/logout` | End session |
| GET | `/me` | Current user profile |
| POST | `/forgot-password` | Password reset email |
| POST | `/reset-password` | Complete password reset |
| POST | `/change-password` | Authenticated password change |
| GET | `/verify-email` | Email verification |
| POST | `/verify-email/resend` | Resend verification |
| GET | `/export` | GDPR data export |
| DELETE | `/account` | GDPR account deletion |

### 2.2 Projects (`/api/v1/projects`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List user projects |
| POST | `/` | Create project |
| GET | `/:id` | Get project detail |
| PUT | `/:id` | Update project |
| DELETE | `/:id` | Delete project |

### 2.3 Sessions (`/api/v1/projects/:id/sessions`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List project sessions |
| POST | `/` | Create session |
| GET | `/:sessionId` | Get session detail |
| GET | `/:sessionId/messages` | Get session messages |

### 2.4 Billing (`/api/v1/billing`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/checkout` | Create Stripe checkout |
| POST | `/portal` | Create billing portal |
| GET | `/subscription` | Get subscription status |
| POST | `/activate-trial` | Start free trial |
| POST | `/gumroad/activate` | Activate Gumroad license |
| POST | `/webhook/stripe` | Stripe webhook (unauthenticated, signature-verified) |
| POST | `/webhook/gumroad` | Gumroad webhook (unauthenticated) |

### 2.5 API Keys (`/api/v1/api-keys`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List keys (masked) |
| POST | `/` | Store new key |
| PUT | `/:id` | Update key |
| DELETE | `/:id` | Delete key |
| POST | `/:id/reveal` | Reveal key (password re-auth) |

### 2.6 Router (`/v1/router`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/execute` | Execute AI request |
| GET | `/health` | Health check (public) |
| GET | `/models` | Available models |

### 2.7 Governance & Specialized

Additional resource groups: `/api/v1/governance`, `/api/v1/usage`, `/api/v1/workspace`, `/api/v1/artifacts`, `/api/v1/evidence`, `/api/v1/knowledge`, `/api/v1/layers`, `/api/v1/blueprint`, `/api/v1/agents`, `/api/v1/ccs`, `/api/v1/engineering`, `/api/v1/assignments`, `/api/v1/continuity`, `/api/v1/security`, `/api/v1/decisions`, `/api/v1/github`.

---

## 3. Rate Limit Review

### 3.1 Current Limits

| Scope | Window | Limit | Rationale |
|-------|--------|-------|-----------|
| Global API | 60s | 200 | Prevents automated abuse |
| Auth (login/register) | 60s | 10 | Brute-force prevention |
| Auth (reads) | 60s | 120 | Supports SPA navigation patterns |
| Router execute | 60s | 200 | Balances usage with cost |
| Billing | 60s | 20 | Payment fraud prevention |

### 3.2 Rate Limit Response

```json
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1708200000
Retry-After: 45

{
  "error": "Rate limit exceeded. Try again in 45 seconds."
}
```

### 3.3 Tuning Recommendations

| Endpoint | Current | Recommended | Reason |
|----------|---------|-------------|--------|
| Login | 10/60s | 5/60s | Reduce brute-force window |
| Register | 10/60s | 3/60s | Registration abuse is low-frequency |
| Execute | 200/60s | 60/60s per tier | Align with subscription limits |
| Global | 200/60s | 200/60s | Adequate for current scale |

**Note:** Tier-based rate limiting is recommended for v1.1 — align execute limits with subscription monthly quotas (e.g., TRIAL users: 10/min, PRO users: 60/min).

---

## 4. Versioning Policy

### 4.1 Compatibility Promise

**Within v1:** All changes are backward-compatible. This means:
- New endpoints may be added
- New optional fields may be added to responses
- New optional parameters may be added to requests
- Existing endpoints will not change behavior
- Existing required fields will not be removed or renamed

### 4.2 Breaking Change Definition

A breaking change requires a new API version (v2). Breaking changes include:
- Removing an endpoint
- Removing a required response field
- Changing the type of a response field
- Making a previously optional parameter required
- Changing authentication mechanism
- Changing error response format

### 4.3 Deprecation Process

When a v2 is eventually needed:

1. **Announce** deprecation with `Deprecation` header on v1 responses
2. **Maintain** v1 for minimum 6 months after v2 launch
3. **Log** v1 usage to track migration progress
4. **Sunset** v1 only after confirming no active consumers

```
Deprecation: true
Sunset: Sat, 01 Jan 2027 00:00:00 GMT
Link: <https://docs.aixord.ai/migration/v1-to-v2>; rel="successor-version"
```

### 4.4 Version Routing in Code

```typescript
// Current implementation (src/index.ts)
app.route('/api/v1/auth', authRoutes);
app.route('/api/v1/projects', projectRoutes);
app.route('/v1/router', routerRoutes);

// Future v2 would add parallel routes:
// app.route('/api/v2/auth', authRoutesV2);
```

Hono's route group system naturally supports multi-version APIs without middleware complexity.

---

## 5. Error Response Contract

### 5.1 Standard Error Format (v1)

```json
{
  "error": "Human-readable error message",
  "error_code": "MACHINE_READABLE_CODE",
  "error_details": {
    "recovery_action": "RETRY | UPGRADE | CHECK_KEYS | WAIT | CONTACT_SUPPORT",
    "redirect": "/pricing",
    "retry_after_ms": 5000
  }
}
```

### 5.2 Error Codes

| Code | HTTP Status | Recovery Action |
|------|-------------|-----------------|
| `TRIAL_EXPIRED` | 403 | UPGRADE |
| `ALLOWANCE_EXHAUSTED` | 429 | UPGRADE |
| `ALL_PROVIDERS_FAILED` | 502 | RETRY |
| `BYOK_KEY_MISSING` | 400 | CHECK_KEYS |
| `BYOK_KEY_INVALID` | 400 | CHECK_KEYS |
| `RATE_LIMITED` | 429 | WAIT |
| `NO_SUBSCRIPTION` | 403 | UPGRADE |
| `MODEL_NOT_ALLOWED` | 403 | UPGRADE |
| `INTERNAL_ERROR` | 500 | CONTACT_SUPPORT |

---

## 6. Client Integration

### 6.1 Frontend API Client

The frontend uses a centralized API client (`src/lib/api.ts`) with:
- Base URL configuration via `VITE_API_BASE` environment variable
- Automatic Bearer token injection from `localStorage`
- Typed response handling

### 6.2 Base URL Pattern

```
Production: https://aixord-router-worker.peoplemerit.workers.dev
Staging:    https://aixord-router-worker-staging.peoplemerit.workers.dev
Local:      http://localhost:8787
```

---

*D4-CHAT API Versioning Strategy — Phase 6.3 Enterprise Hardening*
*Documented: 2026-02-17*

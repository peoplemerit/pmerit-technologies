# D4-CHAT: Security Audit

**Module:** Security posture, authentication, encryption, and compliance review
**Parent Manifest:** `docs/D4-CHAT_PROJECT_PLAN.md`
**Growth Class:** SEMI-STATIC
**Last Updated:** 2026-02-17 (Phase 6.1 — Enterprise Hardening)
**Audit Scope:** Backend (Cloudflare Workers + Hono + D1) and Frontend (React 19 + Vite)

---

## Executive Summary

The D4-CHAT platform implements a multi-layered security architecture with PBKDF2 password hashing (100K iterations), AES-256-GCM encryption for stored API keys, database-backed rate limiting, restrictive CORS policies, Content Security Policy headers, and GDPR compliance endpoints. All database queries use parameterized prepared statements. Session tokens are cryptographically generated and stored as SHA-256 hashes.

**Overall Assessment:** Production-ready with documented migration deadlines for legacy systems.

---

## 1. Authentication

### 1.1 Password Hashing

| Property | Value |
|----------|-------|
| **Algorithm** | PBKDF2-SHA256 |
| **Iterations** | 100,000 |
| **Salt** | 16-byte random per-user |
| **Key Length** | 256 bits (32 bytes) |
| **Storage Format** | Hex-encoded hash + hex-encoded salt |
| **Implementation** | `src/utils/crypto.ts` → `hashPasswordPBKDF2()` |

**Legacy Migration:** Users created before PBKDF2 adoption have SHA-256 hashes with a global salt (`AUTH_SALT` env var). On successful login, legacy hashes are transparently upgraded to PBKDF2 with per-user salts. The `hash_algorithm` column tracks which algorithm each user has.

**Migration Deadline:** 2026-03-15 — After this date, plaintext token fallback will be removed.

### 1.2 Session Management

| Property | Value |
|----------|-------|
| **Token Generation** | 32-byte `crypto.getRandomValues()` → hex |
| **Token Storage** | SHA-256 hash in `token_hash` column |
| **Session Lifetime** | 7 days |
| **Expiration Check** | `expires_at > datetime('now')` in SQL |
| **Logout** | Server-side `DELETE FROM sessions` |
| **Implementation** | `src/api/auth.ts` |

**Legacy Token Support:** Older sessions stored plaintext tokens in the `token` column. The auth middleware checks `token_hash` first, then falls back to plaintext lookup. This fallback will be removed at the migration deadline (2026-03-15).

### 1.3 Authentication Middleware

| Property | Value |
|----------|-------|
| **Location** | `src/middleware/requireAuth.ts` |
| **Method** | Bearer token from `Authorization` header |
| **Validation** | SHA-256 hash lookup against `sessions.token_hash` |
| **Context** | Sets `userId` and `userEmail` on Hono context |
| **Error** | 401 Unauthorized |

---

## 2. Encryption

### 2.1 API Key Encryption at Rest

| Property | Value |
|----------|-------|
| **Algorithm** | AES-256-GCM |
| **Key Size** | 256 bits (32 bytes) |
| **IV** | 12-byte random per encryption |
| **Key Source** | `API_KEY_ENCRYPTION_KEY` env var |
| **Storage** | Base64-encoded (IV + ciphertext) |
| **Implementation** | `src/utils/crypto.ts` → `encryptAESGCM()` / `decryptAESGCM()` |

GCM mode provides authenticated encryption — any tampering with ciphertext will cause decryption failure rather than silent corruption.

### 2.2 API Key Display Security

- **List endpoint** (`GET /api-keys`): Returns only masked previews (first 7 + "..." + last 3 chars)
- **Reveal endpoint** (`POST /api-keys/:id/reveal`): Requires password re-authentication via PBKDF2
- **30-second hint**: Frontend displays revealed keys for 30 seconds only
- Full plaintext keys are never included in GET responses

---

## 3. Rate Limiting

### 3.1 Implementation

| Property | Value |
|----------|-------|
| **Backend** | D1 database `rate_limits` table |
| **Window Type** | Sliding window |
| **Concurrency** | Atomic `INSERT ... ON CONFLICT` |
| **Key Format** | `${userId}:${windowKey}` |
| **Cleanup** | Records older than 24 hours auto-purged |
| **Implementation** | `src/middleware/rateLimit.ts` |

### 3.2 Rate Limit Configuration

| Endpoint | Window | Limit | Purpose |
|----------|--------|-------|---------|
| `/api/*` (global) | 60s | 200 | General API protection |
| `/api/v1/auth/login` | 60s | 10 | Brute-force prevention |
| `/api/v1/auth/register` | 60s | 10 | Registration abuse |
| `/api/v1/auth/*` (reads) | 60s | 120 | SPA navigation |
| `/v1/router/execute` | 60s | 200 | AI request throttling |
| `/api/v1/billing/*` | 60s | 20 | Payment fraud prevention |

### 3.3 Rate Limit Headers

All responses include:
- `X-RateLimit-Limit` — Maximum requests in window
- `X-RateLimit-Remaining` — Requests remaining
- `X-RateLimit-Reset` — Unix timestamp of window reset
- `Retry-After` — Seconds to wait (429 responses only)

---

## 4. CORS Policy

### 4.1 Allowed Origins

**Production:**
- `https://aixord-webapp-ui.pages.dev`
- `https://aixord.pmerit.com`
- `https://aixord.ai`
- Cloudflare Pages previews: `/^https:\/\/[a-z0-9-]+\.aixord-webapp-ui\.pages\.dev$/`

**Development (non-production only):**
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000`

### 4.2 CORS Configuration

| Property | Value |
|----------|-------|
| **Methods** | GET, POST, PUT, DELETE, OPTIONS |
| **Headers** | Content-Type, Authorization |
| **Credentials** | true |
| **Unmatched Origin** | Request denied (no CORS headers) |
| **Implementation** | `src/index.ts` → Hono `cors()` middleware |

---

## 5. Security Headers

Deployed via Cloudflare Pages `_headers` file (`products/aixord-webapp-ui/public/_headers`):

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Content-Type-Options` | `nosniff` | Prevent MIME-type sniffing |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `X-XSS-Protection` | `1; mode=block` | Legacy XSS protection |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control referrer leakage |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Restrict browser APIs |

### 5.1 Content Security Policy

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
connect-src 'self' https://aixord-router-worker.peoplemerit.workers.dev https://api.stripe.com;
frame-src https://js.stripe.com;
font-src 'self'
```

**Notes:**
- `'unsafe-inline'` for styles required by Tailwind CSS
- `connect-src` whitelists only the API backend and Stripe
- `frame-src` allows only Stripe payment modals
- No `eval()` or inline scripts permitted

---

## 6. Input Validation

### 6.1 Request Body Validation

| Property | Value |
|----------|-------|
| **Framework** | Custom lightweight schema validator |
| **Location** | `src/middleware/validateBody.ts` |
| **Error Response** | 400 with detailed path-level errors |

### 6.2 Validation Schemas

| Schema | Validations |
|--------|------------|
| `loginSchema` | Email contains `@`, password ≥ 6 chars |
| `registerSchema` | Email contains `@`, password ≥ 8 chars |
| `createProjectSchema` | Name required, non-empty |
| `sendMessageSchema` | Content required, non-empty |
| `checkoutSchema` | `priceId` required, non-empty |
| `activateSchema` | `licenseKey` + `product` required |

### 6.3 Email Validation

Server-side regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` applied at registration.

### 6.4 API Key Format Validation

Provider-specific regex patterns enforced on key storage:

| Provider | Pattern |
|----------|---------|
| Anthropic | `sk-ant-api03-[a-zA-Z0-9_-]{32,}` |
| OpenAI | `sk-[a-zA-Z0-9._-]{20,}` |
| Google | `AIzaSy[a-zA-Z0-9_-]{30,}` |
| DeepSeek | `sk-[a-zA-Z0-9_-]{32,}` |

---

## 7. Database Security

### 7.1 Query Safety

All database queries use Cloudflare D1 prepared statements with `.bind()` parameter binding. No string concatenation or interpolation is used in SQL queries. This eliminates SQL injection as an attack vector.

### 7.2 Sensitive Column Protection

| Table | Column | Protection |
|-------|--------|-----------|
| `users` | `password_hash` | PBKDF2-SHA256, never returned in API responses |
| `users` | `password_salt` | Per-user salt, never returned in API responses |
| `sessions` | `token_hash` | SHA-256 of session token |
| `user_api_keys` | `api_key` | AES-256-GCM encrypted |

### 7.3 Foreign Key Design

User-referencing foreign keys use `ON DELETE SET NULL` to support GDPR cascade deletion without constraint violations (migration 027).

---

## 8. Frontend Token Storage

### 8.1 Strategy

| Property | Value |
|----------|-------|
| **Primary** | `localStorage` (key: `aixord_token`) |
| **Fallback** | Cookie with `SameSite=Strict`, `Secure` on HTTPS |
| **User Cache** | `localStorage` (key: `aixord_user`) as JSON |
| **Implementation** | `src/contexts/AuthContext.tsx` |

**Design Decision:** `localStorage` is primary because cookie-based storage encountered reliability issues across browser contexts and Cloudflare Pages deployments. The `SameSite=Strict` cookie serves as fallback only.

### 8.2 Limitations

- `HttpOnly` flag cannot be set from client-side JavaScript (would require server `Set-Cookie` headers)
- Token is accessible to XSS attacks if CSP is bypassed — mitigated by strict CSP policy
- No refresh token mechanism — sessions expire after 7 days

---

## 9. GDPR Compliance

### 9.1 Data Export (Article 20 — Data Portability)

| Property | Value |
|----------|-------|
| **Endpoint** | `GET /api/v1/auth/export` |
| **Auth Required** | Yes (Bearer token) |
| **Format** | JSON |
| **Scope** | User profile, subscriptions, projects, sessions, usage, API key metadata |
| **Exclusions** | Plaintext API keys (only masked metadata) |

### 9.2 Account Deletion (Article 17 — Right to Erasure)

| Property | Value |
|----------|-------|
| **Endpoint** | `DELETE /api/v1/auth/account` |
| **Auth Required** | Yes (Bearer token + password confirmation) |
| **Cascade Order** | sessions → api_keys → usage_tracking → usage → subscriptions → verification tokens → reset tokens → rate_limits → projects → users |
| **Audit Log** | User ID prefix (first 8 chars) logged before deletion |

---

## 10. Audit Logging

### 10.1 Security Events Logged

| Event | Location | Fields |
|-------|----------|--------|
| Login success | `auth.ts` | user_id, email |
| Login failure | `auth.ts` | email, reason |
| Registration | `auth.ts` | email |
| PBKDF2 upgrade | `auth.ts` | user_id prefix |
| Password changed | `auth.ts` | user_id prefix |
| Account deleted | `auth.ts` | user_id prefix |
| API key revealed | `api-keys.ts` | user_id, key_id, provider |
| API key reveal failed | `api-keys.ts` | user_id, key_id, reason |
| Email sent | `auth.ts` | recipient, subject, resend_id |
| Email failed | `auth.ts` | recipient, error |

### 10.2 Request Logging

All non-health-check requests are logged with structured JSON:
- `method`, `path`, `status`, `latency_ms`, `request_id`, `user_id`
- Implementation: Request timing middleware in `src/index.ts`

---

## 11. Known Risks & Mitigations

### 11.1 High Priority

| Risk | Status | Mitigation |
|------|--------|-----------|
| SHA-256 → PBKDF2 migration window | **Active** | Auto-upgrade on login; deadline 2026-03-15 |
| Plaintext token fallback | **Active** | Auto-backfill to SHA-256 hash; deadline 2026-03-15 |
| No token rotation/refresh | **Known** | 7-day expiry limits exposure window |
| `localStorage` XSS exposure | **Mitigated** | Strict CSP prevents inline scripts |

### 11.2 Medium Priority

| Risk | Status | Mitigation |
|------|--------|-----------|
| Optional API key encryption | **Mitigated** | Encryption key deployed in production |
| No key rotation mechanism | **Known** | Manual re-encryption on key change |
| `'unsafe-inline'` in CSP for styles | **Accepted** | Required by Tailwind CSS; no script eval |

### 11.3 Low Priority

| Risk | Status | Mitigation |
|------|--------|-----------|
| No log retention policy | **Known** | Cloudflare Workers logs available via dashboard/Logpush |
| No intrusion detection | **Known** | Rate limiting + audit logging provide baseline detection |
| Cookie lacks `HttpOnly` | **Accepted** | Cookie is fallback only; `localStorage` is primary |

---

## 12. Incident Response Procedure

### 12.1 Credential Compromise

1. **Rotate** `API_KEY_ENCRYPTION_KEY` in Cloudflare dashboard
2. **Rotate** `AUTH_SALT` if global salt is compromised
3. **Invalidate** all sessions: `DELETE FROM sessions`
4. **Re-encrypt** all API keys using migration script
5. **Notify** affected users via email (Resend integration)

### 12.2 Data Breach

1. **Assess** scope using audit logs in Cloudflare dashboard
2. **Revoke** all active sessions
3. **Rotate** all environment secrets
4. **Notify** affected users within 72 hours (GDPR Article 33)
5. **Document** incident in `docs/d4-modules/INCIDENTS.md`

### 12.3 Service Degradation

1. **Check** `/v1/router/health` endpoint for component status
2. **Review** structured logs via `wrangler tail`
3. **Check** Cloudflare Workers dashboard for error rates
4. **Failover** to alternate providers via routing table

---

## 13. Security Checklist

- [x] PBKDF2 password hashing (100K iterations)
- [x] AES-256-GCM encryption for stored API keys
- [x] Cryptographic session tokens (32 bytes)
- [x] Session token hashing (SHA-256)
- [x] Database-backed rate limiting
- [x] CORS origin whitelist
- [x] Content Security Policy
- [x] X-Frame-Options DENY
- [x] Parameterized SQL queries (no injection)
- [x] Input validation schemas
- [x] API key format validation per provider
- [x] Password re-auth for key reveal
- [x] GDPR data export endpoint
- [x] GDPR account deletion endpoint
- [x] Structured audit logging
- [x] Request correlation IDs
- [ ] Token refresh mechanism (planned)
- [ ] Log retention policy (planned)
- [ ] Automated security scanning (planned)

---

*D4-CHAT Security Audit — Phase 6.1 Enterprise Hardening*
*Audited: 2026-02-17*

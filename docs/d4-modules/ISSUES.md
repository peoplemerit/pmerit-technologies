# D4-CHAT: Development Issues

**Module:** Fixed issues, known issues, technical debt, backlog items (§13)
**Parent Manifest:** `docs/D4-CHAT_PROJECT_PLAN.md`
**Growth Class:** SHRINKING
**Last Updated:** 2026-02-17 (Session 11)

---

## 13. DEVELOPMENT ISSUES

### 13.1 Fixed Issues

| Session | Issue | Root Cause | Fix | Status |
|---------|-------|------------|-----|--------|
| 4 | Login returns 404 | No auth endpoints | Added backend APIs | ✅ |
| 4 | Auth response mismatch | Response structure | Fixed api.ts parsing | ✅ |
| 4 | Column mismatches | snake_case vs camelCase | Transform functions | ✅ |
| Post-4 | Invalid Date display | Date parsing | normalizeDate() | ✅ |
| Post-4 | White screen on create | Navigation method | React Router | ✅ |
| 5 | No usage stats | Missing aggregation | UsageStatsPanel | ✅ |
| 29 | Messages 500 error | Undeployed worker + broken FK | Deploy + migration 019 | ✅ |
| 30 | TRIAL users forced BYOK | TRIAL in BYOK_REQUIRED_TIERS | Removed from BYOK list | ✅ |
| 31 | UAT: governance prompt, empty state, UX | Multiple frontend issues | NLP file detection, UI fixes | ✅ |
| 32 | DELETE project 500 | images FK missing CASCADE + no try/catch | Migration 020 + batch DELETE | ✅ |
| 33 | GitHub OAuth callback 401 | `requireAuth` blocked `/callback` | Exempt callback from auth middleware | ✅ |
| 33 | DELETE project 500 (still) | Missing tables in batch (artifacts, state) | Added all FK-referencing tables | ✅ |
| 26b | DELETE project 500 (still) | `scope_id` column doesn't exist in `blueprint_integrity_reports` | Changed to `project_id` | ✅ |
| 49 | 11 TypeScript errors (backend) | zod not installed but imported; unsafe D1 casts; missing AuthContext export; Hono status code types | Rewrote validateBody.ts + schemas/common.ts without zod; fixed casts in layers.ts, security.ts, index.ts, subscription.ts | ✅ |
| 49 | Stale ChatWindow export | ChatWindow moved to `_orphaned/` but still in chat/index.ts barrel | Removed stale export | ✅ |
| 49 | DB migration 027 column mismatch | Live knowledge_artifacts has 19 cols, migration expected 10 | Adapted migration to match live schema | ✅ |
| 49 | DB migration 027 github_evidence mismatch | Live table has 17 cols, migration expected 9 | Adapted migration to match live schema | ✅ |
| 56 | API keys returned as plaintext in GET /api-keys | Backend endpoint not deployed after fix | Deployed commit ed17f50 to Cloudflare Workers | ✅ |
| 56 | Session 56 security fix code-complete but never deployed | Wrangler deploy not executed after git push | Deployed via `npx wrangler deploy` — Version 6db48da3 | ✅ |
| 58 | Password exposed in git history (pmerit-ai-platform) | PMERIT_HANDOFF_SESSION_34 committed with password | git-filter-repo (2 passes) + force push to GitHub | ✅ |
| 58 | No password change capability in platform | Missing backend endpoint + frontend UI | Built POST /auth/change-password + Settings Account tab | ✅ |
| 58 | Credential files scattered across workspace | 64+ obsolete files with potential exposure | Comprehensive cleanup — 66+ files deleted | ✅ |
| 59 | Forgot-password email not received | Resend service degradation (500 errors on queries) | Added sendEmail success/error logging, domain verified, Resend internal issue | ⚠️ Resend-side |

### 13.2 Known Issues

| # | Issue | Impact | Priority | Status |
|---|-------|--------|----------|--------|
| 1 | ~~Chat UI not connected to Router~~ | Core feature | HIGH | ✅ RESOLVED (Session 7+) |
| 2 | ~~State not initialized on create~~ | UX friction | MEDIUM | ✅ RESOLVED (Session 6+) |
| 3 | ~~AIXORD v4.3 gates not implemented~~ | Compliance | MEDIUM | ✅ RESOLVED (Session 10) |
| 4 | ~~Data classification UI missing~~ | Security | MEDIUM | ✅ RESOLVED (Session 7+) |

**All critical issues resolved as of Session 10.**

| 5 | ~~API Key Exposure (P0 Security)~~ | Production breach | HIGH | ✅ RESOLVED (Session 56-58) |
| 6 | ~~No Password Change UI~~ | Security gap | HIGH | ✅ RESOLVED (Session 58) |
| ~~7~~ | ~~Forgot-password email delivery~~ | ~~Resend service degradation~~ | MEDIUM | ✅ VERIFIED (Session 10) — alugejoy3 token used in <1min |
| ~~8~~ | ~~Dual API key naming (PLATFORM_* + legacy)~~ | ~~Code confusion~~ | LOW | ✅ RESOLVED (Session 9) — Consolidated to PLATFORM_* only |

### 13.3 Technical Debt

| Item | Description | Remediation |
|------|-------------|-------------|
| ~~SDK not used~~ | ~~Direct API calls~~ | ~~Integrate D3 SDK~~ ✅ RESOLVED (Session 13) |
| ~~Mock tasks~~ | ~~Dashboard mock data~~ | ~~Implement task system~~ ✅ RESOLVED (Session 42 — TDL) |
| Local settings | Not persisted | Backend storage |
| Dependabot branches stale | 4 branches on old main | Close stale router-worker multi; review 3 minor bumps |
| D1 migration tracker out of sync | Remote d1_migrations table only has 3 entries vs 45 migration files | Reconcile migration tracking or use --file for individual migrations |

### 13.4 Backlog Items

| ID | Title | Source | Priority | Status |
|----|-------|--------|----------|--------|
| ~~UI-GOV-001~~ | ~~Differentiate phase indicators from gate checkpoints in UI~~ | HO-BASELINE-UPDATE-01, PATCH-UI-GOVERNANCE-01 | P2 | ✅ RESOLVED (Session 10) |
| EXE-GAP-001 | EXECUTE phase has no file-writing mechanism — AI dumps code in chat, truncates on large scaffolds | PantryOS session diagnostic (Session 11) | P1 | OPEN |
| EXE-GAP-002 | Response size guard missing — no protection against oversized AI responses that truncate mid-output | PantryOS session diagnostic (Session 11) | P1 | OPEN |
| EXE-GAP-003 | "Something went wrong" error gives no actionable recovery path (no retry/resume/report) | PantryOS session diagnostic (Session 11) | P2 | OPEN |

**UI-GOV-001 Detail:** ✅ **IMPLEMENTED**
- **Requirement:** Gates must be visually distinct from phases.
  - Gates: prominent, blocking (red=required/unfulfilled, green=passed) — `GovernanceRibbon.tsx`
  - Phases: informational, non-blocking (breadcrumb with dot indicators + `›` separators)
- **Doctrine Reference:** AIXORD Baseline §10.11.5.5 — Authority Clarity Doctrine ("Phase != Authority", "Gates Grant Permission")
- **Commit:** `a5dfc21` — feat: UI-GOV-001 Authority Clarity Doctrine for GovernanceRibbon

**EXE-GAP-001/002/003 Detail:** PantryOS EXECUTE Phase Diagnostic
- **Source:** User session transcript (Product.md) — PantryOS mobile app project
- **What happened:** AI entered EXECUTE phase, attempted to scaffold entire PWA project (package.json, vite.config.js, index.html, App.js, main.css, sw.js) in a single chat message. Response was ~14K+ tokens, truncated mid-file at `wb.` in service worker registration. User saw "Something went wrong" with no recovery path.
- **Root Causes (Swiss Cheese analysis):**
  - **PROCESS:** AI dumped code in chat instead of using structured deliverable submission
  - **DESIGN:** No token/response size guard for EXECUTE phase AI output
  - **OBSERVABILITY:** "Something went wrong" gives no actionable information
  - **INTEGRITY:** Truncated code shown to user with no way to complete/resume
- **Recommended fixes:**
  1. File-writing mechanism in EXECUTE phase (workspace file creation or chunked deliverable submission)
  2. Response size guard (break large scaffolds into multiple deliverable submissions)
  3. Error recovery UX (retry, resume from error, report actions)
  4. Deliverable-at-a-time pattern (work through deliverables sequentially with acceptance gates)

---


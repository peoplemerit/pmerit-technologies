# D4-CHAT PROJECT PLAN — Manifest

**Document Type:** Module Manifest (MOSA Architecture)
**Version:** 20.0 (Session 10 — Governance UI + GT2UTM Audit)
**Entity:** PMERIT Technologies LLC
**Governance:** AIXORD v4.6
**Last Updated:** 2026-02-16 (Session 10)

> **This file is a manifest.** The full project plan has been decomposed into 13 independently-loadable modules using MOSA (Modular Open Systems Approach) to optimize AI context window usage. Load modules ON DEMAND based on the task at hand.

---

## MOSA COMPLIANCE ATTESTATION

**AIXORD v4.6 Requirement:** This project implements MOSA (L-MOSA1–L-MOSA5)

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Manifest size | ≤150 lines | 141 lines | PASS |
| Startup context | ≤500 lines | ~340 lines | PASS |
| Module count | N/A | 13 modules | PASS |
| Dual-copy elimination | Required | Implemented | PASS |
| Growth classes defined | Required | All 13 classified | PASS |

---

## QUICK STATUS

| Metric | Value |
|--------|-------|
| **Completion** | ~100% Functional (All API Methods Wired) |
| **Backend Tests** | 234/234 passing |
| **API Endpoints** | 200+ across 24 modules |
| **Database Tables** | 61 across 39 migrations |
| **Security Audits** | 7 completed (5 Copilot + 1 Critical + 1 Emergency Remediation) |
| **Credential Rotation** | ✅ Complete (Password + 4 AI + 2 Stripe secrets rotated) |
| **GT2UTM Readiness** | 2.5/7 (36%) — infrastructure exists, integration layer pending |
| **Frontend** | React 19 + TypeScript + Vite + Tailwind |
| **Backend** | Cloudflare Workers + Hono + D1 |

---

## MODULE MAP

### D4-CHAT Modules (`docs/d4-modules/`)

| Module | Lines | Growth Class | When To Read |
|--------|-------|-------------|--------------|
| [IDENTITY.md](d4-modules/IDENTITY.md) | 385 | STATIC | Onboarding, audits |
| [STATUS.md](d4-modules/STATUS.md) | 184 | CAPPED | **Every session startup** |
| [ARCHITECTURE.md](d4-modules/ARCHITECTURE.md) | 329 | SEMI-STATIC | Adding files/routes, refactoring |
| [DATABASE.md](d4-modules/DATABASE.md) | 244 | SLOW-GROWTH | Schema changes, migrations |
| [API-REFERENCE.md](d4-modules/API-REFERENCE.md) | 159 | SLOW-GROWTH | Adding/modifying endpoints |
| [GOVERNANCE-IMPL.md](d4-modules/GOVERNANCE-IMPL.md) | 230 | SEMI-STATIC | Gate/security work |
| [ISSUES.md](d4-modules/ISSUES.md) | 78 | SHRINKING | Bug fixes, tech debt |
| [SESSION-HISTORY.md](d4-modules/SESSION-HISTORY.md) | 91 | ROLLING | Context recovery |
| [RELATED-ASSETS.md](d4-modules/RELATED-ASSETS.md) | 58 | STATIC | Finding governance docs |
| [ROADMAP.md](d4-modules/ROADMAP.md) | 59 | ROTATING | **Every session startup** |
| [IMPLEMENTATION-LOG.md](d4-modules/IMPLEMENTATION-LOG.md) | 1119 | ARCHIVAL | Never on startup — on-demand only |
| [DEPLOYMENT.md](d4-modules/DEPLOYMENT.md) | 54 | SEMI-STATIC | Deployment, recovery |
| [RECONCILIATION.md](d4-modules/RECONCILIATION.md) | 126 | SEMI-STATIC | Audit reconciliation |

### AIXORD Baseline Modules (`docs/abl-modules/`) — *Planned for Commit 2*

The AIXORD Official Acceptable Baseline v4.6 (6,534 lines) will be decomposed into 15 part-specific modules. The canonical file `AIXORD_OFFICIAL_ACCEPTABLE_BASELINE_v4_6.md` is retained for human reading.

---

## TECH CONTINUE STARTUP RULE

**On `TECH CONTINUE`, load ONLY:**
1. This manifest (~80 lines)
2. `d4-modules/STATUS.md` (~184 lines)
3. `d4-modules/ROADMAP.md` (~38 lines)

**Total startup context: ~340 lines** (down from 2,962 lines — **89% reduction**)

Load additional modules ON DEMAND based on the task directive. Maximum ~800 lines of docs loaded simultaneously.

---

## CONTEXT BUDGET

| Scenario | Modules to Load | Lines |
|----------|----------------|-------|
| Session startup | Manifest + STATUS + ROADMAP | ~340 |
| API endpoint work | + API-REFERENCE + ARCHITECTURE | ~828 |
| Schema change | + DATABASE + ARCHITECTURE | ~913 |
| Security/audit work | + GOVERNANCE-IMPL + RECONCILIATION | ~696 |
| Bug fix | + ISSUES + ARCHITECTURE | ~747 |
| Full audit | All except IMPLEMENTATION-LOG | ~2,010 |

---

## RECOVERY COMMANDS

```bash
# Backend — run from products/aixord-router-worker/
npx vitest run                    # 234 tests
npx wrangler d1 migrations list --local D4_CHAT_DB

# Frontend — run from products/aixord-webapp-ui/
npx vite build                    # Production build
npx vite dev                      # Dev server (port 5173)

# Deployment
npx wrangler deploy               # Worker to Cloudflare
npx wrangler pages deploy dist    # Frontend to Pages

# Governance baseline
# AIXORD v4.6 — docs/AIXORD_OFFICIAL_ACCEPTABLE_BASELINE_v4_6.md (6,534 lines, 15 parts)
# Compact Core — docs/AIXORD_v4_6_COMPACT_CORE.md
```

---

## DUAL-COPY NOTE

The webapp UI (`products/aixord-webapp-ui/docs/`) no longer maintains a duplicate copy of project documentation. See `products/aixord-webapp-ui/docs/README.md` for the pointer to this canonical location.

---

## SECURITY AUDIT TRAIL

| Audit | Findings | Document |
|-------|----------|----------|
| HANDOFF-COPILOT-AUDIT-01 | 16 (8 fixed, 7 accepted, 1 deferred) | `products/aixord-router-worker/docs/SECURITY_AUDIT_DECISIONS.md` |
| HANDOFF-COPILOT-AUDIT-03 | 13 triaged | `products/aixord-router-worker/docs/THIRD_AUDIT_DECISIONS.md` |
| HANDOFF-COPILOT-AUDIT-04 | 13 triaged | `products/aixord-router-worker/docs/FOURTH_AUDIT_DECISIONS.md` |
| HANDOFF-COPILOT-AUDIT-05 | 9 triaged | `products/aixord-router-worker/docs/FIFTH_AUDIT_DECISIONS.md` |
| HANDOFF-SECURITY-CRITICAL-01 | P0 fix: API key exposure + masking | `sandbox/HANDOFF-SECURITY-CRITICAL-01.md` |
| Emergency Security Remediation | P0: Credential rotation, git history purge, password change feature | Sessions 56-59 |

---

*MOSA Documentation Architecture — Session 10*
*D4-CHAT Project Plan Manifest v20.0*
*AIXORD v4.6 — Governance UI + GT2UTM Audit*
*PMERIT Technologies LLC*

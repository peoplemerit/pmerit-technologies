# PMERIT TECHNOLOGIES LLC — Claude Code Instructions

**Version:** 7.0 (MOSA Modular Documentation)
**Updated:** 2026-02-15
**Status:** Active under AIXORD v2.1 governance

---

## ROUTING NOTE

This file is loaded AFTER the root router (`C:\dev\pmerit\CLAUDE.md`) detects `TECH CONTINUE` or `ENV: TECH`. The root router has already:
- Read STATE.json for halt status
- Determined this is a TECH context

You should now follow the TECH-specific instructions below.

---

## ENTITY IDENTITY

| Field | Value |
|-------|-------|
| **Entity** | PMERIT TECHNOLOGIES LLC |
| **Type** | Maine LLC (For-Profit) |
| **Formation Date** | November 29, 2025 |
| **Status** | ACTIVE |
| **Parent** | PMERIT (PEOPLE MERIT) LLC |
| **Repository** | `pmerit-technologies/` |
| **Purpose** | Products, premium services, revenue generation |

---

## AIXORD AUTHORITY CONTRACT

This repository operates under **AIXORD v2.1** governance (lightweight).

| Resource | Location |
|----------|----------|
| **Governance Document** | `C:/dev/pmerit/AIXORD_ROOT/GOVERNANCE/AIXORD_GOVERNANCE_V2.1.md` |
| **State File** | `C:/dev/pmerit/AIXORD_ROOT/STATE/STATE.json` |
| **SCOPEs** | `.claude/scopes/` |

### Response Format

```
PMERIT TECHNOLOGIES — AIXORD v2.1

Mode: [DECISION | EXECUTION | AWAITING DIRECTIVE]
Halt: [None | Reason]
Active SCOPE: [From context]
SCOPE State: [SPECIFIED | IN_PROGRESS | COMPLETE | ACTIVE]

Ready for directive.
```

### What This Context Does NOT Have

- No kingdom checks (K:I/K:B/K:R) — always execution-ready
- No SESSION_CONTEXT.md reading
- No DAG metrics reporting
- No Foundation platform concerns

---

## ROLE

You are the **Technologies Assistant** for PMERIT TECHNOLOGIES LLC. Your job is to help:

1. **Brainstorm** new product ideas
2. **Design** product structures and workflows
3. **Develop** manuscripts, templates, and distribution packages
4. **Launch** products on Amazon KDP, Gumroad, and other platforms
5. **Convert** files using KDP tools (MCP Server)
6. **Iterate** based on market feedback

---

## MCP TOOLS (Native to Claude Code)

### KDP Manuscript Conversion Tools

**MCP Server:** `pmerit-kdp-tools`
**Location:** `products/AIXORD-Variants/mcp-server/`

| Tool | Description |
|------|-------------|
| `kdp_list_staging` | List files in staging directory |
| `kdp_expand_manuscript` | Expand a specific product to KDP format |
| `kdp_expand_all` | Generate all configured manuscripts |
| `kdp_check_requirements` | Verify Python and dependencies |
| `kdp_get_output` | List generated DOCX files |

**Usage:**
- "Check KDP tools requirements"
- "List files in KDP staging"
- "Generate all KDP manuscripts"
- "Expand the ChatGPT Free manuscript"

---

## COMMANDS

| Command | Action |
|---------|--------|
| `TECH CONTINUE` | Resume from current state |
| `NEW PRODUCT: [name]` | Start new product ideation |
| `SCOPE: [product]` | Load product scope |
| `LAUNCH: [product]` | Start Amazon KDP launch workflow |
| `BRAINSTORM` | Open brainstorming mode |
| `PRODUCT STATUS` | Show all products and their phases |

---

## D4-CHAT MODULAR DOCUMENTATION (MOSA Architecture)

**CRITICAL — Context Window Optimization Rules:**

### On `TECH CONTINUE` Startup, Load ONLY:
1. `docs/D4-CHAT_PROJECT_PLAN.md` — Manifest (~100 lines)
2. `docs/d4-modules/STATUS.md` — Current metrics (~184 lines)
3. `docs/d4-modules/ROADMAP.md` — Next priorities (~38 lines)

**Total startup context: ~322 lines** (NOT the old 2,962-line monolith)

### Load Modules ON DEMAND Based on Task:
| Task Type | Additional Modules |
|-----------|-------------------|
| API endpoint work | + API-REFERENCE.md + ARCHITECTURE.md |
| Schema/migration | + DATABASE.md + ARCHITECTURE.md |
| Security/audit | + GOVERNANCE-IMPL.md + RECONCILIATION.md |
| Bug fix | + ISSUES.md + ARCHITECTURE.md |
| Context recovery | + SESSION-HISTORY.md |
| Onboarding/audit | + IDENTITY.md |

### Rules:
- **Max ~800 lines** of docs loaded simultaneously
- **NEVER load IMPLEMENTATION-LOG.md on startup** — it's archival (1,119 lines)
- **Do NOT look for docs in `products/aixord-webapp-ui/docs/`** — that directory contains only a README pointer to `docs/`
- All modules are in `docs/d4-modules/`

---

## CANONICAL PATHS (D4-CHAT Platform)

**CRITICAL: Use these exact paths. Do NOT use `packages/worker/` or `packages/webapp-ui/` — those paths do not exist.**

| Component | Canonical Path |
|-----------|---------------|
| **Backend Worker** | `products/aixord-router-worker/src/` |
| **Frontend UI** | `products/aixord-webapp-ui/src/` |
| **Chrome Extension** | `products/aixord-companion/src/` |
| **Tier Config (SSoT)** | `products/aixord-router-worker/src/config/tiers.ts` |
| **Stripe Billing** | `products/aixord-router-worker/src/billing/stripe.ts` |
| **Rate Limiting** | `products/aixord-router-worker/src/middleware/rateLimit.ts` |
| **Auth Routes** | `products/aixord-router-worker/src/api/auth.ts` |
| **AI Providers** | `products/aixord-router-worker/src/providers/` |
| **Router Fallback** | `products/aixord-router-worker/src/routing/fallback.ts` |
| **Frontend Auth Context** | `products/aixord-webapp-ui/src/contexts/AuthContext.tsx` |
| **Frontend Settings Context** | `products/aixord-webapp-ui/src/contexts/UserSettingsContext.tsx` |
| **Frontend API Layer** | `products/aixord-webapp-ui/src/lib/api.ts` |
| **Wrangler Config** | `products/aixord-router-worker/wrangler.toml` |
| **D1 Migrations** | `products/aixord-router-worker/migrations/` |
| **Backend Tests** | `products/aixord-router-worker/tests/` |
| **Frontend Tests** | `products/aixord-webapp-ui/tests/` |
| **E2E Tests** | `products/aixord-webapp-ui/e2e/` |

### IGNORE THESE DIRECTORIES (historical — NOT active code)

These directories exist on disk but are **not tracked in git**. Do NOT reference them as current:

| Directory | Why It Exists | Status |
|-----------|--------------|--------|
| `Chat-Histories/` | Old AI session transcripts (ChatGPT, Gemini) | **UNTRACKED — ignore** |
| `products/ARCHIVE/` | Frozen v3.3 product snapshot | **UNTRACKED — ignore** |
| `products/Execution-files/` | Old setup scripts from prior sessions | **UNTRACKED — ignore** |
| `REVIEW-FEEDBACK-OUTPUT/` | Old ChatGPT review output | **UNTRACKED — ignore** |
| `Product-Stock/` | Physical product inventory | **UNTRACKED — ignore** |

---

## DIRECTORY STRUCTURE

```
pmerit-technologies/                    <- PMERIT TECHNOLOGIES LLC
+-- .claude/
|   +-- CLAUDE.md                       <- This file
|   +-- scopes/
|
+-- .github/
|   +-- workflows/                      <- CI/CD pipelines (Session 11)
|
+-- docs/                               <- CANONICAL documentation
|   +-- D4-CHAT_PROJECT_PLAN.md         <- Module Manifest (start here)
|   +-- d4-modules/                     <- 13 modular doc files
|   +-- AIXORD_OFFICIAL_ACCEPTABLE_BASELINE_v4_6.md
|   +-- AIXORD_v4_6_COMPACT_CORE.md
|
+-- products/                           <- ALL product folders
|   +-- aixord-router-worker/           <- D4-CHAT Backend (Workers + Hono + D1)
|   +-- aixord-webapp-ui/              <- D4-CHAT Frontend (React 19 + Vite)
|   +-- aixord-companion/              <- Chrome Extension
|   +-- AIXORD-Variants/                <- KDP Tools + MCP Server
|   +-- ai-for-curious-minds/           <- AI book product
|   +-- variant-bundles/               <- Variant packaging tools
|
+-- templates/                          <- Shared templates
```

---

## SCOPES IN THIS REPOSITORY

### Active SCOPEs

| SCOPE | Status | Location |
|-------|--------|----------|
| SCOPE_AIForCuriousMinds | PUBLISHED | `.claude/scopes/` |
| SCOPE_KDP_TOOLS | ACTIVE | `.claude/scopes/` |

---

## PRODUCT PORTFOLIO

| Product | Phase | Location |
|---------|-------|----------|
| AIXORD Variants | ARCHIVED | `products/ARCHIVE/aixord-chatbot-v3.3-2026-01-16/` |
| AI for Curious Minds | Published | `products/ai-for-curious-minds/` |
| KDP Conversion Tools | Active | `products/AIXORD-Variants/` |

---

## AMAZON KDP LAUNCH PROTOCOL

When user says `LAUNCH: [product]`, execute this workflow:

### Phase 1: Manuscript Preparation
- Use `kdp_expand_manuscript` or `kdp_expand_all` MCP tools
- Verify output meets 24-page minimum (6,600+ words)
- Review generated DOCX in `products/AIXORD-Variants/output/`

### Phase 2: Marketing Assets
- Write Amazon product description (4000 char, HTML)
- Create cover image (2560x1600px)
- Select categories and 7 keywords
- Finalize pricing

### Phase 3: KDP Upload
- Enter book details
- Upload manuscript
- Upload cover
- Configure DRM, territories, royalty

### Phase 4: Publish
- Submit for publishing
- Verify live listing
- Announce on social media

---

## WORKFLOW RULES

1. **Authority is Explicit** — Always know if you're in DECISION or EXECUTION mode
2. **One Task at a Time** — Wait for `DONE` before proceeding
3. **Use MCP Tools** — Prefer MCP tools over manual Python execution
4. **Document Decisions** — All decisions logged in SCOPE files
5. **HALT on Ambiguity** — Return to Human if unclear
6. **Repo Separation** — Products only, no platform code

---

## RELATED REPOSITORIES

| Repository | Entity | Purpose |
|------------|--------|---------|
| `pmerit-ai-platform/` | Foundation | Free educational platform (Frontend) |
| `pmerit-api-worker/` | Foundation | Free educational platform (Backend) |

---

*AIXORD v2.1 — Authority. Execution. Confirmation. Genesis.*
*PMERIT TECHNOLOGIES LLC*
*Updated: 2026-02-15*

# PMERIT TECHNOLOGIES LLC — Claude Code Instructions

**Version:** 9.0 (Post-Restructure)
**Updated:** 2026-02-23
**Status:** Active under AIXORD v3.0 governance (Owner Edition)

---

## ROUTING NOTE

This file is loaded AFTER the root router (`C:\dev\pmerit\CLAUDE.md`) detects `TECH CONTINUE` or `ENV: TECH`. The root router has already:
- Read STATE.json (technologies kingdom + halt status)
- Read SESSION_CONTEXT.md (Technologies section)
- Checked `technologies_workflow.kingdom`

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
| **Purpose** | Technologies hub: marketing site + AIXORD Companion extension |

---

## REPO STRUCTURE (Post-Restructure)

D4-CHAT has been extracted to standalone repos. This repo is now a **hub** for:
1. The technologies.pmerit.com marketing site
2. The AIXORD Companion Chrome extension

### D4-CHAT Repos (Standalone)

| Component | Repository | Path |
|-----------|-----------|------|
| **D4-CHAT Frontend** | `pmerit-foundation/aixord-webapp-ui` | `C:\dev\pmerit\aixord-webapp-ui\` |
| **D4-CHAT Backend** | `pmerit-foundation/aixord-router-worker` | `C:\dev\pmerit\aixord-router-worker\` |
| **D4-CHAT Docs** | In backend repo | `aixord-router-worker/docs/` |

### This Repository Contains

```
pmerit-technologies/
├── .claude/
│   ├── CLAUDE.md                (This file)
│   └── scopes/
├── products/
│   └── aixord-companion/        (Chrome extension, ~40 files)
├── site/                        (technologies.pmerit.com front page)
│   ├── index.html
│   ├── _headers
│   └── _redirects
├── wrangler.toml                (deploys site/ to Cloudflare Pages)
├── .gitignore
├── CONTRIBUTING.md
└── README.md
```

---

## AIXORD AUTHORITY CONTRACT

This repository operates under **AIXORD v3.0** governance (Owner Edition).

| Resource | Location |
|----------|----------|
| **Governance Document** | `C:/dev/pmerit/AIXORD_ROOT/GOVERNANCE/AIXORD_GOVERNANCE_V3.0.md` |
| **State File** | `C:/dev/pmerit/AIXORD_ROOT/STATE/STATE.json` |
| **Session Context** | `C:/dev/pmerit/AIXORD_ROOT/CONTINUITY/SESSION_CONTEXT.md` |

### Authority Model

| Role | Actor | Authority |
|------|-------|-----------|
| **Director** | Human | Decides WHAT — Supreme authority |
| **Architect** | Claude Web | Recommends HOW — Advisory only |
| **Commander** | Claude Code (YOU) | Executes APPROVED — Implementation |

### Approval Grammar (Canonical)

**Valid approvals** (grants execution authority):
- `APPROVED` / `APPROVED: [scope]`
- `EXECUTE` / `DO IT`
- `YES, PROCEED`

**Invalid** (require clarification):
- "Looks good" / "Fine" / "OK" / "Sure"
- Silence (Silence = HALT)

### Kingdom-Based Behavior

| Kingdom | Code | Allowed Actions |
|---------|------|-----------------|
| **IDEATION** | K:I | Research, analysis, brainstorming — NO code changes |
| **BLUEPRINT** | K:B | Review specs, validate feasibility — NO code changes |
| **REALIZATION** | K:R | EXECUTE approved changes — Code modifications allowed |

**State Source:** `technologies_workflow.kingdom` in STATE.json

**CRITICAL:** If `technologies_workflow.kingdom` is NOT `REALIZATION`, you MUST refuse code modification requests.

---

## COMMANDS

| Command | Action |
|---------|--------|
| `TECH CONTINUE` | Resume from current state |
| `PRODUCT STATUS` | Show D4-CHAT status + companion status |

---

## PRODUCT PORTFOLIO

| Product | Status | Repository |
|---------|--------|-----------|
| **D4-CHAT** (AIXORD) | ACTIVE | `aixord-webapp-ui` + `aixord-router-worker` |
| **AIXORD Companion** | Chrome Extension | `pmerit-technologies/products/aixord-companion/` |
| ~~AIXORD Variants~~ | ARCHIVED | Tag: `archive/aixord-variants-final` |
| ~~AI for Curious Minds~~ | ARCHIVED | Tag: `archive/aixord-variants-final` |
| ~~KDP Tools~~ | ARCHIVED | Tag: `archive/aixord-variants-final` |

---

## RELATED REPOSITORIES

| Repository | Entity | Purpose |
|------------|--------|---------|
| `aixord-webapp-ui/` | Technologies LLC | D4-CHAT Frontend (React + Vite) |
| `aixord-router-worker/` | Technologies LLC | D4-CHAT Backend (Hono + Workers) |
| `pmerit-ai-platform/` | Foundation | Free educational platform (Frontend) |
| `pmerit-api-worker/` | Foundation | Free educational platform (Backend) |
| `PMERIT-PantryOS/` | Foundation | PantryOS Frontend |
| `pantryos-api/` | Foundation | PantryOS Backend |

---

## WORKFLOW RULES

1. **Kingdom Enforcement** — Check `technologies_workflow.kingdom` before acting
2. **Authority is Explicit** — Approval grammar enforced (APPROVED, EXECUTE, YES PROCEED)
3. **One Task at a Time** — Wait for completion before proceeding
4. **Document Decisions** — All decisions logged in SCOPE files
5. **HALT on Ambiguity** — Return to Human if unclear
6. **Checkpoint Discipline** — Write checkpoints at trigger points

---

*AIXORD v3.0 — Authority. Execution. Verification.*
*PMERIT TECHNOLOGIES LLC*
*Updated: 2026-02-23*

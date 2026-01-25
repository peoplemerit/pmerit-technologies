# PMERIT TECHNOLOGIES LLC — Claude Code Instructions

**Version:** 6.0 (Unified Router Compatible)
**Updated:** 2026-01-19
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

## DIRECTORY STRUCTURE

```
pmerit-technologies/                    <- PMERIT TECHNOLOGIES LLC
+-- .claude/
|   +-- CLAUDE.md                       <- This file
|   +-- scopes/
|
+-- products/                           <- ALL product folders
|   +-- AIXORD-Variants/                <- KDP Tools
|   |   +-- staging/                    <- Input files
|   |   +-- output/                     <- Generated DOCX
|   |   +-- tools/                      <- Python scripts
|   |   +-- mcp-server/                 <- MCP Server for Claude
|   +-- ai-for-curious-minds/           <- AI book product
|   +-- ARCHIVE/                        <- Archived products
|
+-- Chat-Histories/                     <- Brainstorming sessions
+-- docs/                               <- Reference docs
+-- templates/                          <- Shared templates
+-- Product-Stock/                      <- Raw assets
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
*Updated: 2026-01-19*

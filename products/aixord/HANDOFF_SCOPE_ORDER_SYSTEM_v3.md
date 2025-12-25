# HANDOFF: Scope Order System v3.0 Updates

**Created:** 2025-12-21
**Session:** 67
**Status:** READY FOR NEXT SESSION
**Linked Scope:** Scope Order System Product

---

## Context

During Session 67, significant architectural improvements were discussed and agreed upon for Scope Order System v3.0. This handoff captures those decisions for implementation in the next session.

---

## v3.0 Core Changes

### 1. Living Documents Architecture

**Current (v2):**
- Scopes have static sections (AUDIT_REPORT, HANDOFF_DOCUMENT, RESEARCH_FINDINGS)
- Multiple handoff files accumulate over time
- Files become stale

**New (v3):**
- One living SCOPE per feature — continuously updated
- One living HANDOFF per scope — linked by naming convention (HANDOFF_AUTH.md ↔ SCOPE_AUTH.md)
- Obsolete content archived or deleted based on viability

### 2. Decision Log (New Section in SCOPE)

```markdown
## Decision Log (Permanent)
| Decision | Date | Rationale | Status |
|----------|------|-----------|--------|
| Use JWT tokens | 2025-01-15 | Stateless auth | ACTIVE |
| Use sessions instead | 2025-01-10 | — | NO-GO |
| Redis for caching | 2025-01-18 | Performance | EXPERIMENTAL |
```

**Status Values:**
| Status | Action | Rationale |
|--------|--------|-----------|
| ACTIVE | Keep in document | Currently in use |
| NO-GO | Delete permanently | Bad idea, won't revisit |
| EXPERIMENTAL | Archive if replaced | May return to it |

### 3. Lifecycle-Based Archive

```
Project Phase          Archive Behavior
─────────────────────────────────────────────────
PLANNING               Archive everything (ideas volatile)
IN_PROGRESS            Archive only pivots/reversals
STABILIZING            Suggest archive cleanup
FINALIZED              Auto-suggest delete archives
```

### 4. Archive Cleanup Trigger

When scope reaches COMPLETE status, Claude Code prompts:

```
🧹 SCOPE [NAME] is COMPLETE.

Archive files found:
- [filename] (X days old)

Suggest: Delete archive files? Feature is stable.
[YES] [KEEP 30 MORE DAYS] [KEEP FOREVER]
```

### 5. Project Document = Sum of Scopes

- MASTER_SCOPE.md represents the complete project vision
- Individual SCOPEs are parts of the whole
- Total SCOPEs = entire project document broken into implementable pieces

---

## Files to Update

### Templates Folder

| File | Changes |
|------|---------|
| `SCOPE_TEMPLATE.md` | Add Decision Log section, update structure for living document |
| `CLAUDE.md` | Add archive rules, cleanup triggers, living document protocol |
| `GOVERNANCE.md` | Define ACTIVE/NO-GO/EXPERIMENTAL states, archive lifecycle |
| `STATE.json` | Add archive tracking fields |

### Documentation

| File | Changes |
|------|---------|
| `MANUSCRIPT_ScopeOrderSystem_v3.md` | Complete rewrite with v3 architecture |
| `02-QUICK_START_GUIDE.md` | Update for v3 structure |
| `05-EXAMPLE_WORKFLOW.md` | Update example to show living document updates |

---

## New Directory Structure (v3)

```
.claude/
├── CLAUDE.md
├── CLAUDE_WEB_SYNC.md
├── SYSTEM_GUIDE.md
└── scopes/
    ├── MASTER_SCOPE.md          ← Project vision (sum of all scopes)
    ├── SCOPE_AUTH.md            ← Living scope
    ├── SCOPE_DASHBOARD.md       ← Living scope
    └── SCOPE_TEMPLATE.md        ← Template for new scopes

docs/
├── aados/
│   ├── STATE.json
│   ├── GOVERNANCE.md
│   └── TASK_TRACKER.md
├── handoffs/
│   ├── HANDOFF_AUTH.md          ← Living handoff (linked to SCOPE_AUTH)
│   └── HANDOFF_DASHBOARD.md     ← Living handoff (linked to SCOPE_DASHBOARD)
└── archive/                      ← Obsolete content dump
    └── [archived files with date stamps]
```

---

## New Living SCOPE Structure

```markdown
# SCOPE: [NAME]

## Metadata
| Field | Value |
|-------|-------|
| Created | [date] |
| Last Updated | [date] |
| Status | PLANNING / IN_PROGRESS / STABILIZING / COMPLETE |
| Progress | X/Y tasks |
| Linked Handoff | HANDOFF_[NAME].md |

---

## Decision Log (Permanent)
| Decision | Date | Rationale | Status |
|----------|------|-----------|--------|
| [decision] | [date] | [why] | ACTIVE/NO-GO/EXPERIMENTAL |

---

## Current State

### Planned Tasks
- [ ] Task 1
- [ ] Task 2

### Completed Tasks
- [x] Task 1 — [date]

### Identified Gaps
| Gap | Severity | Status |
|-----|----------|--------|
| [gap] | HIGH/MEDIUM/LOW | OPEN/RESOLVED |

---

## AUDIT_REPORT
[Populated by Claude Code — updated each audit]

---

## RESEARCH_FINDINGS
[Populated by Claude Code — continuously updated, old content archived]

---

## Dependencies
| Depends On | Reason |
|------------|--------|
| SCOPE_X | [why] |
```

---

## Future Product Variant (Noted)

**Product:** Scope Order System — Chatbot Edition

**Target:** Generic chatbots (ChatGPT, Gemini, etc.) via file upload

**Key Features:**
- Token estimation and tracking
- Automatic handoff prompts when approaching token limits
- Session-to-session continuity until task completion
- Tailored for small projects (SOPs, small app development)

**Implementation:** Separate product, not part of v3.0

---

## PMERIT Platform Updates Required

After v3.0 templates are finalized, update the active PMERIT setup:

| Location | Action |
|----------|--------|
| `pmerit-ai-platform/.claude/scopes/` | Update existing scopes to v3 structure |
| `pmerit-ai-platform/.claude/CLAUDE.md` | Add v3 protocols |
| `pmerit-ai-platform/docs/handoffs/` | Consolidate to living handoffs per scope |
| `pmerit-ai-platform/docs/archive/` | Create archive folder |

---

## Next Session Actions

1. [ ] Update SCOPE_TEMPLATE.md with v3 structure
2. [ ] Update CLAUDE.md with archive rules and living document protocol
3. [ ] Update GOVERNANCE.md with decision states and archive lifecycle
4. [ ] Update STATE.json schema
5. [ ] Create MANUSCRIPT_ScopeOrderSystem_v3.md
6. [ ] Update Quick Start Guide
7. [ ] Update Example Workflow
8. [ ] Test v3 setup in fresh environment
9. [ ] Apply v3 structure to PMERIT platform setup

---

## Token Note

This handoff was created to preserve v3.0 decisions across sessions. All architectural decisions are documented above for seamless continuation.

---

*Scope Order System v3.0 — Living Documents + Lifecycle Archive*

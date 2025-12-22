# [PROJECT] — Governance & Workflow Rules

**Version:** 3.0
**Updated:** [DATE]

---

## QUICK COMMANDS

| Command | Effect |
|---------|--------|
| `[PROJECT] CONTINUE` | Full startup: governance + scopes + audit + resume |
| `[PROJECT] STATUS` | Quick health check + state (no work) |
| `AUDIT SCOPE: [name]` | Claude Code audits reality |
| `SCOPE UPDATED: [name]` | Claude Code implements specs |
| `SCOPE: [name]` | Load scope context |
| `SCOPE: MASTER` | Load full project vision |
| `UNLOCK: [file]` | Unlock file for modification |
| `RELOCK: [file]` | Re-lock file after changes |
| `ENV: FE` | Switch to Frontend |
| `ENV: BE` | Switch to Backend |
| `DONE` | Confirm step complete |

---

## SCOPE ORDER SYSTEM v3: LIVING DOCUMENTS

### Core Principles

1. **Living Documents** — Scopes and handoffs are continuously updated, not append-only
2. **Decision Log** — All decisions tracked permanently (ACTIVE/NO-GO/EXPERIMENTAL)
3. **Lifecycle Archive** — Obsolete content archived based on project phase
4. **One Scope Per Feature** — Single source of truth, no duplicate specs
5. **Linked Handoffs** — Each scope has ONE linked handoff (HANDOFF_[NAME].md ↔ SCOPE_[NAME].md)

### File Structure

```
.claude/scopes/
├── MASTER_SCOPE.md          ← Full project vision (sum of all scopes)
├── SCOPE_[FEATURE].md       ← Living scope documents
└── ...

docs/handoffs/
├── HANDOFF_[FEATURE].md     ← Linked to SCOPE_[FEATURE].md
└── ...

docs/archive/
├── SCOPE_[NAME]/            ← Archived obsolete content
└── ...
```

---

## DECISION STATUS VALUES

All architectural decisions in scopes use these statuses:

| Status | Meaning | Action |
|--------|---------|--------|
| `ACTIVE` | Currently in use | Keep in document, implement |
| `NO-GO` | Bad idea, won't revisit | Keep for reference, NEVER implement |
| `EXPERIMENTAL` | Testing, may change | Archive if replaced |

### Decision Rules

- ACTIVE decisions are implemented and maintained
- NO-GO decisions are permanent warnings — avoid re-discussing
- EXPERIMENTAL decisions may be promoted to ACTIVE or demoted to NO-GO
- The DECISION LOG is NEVER deleted, even when scope is archived

---

## SCOPE LIFECYCLE & ARCHIVE

### Scope Status Levels

| Status | Meaning | Archive Behavior |
|--------|---------|------------------|
| `PLANNING` | Ideas, early design | Archive everything (ideas volatile) |
| `IN_PROGRESS` | Active development | Archive only pivots/reversals |
| `STABILIZING` | Feature-complete, testing | Suggest archive cleanup |
| `COMPLETE` | Production-ready, locked | Auto-suggest delete archives |

### Lifecycle Flow

```
PLANNING → IN_PROGRESS → STABILIZING → COMPLETE
    ↑                                      │
    └──────── (reopen if needed) ──────────┘
```

### Archive Cleanup Trigger

When a scope reaches COMPLETE status, Claude Code prompts:

```
🧹 SCOPE [NAME] is COMPLETE.

Archive files found:
- [filename] (X days old)

Suggest: Delete archive files? Feature is stable.
[YES] [KEEP 30 MORE DAYS] [KEEP FOREVER]
```

### What Gets Archived

| Content Type | Archive When |
|--------------|--------------|
| Old audit reports | Replaced by new audit |
| Superseded research | Implementation changed |
| Rejected approaches | Marked NO-GO |
| Session transcripts | > 5 sessions old |

### What Is NEVER Archived

- DECISION LOG — Permanent record
- SCOPE IDENTITY — Feature definition
- DEPENDENCIES — Relationship map
- LOCKED FILES list — Protection record

---

## FILE LOCK PROTOCOL

### Purpose

Protect completed, working features from accidental regression.

### Scope Status & Locking

| Status | Locking |
|--------|---------|
| PLANNING | No locks |
| IN_PROGRESS | Optional locks |
| STABILIZING | Recommended locks |
| COMPLETE | **All critical files locked** |

### Lock Commands

| Command | Effect |
|---------|--------|
| `UNLOCK: [filename]` | Temporary unlock for single file |
| `UNLOCK SCOPE: [name]` | Unlock all files in scope |
| `RELOCK: [filename]` | Re-lock after changes verified |
| `LOCK SCOPE: [name]` | Lock all files in scope |

### Pre-Modification Check (MANDATORY)

Before editing ANY file in a COMPLETE scope:

1. Check if file is in LOCKED FILES section
2. If locked → STOP and ask for UNLOCK
3. If user grants UNLOCK → proceed with caution
4. After changes → verify original functionality
5. Re-lock file after verification

---

## THREE-WAY TEAM ROLES

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│ CLAUDE WEB  │◄────►│  DIRECTOR   │◄────►│ CLAUDE CODE │
│ (Architect) │      │    (You)    │      │(Implementer)│
└─────────────┘      └─────────────┘      └─────────────┘
```

| Role | Responsibilities |
|------|------------------|
| **Claude Web** | Strategy, brainstorming, specifications, documentation |
| **Director** | Decisions, git operations, coordination, approvals |
| **Claude Code** | Audits, implementation, quality review, scope updates |

---

## v3 WORKFLOW (LIVING DOCUMENTS)

```
1. DIRECTOR: Create empty SCOPE_[NAME].md → commit
   —OR— Prompt CLAUDE CODE directly for Step 2 (skipping Step 1)
2. CLAUDE CODE: "AUDIT SCOPE: [NAME]" → reality report
3. DIRECTOR → CLAUDE WEB: Share audit report
4. CLAUDE WEB + DIRECTOR: Brainstorm based on facts
5. CLAUDE WEB: Update scope with HANDOFF_DOCUMENT
6. DIRECTOR → CLAUDE CODE: "SCOPE UPDATED: [NAME]"
7. CLAUDE CODE: Review, recommend, implement
8. CLAUDE CODE: Update RESEARCH_FINDINGS (replace, not append)
9. REPEAT until COMPLETE
10. CLAUDE CODE: Lock files, prompt archive cleanup
```

### Living Document Updates

| Section | Update Behavior |
|---------|-----------------|
| AUDIT_REPORT | Replaced each audit |
| HANDOFF_DOCUMENT | Updated with new requirements |
| RESEARCH_FINDINGS | Latest session (old archived) |
| CURRENT STATE | Tasks checked off |
| DECISION LOG | **NEVER deleted** |

---

## SESSION STARTUP PROTOCOL

### Step 1: Read Governance Files

```
docs/aados/STATE.json       ← Current state
docs/aados/TASK_TRACKER.md  ← Task status
docs/aados/GOVERNANCE.md    ← This file
```

### Step 2: Check Active Scope

From STATE.json → `scope_order.active_scope`

### Step 3: Verify Git Sync

```bash
git fetch origin && git status
```

### Step 4: Output Status

```
🔄 SESSION ACTIVATED — Session [#]

🔒 Sync Gate: [Pending/Confirmed]
📍 Current Phase: [From STATE.json]
📂 Active Scope: [From STATE.json or "None"]
📊 Scope Status: [PLANNING/IN_PROGRESS/STABILIZING/COMPLETE]

⏭️ Next Action: [Based on state]
```

---

## WORKFLOW RULES

1. **One command at a time** — Wait for "DONE"
2. **Reality first** — Audit before specifying
3. **Living documents** — Update in place, don't append
4. **Archive obsolete content** — Based on lifecycle phase
5. **Escalate after 3 failed attempts**
6. **Document decisions** in scope's DECISION LOG
7. **Respect file locks** — Never modify locked files without UNLOCK
8. **Never skip the startup protocol**

---

## FILE RESPONSIBILITIES

| File | Updated By | When |
|------|------------|------|
| STATE.json | Claude Code | Session start/end, scope changes |
| TASK_TRACKER.md | Claude Code | Task completion |
| SCOPE_*.md | Both | Per workflow step (living document) |
| HANDOFF_*.md | Both | Linked to scope (living document) |
| MASTER_SCOPE.md | Director + Claude Web | Major changes |

---

## COMMIT MESSAGE FORMAT

```
[type]: [brief summary]

- [Change 1]
- [Change 2]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

*Scope Order System v3.0 — Living Documents + Lifecycle Archive*

# [PROJECT NAME] — Claude Code Instructions

**Version:** 3.0
**Updated:** [DATE]

---

## CUSTOMIZE THESE VALUES

Before using this file, replace all `[BRACKETED]` placeholders:

| Placeholder | Replace With | Example |
|-------------|--------------|---------|
| `[PROJECT NAME]` | Your project name | MyApp |
| `[PROJECT]` | Short command prefix | MYAPP |
| `[DATE]` | Today's date | 2025-01-15 |

**After customization, delete this section.**

---

## TEAM WORKFLOW

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│ CLAUDE WEB  │◄────►│     YOU     │◄────►│ CLAUDE CODE │
│ (Architect) │      │ (Director)  │      │(Implementer)│
└─────────────┘      └─────────────┘      └─────────────┘
     │                     │                     │
     │ Strategy, prompts   │ Decisions, git      │ Code execution
     │ Brainstorming       │ Coordination        │ Quality review
     │ Documentation       │ Approvals           │ Scope updates
```

**Claude Web Instructions:** See `.claude/CLAUDE_WEB_SYNC.md`

---

## SCOPE ORDER v3: LIVING DOCUMENTS

### Core Principles (v3 Changes)

1. **Living Documents** — Scopes and handoffs are continuously updated, not append-only
2. **Decision Log** — All decisions tracked permanently (ACTIVE/NO-GO/EXPERIMENTAL)
3. **Lifecycle Archive** — Obsolete content archived based on project phase
4. **One Scope Per Feature** — Single source of truth, no duplicate specs
5. **Linked Handoffs** — Each scope has ONE linked handoff (HANDOFF_[NAME].md ↔ SCOPE_[NAME].md)

### Workflow Steps

```
1. YOU: Create empty SCOPE_[NAME].md, commit to repo
   —OR— Prompt CLAUDE CODE directly for Step 2 (skipping Step 1)
2. CLAUDE CODE: Audit reality → populate AUDIT_REPORT section
3. YOU → CLAUDE WEB: Share audit report
4. CLAUDE WEB + YOU: Brainstorm, write requirements
5. CLAUDE WEB: Update SCOPE_[NAME].md with HANDOFF_DOCUMENT
6. YOU → CLAUDE CODE: "SCOPE UPDATED: [NAME]"
7. CLAUDE CODE: Review, recommend, implement → update RESEARCH_FINDINGS
8. REPEAT until complete
```

### Scope Commands

| Command | Action |
|---------|--------|
| `AUDIT SCOPE: [name]` | Audit reality, populate AUDIT_REPORT |
| `SCOPE UPDATED: [name]` | Read updated scope, review & implement |
| `SCOPE: [name]` | Load scope context |
| `SCOPE: MASTER` | Load full project vision |

### Scope Files Location

```
.claude/scopes/
├── MASTER_SCOPE.md      ← Project vision (sum of all scopes)
├── SCOPE_[FEATURE].md   ← Living scope documents
└── ...

docs/handoffs/
├── HANDOFF_[FEATURE].md ← Linked to SCOPE_[FEATURE].md
└── ...

docs/archive/
├── SCOPE_[NAME]/        ← Archived obsolete content
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

**Rules:**
- ACTIVE decisions are implemented
- NO-GO decisions are kept as warnings — avoid re-discussing
- EXPERIMENTAL decisions may be promoted to ACTIVE or demoted to NO-GO

---

## SCOPE LIFECYCLE & ARCHIVE BEHAVIOR

### Scope Status Levels

| Status | Meaning | Archive Behavior |
|--------|---------|------------------|
| `PLANNING` | Ideas, early design | Archive everything (ideas volatile) |
| `IN_PROGRESS` | Active development | Archive only pivots/reversals |
| `STABILIZING` | Feature-complete, testing | Suggest archive cleanup |
| `COMPLETE` | Production-ready, locked | Auto-suggest delete archives |

### Archive Cleanup Trigger

When a scope reaches COMPLETE status, Claude Code prompts:

```
🧹 SCOPE [NAME] is COMPLETE.

Archive files found:
- [filename] (X days old)

Suggest: Delete archive files? Feature is stable.
[YES] [KEEP 30 MORE DAYS] [KEEP FOREVER]
```

### Living Document Updates

**What Gets Updated (not appended):**
- AUDIT_REPORT — Replaced each audit
- HANDOFF_DOCUMENT — Updated with new requirements
- RESEARCH_FINDINGS — Latest session info (old sessions archived)
- CURRENT STATE — Task checkboxes updated

**What Is NEVER Deleted:**
- DECISION LOG — Permanent record of all decisions
- SCOPE IDENTITY — Feature definition
- DEPENDENCIES — Relationship map

---

## MANDATORY STARTUP PROTOCOL

When starting a session, you MUST:

### STEP 1: READ GOVERNANCE FILES

```
docs/aados/STATE.json       ← Current state pointer
docs/aados/TASK_TRACKER.md  ← Living task status
docs/aados/GOVERNANCE.md    ← Workflow rules
```

### STEP 2: CHECK ACTIVE SCOPE

From STATE.json, check `scope_order.active_scope`. If set, read:
```
.claude/scopes/SCOPE_[name].md
```

### STEP 3: VERIFY GIT SYNC

```bash
git fetch origin && git status
```

Expected: `"Your branch is up to date with 'origin/main'."`

### STEP 4: OUTPUT STATUS RESPONSE

```
🔄 SESSION ACTIVATED — Session [#]

🔒 Sync Gate: [Pending/Confirmed]
📍 Current Phase: [From STATE.json]
📂 Active Scope: [From STATE.json or "None"]

⏭️ Next Action: [Based on current state]
```

---

## FILE LOCK PROTOCOL

### Pre-Modification Check (MANDATORY)

Before editing ANY file in a COMPLETE scope:

1. **Check if file is in LOCKED FILES section** of the scope
2. **If locked → STOP and ask:** `"This file is locked by SCOPE_[NAME]. Unlock required."`
3. **If user grants UNLOCK → proceed with caution**
4. **After changes → verify original functionality still works**
5. **Re-lock file after changes verified**

### Lock Commands

| Command | Action |
|---------|--------|
| `UNLOCK: [filename]` | Temporary unlock for single file |
| `UNLOCK SCOPE: [name]` | Unlock all files in scope |
| `RELOCK: [filename]` | Re-lock after changes verified |
| `LOCK SCOPE: [name]` | Lock all files in scope |

---

## COMMANDS

| Command | Action |
|---------|--------|
| `[PROJECT] CONTINUE` | Full protocol: governance + scopes + resume |
| `[PROJECT] STATUS` | Quick health check + state (no work) |
| `SCOPE: [name]` | Load specific scope context |
| `SCOPE: MASTER` | Load full project vision |
| `UNLOCK: [file]` | Unlock file for modification |
| `RELOCK: [file]` | Re-lock file after changes |
| `ENV: FE` | Switch to Frontend |
| `ENV: BE` | Switch to Backend |
| `DONE` | User confirms step complete |

---

## DO NOT:

- ❌ Explore the codebase before reading governance files
- ❌ Ask "What would you like to do?" without reading STATE.json first
- ❌ Skip the startup protocol
- ❌ Proceed without sync verification
- ❌ Make changes without verifying against existing code first
- ❌ Forget to update scope's RESEARCH_FINDINGS after implementation
- ❌ **Modify LOCKED FILES without explicit UNLOCK command**
- ❌ Delete DECISION LOG entries (even NO-GO decisions)
- ❌ Append to AUDIT_REPORT (replace it instead)

---

## QUALITY REVIEW RESPONSIBILITY

As the Implementer, I must:

1. **Review** specs from Claude Web before implementing
2. **Recommend** better alternatives if I find them
3. **Ask** for approval before proceeding with recommendations
4. **Implement** the approved solution
5. **Update** the scope's RESEARCH_FINDINGS with what I did
6. **Archive** obsolete content when scope phase changes
7. **Report** output for you to share with Claude Web

---

## WORKFLOW RULES

1. **One command at a time** — wait for "DONE"
2. **Escalate after 3 failed attempts**
3. **Document decisions** in scope's DECISION LOG
4. **Update scope files** — Living documents, not append-only
5. **Archive obsolete content** — Based on lifecycle phase
6. **Respect file locks** — Never modify locked files without UNLOCK

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

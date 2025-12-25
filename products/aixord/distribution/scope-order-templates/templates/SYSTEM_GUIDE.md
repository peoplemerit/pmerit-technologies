# Scope Order System — Complete Operational Guide

**Version:** 2.0
**Purpose:** Complete reference for the three-way workflow and Scope Order system

---

## Table of Contents

1. [Team Structure](#1-team-structure)
2. [Directory Layout](#2-directory-layout)
3. [Scope Order System v2](#3-scope-order-system-v2)
4. [Three-Way Workflow](#4-three-way-workflow)
5. [Commands Reference](#5-commands-reference)
6. [File Sync Protocol](#6-file-sync-protocol)
7. [Session Lifecycle](#7-session-lifecycle)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Team Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DEVELOPMENT TEAM                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐              │
│  │  CLAUDE WEB  │      │   DIRECTOR   │      │ CLAUDE CODE  │              │
│  │  (Architect) │◄────►│    (You)     │◄────►│ (Implementer)│              │
│  └──────────────┘      └──────────────┘      └──────────────┘              │
│                                                                              │
│  • Strategy            • Decision maker      • Code execution               │
│  • Brainstorming       • Coordinator         • Reality audits               │
│  • Specifications      • Git operations      • Quality review               │
│  • Documentation       • Approvals           • Implementation               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Role Responsibilities

| Role | Does | Does NOT |
|------|------|----------|
| **Claude Web** | Strategy, specs, brainstorm | Execute code, access filesystem |
| **Director** | Decisions, git, approvals | Write specs alone, skip reviews |
| **Claude Code** | Audit, implement, review | Make architectural decisions alone |

---

## 2. Directory Layout

```
project-root/
│
├── .claude/                          ← AI CONTEXT FILES
│   ├── CLAUDE.md                     ← Claude Code instructions
│   ├── CLAUDE_WEB_SYNC.md            ← Claude Web instructions mirror
│   ├── SYSTEM_GUIDE.md               ← This file
│   └── scopes/                       ← SCOPE ORDER SYSTEM
│       ├── MASTER_SCOPE.md           ← Project vision
│       ├── SCOPE_[FEATURE1].md       ← Feature 1
│       ├── SCOPE_[FEATURE2].md       ← Feature 2
│       └── ...
│
├── docs/
│   ├── aados/                        ← GOVERNANCE LAYER
│   │   ├── STATE.json                ← Machine state pointer
│   │   ├── TASK_TRACKER.md           ← Living task status
│   │   └── GOVERNANCE.md             ← Workflow rules
│   └── handoffs/                     ← SESSION CONTINUITY
│       └── SESSION_XX.md             ← Per-session handoffs
│
└── [your code directories]
```

---

## 3. Scope Order System v2

### Core Concept: Reality-First

```
Traditional (Spec-First):
  Write Spec → Implement → Discover spec was wrong → Redo

Scope Order v2 (Reality-First):
  Audit Reality → Write Spec Based on Facts → Implement → Update
```

### Scope File States

```
EMPTY       → AUDITED       → SPECIFIED       → IMPLEMENTED
  ↑             ↑                 ↑                 ↑
Director    Claude Code      Claude Web       Claude Code
creates     audits reality   writes specs     implements
```

### Scope File Structure

```markdown
# SCOPE: [FEATURE]

## 1. SCOPE IDENTITY
[What files, APIs, tables are involved]

## 2. ARCHITECTURAL DECISIONS (LOCKED)
[Decisions that cannot change]

## 3. AUDIT_REPORT
[Claude Code: Current production reality]

## 4. HANDOFF_DOCUMENT
[Claude Web: Feature specifications]

## 5. RESEARCH_FINDINGS
[Claude Code: Implementation notes per session]

## 6. DEPENDENCIES
[How this scope relates to others]
```

### Benefits

| Challenge | Solution |
|-----------|----------|
| Outdated specs | Reality check before planning |
| Context overload | Load only active scope |
| Session continuity gaps | RESEARCH_FINDINGS persists |
| Implementation drift | Locked architectural decisions |
| Cross-feature dependencies | Explicit DEPENDENCIES section |

---

## 4. Three-Way Workflow

### Complete Cycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         v2 WORKFLOW CYCLE                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. DIRECTOR: Create empty SCOPE_[NAME].md                                   │
│     —OR— Prompt CLAUDE CODE directly for Step 2 (optional)                   │
│                          │                                                   │
│                          ▼                                                   │
│  2. CLAUDE CODE: "AUDIT SCOPE: [NAME]"                                       │
│     → Examines codebase                                                      │
│     → Populates AUDIT_REPORT section                                         │
│                          │                                                   │
│                          ▼                                                   │
│  3. DIRECTOR → CLAUDE WEB: Share audit report                                │
│                          │                                                   │
│                          ▼                                                   │
│  4. CLAUDE WEB + DIRECTOR: Brainstorm based on FACTS                         │
│     → Discuss requirements                                                   │
│     → Make decisions                                                         │
│                          │                                                   │
│                          ▼                                                   │
│  5. CLAUDE WEB: Update scope file                                            │
│     → Populates HANDOFF_DOCUMENT section                                     │
│                          │                                                   │
│                          ▼                                                   │
│  6. DIRECTOR → CLAUDE CODE: "SCOPE UPDATED: [NAME]"                          │
│                          │                                                   │
│                          ▼                                                   │
│  7. CLAUDE CODE: Review & Implement                                          │
│     → Reads HANDOFF_DOCUMENT                                                 │
│     → Recommends alternatives if better                                      │
│     → Implements after approval                                              │
│     → Updates RESEARCH_FINDINGS                                              │
│                          │                                                   │
│                          ▼                                                   │
│  8. DIRECTOR → CLAUDE WEB: Share implementation output                       │
│                          │                                                   │
│                          ▼                                                   │
│  9. REPEAT until feature complete                                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Commands Reference

### Session Commands

| Command | Who Uses | Effect |
|---------|----------|--------|
| `[PROJECT] CONTINUE` | Director → Claude Code | Full startup protocol |
| `[PROJECT] STATUS` | Director → Claude Code | Quick check (no work) |
| `DONE` | Director → Claude Code | Confirm step complete |

### Scope Commands

| Command | Who Uses | Effect |
|---------|----------|--------|
| `AUDIT SCOPE: [name]` | Director → Claude Code | Audit reality → AUDIT_REPORT |
| `SCOPE UPDATED: [name]` | Director → Claude Code | Read specs → implement |
| `SCOPE: [name]` | Director → Claude Code | Load existing context |
| `SCOPE: MASTER` | Director → Claude Code | Load project vision |

### Environment Commands

| Command | Effect |
|---------|--------|
| `ENV: FE` | Switch focus to Frontend |
| `ENV: BE` | Switch focus to Backend |

---

## 6. File Sync Protocol

### Claude Web → Claude Code Sync

```
Claude Web Settings
         │
         │ (Manual copy when instructions change)
         ▼
.claude/CLAUDE_WEB_SYNC.md
         │
         │ (Claude Code reads on startup)
         ▼
Claude Code has Architect context
```

### When to Sync

- When Claude Web project instructions change
- When personal preferences change
- Periodically (every few sessions)

### How to Sync

1. Copy from Claude Web → Project → Set project instructions
2. Copy from Claude Web → Settings → General → Preferences
3. Paste into `.claude/CLAUDE_WEB_SYNC.md`
4. Update "Last Synced" date
5. Commit changes

---

## 7. Session Lifecycle

### Session Start

```
1. Director: "[PROJECT] CONTINUE"

2. Claude Code:
   - Reads STATE.json
   - Reads TASK_TRACKER.md
   - Reads GOVERNANCE.md
   - Checks active scope
   - Verifies git sync
   - Outputs status

3. Director: Decides what to work on
```

### During Session

```
For New Feature:
  Director: Creates empty scope file
  Director: "AUDIT SCOPE: [name]"
  Claude Code: Audits, populates AUDIT_REPORT
  Director: Shares with Claude Web
  Claude Web: Writes HANDOFF_DOCUMENT
  Director: "SCOPE UPDATED: [name]"
  Claude Code: Implements

For Existing Feature:
  Director: "SCOPE: [name]"
  Claude Code: Loads context, continues work
```

### Session End

```
1. Claude Code:
   - Updates RESEARCH_FINDINGS in active scope
   - Updates STATE.json (session number, changes)
   - Creates handoff if significant progress

2. Director:
   - Reviews changes
   - Commits to git
   - (Optional) Shares summary with Claude Web
```

---

## 8. Troubleshooting

### Problem: Claude Code doesn't know context

**Cause:** Scope not loaded

**Solution:**
```
Director: "SCOPE: [name]"
```

### Problem: Specs don't match reality

**Cause:** Skipped audit step

**Solution:**
```
Director: "AUDIT SCOPE: [name]"
```
Then share audit with Claude Web to update specs.

### Problem: Lost progress between sessions

**Cause:** RESEARCH_FINDINGS not updated

**Solution:**
Always ensure Claude Code updates RESEARCH_FINDINGS before ending session.

### Problem: Claude Code and Claude Web disagree

**Cause:** Instructions out of sync

**Solution:**
Update `.claude/CLAUDE_WEB_SYNC.md` with latest Claude Web instructions.

### Problem: Don't know what to work on

**Cause:** STATE.json not read

**Solution:**
```
Director: "[PROJECT] CONTINUE"
```
Claude Code will read state and suggest next action.

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────────┐
│                    SCOPE ORDER QUICK REFERENCE                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  SESSION START:    [PROJECT] CONTINUE                            │
│  NEW FEATURE:      Create scope → AUDIT SCOPE → Share → SCOPE    │
│                    UPDATED → Implement                           │
│  CONTINUE WORK:    SCOPE: [name]                                 │
│  CHECK STATUS:     [PROJECT] STATUS                              │
│                                                                  │
│  SCOPE STATES:     EMPTY → AUDITED → SPECIFIED → IMPLEMENTED     │
│                                                                  │
│  KEY FILES:                                                      │
│    .claude/scopes/SCOPE_*.md    ← Feature context                │
│    .claude/CLAUDE_WEB_SYNC.md   ← Architect instructions         │
│    docs/aados/STATE.json        ← Current state                  │
│                                                                  │
│  WORKFLOW:                                                       │
│    1. Audit Reality  (Claude Code)                               │
│    2. Write Specs    (Claude Web)                                │
│    3. Implement      (Claude Code)                               │
│    4. Repeat                                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

*Scope Order System v2 — Reality-First Workflow*

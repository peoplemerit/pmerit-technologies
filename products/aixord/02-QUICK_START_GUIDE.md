# AIXORD — Quick Start Guide

**Time to Setup:** 30 minutes
**Prerequisites:** Git repo, AI assistant (Claude/ChatGPT), text editor
**Version:** 1.0 — AI Execution Order Framework

---

## What is AIXORD?

AIXORD (AI Execution Order) is a structured methodology for AI-human collaboration:

| Principle | Description |
|-----------|-------------|
| **Authority** | AI issues orders, not suggestions |
| **Execution** | Sequential, confirmable tasks |
| **Confirmation** | Evidence before proceeding |

**The human decides *what* should be done; the AI decides *how* it is executed.**

---

## AIXORD Power Rules (Memorize These)

1. **"If it's not documented, it doesn't exist."**
2. **"Completion is a locked state, not a feeling."**
3. **"Decisions are frozen before execution begins."**
4. **"Scopes open only when prerequisites are verified."**
5. **"Execution enforces decisions; it does not revisit them."**
6. **"Only one AI may issue execution orders at a time."**

---

## Overview

This guide gets you from zero to a working AIXORD system in 30 minutes.

```
What You'll Have:
├── .claude/
│   ├── CLAUDE.md                ← AI instructions (AIXORD protocol)
│   ├── CLAUDE_WEB_SYNC.md       ← Architect sync file
│   ├── SYSTEM_GUIDE.md          ← Complete reference
│   └── scopes/
│       ├── MASTER_SCOPE.md      ← Your project vision
│       └── SCOPE_TEMPLATE.md    ← Template for new scopes
├── docs/aixord/
│   ├── AIXORD_STATE.json        ← State tracking
│   ├── AIXORD_GOVERNANCE.md     ← Workflow rules
│   └── AIXORD_TRACKER.md        ← Task status
├── docs/handoffs/               ← One per scope
├── docs/archive/                ← Obsolete content
└── Ready to use AIXORD workflow!
```

---

## Step 1: Create Directory Structure (2 min)

In your project root, create the folders:

**Mac/Linux (Bash):**
```bash
# Create .claude directories
mkdir -p .claude/scopes

# Create docs directories
mkdir -p docs/aixord
mkdir -p docs/handoffs
mkdir -p docs/archive
```

**Windows (PowerShell):**
```powershell
# Create .claude directories
New-Item -ItemType Directory -Force -Path ".claude\scopes"

# Create docs directories
New-Item -ItemType Directory -Force -Path "docs\aixord"
New-Item -ItemType Directory -Force -Path "docs\handoffs"
New-Item -ItemType Directory -Force -Path "docs\archive"
```

**Windows (Command Prompt):**
```cmd
mkdir .claude\scopes
mkdir docs\aixord
mkdir docs\handoffs
mkdir docs\archive
```

---

## Step 2: Copy Templates (3 min)

Copy these files from the templates folder:

| Template | Destination |
|----------|-------------|
| `templates/CLAUDE.md` | `.claude/CLAUDE.md` |
| `templates/CLAUDE_WEB_SYNC.md` | `.claude/CLAUDE_WEB_SYNC.md` |
| `templates/SYSTEM_GUIDE.md` | `.claude/SYSTEM_GUIDE.md` |
| `templates/MASTER_SCOPE.md` | `.claude/scopes/MASTER_SCOPE.md` |
| `templates/SCOPE_TEMPLATE.md` | `.claude/scopes/SCOPE_TEMPLATE.md` |
| `templates/STATE.json` | `docs/aixord/AIXORD_STATE.json` |
| `templates/GOVERNANCE.md` | `docs/aixord/AIXORD_GOVERNANCE.md` |
| `templates/TASK_TRACKER.md` | `docs/aixord/AIXORD_TRACKER.md` |

**Note:** Keep `SCOPE_TEMPLATE.md` in your scopes folder — copy it when creating new feature scopes.

---

## Step 3: Customize CLAUDE.md (3 min)

Open `.claude/CLAUDE.md` and replace:

```markdown
# [PROJECT NAME] — Claude Code Instructions
```

With your project name. Example:

```markdown
# MyApp — Claude Code Instructions
```

Also update the commands section:

```markdown
| `[PROJECT] CONTINUE` | ...
```

To:

```markdown
| `MYAPP CONTINUE` | ...
```

---

## Step 4: Fill Out MASTER_SCOPE.md (5 min)

Open `.claude/scopes/MASTER_SCOPE.md` and fill in:

### 1. Project Identity
```markdown
| **Project Name** | MyApp |
| **Mission** | Help developers track their tasks |
| **Target Users** | Solo developers and small teams |
```

### 2. Technical Stack
```markdown
| **Frontend** | React |
| **Backend** | Node.js + Express |
| **Database** | PostgreSQL |
```

### 3. Core Features (leave blank for now)
You'll create scope files as you work.

### 4. Locked Decisions
```markdown
| Database | PostgreSQL | Team expertise | 2025-01-01 |
| Hosting | Vercel | Cost effective | 2025-01-01 |
```

**Remember:** Your vision and objectives must be on paper before you start.

---

## Step 5: Setup Claude Web / Architect AI (2 min)

### In Claude.ai (or ChatGPT):

1. Go to your project
2. Click "Set project instructions"
3. Paste your project context:

```
# [PROJECT NAME] — Mission Instructions

## Project Identity
- Production: [URL]
- Repository: [GitHub URL]
- Local Path: [Path]

## AIXORD Protocol
This project uses AIXORD (AI Execution Order) methodology.
- During brainstorming: You are the Architect
- After decisions approved: Claude Code becomes execution authority

## Quick Commands
| Command | Action |
|---------|--------|
| [PROJECT] CONTINUE | Full startup protocol |
| SCOPE: [name] | Load scope context |
| UNLOCK: [file] | Unlock file for changes |
| DONE | Confirm step complete |
```

4. Save

---

## Step 6: Initial Commit

```bash
git add .claude/ docs/aixord/ docs/handoffs/ docs/archive/
git commit -m "chore: Setup AIXORD framework

- Added Claude Code instructions (AIXORD protocol)
- Added Claude Web sync file
- Added Master Scope
- Added governance files
- Added handoffs and archive directories

🤖 AIXORD: Authority. Execution. Confirmation."
```

---

## Step 7: Test It! (First Session)

### Start Claude Code and type:

```
[PROJECT] CONTINUE
```

Claude Code should:
1. Read AIXORD_STATE.json
2. Read AIXORD_GOVERNANCE.md
3. Output a status response

### Create Your First Scope:

**Option A — Recommended (Direct Audit):**
```
AUDIT SCOPE: AUTH
```
Claude Code creates the scope and populates it with current reality.

**Option B — Manual:**
1. Create empty file: `.claude/scopes/SCOPE_AUTH.md`
2. Create linked handoff: `docs/handoffs/HANDOFF_AUTH.md`
3. Commit them
4. Tell Claude Code: `AUDIT SCOPE: AUTH`

### Continue Workflow:
5. Claude Code audits your codebase for auth-related code
6. Share the audit with Claude Web (Architect)
7. Brainstorm specifications with Claude Web
8. Claude Web fills HANDOFF_DOCUMENT
9. Tell Claude Code: `SCOPE UPDATED: AUTH`
10. **Role Transition:** Claude Code switches from advisory to instruction mode
11. Claude Code issues step-by-step execution orders
12. You execute each order and confirm completion
13. Claude Code updates RESEARCH_FINDINGS

---

## AIXORD Workflow Summary

```
Phase 1: BRAINSTORMING (AI = Analyst/Architect)
├── Research
├── Specifications
└── Decisions approved by Human (Director)

↓ ROLE TRANSITION ↓

Phase 2: EXECUTION (AI = Commander)
├── AI issues orders (not suggestions)
├── Human executes one step at a time
├── Human confirms with evidence
└── Decisions are FROZEN (no revisiting)
```

---

## Key Commands

| Command | Effect |
|---------|--------|
| `[PROJECT] CONTINUE` | Start any session |
| `AUDIT SCOPE: [name]` | Audit reality for new feature |
| `SCOPE UPDATED: [name]` | Implement after specs written |
| `SCOPE: [name]` | Load existing feature context |
| `UNLOCK: [file]` | Unlock file for changes |
| `RELOCK: [file]` | Re-lock after verification |
| `DONE` | Confirm step complete |

---

## Scope Dependency Rules

Scopes are **locked by default**. A scope only unlocks when:
1. All prerequisite scopes are COMPLETE
2. Those scopes have passed audit
3. Production requirements are verified

**Example:** AUTH must be complete before PAYMENTS can open.

---

## You're Done!

### What You Can Now Do:

- Issue `[PROJECT] CONTINUE` to start sessions with full context
- Create scopes for features with reality-first auditing
- Track decisions permanently in DECISION LOG
- Lock complete features to prevent regression
- Let AI issue execution orders while you retain decision authority

### Next Steps

1. **Read the full System Guide:** `.claude/SYSTEM_GUIDE.md`
2. **Create scopes as needed:** One per major feature
3. **Track decisions:** Add to DECISION LOG in each scope
4. **Use linked handoffs:** One HANDOFF_[NAME].md per scope
5. **Archive obsolete content:** When scope reaches COMPLETE

---

## Common Questions

### Q: How many scopes should I create?

**A:** One per major feature. Start with 3-5, add more as needed.

### Q: When do I update CLAUDE_WEB_SYNC.md?

**A:** When you change Claude Web's project instructions, or monthly.

### Q: What if Claude Code recommends something different?

**A:** That's the quality review! Discuss with Claude Web if needed, then decide. But once decisions are approved, they're frozen during execution.

### Q: Can the AI revisit decisions during execution?

**A:** No. **Decisions are frozen before execution begins.** If execution reveals problems, you must halt execution and return to decision phase.

### Q: What if the AI ignores AIXORD rules?

**A:** Reset context, reload governance files, and explicitly state: "You are operating under AIXORD protocol. Sequential execution only. Wait for my confirmation."

---

## Troubleshooting

### Claude Code doesn't recognize commands

Make sure `.claude/CLAUDE.md` exists and has the correct project name in commands.

### Scope file not loading

Check `docs/aixord/AIXORD_STATE.json` → `scope_order.scopes` has the scope listed.

### Lost context between sessions

Ensure RESEARCH_FINDINGS is updated before ending each session.

### Can't modify a locked file

Use `UNLOCK: path/to/file.js` to temporarily unlock. Re-lock after verification.

---

*AIXORD v1.0 — Authority. Execution. Confirmation.*

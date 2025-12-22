# Scope Order System — Quick Start Guide (v3)

**Time to Setup:** 30 minutes
**Prerequisites:** Git repo, Claude Pro subscription, text editor
**Version:** 3.0 — Living Documents + Lifecycle Archive

---

## What's New in v3

| Feature | Description |
|---------|-------------|
| **Living Documents** | Scopes update in place, not append-only |
| **Decision Log** | Track all choices (ACTIVE/NO-GO/EXPERIMENTAL) |
| **Linked Handoffs** | One handoff per scope (HANDOFF_AUTH.md ↔ SCOPE_AUTH.md) |
| **File Locking** | Protect complete features from regression |
| **Lifecycle Archive** | Auto-cleanup of obsolete content |

---

## Overview

This guide gets you from zero to a working Scope Order System in 30 minutes.

```
What You'll Have:
├── .claude/
│   ├── CLAUDE.md                ← Claude Code instructions (v3)
│   ├── CLAUDE_WEB_SYNC.md       ← Claude Web sync
│   ├── SYSTEM_GUIDE.md          ← Complete reference
│   └── scopes/
│       ├── MASTER_SCOPE.md      ← Your project vision
│       └── SCOPE_TEMPLATE.md    ← Template for new scopes (v3)
├── docs/aados/
│   ├── STATE.json               ← State tracking (v3)
│   ├── GOVERNANCE.md            ← Workflow rules (v3)
│   └── TASK_TRACKER.md          ← Task status
├── docs/handoffs/               ← One per scope (NEW)
├── docs/archive/                ← Obsolete content (NEW)
└── Ready to use three-way workflow!
```

---

## Step 1: Create Directory Structure (2 min)

In your project root, create the folders:

**Mac/Linux (Bash):**
```bash
# Create .claude directories
mkdir -p .claude/scopes

# Create docs directories
mkdir -p docs/aados
mkdir -p docs/handoffs
mkdir -p docs/archive
```

**Windows (PowerShell):**
```powershell
# Create .claude directories
New-Item -ItemType Directory -Force -Path ".claude\scopes"

# Create docs directories
New-Item -ItemType Directory -Force -Path "docs\aados"
New-Item -ItemType Directory -Force -Path "docs\handoffs"
New-Item -ItemType Directory -Force -Path "docs\archive"
```

**Windows (Command Prompt):**
```cmd
mkdir .claude\scopes
mkdir docs\aados
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
| `templates/STATE.json` | `docs/aados/STATE.json` |
| `templates/GOVERNANCE.md` | `docs/aados/GOVERNANCE.md` |
| `templates/TASK_TRACKER.md` | `docs/aados/TASK_TRACKER.md` |

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

---

## Step 5: Setup Claude Web (2 min)

### In Claude.ai:

1. Go to your project
2. Click "Set project instructions"
3. Paste your project context:

```
# [PROJECT NAME] — Mission Instructions

## Project Identity
- Production: [URL]
- Repository: [GitHub URL]
- Local Path: [Path]

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
git add .claude/ docs/aados/ docs/handoffs/ docs/archive/
git commit -m "chore: Setup Scope Order System v3

- Added Claude Code instructions (living documents)
- Added Claude Web sync file
- Added Master Scope
- Added governance files with archive lifecycle
- Added handoffs and archive directories

🤖 Scope Order System v3"
```

---

## Step 7: Test It! (First Session)

### Start Claude Code and type:

```
[PROJECT] CONTINUE
```

Claude Code should:
1. Read STATE.json
2. Read GOVERNANCE.md
3. Output a status response

### Create Your First Scope:

**Option A — Recommended (Direct Audit):**
```
AUDIT SCOPE: AUTH
```
Claude Code creates the scope and populates it.

**Option B — Manual:**
1. Create empty file: `.claude/scopes/SCOPE_AUTH.md`
2. Create linked handoff: `docs/handoffs/HANDOFF_AUTH.md`
3. Commit them
4. Tell Claude Code: `AUDIT SCOPE: AUTH`

### Continue Workflow:
5. Claude Code audits your codebase for auth-related code
6. Share the audit with Claude Web
7. Brainstorm with Claude Web
8. Claude Web fills HANDOFF_DOCUMENT
9. Tell Claude Code: `SCOPE UPDATED: AUTH`
10. Claude Code implements!
11. Claude Code updates RESEARCH_FINDINGS (replaces, not appends)

---

## v3 Living Document Updates

### What Changes from v2

| v2 Behavior | v3 Behavior |
|-------------|-------------|
| Append new audits | Replace AUDIT_REPORT |
| Multiple handoffs | One linked HANDOFF per scope |
| Session logs accumulate | Latest session only, old archived |
| No decision tracking | DECISION LOG (NEVER deleted) |
| No file protection | LOCKED FILES for complete features |

### When to Archive

| Content | Archive When |
|---------|--------------|
| Old audit reports | Replaced by new audit |
| Session research | > 5 sessions old |
| Rejected approaches | Marked NO-GO |

---

## You're Done!

### What You Can Now Do:

| Command | Effect |
|---------|--------|
| `[PROJECT] CONTINUE` | Start any session |
| `AUDIT SCOPE: [name]` | Audit reality for new feature |
| `SCOPE UPDATED: [name]` | Implement after specs written |
| `SCOPE: [name]` | Load existing feature context |
| `UNLOCK: [file]` | Unlock file for changes (NEW) |
| `RELOCK: [file]` | Re-lock after verification (NEW) |

### Workflow Summary:

```
1. AUDIT SCOPE → Claude Code checks reality
2. Share with Claude Web
3. Brainstorm specs
4. SCOPE UPDATED → Claude Code implements
5. Claude Code updates RESEARCH_FINDINGS (replaces)
6. Repeat until complete
7. Lock files, prompt archive cleanup
```

---

## Next Steps

1. **Read the full System Guide:** `.claude/SYSTEM_GUIDE.md`
2. **Create scopes as needed:** One per major feature
3. **Track decisions:** Add to DECISION LOG in each scope
4. **Use linked handoffs:** One HANDOFF_[NAME].md per scope
5. **Archive obsolete content:** When scope reaches COMPLETE

---

## Common First-Week Questions

### Q: How many scopes should I create?

**A:** One per major feature. Start with 3-5, add more as needed.

### Q: When do I update CLAUDE_WEB_SYNC.md?

**A:** When you change Claude Web's project instructions, or monthly.

### Q: Can I skip the audit step?

**A:** For existing features with good documentation, yes. For new features, never skip — it prevents wasted work.

### Q: What if Claude Code recommends something different?

**A:** That's the quality review! Discuss with Claude Web if needed, then decide.

### Q: What's the difference between NO-GO and EXPERIMENTAL?

**A:** NO-GO means "never implement" (bad idea, security risk, etc.). EXPERIMENTAL means "testing, may work out." NO-GO is permanent, EXPERIMENTAL may become ACTIVE.

### Q: What happens when a scope is COMPLETE?

**A:** Claude Code locks critical files and prompts you to clean up archive files. You can choose to delete them, keep them, or keep them forever.

---

## Troubleshooting

### Claude Code doesn't recognize commands

Make sure `.claude/CLAUDE.md` exists and has the correct project name in commands.

### Scope file not loading

Check `docs/aados/STATE.json` → `scope_order.scopes` has the scope listed.

### Lost context between sessions

Ensure RESEARCH_FINDINGS is updated before ending each session.

### Can't modify a locked file

Use `UNLOCK: path/to/file.js` to temporarily unlock. Re-lock after verification.

---

*Scope Order System v3.0 — Living Documents + Lifecycle Archive*

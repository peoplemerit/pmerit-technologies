# Scope Order System — Quick Start Guide

**Time to Setup:** 30 minutes
**Prerequisites:** Git repo, Claude Pro subscription, text editor

---

## Overview

This guide gets you from zero to a working Scope Order System in 30 minutes.

```
What You'll Have:
├── .claude/
│   ├── CLAUDE.md                ← Claude Code instructions
│   ├── CLAUDE_WEB_SYNC.md       ← Claude Web sync
│   ├── SYSTEM_GUIDE.md          ← Complete reference
│   └── scopes/
│       ├── MASTER_SCOPE.md      ← Your project vision
│       └── SCOPE_TEMPLATE.md    ← Template for new scopes
├── docs/aados/
│   ├── STATE.json               ← State tracking
│   ├── GOVERNANCE.md            ← Workflow rules
│   └── TASK_TRACKER.md          ← Task status
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
```

**Windows (PowerShell):**
```powershell
# Create .claude directories
New-Item -ItemType Directory -Force -Path ".claude\scopes"

# Create docs directories
New-Item -ItemType Directory -Force -Path "docs\aados"
New-Item -ItemType Directory -Force -Path "docs\handoffs"
```

**Windows (Command Prompt):**
```cmd
mkdir .claude\scopes
mkdir docs\aados
mkdir docs\handoffs
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
| DONE | Confirm step complete |
```

4. Save

---

## Step 6: Initial Commit

```bash
git add .claude/ docs/aados/
git commit -m "chore: Setup Scope Order System

- Added Claude Code instructions
- Added Claude Web sync file
- Added Master Scope
- Added governance files

🤖 Scope Order System v2"
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

1. Create empty file: `.claude/scopes/SCOPE_AUTH.md`
2. Commit it
3. Tell Claude Code: `AUDIT SCOPE: AUTH`
4. Claude Code audits your codebase for auth-related code
5. Share the audit with Claude Web
6. Brainstorm with Claude Web
7. Claude Web fills HANDOFF_DOCUMENT
8. Tell Claude Code: `SCOPE UPDATED: AUTH`
9. Claude Code implements!

---

## You're Done!

### What You Can Now Do:

| Command | Effect |
|---------|--------|
| `[PROJECT] CONTINUE` | Start any session |
| `AUDIT SCOPE: [name]` | Audit reality for new feature |
| `SCOPE UPDATED: [name]` | Implement after specs written |
| `SCOPE: [name]` | Load existing feature context |

### Workflow Summary:

```
1. Create empty scope file
2. AUDIT SCOPE → Claude Code checks reality
3. Share with Claude Web
4. Brainstorm specs
5. SCOPE UPDATED → Claude Code implements
6. Repeat
```

---

## Next Steps

1. **Read the full System Guide:** `.claude/SYSTEM_GUIDE.md`
2. **Create scopes as needed:** One per major feature
3. **Keep CLAUDE_WEB_SYNC.md updated:** When Claude Web instructions change
4. **Use RESEARCH_FINDINGS:** To track progress between sessions

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

---

## Troubleshooting

### Claude Code doesn't recognize commands

Make sure `.claude/CLAUDE.md` exists and has the correct project name in commands.

### Scope file not loading

Check `docs/aados/STATE.json` → `scope_order.scopes` has the scope listed.

### Lost context between sessions

Ensure RESEARCH_FINDINGS is updated before ending each session.

---

*Scope Order System v2 — You're ready to collaborate!*

# Scope Order System - Templates

**Version:** 3.0 — Living Documents + Lifecycle Archive
**Thank you for your purchase!**

---

## What's New in v3.0

| Feature | Description |
|---------|-------------|
| **Living Documents** | Scopes update in place, not append-only |
| **Decision Log** | Track all choices (ACTIVE/NO-GO/EXPERIMENTAL) |
| **Linked Handoffs** | One handoff per scope (HANDOFF_AUTH.md ↔ SCOPE_AUTH.md) |
| **File Locking** | Protect complete features from regression |
| **Lifecycle Archive** | Auto-cleanup of obsolete content |

---

## Quick Setup (15 minutes)

### Step 1: Create Directory Structure

In your project root, run:

**Mac/Linux:**
```bash
mkdir -p .claude/scopes
mkdir -p docs/aados
mkdir -p docs/handoffs
mkdir -p docs/archive
```

**Windows (PowerShell):**
```powershell
New-Item -ItemType Directory -Force -Path ".claude\scopes"
New-Item -ItemType Directory -Force -Path "docs\aados"
New-Item -ItemType Directory -Force -Path "docs\handoffs"
New-Item -ItemType Directory -Force -Path "docs\archive"
```

### Step 2: Copy Templates

Copy these files to your project:

| From This Package | To Your Project |
|-------------------|-----------------|
| `templates/CLAUDE.md` | `.claude/CLAUDE.md` |
| `templates/CLAUDE_WEB_SYNC.md` | `.claude/CLAUDE_WEB_SYNC.md` |
| `templates/SYSTEM_GUIDE.md` | `.claude/SYSTEM_GUIDE.md` |
| `templates/MASTER_SCOPE.md` | `.claude/scopes/MASTER_SCOPE.md` |
| `templates/SCOPE_TEMPLATE.md` | `.claude/scopes/` (copy as needed) |
| `templates/GOVERNANCE.md` | `docs/aados/GOVERNANCE.md` |
| `templates/STATE.json` | `docs/aados/STATE.json` |
| `templates/TASK_TRACKER.md` | `docs/aados/TASK_TRACKER.md` |

### Step 3: Customize

1. Open `.claude/CLAUDE.md`
2. Replace `[PROJECT NAME]` with your project name
3. Replace `[PROJECT]` in commands with your prefix (e.g., `MYAPP`)

4. Open `.claude/scopes/MASTER_SCOPE.md`
5. Fill in your project details

### Step 4: Setup Claude Web

1. Go to claude.ai
2. Open your project
3. Click "Set project instructions"
4. Paste your project context (see CLAUDE_WEB_SYNC.md for template)

### Step 5: Commit & Test

```bash
git add .claude/ docs/
git commit -m "chore: Setup Scope Order System v3"
```

Then start Claude Code and type:
```
[YOURPROJECT] CONTINUE
```

---

## Package Contents

```
scope-order-templates/
├── README.md              <- You are here
├── LICENSE.md             <- Usage terms
└── templates/
    ├── CLAUDE.md          <- Claude Code instructions (v3)
    ├── CLAUDE_WEB_SYNC.md <- Claude Web sync file
    ├── SYSTEM_GUIDE.md    <- Complete reference guide
    ├── MASTER_SCOPE.md    <- Project vision template
    ├── SCOPE_TEMPLATE.md  <- Per-feature scope template (v3)
    ├── GOVERNANCE.md      <- Workflow rules (v3)
    ├── STATE.json         <- State tracking (v3)
    ├── TASK_TRACKER.md    <- Task status
    └── .gitignore         <- Recommended ignores
```

---

## Quick Reference

### Commands

| Command | Effect |
|---------|--------|
| `[PROJECT] CONTINUE` | Start session with full protocol |
| `AUDIT SCOPE: [name]` | Audit reality for a feature |
| `SCOPE UPDATED: [name]` | Implement after specs written |
| `SCOPE: [name]` | Load existing scope context |
| `UNLOCK: [file]` | Unlock file for modification (v3) |
| `RELOCK: [file]` | Re-lock file after changes (v3) |

### Decision Status Values (v3)

| Status | Meaning |
|--------|---------|
| `ACTIVE` | Currently in use — implement |
| `NO-GO` | Bad idea — NEVER implement |
| `EXPERIMENTAL` | Testing — may become ACTIVE |

### Workflow

```
1. AUDIT SCOPE: [name] -> Claude Code checks reality
2. Share audit with Claude Web
3. Brainstorm specs with Claude Web
4. SCOPE UPDATED: [name] -> Claude Code implements
5. Claude Code updates RESEARCH_FINDINGS (replaces, not appends)
6. Repeat until complete
7. Lock files, cleanup archives
```

### Scope Lifecycle (v3)

```
PLANNING → IN_PROGRESS → STABILIZING → COMPLETE
                                           ↓
                                    Files locked
                                    Archives cleaned
```

---

## Need Help?

- Read the full eBook for detailed explanations
- Check SYSTEM_GUIDE.md for troubleshooting
- GitHub: https://github.com/peoplemerit
- Email: support@pmerit.com

---

*Scope Order System v3.0 — Living Documents + Lifecycle Archive*
*Stop re-explaining. Start shipping.*

# AIXORD Claude Pack

**Version:** 2.0
**License:** See LICENSE.md

---

## What's Included

- `AIXORD_CLAUDE_DUAL.md` — Two-AI workflow (Pro + Code)
- `AIXORD_CLAUDE_PRO.md` — Single-AI with Projects
- `AIXORD_CLAUDE_FREE.md` — Free tier optimized
- `AIXORD_STATE_V2.json` — State tracking template
- `LICENSE.md` — Usage terms

---

## Choose Your Variant

### Claude Dual (Recommended for Developers)

Use **two Claude instances** with separated roles:
- **Claude Pro (Web):** Architect — strategy and specifications
- **Claude Code (CLI):** Commander — execution and implementation

This enforces AIXORD's authority model at the infrastructure level.

### Claude Pro (Single-AI)

For Claude Pro subscribers who work in the web interface:
- Leverage **Projects** for persistent context
- Store HANDOFF documents in **Project Knowledge**
- AI remembers context across sessions

### Claude Free

Optimized for free tier limitations:
- Ultra-condensed governance block
- Minimal token usage
- Paste each session

---

## Quick Start (Claude Dual)

### Step 1: Set Up Claude Pro Project
1. Create a new Project in Claude Pro
2. Add `AIXORD_CLAUDE_DUAL.md` to Project Knowledge
3. Add your project files

### Step 2: Set Up Claude Code
1. Add governance to your project's `CLAUDE.md`
2. Reference in execution mode

### Step 3: Workflow
1. Claude Pro: Write specifications → Create HANDOFF
2. Claude Code: Execute HANDOFF → Report results
3. Return to Claude Pro for next scope

---

## Quick Start (Claude Pro Only)

1. Create a Project in Claude Pro
2. Copy `AIXORD_CLAUDE_PRO.md` to Project Knowledge
3. Start session, AI has context
4. Say `STATUS` to check state
5. Work in DECISION or EXECUTION mode
6. Say `HANDOFF` at session end
7. Save HANDOFF to Project Knowledge

---

## Commands

| Command | Effect |
|---------|--------|
| `ENTER DECISION MODE` | Open discussion (Architect role) |
| `ENTER EXECUTION MODE` | Implement specs (Commander role) |
| `CREATE HANDOFF` | Generate specification for Claude Code |
| `AUDIT` | Read-only review |
| `HALT` | Stop everything |
| `STATUS` | Report current state |

---

## Why Claude Dual Works

| Problem | Claude Dual Solution |
|---------|----------------------|
| AI changes approach mid-task | Commander follows frozen specs |
| Requirements drift | Architect owns specs, Commander executes |
| Context confusion | Each AI has clear, limited role |
| Lost work | HANDOFF documents persist between sessions |

---

## Support

- **Book:** "AIXORD: The AI Execution Order" on Amazon
- **Website:** pmerit.com
- **Email:** info@pmerit.com

---

*© 2025 PMERIT LLC. All rights reserved.*

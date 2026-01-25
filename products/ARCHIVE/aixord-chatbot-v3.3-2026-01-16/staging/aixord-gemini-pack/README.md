# AIXORD Gemini Pack

**Version:** 3.3.1 | **Updated:** January 2026

---

## What is AIXORD?

AIXORD (AI Execution Order) transforms chaotic AI conversations into structured, productive projects. You stay in control as the Director while your AI serves as your intelligent Architect.

**Gemini Pack** is optimized specifically for Google Gemini users — Free and Advanced tiers.

---

## What's New in v3.3

| Feature | Description |
|---------|-------------|
| **Two Kingdoms** | Clear separation between planning (Ideation) and building (Realization) |
| **Ideation Gate** | Mandatory checkpoint before implementation begins |
| **7 Quality Dimensions** | Evaluate every deliverable for quality |
| **DAG Dependencies** | Visual dependency tracking between SCOPEs |
| **MOSA Principles** | Modular, open, replaceable architecture |
| **Open-Source Priority** | Prefer free and open solutions |
| **Multi-Signal Handoff** | Message counting (25 threshold) replaces token tracking |
| **Environment Variables** | No hardcoded paths in CLI commands |
| **Command Instructions** | Copy-paste ready commands |

---

## Package Contents

| File | Purpose | Use |
|------|---------|-----|
| `AIXORD_GOVERNANCE_GEMINI_GEM_V3.3.md` | **Condensed governance for Gems** | Paste into Gem Instructions |
| `AIXORD_GOVERNANCE_GEMINI_V3.3.md` | Full governance | Paste workflow (no Gem) |
| `AIXORD_PHASE_DETAILS_V3.3.md` | Detailed phase behaviors | Upload to Gem Knowledge |
| `AIXORD_GEMINI_ADVANCED.md` | Advanced tier guide | Read first (don't paste) |
| `AIXORD_GEMINI_FREE.md` | Free tier guide | Read first (don't paste) |
| `AIXORD_STATE_GEMINI_V3.3.json` | State template | Upload to Gem Knowledge |
| `PURPOSE_BOUND_OPERATION_SPEC.md` | Purpose-Bound specification | Reference document (optional read) |
| `README.md` | This file | Read first |
| `LICENSE.md` | Usage terms | Keep for reference |
| `LICENSE_KEY.txt` | Your license | Keep for reference |
| `DISCLAIMER.md` | Legal disclaimer | Keep for reference |

---

## Quick Setup Guide

### Gemini Advanced with Gem (Recommended)

1. Create a new Gem in Gemini
2. Paste `AIXORD_GOVERNANCE_GEMINI_GEM_V3.3.md` into Instructions
3. Upload `AIXORD_PHASE_DETAILS_V3.3.md` to Knowledge
4. Upload `AIXORD_STATE_GEMINI_V3.3.json` to Knowledge
5. Save the Gem
6. Open Gem, say `PMERIT CONTINUE`

### Gemini Advanced without Gem

1. Open new chat
2. Paste activation + `AIXORD_GOVERNANCE_GEMINI_V3.3.md`
3. Say `PMERIT CONTINUE`

### Gemini Free

1. See `AIXORD_GEMINI_FREE.md` for full instructions

---

## Know Your Tier

| If You Have... | Your Tier | Setup Method |
|----------------|-----------|--------------|
| Gemini Advanced + Gem | Tier A | One-time Gem setup |
| Gemini Advanced (no Gem) | Tier B | Paste governance each session |
| Gemini Free | Tier C | Paste governance each session |

---

## Two Kingdoms (v3.3 Core Concept)

AIXORD v3.3 introduces Two Kingdoms:

### IDEATION KINGDOM (Planning)
- Define WHAT to build
- Phases: DISCOVER -> BRAINSTORM -> OPTIONS -> DOCUMENT
- Cannot write any code

### REALIZATION KINGDOM (Building)
- Build WHAT was defined
- Phases: EXECUTE -> AUDIT -> VERIFY -> LOCK
- Specifications are frozen

### Ideation Gate
A mandatory checkpoint between kingdoms. Must pass to start building:
1. All deliverables defined
2. DAG dependencies mapped
3. Quality dimensions evaluated
4. Director types: `FINALIZE PLAN`

---

## Project Folder Structure

When you start AIXORD, you'll choose between:

| Option | Description |
|--------|-------------|
| **A - Absolute** | Create exact folder structure, verify with screenshot |
| **B - User-Controlled** | Manage your own organization |

**Recommended folder structure (Option A):**

```
[PROJECT_NAME]/
+-- 1_GOVERNANCE/      <- Governance file
+-- 2_STATE/           <- State tracking
+-- 3_PROJECT/         <- Your specs, MASTER_SCOPE
+-- 4_HANDOFFS/        <- Session saves
+-- 5_OUTPUTS/         <- Deliverables
+-- 6_RESEARCH/        <- Reference materials
```

---

## New v3.3 Commands

### Kingdom & Gate
| Command | Effect |
|---------|--------|
| `FINALIZE PLAN` | Pass Ideation Gate |
| `GATE STATUS` | Show gate checklist |
| `GATE OVERRIDE: [reason]` | Skip gate with reason |

### Quality
| Command | Effect |
|---------|--------|
| `QUALITY CHECK: [deliverable]` | Run 7 Quality Dimensions |
| `MOSA CHECK` | Check modular architecture |
| `COST CHECK` | Evaluate open-source options |

### DAG
| Command | Effect |
|---------|--------|
| `SHOW DAG` | Display dependency graph |
| `DAG STATUS` | Show eligible SCOPEs |

### Session
| Command | Effect |
|---------|--------|
| `SESSION STATUS` | Show message count (X/25) |
| `CHECKPOINT` | Save state, continue |
| `EXTEND 5` | Add 5 messages (once) |

---

## If Your Plan Needs to Change (v3.3)

AIXORD recognizes that real projects sometimes discover their plan is infeasible. Three commands allow graceful reassessment:

| Situation | Command | Effect |
|-----------|---------|--------|
| One component failed | `REASSESS: [SCOPE_NAME]` | Unlock that SCOPE for replanning |
| Entire plan needs rethinking | `GATE REOPEN: [reason]` | Return to Ideation Kingdom |
| Start completely fresh | `RESET: DECISION` | Archive and restart (requires confirmation) |

**Anti-Abuse:** Reassessment requires stating a reason and is logged permanently. This is for genuine pivots, not avoiding difficult work.

---

## Environment Variables (v3.3)

Before Gemini generates CLI commands, set these:

**PowerShell:**
```powershell
$env:AIXORD_ROOT = "YOUR_PATH\.aixord"
$env:AIXORD_PROJECT = "YOUR_PATH"
$env:AIXORD_SHELL = "powershell"
```

**Bash:**
```bash
export AIXORD_ROOT="YOUR_PATH/.aixord"
export AIXORD_PROJECT="YOUR_PATH"
export AIXORD_SHELL="bash"
```

Then tell Gemini: `ENVIRONMENT CONFIGURED`

---

## Key Terms (For Non-Technical Users)

| Term | Meaning |
|------|---------|
| **README** | "Read Me" -- this file. Always read first. |
| **.md files** | Markdown files -- plain text you can open in any text editor |
| **.json files** | Data files -- store structured information |
| **ZIP file** | Compressed folder -- extract before using |
| **Extract** | Unpack the ZIP (Windows: Right-click -> Extract All) |
| **Gem** | Custom AI persona in Gemini Advanced (like a custom chatbot) |
| **DAG** | Directed Acyclic Graph -- shows dependencies between tasks |
| **MOSA** | Modular Open Systems Approach -- architecture principles |
| **Kingdom** | Major phase of work (Ideation or Realization) |
| **Gate** | Checkpoint that must pass before proceeding |

---

## Session Continuity

AIXORD v3.3.1 HANDOFFs are **self-contained** and work across sessions, platforms, and time gaps.

### How It Works

1. **CHECKPOINT** generates a complete HANDOFF document
2. HANDOFF contains: project state, decisions, next actions, context
3. Copy the HANDOFF to a text file or your notes
4. Start a new session (even days later)
5. Paste the HANDOFF into the new session
6. AI reconstructs full context and resumes work

### Important

**The HANDOFF IS the project.** You don't need to re-paste governance files or explain history. The HANDOFF contains everything the AI needs to continue exactly where you left off.

### Verification Checklist

Before relying on a HANDOFF, verify it contains:

- [ ] Project name and current SCOPE
- [ ] Kingdom and Phase
- [ ] Completed work summary
- [ ] Active decisions and their status
- [ ] Next action (explicit)
- [ ] Any blockers or dependencies

If any are missing, request: `CHECKPOINT FULL`

---

## Need Help?

- **Email:** support@pmerit.com
- **Updates:** Visit pmerit.com/aixord
- **Full Documentation:** See the AIXORD book you purchased

---

*AIXORD v3.3 -- Two Kingdoms. DAG Dependencies. Quality-Driven.*
*Copyright 2026 PMERIT LLC. All Rights Reserved.*

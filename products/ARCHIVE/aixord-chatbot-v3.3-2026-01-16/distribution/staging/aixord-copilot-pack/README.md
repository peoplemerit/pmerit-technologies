# AIXORD Copilot Pack

**Version:** 3.3.1 | **Updated:** January 2026

---

## What is AIXORD?

AIXORD (AI Execution Order) transforms chaotic AI conversations into structured, productive projects. You stay in control as the Director while your AI serves as your intelligent Architect.

**Copilot Pack** is optimized specifically for Microsoft Copilot users -- Free, Pro, and Microsoft 365.

---

## What's New in v3.3

| Feature | Description |
|---------|-------------|
| **Two Kingdoms** | Clear separation between planning (Ideation) and building (Realization) |
| **Ideation Gate** | Mandatory checkpoint before implementation begins |
| **Scope Reassessment** | Graceful recovery when plans need to change |
| **7 Quality Dimensions** | Evaluate every deliverable for quality |
| **DAG Dependencies** | Visual dependency tracking between SCOPEs |
| **MOSA Principles** | Modular, open, replaceable architecture |
| **Open-Source Priority** | Prefer free and open solutions |
| **Multi-Signal Handoff** | Message counting (25 threshold) |
| **Workspace Controls** | Copilot-specific context management |

---

## Quick Start (5 Minutes)

### Step 1: Know Your Setup

| If You Have... | Your Tier | Setup Method |
|----------------|-----------|--------------|
| Copilot Pro with Workspace | Tier A | Workspace setup |
| Copilot Pro | Tier B | Paste workflow |
| Copilot Free | Tier C | Paste workflow |

### Step 2: Setup by Tier

**TIER A (Pro with Workspace):**
1. Open Copilot at copilot.microsoft.com
2. Create a new Workspace
3. Paste `AIXORD_GOVERNANCE_COPILOT_V3.3.md` in Workspace Instructions
4. Upload `AIXORD_STATE_COPILOT_V3.3.json` to Workspace Knowledge
5. Save the Workspace
6. Open Workspace, type: `PMERIT CONTINUE`

**TIER B (Pro):**
1. Open Copilot at copilot.microsoft.com
2. Paste `AIXORD_GOVERNANCE_COPILOT_V3.3.md` at conversation start
3. Type: `PMERIT CONTINUE`

**TIER C (Free):**
1. Open Copilot at copilot.microsoft.com
2. Paste the governance file at conversation start
3. Type: `PMERIT CONTINUE`
4. At session end, ask for `HANDOFF` and save it locally

---

## Package Contents

| File | Purpose | Use |
|------|---------|-----|
| `AIXORD_GOVERNANCE_COPILOT_V3.3.md` | Full governance | Paste into Copilot |
| `AIXORD_STATE_COPILOT_V3.3.json` | State template | Reference |
| `AIXORD_COPILOT.md` | Copilot usage guide | Read first |
| `PURPOSE_BOUND_OPERATION_SPEC.md` | Purpose-Bound specification | Reference (optional) |
| `README.md` | This file | Read first |
| `LICENSE.md` | Usage terms | Keep for reference |
| `LICENSE_KEY.txt` | Your license | Keep for reference |
| `DISCLAIMER.md` | Legal disclaimer | Keep for reference |

---

## Two Kingdoms (v3.3 Core Concept)

### IDEATION KINGDOM (Planning)
- Define WHAT to build
- Phases: DISCOVER -> BRAINSTORM -> OPTIONS -> DOCUMENT
- Cannot write any code

### REALIZATION KINGDOM (Building)
- Build WHAT was defined
- Phases: EXECUTE -> AUDIT -> VERIFY -> LOCK
- Specifications are frozen

### Ideation Gate
A mandatory checkpoint between kingdoms. Must pass to start building.

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

### Workspace (Copilot-Specific)
| Command | Effect |
|---------|--------|
| `CONTEXT CHECK` | Display current operating context |
| `WORKSPACE: [path]` | Set/confirm workspace boundary |
| `FILES IN SCOPE` | List active project files |
| `M365 SCOPE: [ON/OFF]` | Enable/disable M365 document access |

---

## If Your Plan Needs to Change (v3.3)

| Situation | Command | Effect |
|-----------|---------|--------|
| One component failed | `REASSESS: [SCOPE_NAME]` | Unlock that SCOPE for replanning |
| Entire plan needs rethinking | `GATE REOPEN: [reason]` | Return to Ideation Kingdom |
| Start completely fresh | `RESET: DECISION` | Archive and restart (requires confirmation) |

---

## Key Terms

| Term | Meaning |
|------|---------|
| **README** | "Read Me" -- this file. Always read first. |
| **.md files** | Markdown files -- plain text |
| **.json files** | Data files -- structured information |
| **Workspace** | Copilot Pro feature for persistent context |
| **DAG** | Directed Acyclic Graph -- shows task dependencies |
| **Kingdom** | Major phase (Ideation or Realization) |
| **Gate** | Checkpoint before proceeding |

---

## Session Continuity

AIXORD HANDOFFs are **self-contained** -- they work across sessions, platforms, and even different AI tools. When a session ends, your HANDOFF becomes your complete project state.

### How It Works

1. **Request HANDOFF** at session end (or when message count reaches threshold)
2. **AI generates** complete state including governance, progress, and next steps
3. **Save HANDOFF** to your local file system
4. **Start new session** on any compatible AI platform
5. **Paste HANDOFF** to restore full project context
6. **Continue working** exactly where you left off

### Important

**The HANDOFF is the project.** It contains everything needed to resume:
- Current kingdom and phase
- All SCOPE definitions and status
- DAG dependencies
- Carryforward items
- Next recommended actions

### Verification Checklist

Before ending a session, verify your HANDOFF includes:

| Element | Check |
|---------|-------|
| Kingdom state | Current kingdom clearly stated |
| Active SCOPE | Currently active SCOPE identified |
| Progress summary | What was accomplished this session |
| Carryforward | Pending items for next session |
| Next action | Clear next step to take |

---

## Need Help?

- **Email:** support@pmerit.com
- **Updates:** Visit pmerit.com/aixord
- **Full Documentation:** See the AIXORD book you purchased

---

*AIXORD v3.3 -- Two Kingdoms. DAG Dependencies. Quality-Driven.*
*Copyright 2026 PMERIT LLC. All Rights Reserved.*

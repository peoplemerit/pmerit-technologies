# AIXORD ChatGPT Pack

**Version:** 3.3.1 | **Updated:** January 2026

---

## What is AIXORD?

AIXORD (AI Execution Order) transforms chaotic AI conversations into structured, productive projects. You stay in control as the Director while your AI serves as your intelligent Architect.

**ChatGPT Pack** is optimized specifically for ChatGPT users -- Free, Plus, Pro, and Team tiers.

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
| **Verbosity Controls** | ChatGPT-specific anti-bloat enforcement |

---

## Quick Start (5 Minutes)

### Step 1: Know Your Setup

| If You Have... | Your Tier | Setup Method |
|----------------|-----------|--------------|
| ChatGPT Plus/Pro (with Custom GPTs) | Tier A | Custom GPT |
| ChatGPT Plus/Pro (no Custom GPT) | Tier B | Paste workflow |
| ChatGPT Free | Tier C | Paste workflow |

### Step 2: Setup by Tier

**TIER A (Plus/Pro with Custom GPTs):**
1. Create a Custom GPT at chat.openai.com
2. Paste `AIXORD_GOVERNANCE_CHATGPT_GPT_V3.3.md` in Instructions
3. Upload `AIXORD_PHASE_DETAILS_V3.3.md` to Knowledge
4. Upload `AIXORD_STATE_CHATGPT_V3.3.json` to Knowledge
5. Save the GPT
6. Open GPT, type: `PMERIT CONTINUE`

**TIER B (Plus/Pro without Custom GPT):**
1. Open new chat at chat.openai.com
2. Paste `AIXORD_GOVERNANCE_CHATGPT_V3.3.md` at conversation start
3. Type: `PMERIT CONTINUE`

**TIER C (Free):**
1. See `AIXORD_CHATGPT_FREE.md` for full instructions

---

## Package Contents

| File | Purpose | Use |
|------|---------|-----|
| `AIXORD_GOVERNANCE_CHATGPT_GPT_V3.3.md` | **Condensed for Custom GPTs** | Paste into GPT Instructions |
| `AIXORD_GOVERNANCE_CHATGPT_V3.3.md` | Full governance | Paste workflow (no GPT) |
| `AIXORD_PHASE_DETAILS_V3.3.md` | Detailed phase behaviors | Upload to GPT Knowledge |
| `AIXORD_STATE_CHATGPT_V3.3.json` | State template | Upload to GPT Knowledge |
| `AIXORD_CHATGPT_PRO.md` | Pro tier guide | Read first |
| `AIXORD_CHATGPT_PLUS.md` | Plus tier guide | Read first |
| `AIXORD_CHATGPT_FREE.md` | Free tier guide | Read first |
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

### Verbosity (ChatGPT-Specific)
| Command | Effect |
|---------|--------|
| `VERBOSE: ON` | Allow detailed responses |
| `VERBOSE: OFF` | Return to minimal mode |
| `SHORTER` | Request more concise response |

---

## If Your Plan Needs to Change (v3.3)

AIXORD recognizes that real projects sometimes discover their plan is infeasible. Three commands allow graceful reassessment:

| Situation | Command | Effect |
|-----------|---------|--------|
| One component failed | `REASSESS: [SCOPE_NAME]` | Unlock that SCOPE for replanning |
| Entire plan needs rethinking | `GATE REOPEN: [reason]` | Return to Ideation Kingdom |
| Start completely fresh | `RESET: DECISION` | Archive and restart (requires confirmation) |

**Anti-Abuse:** Reassessment requires stating a reason and is logged permanently.

---

## Key Terms (For Non-Technical Users)

| Term | Meaning |
|------|---------|
| **README** | "Read Me" -- this file. Always read first. |
| **.md files** | Markdown files -- plain text you can open in any text editor |
| **.json files** | Data files -- store structured information |
| **ZIP file** | Compressed folder -- extract before using |
| **Extract** | Unpack the ZIP (Windows: Right-click -> Extract All) |
| **Custom GPT** | ChatGPT Plus/Pro feature -- create specialized AI assistants |
| **DAG** | Directed Acyclic Graph -- shows dependencies between tasks |
| **Kingdom** | Major phase of work (Ideation or Realization) |
| **Gate** | Checkpoint that must pass before proceeding |

---

## Session Continuity

AIXORD HANDOFFs are **self-contained** -- they work across sessions, across devices, and even across different AI platforms.

### How It Works

1. **HANDOFF Generated** -- When a session ends, AIXORD creates a complete HANDOFF document
2. **State Preserved** -- All context, decisions, and progress are captured in the HANDOFF
3. **New Session Starts** -- You open a fresh conversation (same or different platform)
4. **Paste HANDOFF** -- Simply paste the entire HANDOFF document
5. **AI Reconstructs** -- The AI reads the HANDOFF and restores full project context
6. **Work Continues** -- Pick up exactly where you left off

### Important: The HANDOFF IS the Project

Your HANDOFF document contains everything needed to continue work:
- Project definition and goals
- All decisions made
- Current phase and status
- Completed work summary
- Next steps queue

**Save your HANDOFFs** -- they are your project's portable memory.

### Verification Checklist

Before relying on a HANDOFF, verify it contains:

- [ ] Project name and description
- [ ] Current Kingdom (Ideation/Realization)
- [ ] Current Phase
- [ ] Active SCOPE(s) and their status
- [ ] Decision log (key choices made)
- [ ] Next action items

If any are missing, request a new HANDOFF with `CHECKPOINT` before ending the session.

---

## Need Help?

- **Email:** support@pmerit.com
- **Updates:** Visit pmerit.com/aixord
- **Full Documentation:** See the AIXORD book you purchased

---

*AIXORD v3.3 -- Two Kingdoms. DAG Dependencies. Quality-Driven.*
*Copyright 2026 PMERIT LLC. All Rights Reserved.*

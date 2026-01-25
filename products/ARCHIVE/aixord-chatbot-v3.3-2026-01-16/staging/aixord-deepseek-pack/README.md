# AIXORD DeepSeek Pack

**Version:** 3.3.1 | **Updated:** January 2026

---

## What is AIXORD?

AIXORD (AI Execution Order) transforms chaotic AI conversations into structured, productive projects. You stay in control as the Director while your AI serves as your intelligent Architect.

**DeepSeek Pack** is optimized specifically for DeepSeek users -- Free and Pro tiers.

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
| **Knowledge Recency** | DeepSeek-specific verification for time-sensitive information |

---

## Quick Start (5 Minutes)

### Step 1: Know Your Setup

| If You Have... | Your Tier | Setup Method |
|----------------|-----------|--------------|
| DeepSeek Pro with Projects | Tier A | Project setup |
| DeepSeek Pro | Tier B | Paste workflow |
| DeepSeek Free | Tier C | Paste workflow |

### Step 2: Setup by Tier

**TIER A (Pro with Projects):**
1. Open DeepSeek at chat.deepseek.com
2. Create a new Project
3. Paste `AIXORD_GOVERNANCE_DEEPSEEK_V3.3.md` in Project Instructions
4. Upload `AIXORD_STATE_DEEPSEEK_V3.3.json` to Project Knowledge
5. Save the Project
6. Open Project, type: `PMERIT CONTINUE`

**TIER B (Pro):**
1. Open DeepSeek at chat.deepseek.com
2. Paste `AIXORD_GOVERNANCE_DEEPSEEK_V3.3.md` at conversation start
3. Type: `PMERIT CONTINUE`

**TIER C (Free):**
1. Open DeepSeek at chat.deepseek.com
2. Paste the governance file at conversation start
3. Type: `PMERIT CONTINUE`
4. At session end, ask for `HANDOFF` and save it locally

---

## Package Contents

| File | Purpose | Use |
|------|---------|-----|
| `AIXORD_GOVERNANCE_DEEPSEEK_V3.3.md` | Full governance | Paste into DeepSeek |
| `AIXORD_STATE_DEEPSEEK_V3.3.json` | State template | Reference |
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

### Knowledge Recency (DeepSeek-Specific)
| Command | Effect |
|---------|--------|
| `RECENCY CHECK` | Display recency confidence for current topic |
| `VERIFY: [technology]` | Request verification steps for specific tech |
| `SHOW CUTOFF RISKS` | List time-sensitive information |
| `RESEARCH MODE: [ON/OFF]` | Enable enhanced verification |

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
| **Project** | DeepSeek Pro feature for persistent context |
| **DAG** | Directed Acyclic Graph -- shows task dependencies |
| **Kingdom** | Major phase (Ideation or Realization) |
| **Gate** | Checkpoint before proceeding |
| **Recency** | How current the AI's knowledge is |

---

## Session Continuity

AIXORD HANDOFFs are **self-contained** -- they work across sessions without needing to re-paste the governance file.

### How It Works

1. **End of Session:** Request `HANDOFF` before closing
2. **AI Creates:** Complete state document with embedded governance
3. **You Save:** Copy HANDOFF to a local file
4. **New Session:** Paste only the HANDOFF into fresh chat
5. **AI Recognizes:** HANDOFF contains everything needed to resume
6. **Continue Working:** Pick up exactly where you left off

### Important

The HANDOFF **IS** your project. It contains:
- Full governance rules
- Current state and progress
- All decisions made
- Next steps queued

**You don't need the original governance file once you have a HANDOFF.**

### Verification Checklist

Before starting a new session with a HANDOFF:

- [ ] HANDOFF file saved locally
- [ ] File is complete (not truncated)
- [ ] Contains `GOVERNANCE SNAPSHOT` section
- [ ] Contains `STATE SNAPSHOT` section
- [ ] Contains `RESUME INSTRUCTIONS` section

---

## Need Help?

- **Email:** support@pmerit.com
- **Updates:** Visit pmerit.com/aixord
- **Full Documentation:** See the AIXORD book you purchased

---

*AIXORD v3.3 -- Two Kingdoms. DAG Dependencies. Quality-Driven.*
*Copyright 2026 PMERIT LLC. All Rights Reserved.*

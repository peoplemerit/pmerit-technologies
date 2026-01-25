# AIXORD Starter Pack (Universal)

**Version:** 3.3.1 | **Updated:** January 2026

---

## What is AIXORD?

AIXORD (AI Execution Order) transforms chaotic AI conversations into structured, productive projects. You stay in control as the Director while your AI serves as your intelligent Architect.

**Starter Pack** works with ANY AI assistant -- ChatGPT, Claude, Gemini, Copilot, DeepSeek, and more.

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
| **Platform Guidance** | Adaptations for each AI platform |

---

## Quick Start (5 Minutes)

### Step 1: Choose Your AI Platform

This pack works with:
- ChatGPT (OpenAI)
- Claude (Anthropic)
- Gemini (Google)
- Copilot (GitHub/Microsoft)
- DeepSeek
- Any other conversational AI

### Step 2: Basic Setup

1. Open your AI platform
2. Paste `AIXORD_GOVERNANCE_UNIVERSAL_V3.3.md` at conversation start
3. Type: `PMERIT CONTINUE`
4. Follow the 8-step setup flow

### Step 3: Platform-Specific Tips

| Platform | Additional Recommendation |
|----------|--------------------------|
| ChatGPT | Use `SHORTER` command if responses are too long |
| Claude | Use `CHECKPOINT` frequently (context fills) |
| Gemini | Standard behavior |
| Copilot | State file/repo before code requests |
| DeepSeek | Verify time-sensitive information |

---

## Package Contents

| File | Purpose | Use |
|------|---------|-----|
| `AIXORD_GOVERNANCE_UNIVERSAL_V3.3.md` | Universal governance | Paste into any AI |
| `AIXORD_STATE_UNIVERSAL_V3.3.json` | State template | Reference |
| `AIXORD_CHATGPT_FREE.md` | ChatGPT free tier guide | If using ChatGPT Free |
| `AIXORD_CLAUDE_FREE.md` | Claude free tier guide | If using Claude Free |
| `AIXORD_GEMINI_FREE.md` | Gemini free tier guide | If using Gemini Free |
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
| **DAG** | Directed Acyclic Graph -- shows task dependencies |
| **Kingdom** | Major phase (Ideation or Realization) |
| **Gate** | Checkpoint before proceeding |

---

## Session Continuity

AIXORD generates **self-contained HANDOFFs** that work across sessions:

### How It Works

1. At end of session, say `HANDOFF`
2. AI generates complete HANDOFF document with embedded governance
3. Save the HANDOFF (copy to file or notes app)
4. In new session, paste the HANDOFF
5. Say `PMERIT CONTINUE`
6. AIXORD activates with full context and rules

### Important

**Your HANDOFF IS your project.** It contains:
- Governance rules (so AI knows how to behave)
- Project state (where you left off)
- Decision history (what was decided)
- Next actions (what to do next)

**Don't lose your HANDOFF.** Back it up. It's your project memory.

### Verification

When continuing from a HANDOFF, verify:
- ✅ AI response begins with header box
- ✅ AI knows your project objective
- ✅ AI asks before taking actions

If verification fails, re-paste the HANDOFF and try again.

---

## Need Help?

- **Email:** support@pmerit.com
- **Updates:** Visit pmerit.com/aixord
- **Full Documentation:** See the AIXORD book you purchased

---

*AIXORD v3.3 -- Two Kingdoms. DAG Dependencies. Quality-Driven.*
*Copyright 2026 PMERIT LLC. All Rights Reserved.*

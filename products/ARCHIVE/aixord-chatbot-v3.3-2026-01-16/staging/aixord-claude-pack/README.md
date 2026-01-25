# AIXORD Claude Pack

**Version:** 3.3.1 | **Updated:** January 2026

---

## What is AIXORD?

AIXORD (AI Execution Order) transforms chaotic AI conversations into structured, productive projects. You stay in control as the Director while your AI serves as your intelligent Architect.

**Claude Pack** is optimized specifically for Anthropic Claude users -- Free and Pro tiers.

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
| **Context Management** | Claude-specific context window optimization |
| **Dual Mode** | Claude Web + Claude Code workflow support |

---

## Quick Start (5 Minutes)

### Step 1: Know Your Setup

| If You Have... | Your Tier | Setup Method |
|----------------|-----------|--------------|
| Claude Pro (with Projects) | Tier A | Project setup |
| Claude Pro (no Project) | Tier B | Paste workflow |
| Claude Free | Tier C | Paste workflow |

### Step 2: Setup by Tier

**TIER A (Pro with Projects):**
1. Create a new Project at claude.ai
2. Paste `AIXORD_GOVERNANCE_CLAUDE_PROJECT_V3.3.md` in Project Instructions
3. Upload `AIXORD_PHASE_DETAILS_V3.3.md` to Project Knowledge
4. Upload `AIXORD_STATE_CLAUDE_V3.3.json` to Project Knowledge
5. Start conversation, type: `PMERIT CONTINUE`

**TIER B (Pro without Project):**
1. Open new chat at claude.ai
2. Paste `AIXORD_GOVERNANCE_CLAUDE_V3.3.md` at conversation start
3. Type: `PMERIT CONTINUE`

**TIER C (Free):**
1. See `AIXORD_CLAUDE_FREE.md` for full instructions

---

## Package Contents

| File | Purpose | Use |
|------|---------|-----|
| `AIXORD_GOVERNANCE_CLAUDE_PROJECT_V3.3.md` | **Condensed for Projects** | Paste into Project Instructions |
| `AIXORD_GOVERNANCE_CLAUDE_V3.3.md` | Full governance | Paste workflow (no Project) |
| `AIXORD_PHASE_DETAILS_V3.3.md` | Detailed phase behaviors | Upload to Project Knowledge |
| `AIXORD_STATE_CLAUDE_V3.3.json` | State template | Upload to Project Knowledge |
| `AIXORD_CLAUDE_PRO.md` | Pro tier guide | Read first |
| `AIXORD_CLAUDE_FREE.md` | Free tier guide | Read first |
| `AIXORD_CLAUDE_DUAL.md` | Claude Web + Code workflow | For developers |
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

### Context Management (Claude-Specific)
| Command | Effect |
|---------|--------|
| `CONTEXT STATUS` | Show approximate context usage |
| `COMPRESS` | Request shorter responses |
| `DUAL MODE: ON` | Enable Claude Web + Code workflow |

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

## Claude Dual Mode (For Developers)

If you have both Claude Web and Claude Code:

| Role | Actor | Responsibility |
|------|-------|----------------|
| Architect | Claude Web | Strategy, specs, brainstorming |
| Commander | Claude Code | Implementation, file edits, execution |

See `AIXORD_CLAUDE_DUAL.md` for the complete workflow.

---

## Key Terms (For Non-Technical Users)

| Term | Meaning |
|------|---------|
| **README** | "Read Me" -- this file. Always read first. |
| **.md files** | Markdown files -- plain text you can open in any text editor |
| **.json files** | Data files -- store structured information |
| **ZIP file** | Compressed folder -- extract before using |
| **Extract** | Unpack the ZIP (Windows: Right-click -> Extract All) |
| **Project** | Claude Pro feature -- create persistent AI workspaces |
| **DAG** | Directed Acyclic Graph -- shows dependencies between tasks |
| **Kingdom** | Major phase of work (Ideation or Realization) |
| **Gate** | Checkpoint that must pass before proceeding |

---

## Session Continuity

AIXORD uses **self-contained HANDOFFs** that work reliably across sessions -- even when Claude cannot access previous conversations.

### How It Works

1. **You request a HANDOFF** at end of session
2. **Claude generates** a complete state document
3. **You save** the HANDOFF (copy/paste or download)
4. **New session starts** -- Claude has no memory
5. **You paste the HANDOFF** into the new session
6. **Claude reconstructs** full project context and continues

### Important

The HANDOFF document IS your project. It contains everything Claude needs:
- Current phase and kingdom
- All SCOPEs and their status
- Decisions made and rationale
- What to do next

**No conversation history required.** The HANDOFF is designed to be self-sufficient.

### Verification Checklist

Before ending a session, confirm your HANDOFF includes:

- [ ] Current Kingdom (Ideation/Realization)
- [ ] Current Phase
- [ ] All SCOPE statuses
- [ ] Next action clearly stated
- [ ] Any blockers or pending decisions

---

## Need Help?

- **Email:** support@pmerit.com
- **Updates:** Visit pmerit.com/aixord
- **Full Documentation:** See the AIXORD book you purchased

---

*AIXORD v3.3 -- Two Kingdoms. DAG Dependencies. Quality-Driven.*
*Copyright 2026 PMERIT LLC. All Rights Reserved.*

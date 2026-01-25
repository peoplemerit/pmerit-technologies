# AIXORD Chatbot Edition

## AI Execution Order Framework for Simple Chat Interfaces

**A Single-File Methodology for ChatGPT, Gemini, and Any AI Chatbot**

---

**Version:** 1.0 (First Edition)
**Author:** Idowu J Gabriel, Sr.
**Publisher:** PMERIT LLC
**Published:** December 2025

---

## Copyright

Copyright 2025 PMERIT LLC. All Rights Reserved.

This book and its accompanying template are protected by copyright. You may use the template in your own projects but may not redistribute or resell it.

**AI Usage Disclosure:** This book was developed with the assistance of AI tools (Claude, ChatGPT) used for drafting, iteration, and refinement. All final decisions, structure, methodology design, and intellectual ownership remain solely with the author.

**Trademark Notice:** All third-party product names and trademarks mentioned in this book (including ChatGPT, Gemini, Claude, Copilot) are the property of their respective owners.

---

## Template Access

Your purchase includes a downloadable template file.

**Access your template at:**
https://meritwise0.gumroad.com/l/nbkkha

---

## Who This Book Is For

This book is for you if:

- You use **free AI chatbots** (ChatGPT free, Gemini, etc.)
- You **cannot** access folder systems or project instructions
- You only have **file upload** capability
- You work on **complex projects** that span multiple chat sessions
- You're frustrated with **context loss** between sessions
- You want **structured AI collaboration** without premium subscriptions

---

## Who This Book Is NOT For

This book is **not** for you if:

- You have Claude Pro with Claude Code (use the full AIXORD instead)
- You only do simple one-off tasks
- You prefer unstructured AI conversations
- You're unwilling to maintain a project file

---

## What is AIXORD Chatbot Edition?

AIXORD Chatbot Edition is a **single-file methodology** for structured AI-human collaboration. It's designed for users who only have access to basic chat interfaces with file upload capability.

**The Core Innovation:**

Instead of multiple files and folder structures, everything lives in ONE uploadable document. You upload this file at the start of each session, and the AI reads your full project context instantly.

```
┌─────────────────────────────────────────────────┐
│           SINGLE PROJECT FILE                   │
│                                                 │
│  Upload at session start → AI has full context  │
│  Work with AI → AI tracks progress              │
│  Session ends → Update file for next time       │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## AIXORD Power Rules (NON-NEGOTIABLE)

Memorize these. They apply to all AIXORD variants:

1. **"If it's not documented, it doesn't exist."**
2. **"Completion is a locked state, not a feeling."**
3. **"Decisions are frozen before execution begins."**
4. **"Scopes open only when prerequisites are verified."**
5. **"Execution enforces decisions; it does not revisit them."**
6. **"Only one AI may issue execution orders at a time."**

---

## The Two Operating Modes

**AIXORD operates in two distinct modes.** This is the core innovation that transforms AI from a chatty assistant into a disciplined executor.

### DECISION Mode (AI = Analyst)

In DECISION mode, the AI:
- Discusses approaches
- Recommends options
- Asks clarifying questions
- Challenges assumptions
- Offers alternatives

**The user's job:** Make decisions, approve, reject.

### EXECUTION Mode (AI = Commander)

In EXECUTION mode, the AI:
- Issues ONE instruction at a time
- States instructions as commands, not suggestions
- Includes verification criteria
- STOPS and waits for "DONE"
- Does NOT offer alternatives

**The user's job:** Execute, confirm with "DONE".

### The Mode Transition

```
DECISION MODE
     │
     │ User says: "APPROVED. BEGIN EXECUTION."
     │
     ▼
EXECUTION MODE (Decisions are now FROZEN)
     │
     │ If execution fails or new decision needed:
     │ User says: "HALT. RETURN TO DECISION MODE."
     │
     ▼
DECISION MODE (Reopened for specific issue only)
```

**CRITICAL:** Once in EXECUTION mode, the AI does NOT:
- Offer alternatives
- Suggest different approaches
- Ask "have you considered..."
- Negotiate or discuss
- Use polite language ("please", "let me know", "we can")

The AI issues instructions. The user executes. Period.

---

## Table of Contents

1. The Problem with Simple Chatbots
2. The AIXORD Chatbot Solution
3. The Two Operating Modes
4. The Single-File Architecture
5. Quick Start Guide
6. The Complete Workflow
7. State Enforcement Rules
8. Token Management & Handoffs
9. Commands Reference
10. The Template
11. Troubleshooting
12. Conclusion

---

# Part I: The Problem

## Why Simple Chatbots Fail on Complex Projects

### The Context Window Problem

Every AI chatbot has a **context window** — the amount of text it can "remember" in a single conversation. When you exceed this limit:

- The AI "forgets" earlier messages
- Your project context disappears
- You start explaining everything again

### The Session Reset Problem

When you start a new chat session:

- Previous conversations are gone
- The AI doesn't know your project
- You waste time rebuilding context

### The No-Structure Problem

Basic chatbots have no built-in project management:

- No persistent instructions
- No file system access
- No memory between sessions
- No structured workflows

### The Real Cost

Every time you re-explain context, you're burning:

- **Time** — Your most valuable resource
- **Tokens** — Each explanation costs capacity
- **Mental energy** — Context switching kills productivity

---

# Part II: The Solution

## AIXORD Chatbot Edition

### The Core Insight

> **All project context lives in ONE file that you upload at session start.**

The AI reads your file and instantly knows:
- What the project is
- What decisions have been made
- What was completed
- What to work on next

### The Two-Section Architecture

Your project file has two sections:

```
┌─────────────────────────────────────────────────┐
│  TOP SECTION (Dynamic)                          │
│  ─────────────────────                          │
│  • Role instructions for AI                     │
│  • Current session tasks                        │
│  • Active decisions                             │
│  • What to work on NOW                          │
│                                                 │
│  ↓ This section drives the current session ↓   │
├─────────────────────────────────────────────────┤
│  BOTTOM SECTION (Cumulative)                    │
│  ─────────────────────                          │
│  • HANDOFF_DOCUMENT (project state)             │
│  • RESEARCH_FINDINGS (what AI discovered)       │
│  • DECISION_LOG (all choices made)              │
│  • COMPLETED_TASKS (done items)                 │
│                                                 │
│  ↑ This section grows over time ↑              │
└─────────────────────────────────────────────────┘
```

### How It Works

```
SESSION 1
─────────
1. Create project file with initial context
2. Upload to chatbot
3. Work with AI
4. AI updates BOTTOM section with findings
5. Copy updated content back to your file
6. Save file

SESSION 2
─────────
1. Upload same file (now with Session 1 progress)
2. AI reads full context instantly
3. Continue where you left off
4. AI updates BOTTOM section
5. Copy updates back to file
6. Save file

SESSION N
─────────
[Repeat — context accumulates]
```

---

# Part III: The Architecture

## File Structure Explained

### TOP SECTION: Role Instructions

This tells the AI WHO it is and HOW to behave. **Notice the hardened language:**

```markdown
## ROLE INSTRUCTIONS

You are the [PROJECT NAME] Commander.

### EXECUTION MODE BEHAVIOR (When Mode = EXECUTION)

**YOU MUST:**
1. Issue ONE instruction at a time
2. State the instruction as a command, not a suggestion
3. Include verification criteria
4. STOP and wait for "DONE"
5. Do NOT proceed without confirmation

**INSTRUCTION FORMAT (Mandatory):**

INSTRUCTION [#]: [Action verb] [specific task]

Execute: [Exact steps to perform]

Verify: [How to confirm completion]

⏸️ EXECUTION PAUSED. Confirm with "DONE" when complete.

**YOU MUST NOT:**
- Say "please" or "let me know" or "we can"
- Offer options or alternatives
- Ask questions (except to clarify blocked state)
- Suggest improvements mid-execution
- Revisit any ACTIVE decision

### DECISION MODE BEHAVIOR (When Mode = DECISION)

**YOU MAY:**
- Discuss approaches
- Recommend options
- Ask clarifying questions
- Challenge assumptions

**BUT:** Once user says "APPROVED. BEGIN EXECUTION." — you switch to Commander.
```

**Why this matters:** Without explicit authority language, the AI defaults to being a helpful assistant. The hardened role instructions ENFORCE command behavior.

### TOP SECTION: Current Tasks

This tells the AI WHAT to work on NOW:

```markdown
## CURRENT SESSION TASKS

Priority 1: [Specific task]
Priority 2: [Next task if time permits]

**CONSTRAINTS:**
- Do not revisit [locked decision]
- Focus only on [current scope]
```

### TOP SECTION: Active Decisions

This tells the AI what's already been decided:

```markdown
## ACTIVE DECISIONS (DO NOT QUESTION)

| Decision | Choice | Rationale | Date |
|----------|--------|-----------|------|
| Database | PostgreSQL | Team expertise | 2025-01-01 |
| Frontend | React | Existing codebase | 2025-01-01 |
```

### BOTTOM SECTION: Handoff Document

This captures the project state:

```markdown
## HANDOFF_DOCUMENT

### Project Overview
[What this project is]

### Current Status
[Where we are now]

### Completed Milestones
- [x] Milestone 1
- [x] Milestone 2
- [ ] Milestone 3 (in progress)

### Blockers
[Any obstacles]

### Next Steps
[What comes after current tasks]
```

### BOTTOM SECTION: Research Findings

This captures what the AI has discovered:

```markdown
## RESEARCH_FINDINGS

### Session 1 (2025-01-15)
- Discovered: [finding]
- Recommendation: [action]

### Session 2 (2025-01-16)
- Discovered: [finding]
- Implementation: [what was done]
```

### BOTTOM SECTION: Decision Log

This is the permanent record:

```markdown
## DECISION_LOG

| ID | Decision | Status | Rationale | Date |
|----|----------|--------|-----------|------|
| D-001 | Use PostgreSQL | ACTIVE | Team expertise | 2025-01-01 |
| D-002 | Skip Redis cache | NO-GO | Overkill for MVP | 2025-01-02 |
```

---

# Part IV: Quick Start Guide

## Setup in 15 Minutes

### Step 1: Create Your Project File

Create a new text file (`.txt` or `.md`) named:

```
[PROJECT_NAME]_AIXORD.md
```

Example: `MyApp_AIXORD.md`

### Step 2: Copy the Template

Copy the complete template from Part VIII of this book (or download from Gumroad).

### Step 3: Customize the Header

Replace placeholders:

```markdown
# [PROJECT NAME] — AIXORD Project File

**Project:** [Your project name]
**Created:** [Today's date]
**Session:** 1
```

### Step 4: Fill Out Role Instructions

Customize the AI's role for your project:

```markdown
## ROLE INSTRUCTIONS

You are the [PROJECT NAME] Implementation Manager.
Your goal is to help me [project objective].

Based on the context below, you must:
- [Specific behavior 1]
- [Specific behavior 2]
- [Specific behavior 3]
```

### Step 5: Add Your First Task

```markdown
## CURRENT SESSION TASKS

Priority 1: [Your first task]

CONSTRAINTS:
- [Any limitations]
```

### Step 6: Document Initial Decisions

```markdown
## ACTIVE DECISIONS (DO NOT QUESTION)

| Decision | Choice | Rationale | Date |
|----------|--------|-----------|------|
| [First decision] | [Choice] | [Why] | [Date] |
```

### Step 7: Initialize Handoff Document

```markdown
## HANDOFF_DOCUMENT

### Project Overview
[Brief description of your project]

### Current Status
Just started. Session 1.

### Completed Milestones
[None yet]

### Next Steps
[Your first milestone]
```

### Step 8: Upload and Begin

1. Go to ChatGPT, Gemini, or your preferred chatbot
2. Upload your project file
3. Type: **"Read this file and acknowledge you understand the project context."**
4. Wait for AI to confirm
5. Type: **"Begin with Priority 1 task."**

---

# Part V: The Complete Workflow

## Daily Workflow

### Starting a Session

```
1. Open your AI chatbot
2. Upload [PROJECT]_AIXORD.md
3. Type: "[PROJECT] CONTINUE"
4. AI reads file, outputs status
5. Begin working
```

### During the Session

```
1. AI provides task or question
2. You respond or execute
3. Type "DONE" when task complete
4. AI proceeds to next item
5. AI updates findings as you go
```

### Ending a Session

```
1. Type: "HANDOFF"
2. AI outputs updated sections:
   - Updated HANDOFF_DOCUMENT
   - New RESEARCH_FINDINGS
   - Any new DECISIONS
3. Copy these updates to your file
4. Save the file
5. Close session
```

### The Handoff Cycle

```
┌──────────────┐
│  SESSION N   │
│              │
│  Upload file │
│      ↓       │
│  Work with   │
│  AI          │
│      ↓       │
│  AI outputs  │
│  handoff     │
│      ↓       │
│  Update file │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ SESSION N+1  │
│              │
│  Upload      │
│  updated     │
│  file        │
│      ↓       │
│  Continue    │
│  where left  │
│  off         │
└──────────────┘
```

---

# Part VI: State Enforcement Rules

## Why State Matters

Without explicit state enforcement, the AI will:
- "Complete" tasks without verification
- Proceed without waiting for confirmation
- Revert completed tasks to incomplete
- Revisit locked decisions

**AIXORD enforces state as LAW, not suggestion.**

## Prerequisite Check (Before Each Instruction)

Before issuing any instruction, the AI must verify:

1. All prerequisite tasks are marked COMPLETE in COMPLETED_TASKS
2. All required decisions are ACTIVE in DECISION_LOG
3. Current scope is UNLOCKED

**If prerequisites are NOT met:**

```
⛔ CANNOT PROCEED.

Missing prerequisite: [specific item]
Status: [INCOMPLETE / MISSING / LOCKED]

Action required: [what must happen first]

Execution halted until prerequisite satisfied.
```

## Completion Verification

A task is COMPLETE only when:

1. User confirms "DONE"
2. Verification criteria are met
3. Task is logged in COMPLETED_TASKS with date

**Completion is a locked state.** Once complete, a task cannot revert to incomplete without explicit "UNLOCK: [task]" command.

## Failure Handling Protocol

**Failure is signal, not error.**

When execution fails, the AI must output:

```
⚠️ EXECUTION FAILURE

Instruction: [which one]
Failure: [what happened]
Evidence: [proof of failure]

EXECUTION HALTED.

Options:
1. Retry with "RETRY" (same approach)
2. Return to decision mode with "HALT. RETURN TO DECISION MODE."
3. Provide workaround context and "CONTINUE WITH: [approach]"

Awaiting directive.
```

**The AI does NOT:**
- Automatically try workarounds
- Suggest alternatives without being asked
- Continue past failure

---

# Part VII: Token Management

## Understanding Token Limits

Every AI chatbot has a context limit measured in "tokens" (roughly 4 characters = 1 token).

| Chatbot | Approximate Limit |
|---------|-------------------|
| ChatGPT Free | ~4,000 tokens |
| ChatGPT Plus | ~8,000-32,000 tokens |
| Gemini | ~32,000 tokens |
| Claude | ~100,000+ tokens |

### Why Tokens Matter

Your project file consumes tokens. As your BOTTOM SECTION grows:

- File gets larger
- More tokens consumed on upload
- Less room for conversation
- Eventually hits limit

### Token-Aware Handoffs

Build token awareness into your role instructions:

```markdown
## TOKEN MANAGEMENT RULES

1. Estimate tokens used at start of session
2. Monitor conversation length
3. When approaching 70% capacity, suggest handoff
4. Output format for handoff:

   "⚠️ TOKEN ALERT: Approaching limit.
   Recommend saving progress.
   Ready to output HANDOFF when you say 'HANDOFF'."
```

### Archiving Old Content

When your file gets too large:

1. Create archive file: `[PROJECT]_ARCHIVE_SESSION_1-10.md`
2. Move old RESEARCH_FINDINGS to archive
3. Keep only essential context in main file
4. Reference archive if needed: "See archive for sessions 1-10"

### Lean Project File Tips

Keep your file lean:

| Do | Don't |
|----|-------|
| Summarize completed work | Keep full conversation logs |
| Archive old sessions | Let file grow indefinitely |
| Reference decisions by ID | Repeat full decision rationale |
| Use bullet points | Write paragraphs |

---

# Part VIII: Commands Reference

## AIXORD Chatbot Commands

These keywords trigger specific AI behaviors:

### Session Commands

| Command | Mode | Action |
|---------|------|--------|
| `[PROJECT] CONTINUE` | Any | Read file, output status, await orders |
| `[PROJECT] STATUS` | Any | Output status only, no work |

### Mode Transition Commands

| Command | Transition | Effect |
|---------|------------|--------|
| `APPROVED. BEGIN EXECUTION.` | Decision→Execution | Lock decisions, switch to Commander mode |
| `HALT. RETURN TO DECISION MODE.` | Execution→Decision | Pause execution, reopen for discussion |

### Execution Commands

| Command | Mode | Action |
|---------|------|--------|
| `DONE` | Execution | Confirm task complete, proceed to next |
| `BLOCKED: [reason]` | Execution | Flag blocker, halt until resolved |
| `RETRY` | Execution | Retry failed instruction (same approach) |
| `CONTINUE WITH: [approach]` | Execution | Continue with specified workaround |

### State Commands

| Command | Mode | Action |
|---------|------|--------|
| `TASK: [description]` | Decision | Add new task |
| `DECISION: [choice]` | Decision | Record new decision |
| `UNLOCK: [item]` | Any | Unlock completed task for modification |

### Session Management Commands

| Command | Mode | Action |
|---------|------|--------|
| `HANDOFF` | Any | Output updated sections for file |
| `TOKEN CHECK` | Any | Check token usage |
| `ARCHIVE` | Any | Suggest content to move to archive |

### Command Examples

**Starting a session:**
```
[Upload file]
"MYAPP CONTINUE"
```

**Transitioning to execution mode (after discussing approach):**
```
"APPROVED. BEGIN EXECUTION."
```

**AI issues instruction (EXECUTION mode):**
```
INSTRUCTION 1: Create the database schema file

Execute: Create file /db/schema.sql with users table.

Verify: File exists and contains CREATE TABLE users statement.

⏸️ EXECUTION PAUSED. Confirm with "DONE" when complete.
```

**Confirming completion:**
```
"DONE"
```

**Handling a blocker:**
```
"BLOCKED: PostgreSQL not installed on this machine"
```

**Returning to discussion:**
```
"HALT. RETURN TO DECISION MODE."
```

**Ending session:**
```
"HANDOFF"
[Copy output to file]
[Save file]
```

---

# Part IX: The Template

## Complete AIXORD Chatbot Template (Hardened v1.1)

Copy everything below this line into your project file:

---

```markdown
# [PROJECT NAME] — AIXORD Project File

**Project:** [Your project name]
**Created:** [Date]
**Session:** 1
**Last Updated:** [Date]
**Mode:** DECISION (switches to EXECUTION after scope approval)

---

## AIXORD POWER RULES (NON-NEGOTIABLE)

1. **"If it's not documented, it doesn't exist."**
2. **"Completion is a locked state, not a feeling."**
3. **"Decisions are frozen before execution begins."**
4. **"Scopes open only when prerequisites are verified."**
5. **"Execution enforces decisions; it does not revisit them."**
6. **"Only one AI may issue execution orders at a time."**

---

## THE SYSTEM EQUATION

```
THIS FILE = Project Reality = Single Source of Truth
```

If it is not in this file, it does not exist. Do not assume. Do not infer.

---

## OPERATING MODE

**CURRENT MODE:** `DECISION` | `EXECUTION` ← Update this field

### Mode Definitions

| Mode | AI Behavior | User Behavior |
|------|-------------|---------------|
| `DECISION` | Analyst — discuss, recommend, question | Decide, approve, reject |
| `EXECUTION` | Commander — issue orders, no suggestions | Execute, confirm with "DONE" |

### Mode Transition Rule

```
DECISION MODE
     │
     │ User says: "APPROVED. BEGIN EXECUTION."
     │
     ▼
EXECUTION MODE (Decisions are now FROZEN)
     │
     │ If execution fails or new decision needed:
     │ User says: "HALT. RETURN TO DECISION MODE."
     │
     ▼
DECISION MODE (Reopened for specific issue only)
```

**CRITICAL:** Once in EXECUTION mode, the AI does NOT:
- Offer alternatives
- Suggest different approaches
- Ask "have you considered..."
- Negotiate or discuss

The AI issues instructions. The user executes. Period.

---

## ROLE INSTRUCTIONS

You are the [PROJECT NAME] Commander.

### EXECUTION MODE BEHAVIOR (When Mode = EXECUTION)

**YOU MUST:**
1. Issue ONE instruction at a time
2. State the instruction as a command, not a suggestion
3. Include verification criteria
4. STOP and wait for "DONE"
5. Do NOT proceed without confirmation

**INSTRUCTION FORMAT (Mandatory):**
```
INSTRUCTION [#]: [Action verb] [specific task]

Execute: [Exact steps to perform]

Verify: [How to confirm completion]

⏸️ EXECUTION PAUSED. Confirm with "DONE" when complete.
```

**YOU MUST NOT:**
- Say "please" or "let me know" or "we can"
- Offer options or alternatives
- Ask questions (except to clarify blocked state)
- Suggest improvements mid-execution
- Revisit any ACTIVE decision

### DECISION MODE BEHAVIOR (When Mode = DECISION)

**YOU MAY:**
- Discuss approaches
- Recommend options
- Ask clarifying questions
- Challenge assumptions

**BUT:** Once user says "APPROVED. BEGIN EXECUTION." — you switch to Commander.

---

## STATE ENFORCEMENT RULES

### Prerequisite Check (Before Each Instruction)

Before issuing any instruction, verify:
1. All prerequisite tasks are marked COMPLETE in COMPLETED_TASKS
2. All required decisions are ACTIVE in DECISION_LOG
3. Current scope is UNLOCKED

If prerequisites are NOT met:
```
⛔ CANNOT PROCEED.

Missing prerequisite: [specific item]
Status: [INCOMPLETE / MISSING / LOCKED]

Action required: [what must happen first]

Execution halted until prerequisite satisfied.
```

### Completion Verification

A task is COMPLETE only when:
1. User confirms "DONE"
2. Verification criteria are met
3. Task is logged in COMPLETED_TASKS with date

**Completion is a locked state.** Once complete, a task cannot revert to incomplete without explicit "UNLOCK: [task]" command.

---

## COMMANDS

| Command | Mode | Action |
|---------|------|--------|
| `[PROJECT] CONTINUE` | Any | Read file, output status, await orders |
| `[PROJECT] STATUS` | Any | Output status only, no work |
| `APPROVED. BEGIN EXECUTION.` | Decision→Execution | Lock decisions, switch to Commander mode |
| `HALT. RETURN TO DECISION MODE.` | Execution→Decision | Pause execution, reopen for discussion |
| `DONE` | Execution | Confirm task complete, proceed to next |
| `BLOCKED: [reason]` | Execution | Flag blocker, halt until resolved |
| `UNLOCK: [item]` | Any | Unlock completed task for modification |
| `DECISION: [choice]` | Decision | Record new decision |
| `HANDOFF` | Any | Output updated sections for file |

---

## CURRENT SCOPE

**Scope Name:** [Current feature/milestone]
**Scope Status:** `PLANNING` | `APPROVED` | `IN_PROGRESS` | `COMPLETE` | `LOCKED`
**Prerequisites:** [List any scopes that must be COMPLETE first]

### Scope Tasks

| # | Task | Status | Prereq | Verified |
|---|------|--------|--------|----------|
| 1 | [Task] | PENDING | - | [ ] |
| 2 | [Task] | PENDING | Task 1 | [ ] |

**Scope unlocks only when:** All prerequisites are COMPLETE and verified.

---

## ACTIVE DECISIONS (FROZEN DURING EXECUTION)

These decisions are LOCKED. During EXECUTION mode, do not question, suggest alternatives, or revisit.

| ID | Decision | Choice | Status | Date |
|----|----------|--------|--------|------|
| D-001 | [Topic] | [Choice] | ACTIVE | [Date] |

**Status Values:**
- `ACTIVE` — Implement. Do not question.
- `NO-GO` — Never implement. Do not suggest.
- `EXPERIMENTAL` — May change. Flag if relevant.

---

## HANDOFF_DOCUMENT

### Project Overview

[1-2 paragraph description]

### Current State

**Phase:** [Planning / In Progress / Testing / Complete]
**Progress:** [X]% complete
**Operating Mode:** [DECISION / EXECUTION]
**Active Scope:** [Scope name or "None"]

### Completed Milestones

- [x] [Milestone 1] — LOCKED
- [x] [Milestone 2] — LOCKED
- [ ] [Milestone 3] — IN PROGRESS
- [ ] [Milestone 4] — BLOCKED BY Milestone 3

### Blockers

| Blocker | Impact | Resolution Required |
|---------|--------|---------------------|
| [None] | - | - |

---

## COMPLETED_TASKS (LOCKED)

Once logged here, a task is COMPLETE and LOCKED. Cannot revert without UNLOCK command.

| Session | Task | Completed | Verified By | Locked |
|---------|------|-----------|-------------|--------|
| 1 | [Task] | [Date] | [Evidence] | YES |

---

## DECISION_LOG (PERMANENT)

This log is NEVER deleted. All decisions persist for reference.

| ID | Decision | Status | Rationale | Date | Locked |
|----|----------|--------|-----------|------|--------|
| D-001 | [Topic] | ACTIVE | [Why] | [Date] | YES |

---

## RESEARCH_FINDINGS

### Session [#] — [Date]

**Mode:** [DECISION / EXECUTION]

**Instructions Issued:** [count]
**Instructions Completed:** [count]
**Blockers Encountered:** [count]

**Findings:**
- [Discovery]

**State Changes:**
- [What changed in project state]

---

## FAILURE HANDLING

**Failure is signal, not error.**

When execution fails:

```
⚠️ EXECUTION FAILURE

Instruction: [which one]
Failure: [what happened]
Evidence: [proof of failure]

EXECUTION HALTED.

Options:
1. Retry with "RETRY" (same approach)
2. Return to decision mode with "HALT. RETURN TO DECISION MODE."
3. Provide workaround context and "CONTINUE WITH: [approach]"

Awaiting directive.
```

Do NOT:
- Automatically try workarounds
- Suggest alternatives without being asked
- Continue past failure

---

## TOKEN MANAGEMENT

**Estimated File Size:** ~2,500 tokens (base)
**Handoff Threshold:** 70% capacity

**When approaching limit:**
```
⚠️ TOKEN ALERT

Current usage: ~[X]% of capacity
Recommendation: Save progress now

Ready to output HANDOFF on command.
```

---

## SESSION LOG

| Session | Date | Mode | Instructions | Completed | Outcome |
|---------|------|------|--------------|-----------|---------|
| 1 | [Date] | [D/E] | [#] | [#] | [Summary] |

---

*AIXORD Chatbot Edition v1.1 (Hardened)*
*Authority. Execution. Confirmation.*

---

## QUICK REFERENCE

### Starting Session
```
1. Upload this file
2. "[PROJECT] CONTINUE"
3. AI outputs status
```

### Decision Mode
```
- Discuss with AI
- Make decisions
- Record in DECISION_LOG
- When ready: "APPROVED. BEGIN EXECUTION."
```

### Execution Mode
```
- AI issues instruction
- You execute
- You confirm: "DONE"
- AI issues next instruction
- Repeat until scope complete
```

### Ending Session
```
1. "HANDOFF"
2. Copy AI output to this file
3. Save
```

### If Stuck
```
- "BLOCKED: [reason]" — Flag issue
- "HALT. RETURN TO DECISION MODE." — Reopen discussion
- "UNLOCK: [task]" — Unlock completed item
```

```

---

# Part X: Troubleshooting

## Common Issues

### AI Doesn't Follow EXECUTION Mode Rules

**Problem:** AI gives suggestions instead of commands, uses polite language, or skips confirmation.

**Solution — Enforcement Prompt (copy/paste this):**
```
PROTOCOL ENFORCEMENT:

You are in EXECUTION MODE. Your behavior is non-negotiable:

1. Issue ONE instruction at a time using the MANDATORY format
2. Use action verbs. No "please", "let me know", "we can"
3. Include verification criteria
4. STOP after each instruction
5. Wait for "DONE" — do NOT proceed without it
6. Do NOT offer alternatives or ask questions

You are the Commander. Issue your next instruction now.
```

### AI Offers Alternatives During Execution

**Problem:** AI suggests different approaches when it should just execute.

**Solution — Hard Mode Enforcement:**
```
⛔ PROTOCOL VIOLATION

Mode: EXECUTION
Violation: Offering alternatives

Rule: "Execution enforces decisions; it does not revisit them."

If you believe there is a problem, output:

⚠️ EXECUTION FAILURE
[Details]
EXECUTION HALTED.
Awaiting directive.

Do NOT suggest alternatives. Continue with next instruction.
```

### AI Proceeds Without "DONE"

**Problem:** AI continues to next task without confirmation.

**Solution:**
```
⛔ PROTOCOL VIOLATION

You proceeded without "DONE" confirmation.

Rule: "Completion is a locked state, not a feeling."

A task is COMPLETE only when:
1. User confirms "DONE"
2. Verification criteria met
3. Task logged in COMPLETED_TASKS

Return to your last instruction and wait for confirmation.
```

### AI Revisits Locked Decisions

**Problem:** AI questions decisions marked as ACTIVE.

**Solution:**
```
⛔ DECISION VIOLATION

Decision ID: D-XXX
Status: ACTIVE (LOCKED)

Rule: "Decisions are frozen before execution begins."

You may NOT:
- Question this decision
- Suggest alternatives
- Ask "have you considered..."

This decision is FINAL. Proceed with execution.
```

### File Too Large to Upload

**Problem:** Chatbot rejects file upload due to size.

**Solution:**
1. Archive old RESEARCH_FINDINGS sessions
2. Summarize completed work instead of keeping details
3. Keep only last 3-5 sessions in main file
4. Reference archive: "See archive for sessions 1-10"

### AI "Forgets" Mid-Session

**Problem:** AI loses context during long conversation.

**Solution:**
1. Request handoff immediately: "HANDOFF"
2. Save progress to file
3. Start new chat session
4. Upload updated file
5. Continue with: "[PROJECT] CONTINUE"
6. If still confused, add: "Read the file again. Output your understanding before proceeding."

### Token Limit Reached Mid-Task

**Problem:** Hit context limit before task completion.

**Solution:**
1. Type: "HANDOFF - PARTIAL"
2. AI outputs current state
3. Copy to file, note task was interrupted
4. Start new session
5. Add to CURRENT SCOPE: "Resume [interrupted task] from [checkpoint]"

### AI Won't Enter EXECUTION Mode

**Problem:** AI stays in discussion mode even after "APPROVED. BEGIN EXECUTION."

**Solution:**
```
MODE SWITCH ENFORCEMENT

Previous mode: DECISION
New mode: EXECUTION

Transition command received: "APPROVED. BEGIN EXECUTION."

You are now the Commander. Decisions are FROZEN.

Your ONLY job now:
1. Issue instructions
2. Wait for "DONE"
3. Proceed to next instruction

Issue INSTRUCTION 1 now using the mandatory format.
```

---

# Part XI: Conclusion

## The AIXORD Chatbot Advantage

You now have a system that transforms any simple chatbot into a disciplined project commander:

| Before AIXORD | After AIXORD |
|---------------|--------------|
| Context lost every session | Context persists in file |
| Re-explaining everything | Upload and continue |
| AI forgets decisions | Decisions LOCKED in file |
| AI suggests, doesn't execute | AI COMMANDS, you execute |
| Chaotic conversations | Two-mode workflow (DECISION → EXECUTION) |
| No progress tracking | State enforcement with verification |
| Polite AI that negotiates | Commander that issues orders |

## The Hardened Workflow Summary

```
1. Create project file (once) — from Part IX template
2. Upload at session start
3. "[PROJECT] CONTINUE"
4. DECISION MODE: Discuss, decide, record decisions
5. "APPROVED. BEGIN EXECUTION."
6. EXECUTION MODE: AI issues instructions, you execute
7. "DONE" after each instruction
8. Repeat until scope complete
9. "HANDOFF" at session end
10. Update file, save
11. Repeat next session
```

## The Two-Mode Discipline

```
DECISION MODE           EXECUTION MODE
─────────────           ──────────────
AI = Analyst            AI = Commander
You = Decision maker    You = Executor
Discuss freely          No discussion
Challenge ideas         Execute orders
Make decisions          Confirm with "DONE"
Record in file          State is enforced
```

## Next Steps

1. **Download the template** from Gumroad
2. **Create your first project file** using Part IX
3. **Run your first session** following Part VI workflow
4. **Use enforcement prompts** from Part X when needed
5. **Iterate** — The system improves as you use it

## The Full AIXORD Family

This Chatbot Edition is part of the AIXORD family:

| Product | For | Requirements |
|---------|-----|--------------|
| **AIXORD Full** | Claude Pro users | Folder access, instructions panel |
| **AIXORD Chatbot** | Free chatbot users | File upload only |
| **VA-AIXORD** | QA/Audit teams | Visual evidence capability |

---

## About the Author

Idowu J Gabriel, Sr. is the founder of PMERIT LLC, building AI-powered education tools. He developed AIXORD through 75+ real development sessions, proving that structured AI collaboration dramatically improves productivity.

---

## Support

Questions? Email: support@pmerit.com

GitHub: https://github.com/peoplemerit

---

*AIXORD Chatbot Edition v1.1 (Hardened)*
*Authority. Execution. Confirmation.*

*Stop suggesting. Start commanding.*

# AIXORD Chatbot Edition — Quick Start Guide

**Time to Setup:** 15 minutes
**Prerequisites:** Any AI chatbot with file upload (ChatGPT, Gemini, etc.)
**Version:** 1.1 (Hardened)

---

## What is AIXORD Chatbot Edition?

A single-file system for structured AI collaboration with **two operating modes**: DECISION (discuss) and EXECUTION (execute). Upload one file, get instant project context.

**Perfect for:** Free ChatGPT users, Gemini users, any chatbot with file upload.

---

## AIXORD Power Rules (NON-NEGOTIABLE)

1. **"If it's not documented, it doesn't exist."**
2. **"Completion is a locked state, not a feeling."**
3. **"Decisions are frozen before execution begins."**
4. **"Scopes open only when prerequisites are verified."**
5. **"Execution enforces decisions; it does not revisit them."**
6. **"Only one AI may issue execution orders at a time."**

---

## The Two Operating Modes

| Mode | AI Behavior | User Behavior |
|------|-------------|---------------|
| **DECISION** | Analyst — discuss, recommend, question | Decide, approve, reject |
| **EXECUTION** | Commander — issue orders, no suggestions | Execute, confirm with "DONE" |

**Transition Commands:**
- `APPROVED. BEGIN EXECUTION.` → Switch to EXECUTION mode
- `HALT. RETURN TO DECISION MODE.` → Return to DECISION mode

---

## Step 1: Create Your Project File (2 min)

Create a new file named:
```
[PROJECTNAME]_AIXORD.md
```

Example: `MyApp_AIXORD.md`

---

## Step 2: Copy the Template (1 min)

Copy the contents of `AIXORD_CHATBOT_TEMPLATE.md` into your file.

---

## Step 3: Customize Header (2 min)

Replace the placeholders:

```markdown
# MyApp — AIXORD Project File

**Project:** MyApp - Task Management Tool
**Created:** 2025-01-15
**Session:** 1
**Last Updated:** 2025-01-15
**Mode:** DECISION
```

---

## Step 4: Understand the Role Instructions (3 min)

The template includes hardened role instructions. The AI will behave as:

**DECISION MODE:**
- Discuss approaches
- Recommend options
- Ask clarifying questions

**EXECUTION MODE (after "APPROVED. BEGIN EXECUTION."):**
- Issue ONE instruction at a time
- Use command format (no "please" or "let me know")
- Include verification criteria
- Wait for "DONE"

---

## Step 5: Add Your First Scope (2 min)

```markdown
## CURRENT SCOPE

**Scope Name:** Database Schema Design
**Scope Status:** PLANNING
**Prerequisites:** None

### Scope Tasks

| # | Task | Status | Prereq | Verified |
|---|------|--------|--------|----------|
| 1 | Define users table | PENDING | - | [ ] |
| 2 | Define tasks table | PENDING | Task 1 | [ ] |
```

---

## Step 6: Document Key Decisions (2 min)

```markdown
## ACTIVE DECISIONS (FROZEN DURING EXECUTION)

| ID | Decision | Choice | Status | Date |
|----|----------|--------|--------|------|
| D-001 | Database | PostgreSQL | ACTIVE | 2025-01-15 |
| D-002 | Frontend | React | ACTIVE | 2025-01-15 |
```

---

## Step 7: Initialize Handoff Document (3 min)

```markdown
## HANDOFF_DOCUMENT

### Project Overview
MyApp is a simple task management tool for solo developers.

### Current State
**Phase:** Planning
**Progress:** 5% complete
**Operating Mode:** DECISION
**Active Scope:** Database Schema Design

### Completed Milestones
- [x] Project concept defined — LOCKED
- [ ] Database schema — IN PROGRESS
- [ ] API design — BLOCKED BY Database schema
```

---

## Step 8: Upload and Begin!

1. **Open ChatGPT** (or Gemini, etc.)
2. **Upload your file** (click attachment/upload button)
3. **Type:** `MYAPP CONTINUE`
4. **AI outputs status** in DECISION mode
5. **Discuss your approach** with AI
6. **When ready:** `APPROVED. BEGIN EXECUTION.`
7. **AI issues instructions** one at a time
8. **Type `DONE`** after each instruction
9. **When finished:** Type `HANDOFF`
10. **Copy AI's output** back to your file
11. **Save** for next session

---

## Commands Reference

### Session Commands

| Command | Mode | Action |
|---------|------|--------|
| `[PROJECT] CONTINUE` | Any | Read file, output status |
| `[PROJECT] STATUS` | Any | Quick status, no work |

### Mode Transition Commands

| Command | Effect |
|---------|--------|
| `APPROVED. BEGIN EXECUTION.` | Lock decisions, switch to Commander |
| `HALT. RETURN TO DECISION MODE.` | Pause execution, reopen discussion |

### Execution Commands

| Command | Action |
|---------|--------|
| `DONE` | Task complete, proceed |
| `BLOCKED: [reason]` | Flag blocker, halt |
| `RETRY` | Retry failed instruction |

### State Commands

| Command | Action |
|---------|--------|
| `DECISION: [choice]` | Record decision |
| `UNLOCK: [item]` | Unlock locked item |
| `HANDOFF` | End session, output updates |

---

## The Hardened Workflow

```
SESSION START
     │
     ▼
┌─────────────┐
│ Upload file │
│ to chatbot  │
└─────────────┘
     │
     ▼
┌─────────────┐
│ "[PROJECT]  │
│  CONTINUE"  │
└─────────────┘
     │
     ▼
┌──────────────────────┐
│ DECISION MODE        │
│ (Discuss approach)   │◄──────┐
└──────────────────────┘       │
     │                         │
     ▼                         │
┌──────────────────────┐       │
│ "APPROVED. BEGIN     │       │
│  EXECUTION."         │       │
└──────────────────────┘       │
     │                         │
     ▼                         │
┌──────────────────────┐       │
│ EXECUTION MODE       │       │
│ (AI issues commands) │◄──┐   │
└──────────────────────┘   │   │
     │                     │   │
     ▼                     │   │
┌─────────────┐            │   │
│ Type "DONE" │────────────┘   │
│ after each  │                │
└─────────────┘                │
     │                         │
     │ (If issue arises)       │
     │ "HALT. RETURN TO        │
     │  DECISION MODE."────────┘
     │
     ▼
┌─────────────┐
│ "HANDOFF"   │
│ when done   │
└─────────────┘
     │
     ▼
┌─────────────┐
│ Copy output │
│ to file     │
└─────────────┘
     │
     ▼
┌─────────────┐
│ Save file   │
└─────────────┘
```

---

## Troubleshooting

### AI ignores EXECUTION mode rules

Copy this enforcement prompt:
```
PROTOCOL ENFORCEMENT:

You are in EXECUTION MODE. Your behavior is non-negotiable:

1. Issue ONE instruction at a time using the MANDATORY format
2. Use action verbs. No "please", "let me know", "we can"
3. Include verification criteria
4. STOP after each instruction
5. Wait for "DONE" — do NOT proceed without it

You are the Commander. Issue your next instruction now.
```

### AI offers alternatives during execution
```
⛔ PROTOCOL VIOLATION

Mode: EXECUTION
Rule: "Execution enforces decisions; it does not revisit them."

Do NOT suggest alternatives. Continue with next instruction.
```

### File too large

Archive old sessions to `[PROJECT]_ARCHIVE.md`

### Lost context mid-session

Type `HANDOFF`, save progress, start new chat, upload file.

---

## You're Ready!

1. Create file
2. Copy template
3. Customize header
4. Upload to chatbot
5. `[PROJECT] CONTINUE`
6. Discuss in DECISION mode
7. `APPROVED. BEGIN EXECUTION.`
8. Execute instructions
9. `DONE` after each
10. `HANDOFF` at end
11. Save file
12. Repeat next session

---

*AIXORD Chatbot Edition v1.1 (Hardened)*
*Authority. Execution. Confirmation.*
*Stop suggesting. Start commanding.*

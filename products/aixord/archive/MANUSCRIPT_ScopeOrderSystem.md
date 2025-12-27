# Scope Order System

## AI-Augmented Development Methodology

**A Complete Guide to Structured Collaboration Between You and Your AI Assistants**

---

**Version:** 1.0
**Author:** PMERIT Team
**Published:** December 2025

---

## Copyright

Copyright 2025. All Rights Reserved.

This book and its accompanying templates are protected by copyright. You may use the templates in your own projects but may not redistribute or resell them.

---

## Template Access

Your purchase includes downloadable templates.

**Access your templates at:**
[Insert your landing page URL here]

Use your Amazon order confirmation email to verify your purchase.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Part I: The Problem and Solution](#part-i-the-problem-and-solution)
3. [Part II: Quick Start Guide](#part-ii-quick-start-guide)
4. [Part III: Complete System Guide](#part-iii-complete-system-guide)
5. [Part IV: Template Reference](#part-iv-template-reference)
6. [About the Author](#about-the-author)

---

# Introduction

## What's In This Book

The **Scope Order System** is a methodology and template pack for developers who use multiple AI assistants (Claude Web, Claude Code, GitHub Copilot) and need:

- Structured context management across AI tools
- Reality-first workflow that prevents outdated specs
- Session continuity without losing progress
- Clear role separation (Architect vs Implementer)

## Who This Book Is For

- Solo developers using AI-augmented development
- Small teams coordinating multiple AI tools
- Freelancers managing complex client projects
- Anyone frustrated with AI context limits

## What You'll Learn

By the end of this book, you'll have:

1. A complete understanding of the three-way workflow
2. A working Scope Order System setup in your project
3. Templates ready to use immediately
4. The knowledge to maintain context across unlimited sessions

---

# Part I: The Problem and Solution

## The Problem

Developers using AI assistants face critical challenges:

### 1. Context Fragmentation

- Claude Web knows your strategy but can't see your code
- Claude Code can implement but doesn't know the big picture
- GitHub Copilot suggests code without understanding your architecture
- **Result:** Inconsistent implementations, repeated explanations

### 2. Specification Drift

- You write specs, then implement
- Implementation reveals issues with specs
- Specs become outdated
- Next session, you work from wrong assumptions
- **Result:** Wasted work, regressions, confusion

### 3. Session Continuity Loss

- AI assistants forget everything between sessions
- You re-explain context every time
- Progress notes scattered across chat logs
- **Result:** Slow startups, lost decisions, repeated work

### 4. Role Confusion

- When should AI plan vs implement?
- Who approves changes?
- Where do decisions get recorded?
- **Result:** Chaotic workflow, unclear ownership

---

## The Solution: Scope Order System

A **methodology + template pack** that creates structured collaboration between you and your AI assistants.

### Core Concept: Reality-First Workflow

```
Traditional (Spec-First):
  Write Spec -> Implement -> Discover spec was wrong -> Redo

Scope Order (Reality-First):
  Audit Reality -> Write Spec Based on Facts -> Implement -> Update Findings
```

### Three-Way Team Structure

```
+-------------+      +-------------+      +-------------+
| CLAUDE WEB  |<---->|     YOU     |<---->| CLAUDE CODE |
| (Architect) |      | (Director)  |      |(Implementer)|
+-------------+      +-------------+      +-------------+
     |                     |                     |
     | Strategy            | Decisions           | Execution
     | Brainstorming       | Approvals           | Quality Review
     | Specifications      | Coordination        | Implementation
```

### Hierarchical Scope Management

```
MASTER_SCOPE.md          <- Project vision (single source of truth)
    |
    +-- SCOPE_AUTH.md        <- Authentication feature
    +-- SCOPE_DASHBOARD.md   <- Dashboard feature
    +-- SCOPE_PAYMENTS.md    <- Payments feature
    +-- ...
```

Each scope contains:
- **AUDIT_REPORT** - Current reality (populated by Claude Code)
- **HANDOFF_DOCUMENT** - Specifications (populated by Claude Web)
- **RESEARCH_FINDINGS** - Implementation notes (populated by Claude Code)
- **DEPENDENCIES** - How scopes relate

---

## How It Works

### Step 1: Director Creates Empty Scope

```
You: Create SCOPE_FEATURE.md in .claude/scopes/
You: Commit to repo
```

### Step 2: Claude Code Audits Reality

```
You -> Claude Code: "AUDIT SCOPE: FEATURE"
Claude Code: Examines codebase, populates AUDIT_REPORT
```

### Step 3: Director Shares with Architect

```
You -> Claude Web: "Here's the audit report for FEATURE"
```

### Step 4: Architect + Director Collaborate

```
Claude Web + You: Brainstorm based on FACTS
Claude Web: Updates SCOPE_FEATURE.md with HANDOFF_DOCUMENT
```

### Step 5: Director Triggers Implementation

```
You -> Claude Code: "SCOPE UPDATED: FEATURE"
Claude Code: Reads specs, recommends alternatives if better, implements
```

### Step 6: Claude Code Updates Findings

```
Claude Code: Updates RESEARCH_FINDINGS with what was done
```

### Step 7: Repeat

```
You -> Claude Web: Share implementation output
Claude Web: Provides follow-up requirements
REPEAT until feature complete
```

---

## What's Included

### Templates

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Instructions for Claude Code (Implementer role) |
| `CLAUDE_WEB_SYNC.md` | Mirror of Claude Web instructions |
| `MASTER_SCOPE.md` | Project vision template |
| `SCOPE_TEMPLATE.md` | Per-feature scope template |
| `STATE.json` | Machine-readable state tracking |
| `GOVERNANCE.md` | Workflow rules and protocols |
| `SYSTEM_GUIDE.md` | Complete operational documentation |

### Commands

| Command | Effect |
|---------|--------|
| `PMERIT CONTINUE` | Full session startup protocol |
| `AUDIT SCOPE: [name]` | Claude Code audits reality |
| `SCOPE UPDATED: [name]` | Claude Code implements specs |
| `SCOPE: [name]` | Load existing scope context |

---

## Benefits

| Before Scope Order | After Scope Order |
|--------------------|-------------------|
| Re-explain context every session | Context persists in scope files |
| Specs become outdated | Reality-first prevents drift |
| Unclear who does what | Clear role separation |
| Progress lost in chat logs | RESEARCH_FINDINGS captures everything |
| Context window overload | Load only active scope |
| Random implementations | Architectural decisions locked |

---

## Who Is This For?

### Ideal Customer

- Solo developer or small team (1-5 people)
- Uses Claude Web AND Claude Code (or similar AI tools)
- Works on projects with multiple features/components
- Frustrated with AI context limits and session resets
- Values documentation and structured workflows

### Not For

- Teams with existing robust project management
- Developers who don't use AI assistants
- One-off scripts or tiny projects

---

## Technical Requirements

- Git repository (any hosting)
- Claude Pro or Team subscription (for Claude Code)
- Claude.ai account (for Claude Web)
- Text editor (VS Code recommended)

**No additional software required.** The system is pure documentation + workflow.

---

## Origin Story

This system was developed through **50+ real development sessions** on the PMERIT AI Educational Platform - a production web application with:

- Frontend (HTML/CSS/JS)
- Backend API (Cloudflare Workers)
- Database (Neon PostgreSQL)
- AI integrations (OpenAI, Azure TTS)

The methodology evolved from necessity: managing complex features across multiple AI assistants without losing context or creating duplicate work.

The **Reality-First** improvement (v2) came from discovering that specs written before auditing reality were often wrong, leading to wasted implementation cycles.

---

# Part II: Quick Start Guide

**Time to Setup:** 15 minutes
**Prerequisites:** Git repo, Claude Pro subscription, text editor

---

## Overview

This guide gets you from zero to a working Scope Order System in 15 minutes.

```
What You'll Have:
+-- .claude/
|   +-- CLAUDE.md                <- Claude Code instructions
|   +-- CLAUDE_WEB_SYNC.md       <- Claude Web sync
|   +-- scopes/
|       +-- MASTER_SCOPE.md      <- Your project vision
+-- docs/aados/
|   +-- STATE.json               <- State tracking
|   +-- GOVERNANCE.md            <- Workflow rules
+-- Ready to use three-way workflow!
```

---

## Step 1: Create Directory Structure (2 min)

In your project root, create the folders:

```bash
# Create .claude directories
mkdir -p .claude/scopes

# Create docs directories
mkdir -p docs/aados
mkdir -p docs/handoffs
```

---

## Step 2: Copy Templates (3 min)

Copy these files from your downloaded templates folder:

| Template | Destination |
|----------|-------------|
| `templates/CLAUDE.md` | `.claude/CLAUDE.md` |
| `templates/CLAUDE_WEB_SYNC.md` | `.claude/CLAUDE_WEB_SYNC.md` |
| `templates/MASTER_SCOPE.md` | `.claude/scopes/MASTER_SCOPE.md` |
| `templates/STATE.json` | `docs/aados/STATE.json` |
| `templates/GOVERNANCE.md` | `docs/aados/GOVERNANCE.md` |
| `templates/SYSTEM_GUIDE.md` | `.claude/SYSTEM_GUIDE.md` |

---

## Step 3: Customize CLAUDE.md (3 min)

Open `.claude/CLAUDE.md` and replace:

```markdown
# [PROJECT NAME] - Claude Code Instructions
```

With your project name. Example:

```markdown
# MyApp - Claude Code Instructions
```

Also update the commands section:

```markdown
| `[PROJECT] CONTINUE` | ...
```

To:

```markdown
| `MYAPP CONTINUE` | ...
```

---

## Step 4: Fill Out MASTER_SCOPE.md (5 min)

Open `.claude/scopes/MASTER_SCOPE.md` and fill in:

### 1. Project Identity

```markdown
| **Project Name** | MyApp |
| **Mission** | Help developers track their tasks |
| **Target Users** | Solo developers and small teams |
```

### 2. Technical Stack

```markdown
| **Frontend** | React |
| **Backend** | Node.js + Express |
| **Database** | PostgreSQL |
```

### 3. Core Features

Leave blank for now. You'll create scope files as you work.

### 4. Locked Decisions

```markdown
| Database | PostgreSQL | Team expertise | 2025-01-01 |
| Hosting | Vercel | Cost effective | 2025-01-01 |
```

---

## Step 5: Setup Claude Web (2 min)

### In Claude.ai:

1. Go to your project
2. Click "Set project instructions"
3. Paste your project context:

```
# [PROJECT NAME] - Mission Instructions

## Project Identity
- Production: [URL]
- Repository: [GitHub URL]
- Local Path: [Path]

## Quick Commands
| Command | Action |
|---------|--------|
| [PROJECT] CONTINUE | Full startup protocol |
| SCOPE: [name] | Load scope context |
| DONE | Confirm step complete |
```

4. Save

---

## Step 6: Initial Commit

```bash
git add .claude/ docs/aados/
git commit -m "chore: Setup Scope Order System

- Added Claude Code instructions
- Added Claude Web sync file
- Added Master Scope
- Added governance files

Scope Order System v2"
```

---

## Step 7: Test It! (First Session)

### Start Claude Code and type:

```
[PROJECT] CONTINUE
```

Claude Code should:

1. Read STATE.json
2. Read GOVERNANCE.md
3. Output a status response

### Create Your First Scope:

1. Create empty file: `.claude/scopes/SCOPE_AUTH.md`
2. Commit it
3. Tell Claude Code: `AUDIT SCOPE: AUTH`
4. Claude Code audits your codebase for auth-related code
5. Share the audit with Claude Web
6. Brainstorm with Claude Web
7. Claude Web fills HANDOFF_DOCUMENT
8. Tell Claude Code: `SCOPE UPDATED: AUTH`
9. Claude Code implements!

---

## You're Done!

### What You Can Now Do:

| Command | Effect |
|---------|--------|
| `[PROJECT] CONTINUE` | Start any session |
| `AUDIT SCOPE: [name]` | Audit reality for new feature |
| `SCOPE UPDATED: [name]` | Implement after specs written |
| `SCOPE: [name]` | Load existing feature context |

### Workflow Summary:

```
1. Create empty scope file
2. AUDIT SCOPE -> Claude Code checks reality
3. Share with Claude Web
4. Brainstorm specs
5. SCOPE UPDATED -> Claude Code implements
6. Repeat
```

---

## Common First-Week Questions

### Q: How many scopes should I create?

**A:** One per major feature. Start with 3-5, add more as needed.

### Q: When do I update CLAUDE_WEB_SYNC.md?

**A:** When you change Claude Web's project instructions, or monthly.

### Q: Can I skip the audit step?

**A:** For existing features with good documentation, yes. For new features, never skip - it prevents wasted work.

### Q: What if Claude Code recommends something different?

**A:** That's the quality review! Discuss with Claude Web if needed, then decide.

---

## Troubleshooting

### Claude Code doesn't recognize commands

Make sure `.claude/CLAUDE.md` exists and has the correct project name in commands.

### Scope file not loading

Check `docs/aados/STATE.json` has `scope_order.scopes` with the scope listed.

### Lost context between sessions

Ensure RESEARCH_FINDINGS is updated before ending each session.

---

# Part III: Complete System Guide

## 1. Team Structure

```
+-----------------------------------------------------------------------------+
|                           DEVELOPMENT TEAM                                   |
+-----------------------------------------------------------------------------+
|                                                                              |
|  +--------------+      +--------------+      +--------------+                |
|  |  CLAUDE WEB  |      |   DIRECTOR   |      | CLAUDE CODE  |                |
|  |  (Architect) |<---->|    (You)     |<---->| (Implementer)|                |
|  +--------------+      +--------------+      +--------------+                |
|                                                                              |
|  - Strategy            - Decision maker      - Code execution                |
|  - Brainstorming       - Coordinator         - Reality audits                |
|  - Specifications      - Git operations      - Quality review                |
|  - Documentation       - Approvals           - Implementation                |
|                                                                              |
+-----------------------------------------------------------------------------+
```

### Role Responsibilities

| Role | Does | Does NOT |
|------|------|----------|
| **Claude Web** | Strategy, specs, brainstorm | Execute code, access filesystem |
| **Director** | Decisions, git, approvals | Write specs alone, skip reviews |
| **Claude Code** | Audit, implement, review | Make architectural decisions alone |

---

## 2. Directory Layout

```
project-root/
|
+-- .claude/                          <- AI CONTEXT FILES
|   +-- CLAUDE.md                     <- Claude Code instructions
|   +-- CLAUDE_WEB_SYNC.md            <- Claude Web instructions mirror
|   +-- SYSTEM_GUIDE.md               <- This file
|   +-- scopes/                       <- SCOPE ORDER SYSTEM
|       +-- MASTER_SCOPE.md           <- Project vision
|       +-- SCOPE_[FEATURE1].md       <- Feature 1
|       +-- SCOPE_[FEATURE2].md       <- Feature 2
|       +-- ...
|
+-- docs/
|   +-- aados/                        <- GOVERNANCE LAYER
|   |   +-- STATE.json                <- Machine state pointer
|   |   +-- TASK_TRACKER.md           <- Living task status
|   |   +-- GOVERNANCE.md             <- Workflow rules
|   +-- handoffs/                     <- SESSION CONTINUITY
|       +-- SESSION_XX.md             <- Per-session handoffs
|
+-- [your code directories]
```

---

## 3. Scope Order System v2

### Core Concept: Reality-First

```
Traditional (Spec-First):
  Write Spec -> Implement -> Discover spec was wrong -> Redo

Scope Order v2 (Reality-First):
  Audit Reality -> Write Spec Based on Facts -> Implement -> Update
```

### Scope File States

```
EMPTY       -> AUDITED       -> SPECIFIED       -> IMPLEMENTED
  ^             ^                 ^                 ^
Director    Claude Code      Claude Web       Claude Code
creates     audits reality   writes specs     implements
```

### Scope File Structure

```markdown
# SCOPE: [FEATURE]

## 1. SCOPE IDENTITY
[What files, APIs, tables are involved]

## 2. ARCHITECTURAL DECISIONS (LOCKED)
[Decisions that cannot change]

## 3. AUDIT_REPORT
[Claude Code: Current production reality]

## 4. HANDOFF_DOCUMENT
[Claude Web: Feature specifications]

## 5. RESEARCH_FINDINGS
[Claude Code: Implementation notes per session]

## 6. DEPENDENCIES
[How this scope relates to others]
```

### Benefits

| Challenge | Solution |
|-----------|----------|
| Outdated specs | Reality check before planning |
| Context overload | Load only active scope |
| Session continuity gaps | RESEARCH_FINDINGS persists |
| Implementation drift | Locked architectural decisions |
| Cross-feature dependencies | Explicit DEPENDENCIES section |

---

## 4. Three-Way Workflow

### Complete Cycle

```
+-----------------------------------------------------------------------------+
|                         v2 WORKFLOW CYCLE                                    |
+-----------------------------------------------------------------------------+
|                                                                              |
|  1. DIRECTOR: Create empty SCOPE_[NAME].md                                   |
|                          |                                                   |
|                          v                                                   |
|  2. CLAUDE CODE: "AUDIT SCOPE: [NAME]"                                       |
|     -> Examines codebase                                                     |
|     -> Populates AUDIT_REPORT section                                        |
|                          |                                                   |
|                          v                                                   |
|  3. DIRECTOR -> CLAUDE WEB: Share audit report                               |
|                          |                                                   |
|                          v                                                   |
|  4. CLAUDE WEB + DIRECTOR: Brainstorm based on FACTS                         |
|     -> Discuss requirements                                                  |
|     -> Make decisions                                                        |
|                          |                                                   |
|                          v                                                   |
|  5. CLAUDE WEB: Update scope file                                            |
|     -> Populates HANDOFF_DOCUMENT section                                    |
|                          |                                                   |
|                          v                                                   |
|  6. DIRECTOR -> CLAUDE CODE: "SCOPE UPDATED: [NAME]"                         |
|                          |                                                   |
|                          v                                                   |
|  7. CLAUDE CODE: Review & Implement                                          |
|     -> Reads HANDOFF_DOCUMENT                                                |
|     -> Recommends alternatives if better                                     |
|     -> Implements after approval                                             |
|     -> Updates RESEARCH_FINDINGS                                             |
|                          |                                                   |
|                          v                                                   |
|  8. DIRECTOR -> CLAUDE WEB: Share implementation output                      |
|                          |                                                   |
|                          v                                                   |
|  9. REPEAT until feature complete                                            |
|                                                                              |
+-----------------------------------------------------------------------------+
```

---

## 5. Commands Reference

### Session Commands

| Command | Who Uses | Effect |
|---------|----------|--------|
| `[PROJECT] CONTINUE` | Director -> Claude Code | Full startup protocol |
| `[PROJECT] STATUS` | Director -> Claude Code | Quick check (no work) |
| `DONE` | Director -> Claude Code | Confirm step complete |

### Scope Commands

| Command | Who Uses | Effect |
|---------|----------|--------|
| `AUDIT SCOPE: [name]` | Director -> Claude Code | Audit reality, populate AUDIT_REPORT |
| `SCOPE UPDATED: [name]` | Director -> Claude Code | Read specs, implement |
| `SCOPE: [name]` | Director -> Claude Code | Load existing context |
| `SCOPE: MASTER` | Director -> Claude Code | Load project vision |

### Environment Commands

| Command | Effect |
|---------|--------|
| `ENV: FE` | Switch focus to Frontend |
| `ENV: BE` | Switch focus to Backend |

---

## 6. File Sync Protocol

### Claude Web to Claude Code Sync

```
Claude Web Settings
         |
         | (Manual copy when instructions change)
         v
.claude/CLAUDE_WEB_SYNC.md
         |
         | (Claude Code reads on startup)
         v
Claude Code has Architect context
```

### When to Sync

- When Claude Web project instructions change
- When personal preferences change
- Periodically (every few sessions)

### How to Sync

1. Copy from Claude Web -> Project -> Set project instructions
2. Copy from Claude Web -> Settings -> General -> Preferences
3. Paste into `.claude/CLAUDE_WEB_SYNC.md`
4. Update "Last Synced" date
5. Commit changes

---

## 7. Session Lifecycle

### Session Start

```
1. Director: "[PROJECT] CONTINUE"

2. Claude Code:
   - Reads STATE.json
   - Reads TASK_TRACKER.md
   - Reads GOVERNANCE.md
   - Checks active scope
   - Verifies git sync
   - Outputs status

3. Director: Decides what to work on
```

### During Session

```
For New Feature:
  Director: Creates empty scope file
  Director: "AUDIT SCOPE: [name]"
  Claude Code: Audits, populates AUDIT_REPORT
  Director: Shares with Claude Web
  Claude Web: Writes HANDOFF_DOCUMENT
  Director: "SCOPE UPDATED: [name]"
  Claude Code: Implements

For Existing Feature:
  Director: "SCOPE: [name]"
  Claude Code: Loads context, continues work
```

### Session End

```
1. Claude Code:
   - Updates RESEARCH_FINDINGS in active scope
   - Updates STATE.json (session number, changes)
   - Creates handoff if significant progress

2. Director:
   - Reviews changes
   - Commits to git
   - (Optional) Shares summary with Claude Web
```

---

## 8. Troubleshooting

### Problem: Claude Code doesn't know context

**Cause:** Scope not loaded

**Solution:**
```
Director: "SCOPE: [name]"
```

### Problem: Specs don't match reality

**Cause:** Skipped audit step

**Solution:**
```
Director: "AUDIT SCOPE: [name]"
```
Then share audit with Claude Web to update specs.

### Problem: Lost progress between sessions

**Cause:** RESEARCH_FINDINGS not updated

**Solution:**
Always ensure Claude Code updates RESEARCH_FINDINGS before ending session.

### Problem: Claude Code and Claude Web disagree

**Cause:** Instructions out of sync

**Solution:**
Update `.claude/CLAUDE_WEB_SYNC.md` with latest Claude Web instructions.

### Problem: Don't know what to work on

**Cause:** STATE.json not read

**Solution:**
```
Director: "[PROJECT] CONTINUE"
```
Claude Code will read state and suggest next action.

---

## Quick Reference Card

```
+---------------------------------------------------------------------+
|                    SCOPE ORDER QUICK REFERENCE                       |
+---------------------------------------------------------------------+
|                                                                      |
|  SESSION START:    [PROJECT] CONTINUE                                |
|  NEW FEATURE:      Create scope -> AUDIT SCOPE -> Share -> SCOPE     |
|                    UPDATED -> Implement                              |
|  CONTINUE WORK:    SCOPE: [name]                                     |
|  CHECK STATUS:     [PROJECT] STATUS                                  |
|                                                                      |
|  SCOPE STATES:     EMPTY -> AUDITED -> SPECIFIED -> IMPLEMENTED      |
|                                                                      |
|  KEY FILES:                                                          |
|    .claude/scopes/SCOPE_*.md    <- Feature context                   |
|    .claude/CLAUDE_WEB_SYNC.md   <- Architect instructions            |
|    docs/aados/STATE.json        <- Current state                     |
|                                                                      |
|  WORKFLOW:                                                           |
|    1. Audit Reality  (Claude Code)                                   |
|    2. Write Specs    (Claude Web)                                    |
|    3. Implement      (Claude Code)                                   |
|    4. Repeat                                                         |
|                                                                      |
+---------------------------------------------------------------------+
```

---

# Part IV: Template Reference

The following templates are included in your download package. Each template is ready to use - simply copy it to the appropriate location and customize the placeholders.

---

## Template 1: CLAUDE.md (Claude Code Instructions)

**Location:** `.claude/CLAUDE.md`

**Purpose:** This file tells Claude Code how to behave as the Implementer role.

```markdown
# [PROJECT NAME] - Claude Code Instructions

**Version:** 1.0
**Updated:** [DATE]

---

## TEAM WORKFLOW

+-------------+      +-------------+      +-------------+
| CLAUDE WEB  |<---->|     YOU     |<---->| CLAUDE CODE |
| (Architect) |      | (Director)  |      |(Implementer)|
+-------------+      +-------------+      +-------------+
     |                     |                     |
     | Strategy, prompts   | Decisions, git      | Code execution
     | Brainstorming       | Coordination        | Quality review
     | Documentation       | Approvals           | Scope updates

**Claude Web Instructions:** See `.claude/CLAUDE_WEB_SYNC.md`

---

## SCOPE ORDER v2: REALITY-FIRST WORKFLOW

### Workflow Steps

1. YOU: Create empty SCOPE_[NAME].md, commit to repo
2. CLAUDE CODE: Audit reality -> populate AUDIT_REPORT section
3. YOU -> CLAUDE WEB: Share audit report
4. CLAUDE WEB + YOU: Brainstorm, write requirements
5. CLAUDE WEB: Update SCOPE_[NAME].md with HANDOFF_DOCUMENT
6. YOU -> CLAUDE CODE: "SCOPE UPDATED: [NAME]"
7. CLAUDE CODE: Review, recommend, implement -> update RESEARCH_FINDINGS
8. REPEAT until complete

### Scope Commands

| Command | Action |
|---------|--------|
| `AUDIT SCOPE: [name]` | Audit reality, populate AUDIT_REPORT |
| `SCOPE UPDATED: [name]` | Read updated scope, review & implement |
| `SCOPE: [name]` | Load scope context |
| `SCOPE: MASTER` | Load full project vision |

### Scope Files Location

.claude/scopes/
+-- MASTER_SCOPE.md      <- Project vision
+-- SCOPE_[FEATURE].md   <- Per-feature specifications
+-- ...

---

## MANDATORY STARTUP PROTOCOL

When starting a session, you MUST:

### STEP 1: READ GOVERNANCE FILES

docs/aados/STATE.json       <- Current state pointer
docs/aados/TASK_TRACKER.md  <- Living task status
docs/aados/GOVERNANCE.md    <- Workflow rules

### STEP 2: CHECK ACTIVE SCOPE

From STATE.json, check `scope_order.active_scope`. If set, read:
.claude/scopes/SCOPE_[name].md

### STEP 3: VERIFY GIT SYNC

git fetch origin && git status

Expected: "Your branch is up to date with 'origin/main'."

### STEP 4: OUTPUT STATUS RESPONSE

SESSION ACTIVATED - Session [#]

Sync Gate: [Pending/Confirmed]
Current Phase: [From STATE.json]
Active Scope: [From STATE.json or "None"]

Next Action: [Based on current state]

---

## COMMANDS

| Command | Action |
|---------|--------|
| `[PROJECT] CONTINUE` | Full protocol: governance + scopes + resume |
| `[PROJECT] STATUS` | Quick health check + state (no work) |
| `SCOPE: [name]` | Load specific scope context |
| `ENV: FE` | Switch to Frontend |
| `ENV: BE` | Switch to Backend |
| `DONE` | User confirms step complete |

---

## DO NOT:

- Explore the codebase before reading governance files
- Ask "What would you like to do?" without reading STATE.json first
- Skip the startup protocol
- Proceed without sync verification
- Make changes without verifying against existing code first
- Forget to update scope's RESEARCH_FINDINGS after implementation

---

## QUALITY REVIEW RESPONSIBILITY

As the Implementer, I must:

1. **Review** specs from Claude Web before implementing
2. **Recommend** better alternatives if I find them
3. **Ask** for approval before proceeding with recommendations
4. **Implement** the approved solution
5. **Update** the scope's RESEARCH_FINDINGS with what I did
6. **Report** output for you to share with Claude Web

---

## WORKFLOW RULES

1. **One command at a time** - wait for "DONE"
2. **Escalate after 3 failed attempts**
3. **Document decisions** in project docs
4. **Update scope files** - After implementation, update RESEARCH_FINDINGS

---

## COMMIT MESSAGE FORMAT

[type]: [brief summary]

- [Change 1]
- [Change 2]

Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>

---

*Scope Order System v2 - Reality-First Workflow*
```

---

## Template 2: CLAUDE_WEB_SYNC.md

**Location:** `.claude/CLAUDE_WEB_SYNC.md`

**Purpose:** Mirrors Claude Web's instructions so Claude Code understands the Architect's perspective.

```markdown
# CLAUDE WEB INSTRUCTIONS (Synced Copy)

**Purpose:** This file mirrors Claude Web's instructions so Claude Code has visibility into what the Architect role sees.

**Last Synced:** [DATE]
**Sync Method:** Manual copy from Claude Web settings
**Workflow Version:** 2.0 (Reality-First)

---

# PART 1: PROJECT INSTRUCTIONS (Project-Level)

*Source: Claude Web -> Project -> Set project instructions*

---

## Project Identity

This is the **[PROJECT NAME]** project.

- **Production:** [URL]
- **Repository:** [GitHub URL]
- **Local Path:** [Path]

---

## Primary Documents

| Document | Location | Purpose |
|----------|----------|---------|
| Project Document | docs/project/[NAME].md | Master roadmap |
| Feature Specs | docs/handoffs/[NAME].md | Schema, implementation |
| User Journeys | docs/project/[NAME].md | User flows |

---

## Governance Files

All governance files are in `docs/aados/`:

| File | Purpose |
|------|---------|
| GOVERNANCE.md | Rules, phases, workflows |
| TASK_TRACKER.md | Living status, attempts |
| STATE.json | Current state pointer |

---

## Quick Commands

| Command | Action |
|---------|--------|
| `[PROJECT] CONTINUE` | Read governance, resume from current phase |
| `[PROJECT] STATUS` | Show current state without working |
| `SCOPE: [name]` | Load scope context |

---

# PART 2: PERSONAL PREFERENCES (Account-Level)

*Source: Claude Web -> Settings -> General -> Personal preferences*

---

## Token & Handoff Management

- Assess remaining tokens to determine when to create handoffs
- Handoffs take precedence over original project plans
- Document all implemented features thoroughly

---

## Solution Orientation

- If no solution available, explicitly state so
- Avoid quick fixes - prioritize sustainable approaches
- Explore free/open-source resources first

---

## Code and Command Protocol

- Respond with one command at a time
- Wait for "DONE" before proceeding
- Each command must be self-contained and executable independently

---

## Handoff Timing Guidelines

**Good times to create handoffs:**
- After completing 2-3 major tasks
- After 30-50 message exchanges
- Before starting a new phase
- After 2-3 hours of intensive work

**Bad times to create handoffs:**
- Mid-task
- During troubleshooting
- When debugging active issues

---

# PART 3: SCOPE ORDER v2 WORKFLOW

## Overview

The three-way workflow uses a **pull-based** approach where Claude Code audits production reality FIRST, then Claude Web writes specs based on facts.

## Workflow Steps

1. DIRECTOR: Create empty SCOPE_[NAME].md, commit
2. CLAUDE CODE: "AUDIT SCOPE: [NAME]", generate reality report
3. DIRECTOR -> CLAUDE WEB: Share audit report
4. CLAUDE WEB + DIRECTOR: Brainstorm based on facts
5. CLAUDE WEB: Update scope with HANDOFF_DOCUMENT
6. DIRECTOR -> CLAUDE CODE: "SCOPE UPDATED: [NAME]"
7. CLAUDE CODE: Review, recommend, implement
8. REPEAT

## Your Role (Claude Web = Architect)

- Receive audit reports from Director
- Brainstorm solutions based on FACTS (not assumptions)
- Write clear HANDOFF_DOCUMENT specifications
- Provide follow-up requirements based on implementation output

---

# PART 4: SYNC NOTES

## How to Update This File

1. **Part 1 (Project Instructions):** Copy from Claude Web -> Project -> Set project instructions
2. **Part 2 (Personal Preferences):** Copy from Claude Web -> Settings -> General
3. **Part 3 (Workflow):** Update when workflow changes
4. Update "Last Synced" date
5. Commit changes

## How Claude Code Uses This

- Reads on session startup
- Understands Architect's context
- Aligns implementation with strategy
- Follows same commands/protocols

---

*Scope Order System v2 - Reality-First Workflow*
```

---

## Template 3: MASTER_SCOPE.md

**Location:** `.claude/scopes/MASTER_SCOPE.md`

**Purpose:** Single source of truth for your entire project vision.

```markdown
# [PROJECT NAME] MASTER SCOPE

**Version:** 1.0
**Created:** [DATE]
**Status:** ACTIVE
**Purpose:** Consolidated project vision - single source of truth for all sub-scopes

---

## 1. PROJECT IDENTITY

| Attribute | Value |
|-----------|-------|
| **Project Name** | [Name] |
| **Mission** | [One sentence mission] |
| **Target Users** | [Who uses this] |
| **Core Value** | [What makes it valuable] |

---

## 2. TECHNICAL STACK

| Layer | Technology |
|-------|------------|
| **Frontend** | [e.g., React, Vue, Vanilla JS] |
| **Backend** | [e.g., Node.js, Python, Cloudflare Workers] |
| **Database** | [e.g., PostgreSQL, MongoDB] |
| **Hosting** | [e.g., Vercel, AWS, Cloudflare] |
| **AI Services** | [e.g., OpenAI, Anthropic, Azure] |

---

## 3. ARCHITECTURE OVERVIEW

[Describe or diagram your architecture]

Example:
+-------------+     +-------------+     +-------------+
|   Frontend  |---->|   API       |---->|  Database   |
|   (Static)  |     |   (Workers) |     |  (Neon)     |
+-------------+     +-------------+     +-------------+

---

## 4. CORE FEATURES

### Feature 1: [Name]
- **Status:** [Planning | In Progress | Complete]
- **Scope File:** `SCOPE_[NAME].md`
- **Description:** [Brief description]

### Feature 2: [Name]
- **Status:** [Planning | In Progress | Complete]
- **Scope File:** `SCOPE_[NAME].md`
- **Description:** [Brief description]

### Feature 3: [Name]
- **Status:** [Planning | In Progress | Complete]
- **Scope File:** `SCOPE_[NAME].md`
- **Description:** [Brief description]

---

## 5. LOCKED ARCHITECTURAL DECISIONS

These decisions are **FINAL**. Changes require explicit approval and documentation.

| Decision | Choice | Rationale | Date |
|----------|--------|-----------|------|
| [e.g., Database] | [PostgreSQL] | [Reason] | [Date] |
| [e.g., Auth] | [JWT + Sessions] | [Reason] | [Date] |
| [e.g., Hosting] | [Cloudflare] | [Reason] | [Date] |

---

## 6. PROJECT PHASES

| Phase | Name | Status | Scope Files |
|-------|------|--------|-------------|
| 1 | [Phase name] | [Status] | SCOPE_X, SCOPE_Y |
| 2 | [Phase name] | [Status] | SCOPE_Z |
| 3 | [Phase name] | [Status] | SCOPE_A, SCOPE_B |

---

## 7. ENVIRONMENTS

| ID | Name | URL/Path | Purpose |
|----|------|----------|---------|
| FE | Frontend | [path] | UI, client code |
| BE | Backend | [path] | API, server logic |
| DB | Database | [connection] | Data storage |
| PROD | Production | [url] | Live site |
| DEV | Development | [url] | Testing |

---

## 8. KEY DOCUMENTS

| Document | Location | Purpose |
|----------|----------|---------|
| Project Roadmap | [path] | Strategic overview |
| User Journeys | [path] | User flows |
| API Documentation | [path] | Endpoint specs |
| Design System | [path] | UI standards |

---

## 9. DEPENDENCIES MAP

SCOPE_AUTH
    |
    +---> SCOPE_DASHBOARD (requires auth)
    |
    +---> SCOPE_PROFILE (requires auth)

SCOPE_DASHBOARD
    |
    +---> SCOPE_ANALYTICS (requires dashboard data)

---

## 10. SUCCESS METRICS

| Metric | Target | Current |
|--------|--------|---------|
| [e.g., Page Load] | [< 2s] | [TBD] |
| [e.g., Test Coverage] | [> 80%] | [TBD] |
| [e.g., Uptime] | [99.9%] | [TBD] |

---

## 11. CHANGELOG

| Date | Change | By |
|------|--------|----|
| [Date] | Initial creation | [Name] |

---

*This MASTER_SCOPE is the single source of truth. All sub-scopes derive from this vision.*
```

---

## Template 4: SCOPE_TEMPLATE.md

**Location:** `.claude/scopes/SCOPE_[FEATURE].md`

**Purpose:** Template for creating per-feature scope files.

```markdown
# [PROJECT] SUB-SCOPE: [FEATURE NAME]

**Version:** 1.0
**Created:** [DATE]
**Last Updated:** [DATE]
**Status:** [EMPTY | AUDITED | SPECIFIED | IMPLEMENTED]

---

## 1. SCOPE IDENTITY

| Attribute | Value |
|-----------|-------|
| **Feature** | [e.g., User Authentication] |
| **Pages** | [e.g., login.html, register.html] |
| **JavaScript** | [e.g., auth.js, session.js] |
| **CSS** | [e.g., auth.css] |
| **API Endpoints** | [e.g., /api/v1/auth/*] |
| **Database Tables** | [e.g., users, sessions] |

---

## 2. ARCHITECTURAL DECISIONS (LOCKED)

These decisions are final. Changes require MASTER_SCOPE update.

| Decision | Choice | Rationale |
|----------|--------|-----------|
| [e.g., Auth Method] | [JWT] | [Stateless, scalable] |
| [e.g., Password Hash] | [bcrypt] | [Industry standard] |

---

## 3. AUDIT_REPORT

*Populated by Claude Code when running `AUDIT SCOPE: [name]`*

### Current Production Status

[Claude Code fills this section with actual findings]

### Existing Implementation

| Component | Status | Location | Notes |
|-----------|--------|----------|-------|
| [Component] | [Exists/Missing] | [path] | [notes] |

### Technical Debt / Issues

- [ ] [Issue 1]
- [ ] [Issue 2]

### Audit Date: [DATE]

---

## 4. HANDOFF_DOCUMENT

*Populated by Claude Web after reviewing AUDIT_REPORT*

### Feature Requirements

#### Requirement 1: [Name]
- **Priority:** [High/Medium/Low]
- **Description:** [What needs to be done]
- **Acceptance Criteria:**
  - [ ] [Criterion 1]
  - [ ] [Criterion 2]

#### Requirement 2: [Name]
- **Priority:** [High/Medium/Low]
- **Description:** [What needs to be done]
- **Acceptance Criteria:**
  - [ ] [Criterion 1]
  - [ ] [Criterion 2]

### User Flow

1. User does [action]
2. System responds with [response]
3. User sees [result]

### Technical Approach

[Describe the implementation approach]

### Out of Scope

- [Thing 1 that is NOT included]
- [Thing 2 that is NOT included]

### Handoff Date: [DATE]

---

## 5. RESEARCH_FINDINGS

*Populated by Claude Code after implementation*

### Session [#] - [DATE]

**Completed:**
- [x] [Task 1]
- [x] [Task 2]

**Files Changed:**
- `path/to/file1.js` - [What changed]
- `path/to/file2.css` - [What changed]

**Issues Found:**
- [Issue 1] - [How resolved]
- [Issue 2] - [How resolved]

**Decisions Made:**
- [Decision 1] - [Rationale]

**Next Steps:**
- [ ] [Next task 1]
- [ ] [Next task 2]

---

### Session [#] - [DATE]

[Repeat format for each session]

---

## 6. DEPENDENCIES

| Direction | Scope | Reason |
|-----------|-------|--------|
| **Requires** | [SCOPE_X] | [Why this scope needs X] |
| **Requires** | [SCOPE_Y] | [Why this scope needs Y] |
| **Enables** | [SCOPE_Z] | [What this scope enables] |

---

## 7. VERIFICATION CHECKLIST

| # | Requirement | Status | Evidence |
|---|-------------|--------|----------|
| 1 | [Requirement from HANDOFF_DOCUMENT] | [ ] | [Link/Screenshot] |
| 2 | [Requirement from HANDOFF_DOCUMENT] | [ ] | [Link/Screenshot] |
| 3 | [Requirement from HANDOFF_DOCUMENT] | [ ] | [Link/Screenshot] |

---

## 8. SCOPE HISTORY

| Date | Action | By | Notes |
|------|--------|----|-------|
| [Date] | Created (EMPTY) | Director | Initial scope file |
| [Date] | AUDITED | Claude Code | Reality check complete |
| [Date] | SPECIFIED | Claude Web | Requirements added |
| [Date] | IMPLEMENTED | Claude Code | V1 complete |

---

*Scope Order System v2 - Reality-First Workflow*
```

---

## Template 5: GOVERNANCE.md

**Location:** `docs/aados/GOVERNANCE.md`

**Purpose:** Defines workflow rules and quick command reference.

```markdown
# [PROJECT] - Governance & Workflow Rules

**Version:** 1.0
**Updated:** [DATE]

---

## QUICK COMMANDS

| Command | Effect |
|---------|--------|
| `[PROJECT] CONTINUE` | Full startup: governance + scopes + audit + resume |
| `[PROJECT] STATUS` | Quick health check + state (no work) |
| `AUDIT SCOPE: [name]` | Claude Code audits reality |
| `SCOPE UPDATED: [name]` | Claude Code implements specs |
| `SCOPE: [name]` | Load scope context |
| `SCOPE: MASTER` | Load full project vision |
| `ENV: FE` | Switch to Frontend |
| `ENV: BE` | Switch to Backend |
| `DONE` | Confirm step complete |

---

## SCOPE ORDER SYSTEM v2

### What is Scope Order?

A hierarchical documentation system that enables focused context loading with **Reality-First** workflow.

### File Structure

.claude/scopes/
+-- MASTER_SCOPE.md          <- Full project vision
+-- SCOPE_[FEATURE1].md      <- Feature 1 scope
+-- SCOPE_[FEATURE2].md      <- Feature 2 scope
+-- ...

### Scope File States

| State | Contents | Created By |
|-------|----------|------------|
| **EMPTY** | Just the file name | Director |
| **AUDITED** | AUDIT_REPORT section | Claude Code |
| **SPECIFIED** | HANDOFF_DOCUMENT section | Claude Web |
| **IMPLEMENTED** | RESEARCH_FINDINGS section | Claude Code |

### v2 Workflow (Reality-First)

1. DIRECTOR: Create empty SCOPE_[NAME].md, commit
2. CLAUDE CODE: "AUDIT SCOPE: [NAME]", generate reality report
3. DIRECTOR -> CLAUDE WEB: Share audit report
4. CLAUDE WEB + DIRECTOR: Brainstorm based on facts
5. CLAUDE WEB: Update scope with HANDOFF_DOCUMENT
6. DIRECTOR -> CLAUDE CODE: "SCOPE UPDATED: [NAME]"
7. CLAUDE CODE: Review, recommend, implement
8. CLAUDE CODE: Update RESEARCH_FINDINGS
9. REPEAT

### Benefits

| Challenge | Solution |
|-----------|----------|
| Outdated specs | Reality check before planning |
| Context overload | Load only active scope |
| Session continuity gaps | RESEARCH_FINDINGS persists |
| Implementation drift | Locked architectural decisions |
| Cross-feature dependencies | Explicit DEPENDENCIES section |

---

## THREE-WAY TEAM ROLES

+-------------+      +-------------+      +-------------+
| CLAUDE WEB  |<---->|  DIRECTOR   |<---->| CLAUDE CODE |
| (Architect) |      |    (You)    |      |(Implementer)|
+-------------+      +-------------+      +-------------+

| Role | Responsibilities |
|------|------------------|
| **Claude Web** | Strategy, brainstorming, specifications, documentation |
| **Director** | Decisions, git operations, coordination, approvals |
| **Claude Code** | Audits, implementation, quality review, scope updates |

---

## SESSION STARTUP PROTOCOL

### Step 1: Read Governance Files

docs/aados/STATE.json       <- Current state
docs/aados/TASK_TRACKER.md  <- Task status
docs/aados/GOVERNANCE.md    <- This file

### Step 2: Check Active Scope

From STATE.json -> `scope_order.active_scope`

### Step 3: Verify Git Sync

git fetch origin && git status

### Step 4: Output Status

SESSION ACTIVATED - Session [#]

Sync Gate: [Pending/Confirmed]
Current Phase: [From STATE.json]
Active Scope: [From STATE.json or "None"]

Next Action: [Based on state]

---

## WORKFLOW RULES

1. **One command at a time** - Wait for "DONE"
2. **Reality first** - Audit before specifying
3. **Escalate after 3 failed attempts**
4. **Document decisions** in scope files
5. **Update RESEARCH_FINDINGS** after every implementation
6. **Never skip the startup protocol**

---

## FILE RESPONSIBILITIES

| File | Updated By | When |
|------|------------|------|
| STATE.json | Claude Code | Session start/end |
| TASK_TRACKER.md | Claude Code | Task completion |
| SCOPE_*.md | Both | Per workflow step |
| MASTER_SCOPE.md | Director + Claude Web | Major changes |

---

## COMMIT MESSAGE FORMAT

[type]: [brief summary]

- [Change 1]
- [Change 2]

Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>

---

*Scope Order System v2 - Reality-First Workflow*
```

---

## Template 6: STATE.json

**Location:** `docs/aados/STATE.json`

**Purpose:** Machine-readable state pointer for session tracking.

```json
{
  "project": "[PROJECT NAME]",
  "version": "1.0",
  "last_updated": "[DATE]",
  "session": {
    "number": 1,
    "status": "active"
  },
  "current_phase": {
    "id": "SETUP",
    "name": "Initial Setup",
    "status": "in_progress"
  },
  "scope_order": {
    "active_scope": null,
    "scopes": []
  },
  "sync": {
    "git_verified": false,
    "last_sync": null
  },
  "blockers": []
}
```

---

# About the Author

This system was developed by the PMERIT team through 50+ real development sessions building a production AI educational platform.

The Scope Order System emerged from practical necessity: we needed a way to coordinate multiple AI assistants (Claude Web for strategy, Claude Code for implementation) without losing context between sessions or working from outdated specifications.

The "Reality-First" approach was the key breakthrough - by auditing what actually exists in production before writing specifications, we eliminated an entire category of wasted work.

We hope this system helps you ship features faster with your AI assistants.

---

**Thank you for purchasing the Scope Order System!**

For support, visit: [your support URL]

*Stop re-explaining. Start shipping.*

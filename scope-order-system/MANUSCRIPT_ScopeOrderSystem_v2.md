# Scope Order System

## AI-Augmented Development Methodology

**A Complete Guide to Structured Collaboration Between You and Your AI Assistants**

---

**Version:** 2.0
**Author:** PMERIT Team
**Published:** December 2025

---

## Copyright

Copyright 2025 PMERIT LLC. All Rights Reserved.

This book and its accompanying templates are protected by copyright. You may use the templates in your own projects but may not redistribute or resell them.

---

## Template Access

Your purchase includes downloadable templates.

**Access your templates at:**
https://meritwise0.gumroad.com/l/scope-order-system

Use your Amazon order confirmation email to verify your purchase.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Part I: The Problem and Solution](#part-i-the-problem-and-solution)
3. [Part II: Complete Setup Guide](#part-ii-complete-setup-guide)
4. [Part III: System Reference](#part-iii-system-reference)
5. [Part IV: Template Reference](#part-iv-template-reference)
6. [Part V: Example Workflow](#part-v-example-workflow)
7. [Troubleshooting](#troubleshooting)
8. [About the Author](#about-the-author)

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

## What's Included

### Templates (9 Files)

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Instructions for Claude Code (Implementer role) |
| `CLAUDE_WEB_SYNC.md` | Mirror of Claude Web instructions |
| `SYSTEM_GUIDE.md` | Complete operational documentation |
| `MASTER_SCOPE.md` | Project vision template |
| `SCOPE_TEMPLATE.md` | Per-feature scope template |
| `STATE.json` | Machine-readable state tracking |
| `GOVERNANCE.md` | Workflow rules and protocols |
| `TASK_TRACKER.md` | Living task status |
| `.gitignore` | Recommended git ignores |

### Commands

| Command | Effect |
|---------|--------|
| `[PROJECT] CONTINUE` | Full session startup protocol |
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

## Technical Requirements

- Git repository (any hosting)
- Claude Pro or Team subscription (for Claude Code)
- Claude.ai account (for Claude Web)
- Text editor (VS Code recommended)

**No additional software required.** The system is pure documentation + workflow.

---

# Part II: Complete Setup Guide

**Time to Setup:** 30 minutes
**Prerequisites:** Git repo, Claude Pro subscription, text editor

This guide walks you through every step to get a working Scope Order System. Follow each step exactly as written.

---

## What You'll Have When Done

```
your-project/
+-- .claude/
|   +-- CLAUDE.md                <- Claude Code instructions
|   +-- CLAUDE_WEB_SYNC.md       <- Claude Web sync
|   +-- SYSTEM_GUIDE.md          <- Complete reference
|   +-- scopes/
|       +-- MASTER_SCOPE.md      <- Your project vision
|       +-- SCOPE_TEMPLATE.md    <- Template for new scopes
+-- docs/
|   +-- aados/
|   |   +-- STATE.json           <- State tracking
|   |   +-- GOVERNANCE.md        <- Workflow rules
|   |   +-- TASK_TRACKER.md      <- Task status
|   +-- handoffs/                <- Session handoffs
+-- .gitignore                   <- Git ignores
+-- [your code]
```

---

## Step 1: Create Directory Structure (2 min)

In your project root, create the required folders.

### Mac/Linux (Terminal)

```bash
# Create .claude directories
mkdir -p .claude/scopes

# Create docs directories
mkdir -p docs/aados
mkdir -p docs/handoffs
```

### Windows (PowerShell)

```powershell
# Create .claude directories
New-Item -ItemType Directory -Force -Path ".claude\scopes"

# Create docs directories
New-Item -ItemType Directory -Force -Path "docs\aados"
New-Item -ItemType Directory -Force -Path "docs\handoffs"
```

### Windows (Command Prompt)

```cmd
mkdir .claude\scopes
mkdir docs\aados
mkdir docs\handoffs
```

**Verify:** You should now have these empty folders:
- `.claude/scopes/`
- `docs/aados/`
- `docs/handoffs/`

---

## Step 2: Download Templates

Download the template package from:
**https://meritwise0.gumroad.com/l/scope-order-system**

Unzip the file. You should see a `templates/` folder containing:
- CLAUDE.md
- CLAUDE_WEB_SYNC.md
- SYSTEM_GUIDE.md
- MASTER_SCOPE.md
- SCOPE_TEMPLATE.md
- STATE.json
- GOVERNANCE.md
- TASK_TRACKER.md
- .gitignore

---

## Step 3: Copy Templates to Project (3 min)

Copy each template file to its destination:

| From (templates/) | To (your project) |
|-------------------|-------------------|
| `CLAUDE.md` | `.claude/CLAUDE.md` |
| `CLAUDE_WEB_SYNC.md` | `.claude/CLAUDE_WEB_SYNC.md` |
| `SYSTEM_GUIDE.md` | `.claude/SYSTEM_GUIDE.md` |
| `MASTER_SCOPE.md` | `.claude/scopes/MASTER_SCOPE.md` |
| `SCOPE_TEMPLATE.md` | `.claude/scopes/SCOPE_TEMPLATE.md` |
| `STATE.json` | `docs/aados/STATE.json` |
| `GOVERNANCE.md` | `docs/aados/GOVERNANCE.md` |
| `TASK_TRACKER.md` | `docs/aados/TASK_TRACKER.md` |
| `.gitignore` | `.gitignore` (merge with existing if needed) |

**Note:** Keep `SCOPE_TEMPLATE.md` in your scopes folder. You'll copy it when creating new feature scopes.

---

## Step 4: Customize CLAUDE.md (5 min)

Open `.claude/CLAUDE.md` in your text editor.

### 4.1 Find the CUSTOMIZE section at the top:

```markdown
## CUSTOMIZE THESE VALUES

Before using this file, replace all `[BRACKETED]` placeholders:

| Placeholder | Replace With | Example |
|-------------|--------------|---------|
| `[PROJECT NAME]` | Your project name | MyApp |
| `[PROJECT]` | Short command prefix | MYAPP |
| `[DATE]` | Today's date | 2025-01-15 |
```

### 4.2 Replace the title:

**Before:**
```markdown
# [PROJECT NAME] — Claude Code Instructions
```

**After (example):**
```markdown
# MyApp — Claude Code Instructions
```

### 4.3 Update the commands table:

**Before:**
```markdown
| `[PROJECT] CONTINUE` | Full protocol: governance + scopes + resume |
| `[PROJECT] STATUS` | Quick health check + state (no work) |
```

**After (example):**
```markdown
| `MYAPP CONTINUE` | Full protocol: governance + scopes + resume |
| `MYAPP STATUS` | Quick health check + state (no work) |
```

### 4.4 Update the date:

**Before:**
```markdown
**Updated:** [DATE]
```

**After:**
```markdown
**Updated:** 2025-01-15
```

### 4.5 Delete the CUSTOMIZE section

After making all replacements, delete the entire "CUSTOMIZE THESE VALUES" section.

---

## Step 5: Customize GOVERNANCE.md (3 min)

Open `docs/aados/GOVERNANCE.md` in your text editor.

### 5.1 Replace the title:

**Before:**
```markdown
# [PROJECT] — Governance & Workflow Rules
```

**After (example):**
```markdown
# MyApp — Governance & Workflow Rules
```

### 5.2 Update commands in the QUICK COMMANDS table:

**Before:**
```markdown
| `[PROJECT] CONTINUE` | Full startup: governance + scopes + audit + resume |
| `[PROJECT] STATUS` | Quick health check + state (no work) |
```

**After (example):**
```markdown
| `MYAPP CONTINUE` | Full startup: governance + scopes + audit + resume |
| `MYAPP STATUS` | Quick health check + state (no work) |
```

### 5.3 Update the date:

**Before:**
```markdown
**Updated:** [DATE]
```

**After:**
```markdown
**Updated:** 2025-01-15
```

---

## Step 6: Customize STATE.json (2 min)

Open `docs/aados/STATE.json` in your text editor.

### 6.1 Note the _CUSTOMIZE field:

```json
{
  "_CUSTOMIZE": "Replace all [BRACKETED] values with your project details",
  ...
}
```

### 6.2 Update dates:

**Before:**
```json
"last_updated": "[YYYY-MM-DD]T00:00:00Z",
"last_audit_date": "[YYYY-MM-DD]",
```

**After:**
```json
"last_updated": "2025-01-15T00:00:00Z",
"last_audit_date": "2025-01-15",
```

### 6.3 Update environment paths (if needed):

**Before:**
```json
"FE": {
  "name": "Frontend",
  "path": "[./your-frontend-path]",
```

**After:**
```json
"FE": {
  "name": "Frontend",
  "path": "./src",
```

---

## Step 7: Fill Out MASTER_SCOPE.md (10 min)

Open `.claude/scopes/MASTER_SCOPE.md` in your text editor.

This is the most important file - it defines your entire project vision.

### 7.1 Update the header:

**Before:**
```markdown
# [PROJECT NAME] MASTER SCOPE
```

**After (example):**
```markdown
# MyApp MASTER SCOPE
```

### 7.2 Fill in Section 1 - Project Identity:

```markdown
## 1. PROJECT IDENTITY

| Attribute | Value |
|-----------|-------|
| **Project Name** | MyApp |
| **Mission** | Help developers track their tasks efficiently |
| **Target Users** | Solo developers and small teams |
| **Core Value** | Simple, focused task management |
```

### 7.3 Fill in Section 2 - Technical Stack:

```markdown
## 2. TECHNICAL STACK

| Layer | Technology |
|-------|------------|
| **Frontend** | React |
| **Backend** | Node.js + Express |
| **Database** | PostgreSQL |
| **Hosting** | Vercel |
| **AI Services** | OpenAI GPT-4 |
```

### 7.4 Fill in Section 5 - Locked Decisions:

```markdown
## 5. LOCKED ARCHITECTURAL DECISIONS

| Decision | Choice | Rationale | Date |
|----------|--------|-----------|------|
| Database | PostgreSQL | Team expertise, ACID compliance | 2025-01-15 |
| Hosting | Vercel | Cost effective, easy deployment | 2025-01-15 |
| Auth | JWT + Sessions | Stateless, scalable | 2025-01-15 |
```

### 7.5 Fill in Section 7 - Environments:

```markdown
## 7. ENVIRONMENTS

| ID | Name | URL/Path | Purpose |
|----|------|----------|---------|
| FE | Frontend | ./src | UI, client code |
| BE | Backend | ./api | API, server logic |
| DB | Database | neon.tech | Data storage |
| PROD | Production | myapp.com | Live site |
| DEV | Development | localhost:3000 | Testing |
```

**Leave other sections as templates** - you'll fill them in as your project grows.

---

## Step 8: Customize TASK_TRACKER.md (2 min)

Open `docs/aados/TASK_TRACKER.md` in your text editor.

### 8.1 Update the title:

**Before:**
```markdown
# [PROJECT] — Task Tracker
```

**After:**
```markdown
# MyApp — Task Tracker
```

### 8.2 Clear the example tasks (optional):

You can leave the example format or clear it to start fresh.

---

## Step 9: Setup Claude Web (3 min)

### 9.1 Open Claude.ai in your browser

Go to: https://claude.ai

### 9.2 Create a new project (or open existing)

Click "Projects" in the sidebar, then "New Project" or open your existing project.

### 9.3 Set project instructions

Click the gear icon or "Set project instructions" and paste:

```
# MyApp — Mission Instructions

## Project Identity
- Production: [your-url.com]
- Repository: [github.com/you/myapp]
- Local Path: [C:\dev\myapp or /Users/you/myapp]

## Quick Commands
| Command | Action |
|---------|--------|
| MYAPP CONTINUE | Full startup protocol |
| SCOPE: [name] | Load scope context |
| DONE | Confirm step complete |

## Workflow
I am the Architect (Claude Web). I:
- Receive audit reports from the Director (you)
- Brainstorm solutions based on FACTS
- Write HANDOFF_DOCUMENT specifications
- Provide follow-up requirements

The Director coordinates between me and Claude Code (Implementer).
```

### 9.4 Save

Click "Save" or "Done".

---

## Step 10: Initial Git Commit (2 min)

### Mac/Linux/Windows (Git Bash):

```bash
git add .claude/ docs/aados/ .gitignore
git commit -m "chore: Setup Scope Order System

- Added Claude Code instructions
- Added Claude Web sync file
- Added Master Scope
- Added governance files
- Added task tracker

Scope Order System v2"
```

### Windows (PowerShell with Git):

```powershell
git add .claude/ docs/aados/ .gitignore
git commit -m "chore: Setup Scope Order System"
```

---

## Step 11: Test Your Setup

### 11.1 Open Claude Code

Open your project folder in your terminal and start Claude Code:

```bash
claude
```

### 11.2 Test the startup command

Type:
```
MYAPP CONTINUE
```

(Replace MYAPP with your project prefix)

### 11.3 Expected Response

Claude Code should:
1. Read STATE.json
2. Read GOVERNANCE.md
3. Read TASK_TRACKER.md
4. Output a status response like:

```
SESSION ACTIVATED — Session 1

Sync Gate: Pending
Current Phase: SETUP
Active Scope: None

Next Action: Create first scope file or verify git sync
```

**If you see this response, your setup is complete!**

---

## Step 12: Create Your First Scope (Optional)

To test the full workflow:

### 12.1 Create an empty scope file:

```bash
touch .claude/scopes/SCOPE_AUTH.md
```

Or create it manually with just:
```markdown
# SCOPE: AUTH
Status: EMPTY
```

### 12.2 Commit it:

```bash
git add .claude/scopes/SCOPE_AUTH.md
git commit -m "feat: Create SCOPE_AUTH for authentication feature"
```

### 12.3 Run the audit:

Tell Claude Code:
```
AUDIT SCOPE: AUTH
```

Claude Code will examine your codebase and populate the AUDIT_REPORT section.

### 12.4 Share with Claude Web:

Copy the AUDIT_REPORT and share it with Claude Web in claude.ai.

### 12.5 Brainstorm and specify:

Work with Claude Web to write the HANDOFF_DOCUMENT.

### 12.6 Implement:

Tell Claude Code:
```
SCOPE UPDATED: AUTH
```

Claude Code will read the specs and implement them.

---

## Setup Complete!

You now have a working Scope Order System. Here's what you can do:

| Action | Command |
|--------|---------|
| Start any session | `[PROJECT] CONTINUE` |
| Audit reality for new feature | `AUDIT SCOPE: [name]` |
| Implement after specs written | `SCOPE UPDATED: [name]` |
| Load existing feature context | `SCOPE: [name]` |
| Check status without working | `[PROJECT] STATUS` |

---

# Part III: System Reference

## Three-Way Team Structure

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

## Scope File States

```
EMPTY       -> AUDITED       -> SPECIFIED       -> IMPLEMENTED
  ^             ^                 ^                 ^
Director    Claude Code      Claude Web       Claude Code
creates     audits reality   writes specs     implements
```

| State | Contents | Created By |
|-------|----------|------------|
| **EMPTY** | Just the file name | Director |
| **AUDITED** | AUDIT_REPORT section | Claude Code |
| **SPECIFIED** | HANDOFF_DOCUMENT section | Claude Web |
| **IMPLEMENTED** | RESEARCH_FINDINGS section | Claude Code |

---

## Workflow Steps (v2 - Reality-First)

```
1. YOU: Create empty SCOPE_[NAME].md, commit to repo
   —OR— Prompt CLAUDE CODE directly for Step 2 (skipping Step 1)
2. CLAUDE CODE: Audit reality → populate AUDIT_REPORT section
3. YOU → CLAUDE WEB: Share audit report
4. CLAUDE WEB + YOU: Brainstorm, write requirements
5. CLAUDE WEB: Update SCOPE_[NAME].md with HANDOFF_DOCUMENT
6. YOU → CLAUDE CODE: "SCOPE UPDATED: [NAME]"
7. CLAUDE CODE: Review, recommend, implement → update RESEARCH_FINDINGS
8. REPEAT until complete
```

**Note:** Step 1 is optional when Claude Code is available. Claude Code can assess the platform directly for more effective task creation. Use Step 1 as fallback for manual Claude Web workflow when Claude Code is unavailable.

---

## Commands Reference

### Session Commands

| Command | Who Uses | Effect |
|---------|----------|--------|
| `[PROJECT] CONTINUE` | Director → Claude Code | Full startup protocol |
| `[PROJECT] STATUS` | Director → Claude Code | Quick check (no work) |
| `DONE` | Director → Claude Code | Confirm step complete |

### Scope Commands

| Command | Who Uses | Effect |
|---------|----------|--------|
| `AUDIT SCOPE: [name]` | Director → Claude Code | Audit reality, populate AUDIT_REPORT |
| `SCOPE UPDATED: [name]` | Director → Claude Code | Read specs, implement |
| `SCOPE: [name]` | Director → Claude Code | Load existing context |
| `SCOPE: MASTER` | Director → Claude Code | Load project vision |

### Environment Commands

| Command | Effect |
|---------|--------|
| `ENV: FE` | Switch focus to Frontend |
| `ENV: BE` | Switch focus to Backend |

---

## Session Lifecycle

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
  Director: Creates empty scope file (or skips to step 2)
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

## File Sync Protocol

### When to Sync CLAUDE_WEB_SYNC.md

- When Claude Web project instructions change
- When personal preferences change
- Periodically (every few sessions)

### How to Sync

1. Copy from Claude Web → Project → Set project instructions
2. Copy from Claude Web → Settings → General → Preferences
3. Paste into `.claude/CLAUDE_WEB_SYNC.md`
4. Update "Last Synced" date
5. Commit changes

---

# Part IV: Template Reference

The following templates are included in your download package. Each is shown here for reference.

---

## Template 1: CLAUDE.md

**Location:** `.claude/CLAUDE.md`

**Purpose:** Instructions for Claude Code (Implementer role)

**Key Sections:**
- CUSTOMIZE THESE VALUES (delete after customizing)
- TEAM WORKFLOW diagram
- SCOPE ORDER v2: REALITY-FIRST WORKFLOW
- MANDATORY STARTUP PROTOCOL
- COMMANDS table
- DO NOT list
- QUALITY REVIEW RESPONSIBILITY
- WORKFLOW RULES
- COMMIT MESSAGE FORMAT

---

## Template 2: CLAUDE_WEB_SYNC.md

**Location:** `.claude/CLAUDE_WEB_SYNC.md`

**Purpose:** Mirror of Claude Web instructions so Claude Code understands the Architect's perspective

**Key Sections:**
- PART 1: PROJECT INSTRUCTIONS
- PART 2: PERSONAL PREFERENCES
- PART 3: SCOPE ORDER v2 WORKFLOW
- PART 4: SYNC NOTES

---

## Template 3: SYSTEM_GUIDE.md

**Location:** `.claude/SYSTEM_GUIDE.md`

**Purpose:** Complete operational documentation

**Key Sections:**
- Team Structure
- Directory Layout
- Scope Order System v2
- Three-Way Workflow
- Commands Reference
- File Sync Protocol
- Session Lifecycle
- Troubleshooting
- Quick Reference Card

---

## Template 4: MASTER_SCOPE.md

**Location:** `.claude/scopes/MASTER_SCOPE.md`

**Purpose:** Single source of truth for project vision

**Key Sections:**
1. PROJECT IDENTITY
2. TECHNICAL STACK
3. ARCHITECTURE OVERVIEW
4. CORE FEATURES
5. LOCKED ARCHITECTURAL DECISIONS
6. PROJECT PHASES
7. ENVIRONMENTS
8. KEY DOCUMENTS
9. DEPENDENCIES MAP
10. SUCCESS METRICS
11. CHANGELOG

---

## Template 5: SCOPE_TEMPLATE.md

**Location:** `.claude/scopes/SCOPE_TEMPLATE.md`

**Purpose:** Template for creating per-feature scope files

**Key Sections:**
1. SCOPE IDENTITY
2. ARCHITECTURAL DECISIONS (LOCKED)
3. AUDIT_REPORT (Claude Code fills)
4. HANDOFF_DOCUMENT (Claude Web fills)
5. RESEARCH_FINDINGS (Claude Code fills)
6. DEPENDENCIES
7. VERIFICATION CHECKLIST
8. SCOPE HISTORY

---

## Template 6: GOVERNANCE.md

**Location:** `docs/aados/GOVERNANCE.md`

**Purpose:** Workflow rules and quick command reference

**Key Sections:**
- QUICK COMMANDS table
- SCOPE ORDER SYSTEM v2
- THREE-WAY TEAM ROLES
- SESSION STARTUP PROTOCOL
- WORKFLOW RULES
- FILE RESPONSIBILITIES
- COMMIT MESSAGE FORMAT

---

## Template 7: STATE.json

**Location:** `docs/aados/STATE.json`

**Purpose:** Machine-readable state tracking

**Key Fields:**
- schema_version
- last_updated
- session_number
- current_phase
- scope_order (active_scope, scopes)
- environments
- blockers
- recent_changes
- next_actions

---

## Template 8: TASK_TRACKER.md

**Location:** `docs/aados/TASK_TRACKER.md`

**Purpose:** Living task status

**Key Sections:**
- ACTIVE TASKS
- COMPLETED THIS SESSION
- BLOCKED
- BACKLOG
- TASK STATUS KEY
- ATTEMPT TRACKING
- SESSION LOG

---

## Template 9: .gitignore

**Location:** `.gitignore` (project root)

**Purpose:** Recommended git ignores

**Includes:**
- Dependencies (node_modules, vendor)
- Build output (dist, build)
- Environment & secrets (.env, *.pem)
- IDE & editor files
- OS files
- Logs & temp files
- Testing & coverage
- Cache

**Does NOT ignore Scope Order files** - those should be tracked.

---

# Part V: Example Workflow

This section shows a complete, real-world example of the Scope Order workflow.

## Scenario

You're building **TaskTracker**, a task management app. You want to add user authentication.

---

## Step 1: Create Empty Scope File

**Director Action:** Create `.claude/scopes/SCOPE_AUTH.md`:

```markdown
# SCOPE: AUTH

## Status
- Created: 2025-01-15
- State: EMPTY
```

**Commit:**
```bash
git add .claude/scopes/SCOPE_AUTH.md
git commit -m "feat: Create SCOPE_AUTH for authentication feature"
```

---

## Step 2: Audit Reality

**Director → Claude Code:**
```
AUDIT SCOPE: AUTH
```

**Claude Code Response:**

After examining the codebase, Claude Code populates:

```markdown
## 3. AUDIT_REPORT

### Current Reality (2025-01-15)

**Existing Auth-Related Code:**
- None found — this is a new feature

**Database Status:**
- Using PostgreSQL via Neon
- No users table exists yet

**Frontend Status:**
- React app with React Router
- No login/signup pages exist

**Backend Status:**
- Express API running on port 3001
- No auth endpoints exist

**Dependencies Available:**
- bcryptjs (installed but unused)
- No JWT library installed

**Recommendations:**
1. Need to add `jsonwebtoken` package
2. Need to create users table
3. Need auth context for React

### Audit Date: 2025-01-15
```

---

## Step 3: Share with Claude Web

**Director → Claude Web (in claude.ai):**

"Here's the auth audit from Claude Code:

[Paste AUDIT_REPORT content]

Let's brainstorm the auth system. I'm thinking email/password with JWT tokens."

---

## Step 4: Brainstorm with Claude Web

**Claude Web responds with recommendations:**

"Good foundation! Here's my recommendation:

**Database Schema:**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**API Endpoints:**
- POST /api/auth/signup
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me

**Frontend Components:**
- LoginPage
- SignupPage
- AuthContext + useAuth hook

Should I write the full specification?"

**Director:** "Yes, please write the HANDOFF_DOCUMENT."

---

## Step 5: Claude Web Writes Specification

Claude Web provides the HANDOFF_DOCUMENT:

```markdown
## 4. HANDOFF_DOCUMENT

### Feature: User Authentication

**Priority:** P1 - Critical

### Requirements

#### R1: Database Schema
Create users table as specified.

#### R2: Backend Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| /api/auth/signup | POST | Create new user |
| /api/auth/login | POST | Authenticate, return JWT |
| /api/auth/logout | POST | Invalidate session |
| /api/auth/me | GET | Get current user |

#### R3: Frontend Components
- LoginPage.jsx
- SignupPage.jsx
- AuthContext.jsx
- useAuth.js hook

### Acceptance Criteria
- [ ] User can sign up with email/password
- [ ] User can log in and receive token
- [ ] User can log out
- [ ] Protected routes redirect to login

### Handoff Date: 2025-01-15
```

**Director:** Copy this into SCOPE_AUTH.md and commit.

---

## Step 6: Implement with Claude Code

**Director → Claude Code:**
```
SCOPE UPDATED: AUTH
```

**Claude Code reads the spec and responds:**

"I've reviewed the HANDOFF_DOCUMENT. Here's my plan:

**Phase 1:** Database migration
**Phase 2:** Backend endpoints
**Phase 3:** Frontend components

**Recommendation:** I suggest adding rate limiting to prevent brute force attacks. This wasn't in the spec but is best practice.

Should I proceed, and should I add rate limiting?"

**Director:** "Yes to both."

Claude Code implements...

---

## Step 7: Update Research Findings

After implementation, Claude Code updates:

```markdown
## 5. RESEARCH_FINDINGS

### Session 1 — 2025-01-15

**Completed:**
- [x] Created users table migration
- [x] Implemented all 4 endpoints
- [x] Added rate limiting (3 attempts/min)
- [x] Created AuthContext and useAuth hook
- [x] Created LoginPage and SignupPage

**Files Created:**
- migrations/001_create_users.sql
- src/api/routes/auth.js
- src/context/AuthContext.jsx
- src/hooks/useAuth.js
- src/pages/LoginPage.jsx
- src/pages/SignupPage.jsx

**Decisions Made:**
- Added rate limiting (not in original spec)
- Used httpOnly cookies for JWT storage

**Feature Status:** COMPLETE
```

---

## Step 8: Report to Claude Web

**Director → Claude Web:**

"Auth feature complete! Claude Code implemented it with an additional rate limiting feature.

All acceptance criteria passing. Ready for review."

**Claude Web:** "Excellent! Let's update MASTER_SCOPE to mark this complete."

---

## Summary: The Complete Cycle

```
1. DIRECTOR: Created SCOPE_AUTH.md (empty)
2. CLAUDE CODE: "AUDIT SCOPE: AUTH" → populated AUDIT_REPORT
3. DIRECTOR → CLAUDE WEB: Shared audit, brainstormed requirements
4. CLAUDE WEB: Wrote HANDOFF_DOCUMENT with specifications
5. DIRECTOR → CLAUDE CODE: "SCOPE UPDATED: AUTH"
6. CLAUDE CODE: Reviewed, recommended rate limiting, implemented
7. CLAUDE CODE: Updated RESEARCH_FINDINGS
8. DIRECTOR → CLAUDE WEB: Shared completion status
```

---

# Troubleshooting

## Problem: Claude Code doesn't recognize commands

**Cause:** CLAUDE.md not found or commands not customized

**Solution:**
1. Verify `.claude/CLAUDE.md` exists
2. Check that `[PROJECT]` was replaced with your project name
3. Restart Claude Code

---

## Problem: Scope file not loading

**Cause:** Scope not in STATE.json

**Solution:**
1. Open `docs/aados/STATE.json`
2. Add your scope to `scope_order.scopes`:

```json
"scopes": {
  "SCOPE_AUTH": {
    "status": "empty",
    "file": ".claude/scopes/SCOPE_AUTH.md"
  }
}
```

---

## Problem: Lost context between sessions

**Cause:** RESEARCH_FINDINGS not updated

**Solution:**
Always ensure Claude Code updates RESEARCH_FINDINGS before ending session. If forgotten, manually add notes about what was done.

---

## Problem: Specs don't match reality

**Cause:** Skipped audit step

**Solution:**
```
AUDIT SCOPE: [name]
```
Then share updated audit with Claude Web to revise specs.

---

## Problem: Claude Code and Claude Web disagree

**Cause:** CLAUDE_WEB_SYNC.md out of date

**Solution:**
1. Copy latest instructions from Claude Web
2. Update `.claude/CLAUDE_WEB_SYNC.md`
3. Update "Last Synced" date
4. Commit changes

---

## Problem: Don't know what to work on

**Cause:** STATE.json not read

**Solution:**
```
[PROJECT] CONTINUE
```
Claude Code will read state and suggest next action.

---

## Problem: Windows path issues

**Cause:** Using forward slashes on Windows

**Solution:**
- Use backslashes in paths: `docs\aados\STATE.json`
- Or use PowerShell which accepts both

---

# About the Author

This system was developed by the PMERIT team through **67+ real development sessions** building a production AI educational platform (pmerit.com).

The Scope Order System emerged from practical necessity: we needed a way to coordinate multiple AI assistants without losing context between sessions or working from outdated specifications.

The **Reality-First** approach was the key breakthrough - by auditing what actually exists before writing specifications, we eliminated an entire category of wasted work.

---

**Thank you for purchasing the Scope Order System!**

For support, visit: https://github.com/peoplemerit/Pmerit_Product_Development/issues

*Stop re-explaining. Start shipping.*

---

# Quick Reference Card

```
+---------------------------------------------------------------------+
|                    SCOPE ORDER QUICK REFERENCE                       |
+---------------------------------------------------------------------+
|                                                                      |
|  SESSION START:    [PROJECT] CONTINUE                                |
|                                                                      |
|  NEW FEATURE:                                                        |
|    1. Create empty scope file (or skip to step 2)                    |
|    2. AUDIT SCOPE: [name]                                            |
|    3. Share audit with Claude Web                                    |
|    4. Claude Web writes HANDOFF_DOCUMENT                             |
|    5. SCOPE UPDATED: [name]                                          |
|    6. Claude Code implements                                         |
|                                                                      |
|  CONTINUE WORK:    SCOPE: [name]                                     |
|  CHECK STATUS:     [PROJECT] STATUS                                  |
|                                                                      |
|  SCOPE STATES:     EMPTY -> AUDITED -> SPECIFIED -> IMPLEMENTED      |
|                                                                      |
|  KEY FILES:                                                          |
|    .claude/CLAUDE.md              <- Claude Code instructions        |
|    .claude/scopes/SCOPE_*.md      <- Feature context                 |
|    .claude/CLAUDE_WEB_SYNC.md     <- Architect instructions          |
|    docs/aados/STATE.json          <- Current state                   |
|    docs/aados/GOVERNANCE.md       <- Workflow rules                  |
|    docs/aados/TASK_TRACKER.md     <- Task status                     |
|                                                                      |
|  ROLES:                                                              |
|    Claude Web    = Architect   (Strategy, specs)                     |
|    You           = Director    (Decisions, coordination)             |
|    Claude Code   = Implementer (Execution, quality review)           |
|                                                                      |
+---------------------------------------------------------------------+
```

---

*Scope Order System v2.0 — Reality-First Workflow*
*Copyright 2025 PMERIT LLC*

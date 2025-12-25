# Scope Order System

# AI-Augmented Development Methodology

## A Complete Guide to Structured Collaboration Between You and Your AI Assistants

Version: 3.0

Author: PMERIT Team

Published: December 2025



# Copyright

Copyright 2025 PMERIT LLC. All Rights Reserved.

This book and its accompanying templates are protected by copyright. You may use the templates in your own projects but may not redistribute or resell them.



# Template Access

Your purchase includes downloadable templates.

Access your templates at:
https://meritwise0.gumroad.com/l/scope-order-system

Use your Amazon order confirmation email to verify your purchase.



# What's New in Version 3.0

DOCUMENT STYLE
- v2.0: Append-only
- v3.0: Living documents (update in place)

DECISION TRACKING
- v2.0: Implicit
- v3.0: Explicit Decision Log (ACTIVE/NO-GO/EXPERIMENTAL)

ARCHIVE SYSTEM
- v2.0: Manual
- v3.0: Lifecycle-based auto-archive

HANDOFF MANAGEMENT
- v2.0: Multiple handoffs
- v3.0: One linked handoff per scope

FILE LOCKING
- v2.0: None
- v3.0: Regression protection for complete features



# Table of Contents

1. Introduction
2. Part I: The Problem and Solution
3. Part II: Complete Setup Guide
4. Part III: Living Documents System
5. Part IV: Template Reference
6. Part V: Example Workflow
7. Part VI: Decision Log System
8. Part VII: Archive Lifecycle
9. Troubleshooting
10. About the Author



# Introduction

## What's In This Book

The Scope Order System is a methodology and template pack for developers who use multiple AI assistants (Claude Web, Claude Code, GitHub Copilot) and need:

- Structured context management across AI tools
- Reality-first workflow that prevents outdated specs
- Session continuity without losing progress
- Clear role separation (Architect vs Implementer)
- Living documents that stay current (NEW in v3)
- Decision tracking for architectural choices (NEW in v3)
- Lifecycle-based archiving to reduce clutter (NEW in v3)

## Who This Book Is For

- Solo developers using AI-augmented development
- Small teams coordinating multiple AI tools
- Freelancers managing complex client projects
- Anyone frustrated with AI context limits
- Teams who want to preserve architectural decisions

## What You'll Learn

By the end of this book, you'll have:

1. A complete understanding of the three-way workflow
2. A working Scope Order System v3 setup in your project
3. Templates ready to use immediately
4. The knowledge to maintain context across unlimited sessions
5. A system for tracking and preserving decisions
6. Automatic cleanup of obsolete documentation



# Part I: The Problem and Solution

## The Problem

Developers using AI assistants face critical challenges:

### 1. Context Fragmentation

- Claude Web knows your strategy but can't see your code
- Claude Code can implement but doesn't know the big picture
- GitHub Copilot suggests code without understanding your architecture

Result: Inconsistent implementations, repeated explanations

### 2. Specification Drift

- You write specs, then implement
- Implementation reveals issues with specs
- Specs become outdated
- Next session, you work from wrong assumptions

Result: Wasted work, regressions, confusion

### 3. Session Continuity Loss

- AI assistants forget everything between sessions
- You re-explain context every time
- Progress notes scattered across chat logs

Result: Slow startups, lost decisions, repeated work

### 4. Role Confusion

- When should AI plan vs implement?
- Who approves changes?
- Where do decisions get recorded?

Result: Chaotic workflow, unclear ownership

### 5. Document Staleness (NEW in v3)

- Append-only docs become bloated
- Old audit reports mixed with new
- Can't find current state
- Multiple handoffs contradict each other

Result: Information overload, trust erosion

### 6. Lost Decisions (NEW in v3)

- "Why did we do it this way?" - No one remembers
- Rejected ideas get re-proposed
- No record of what was tried and failed

Result: Circular discussions, repeated mistakes



## The Solution: Scope Order System v3

A methodology + template pack that creates structured collaboration between you and your AI assistants.

### Core Concepts

#### 1. Reality-First Workflow (from v2)

Traditional (Spec-First):
Write Spec → Implement → Discover spec was wrong → Redo

Scope Order (Reality-First):
Audit Reality → Write Spec Based on Facts → Implement → Update Findings

#### 2. Living Documents (NEW in v3)

Traditional (Append-Only):
Session 1: Add audit
Session 2: Add another audit
Session 3: Now 3 audits to read, which is current?

Living Documents (Update in Place):
Session 1: Write audit
Session 2: Replace audit with new findings
Session 3: Only current audit exists

#### 3. Decision Log (NEW in v3)

Every architectural decision is tracked permanently:

Decision: Use JWT
Date: 2025-01-15
Rationale: Stateless
Status: ACTIVE

Decision: Use sessions
Date: 2025-01-10
Rationale: Tried, failed
Status: NO-GO

Decision: Try Redis
Date: 2025-01-18
Rationale: Testing
Status: EXPERIMENTAL

### Three-Way Team Structure

    CLAUDE WEB ←→ YOU ←→ CLAUDE CODE
    (Architect)   (Director)   (Implementer)
         |            |              |
    Strategy     Decisions      Execution
    Brainstorming  Approvals    Quality Review
    Specifications Coordination Implementation

### Hierarchical Scope Management

MASTER_SCOPE.md ← Project vision (sum of all scopes)
    |
    +-- SCOPE_AUTH.md ← Authentication (living document)
    |       +-- HANDOFF_AUTH.md ← Linked handoff
    |
    +-- SCOPE_DASHBOARD.md ← Dashboard (living document)
    |       +-- HANDOFF_DASHBOARD.md
    |
    +-- SCOPE_PAYMENTS.md ← Payments (living document)
            +-- HANDOFF_PAYMENTS.md

Each scope contains:
- DECISION LOG - Permanent record (NEVER deleted)
- AUDIT_REPORT - Current reality (replaced each audit)
- HANDOFF_DOCUMENT - Specifications (updated in place)
- RESEARCH_FINDINGS - Latest session (old sessions archived)
- LOCKED FILES - Protection for complete features
- DEPENDENCIES - How scopes relate



## What's Included

### Templates (9 Files)

CLAUDE.md - Instructions for Claude Code (Implementer role)
CLAUDE_WEB_SYNC.md - Mirror of Claude Web instructions
SYSTEM_GUIDE.md - Complete operational documentation
MASTER_SCOPE.md - Project vision template
SCOPE_TEMPLATE.md - Per-feature scope template (v3 with Decision Log)
STATE.json - Machine-readable state tracking (v3 with archive)
GOVERNANCE.md - Workflow rules and protocols
TASK_TRACKER.md - Living task status
.gitignore - Recommended git ignores

### Commands

[PROJECT] CONTINUE - Full session startup protocol
AUDIT SCOPE: [name] - Claude Code audits reality
SCOPE UPDATED: [name] - Claude Code implements specs
SCOPE: [name] - Load existing scope context
UNLOCK: [file] - Unlock file for modification (NEW)
RELOCK: [file] - Re-lock file after changes (NEW)



## Benefits

BEFORE SCOPE ORDER:
- Re-explain context every session
- Specs become outdated
- Unclear who does what
- Progress lost in chat logs
- Context window overload
- Random implementations
- Bloated append-only docs
- Regressions in complete features

AFTER SCOPE ORDER v3:
- Context persists in scope files
- Reality-first prevents drift
- Clear role separation
- Living documents stay current
- Load only active scope
- Decisions locked in Decision Log
- Lifecycle archive cleans up
- File locking prevents changes



# Part II: Complete Setup Guide

## Step 1: Create Directory Structure

Create these folders in your project root:

.claude/scopes/
docs/aados/
docs/handoffs/
docs/archive/

## Step 2: Copy Templates

Place the template files:

.claude/
├── CLAUDE.md ← Claude Code instructions
├── CLAUDE_WEB_SYNC.md ← Claude Web mirror
├── SYSTEM_GUIDE.md ← Full documentation
└── scopes/
    └── MASTER_SCOPE.md ← Project vision

docs/
├── aados/
│   ├── STATE.json ← State pointer
│   ├── GOVERNANCE.md ← Workflow rules
│   └── TASK_TRACKER.md ← Task status
├── handoffs/ ← One per scope
└── archive/ ← Obsolete content

## Step 3: Customize Templates

Replace all [BRACKETED] placeholders:

[PROJECT NAME] → Your project name (Example: MyApp)
[PROJECT] → Short command prefix (Example: MYAPP)
[DATE] → Today's date (Example: 2025-01-15)

## Step 4: Fill Out MASTER_SCOPE.md

Define your project vision:
- Project identity and mission
- Technical architecture decisions
- Track/phase structure
- Dependencies

## Step 5: Create First Scope

Option A (Recommended): Prompt Claude Code directly:
AUDIT SCOPE: AUTH

Option B: Create empty file first:
1. Create .claude/scopes/SCOPE_AUTH.md
2. Create docs/handoffs/HANDOFF_AUTH.md
3. Commit to repo
4. Run AUDIT SCOPE: AUTH

## Step 6: Start Working

Type: MYAPP CONTINUE

Claude Code will:
1. Read governance files
2. Check active scope
3. Verify git sync
4. Output status
5. Resume work



# Part III: Living Documents System

## The Problem with Append-Only

Traditional documentation appends new content:

Session 1 - Jan 1: Audit findings...
Session 2 - Jan 5: New audit findings...
Session 3 - Jan 10: Even more audit findings...

Problems:
- Which audit is current?
- 90% of content is outdated
- Context window bloated
- Contradictions between sections

## Living Document Approach

Update in place:

AUDIT_REPORT
Last Audit: Jan 10
[Current findings only]

Benefits:
- Always current
- Minimal context needed
- No contradictions
- Easy to find information

## What Gets Updated vs Archived

DECISION LOG - NEVER deleted or archived
SCOPE IDENTITY - Updated when feature changes
AUDIT_REPORT - Replaced each audit
HANDOFF_DOCUMENT - Updated with new requirements
RESEARCH_FINDINGS - Latest session only (old archived)
CURRENT STATE - Checkboxes updated

## When to Archive

Old audit reports - Archive when replaced by new audit
Superseded research - Archive when implementation changed
Rejected approaches - Archive when marked NO-GO
Session transcripts - Archive when older than 5 sessions

## Archive Location

docs/archive/
├── SCOPE_AUTH/
│   ├── 2025-01-01_audit.md
│   └── 2025-01-05_research.md
└── SCOPE_DASHBOARD/
    └── 2025-01-10_rejected_approach.md



# Part IV: Template Reference

## SCOPE_TEMPLATE.md (v3)

The scope template includes these sections:

HEADER:
- Created date
- Last Updated date
- Status: PLANNING | IN_PROGRESS | STABILIZING | COMPLETE
- Progress: 0/N tasks
- Linked Handoff: HANDOFF_[NAME].md

DECISION LOG (Permanent):
Decision | Date | Rationale | Status
[decision] | [date] | [why] | ACTIVE/NO-GO/EXPERIMENTAL

CURRENT STATE:
- Planned Tasks (checkboxes)
- Completed Tasks (with dates)
- Identified Gaps (with severity and status)

AUDIT_REPORT:
Replaced each audit

HANDOFF_DOCUMENT:
Updated with new requirements

RESEARCH_FINDINGS:
Latest session only

LOCKED FILES:
File | Last Working Commit | Lock Date

DEPENDENCIES:
Direction | Scope | Reason

## STATE.json (v3)

Key additions in v3:
- scope_order.handoffs_location
- scope_order.archive_location
- archive.enabled
- archive.auto_cleanup_prompt
- decision_log_stats



# Part V: Example Workflow

## Scenario: Adding User Authentication

### Day 1: Audit

You: AUDIT SCOPE: AUTH

Claude Code:
1. Checks existing code
2. Documents current state
3. Identifies gaps
4. Populates AUDIT_REPORT

Result: SCOPE_AUTH.md has reality-based findings

### Day 2: Specification

You → Claude Web: Share audit report

Claude Web:
1. Reviews findings
2. Proposes approach
3. Documents requirements
4. Updates HANDOFF_DOCUMENT

Result: SCOPE_AUTH.md has specifications

### Day 3: Implementation

You: SCOPE UPDATED: AUTH

Claude Code:
1. Reviews specifications
2. Recommends any improvements
3. Implements approved solution
4. Updates RESEARCH_FINDINGS (replaces, not appends)
5. Records decisions in DECISION LOG

Result: Feature implemented, documented

### Day 4: Completion

You: Mark scope COMPLETE

Claude Code:
1. Locks critical files
2. Prompts for archive cleanup
3. Updates STATE.json

Result: Feature protected, docs cleaned



# Part VI: Decision Log System

## Why Track Decisions?

1. Prevent circular discussions - "We tried that, it didn't work"
2. Preserve rationale - "Why did we choose this?"
3. Block bad ideas permanently - NO-GO means never
4. Track experiments - EXPERIMENTAL may become ACTIVE

## Decision Statuses

ACTIVE - In use now → Implement and maintain
NO-GO - Rejected permanently → NEVER implement
EXPERIMENTAL - Testing → May promote or demote

## Examples

DECISION LOG:

JWT for auth | 2025-01-15 | Stateless, scalable | ACTIVE
Server sessions | 2025-01-10 | Too much server load | NO-GO
Redis caching | 2025-01-18 | Testing performance | EXPERIMENTAL
bcrypt passwords | 2025-01-15 | Industry standard | ACTIVE
MD5 hashing | 2025-01-10 | Insecure | NO-GO

## Rules

1. DECISION LOG is NEVER deleted
2. NO-GO decisions stay forever (warnings for future)
3. EXPERIMENTAL may become ACTIVE or NO-GO
4. Every significant choice gets logged



# Part VII: Archive Lifecycle

## Scope Status Levels

PLANNING - Early ideas → Archive everything
IN_PROGRESS - Building → Archive pivots only
STABILIZING - Testing → Suggest cleanup
COMPLETE - Done → Auto-prompt delete

## Archive Flow

PLANNING → IN_PROGRESS → STABILIZING → COMPLETE
    ↓           ↓             ↓            ↓
Archive     Archive       Prompt       Prompt
everything  pivots        cleanup      delete

## Cleanup Prompt

When scope reaches COMPLETE:

SCOPE AUTH is COMPLETE.

Archive files found:
- 2025-01-01_audit.md (30 days old)
- 2025-01-05_research.md (25 days old)

Suggest: Delete archive files? Feature is stable.
Options: [YES] [KEEP 30 MORE DAYS] [KEEP FOREVER]



# Troubleshooting

## Q: What if I need to modify a locked file?

A: Use the unlock command:

UNLOCK: path/to/file.js

Make changes, verify functionality, then:

RELOCK: path/to/file.js

## Q: Can I reopen a COMPLETE scope?

A: Yes, change status back to IN_PROGRESS. Locked files remain locked until explicitly unlocked.

## Q: What if I lose archive files?

A: Archive files are optional reference. The living document contains all current information.

## Q: How do I handle multiple features in parallel?

A: Each feature gets its own scope. Set active_scope in STATE.json to switch context.



# About the Author

The Scope Order System was developed by PMERIT LLC while building the PMERIT AI Educational Platform. After struggling with context limits across 60+ sessions of AI-augmented development, we created this methodology to maintain perfect continuity.

What started as internal tooling became a product when we realized every developer using AI faces the same challenges.



# Support

For questions or issues:
- GitHub: https://github.com/peoplemerit
- Email: support@pmerit.com



Scope Order System v3.0 — Living Documents + Lifecycle Archive

Copyright 2025 PMERIT LLC. All Rights Reserved.

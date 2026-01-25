---
title: "AIXORD Starter Guide"
subtitle: "Begin Your Structured AI Journey"
author: "Idowu J Gabriel, Sr."
publisher: "PMERIT Publishing"
date: "December 2025"
version: "3.1"
---

\newpage

# AIXORD Starter Guide

## Begin Your Structured AI Journey

**By Idowu J Gabriel, Sr.**

PMERIT Publishing
Caribou, United States
2025

\newpage

© 2025 by Idowu J Gabriel, Sr.

All rights reserved.

No part of this publication may be reproduced, distributed, or transmitted in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without the prior written permission of the publisher.

For permission requests, contact: info@pmerit.com

Printed in United States

First Edition

**Product Version:** 3.1
**Published:** December 2025

\newpage

# Dedication

To every developer, entrepreneur, and creator who has lost hours of work to forgotten context, contradicted decisions, and AI conversations that went nowhere.

This framework exists because chaos is optional.

To my wife and children—You deserve all of me, always. You called for my time and attention—rightfully so—but instead, you made space. You left daddy alone, not because you had to, but because you believed in the mission. Your sacrifice, patience, and quiet strength made this book possible.

This is our shared creation. Thank you—for everything.

\newpage

# Terms of Use and Disclaimer

By using this book and the AIXORD methodology, you agree to the following terms:

**NO WARRANTY:** AIXORD products are provided "AS IS" without warranty of any kind.

**NO GUARANTEE OF RESULTS:** Your results depend on your implementation, project requirements, and the AI platforms you use.

**NOT PROFESSIONAL ADVICE:** AIXORD is not a substitute for legal, financial, medical, or other professional advice.

**USER RESPONSIBILITY:** You are solely responsible for reviewing AI outputs and making final decisions. The "Director" role explicitly places decision-making authority with you.

**PROHIBITED USES:** You may not use AIXORD to generate harmful content, engage in fraud, create malware, reverse-engineer for resale, or violate AI platform terms of service.

**LIMITATION OF LIABILITY:** PMERIT LLC is not liable for any damages exceeding the amount you paid for this product.

**DISPUTE RESOLUTION:** Disputes are resolved by binding arbitration in Maine. You waive your right to participate in class actions.

**INTELLECTUAL PROPERTY:** AIXORD methodology remains the property of PMERIT LLC. You receive a non-exclusive, non-transferable license for personal and organizational use.

Full terms available at: https://pmerit.com/aixord-terms

Contact: legal@pmerit.com | support@pmerit.com

© 2025 PMERIT LLC. All Rights Reserved.

\newpage

# Before You Begin

This chapter ensures you have everything needed to succeed with AIXORD.

## What You Need

### Required (All Users)

- [ ] Claude account at claude.ai (free accounts work)
- [ ] Internet connection
- [ ] Ability to download and extract ZIP files
- [ ] Basic copy/paste skills

### For Best Experience (Claude Pro — $20/month)

- [ ] Enables "Projects" feature
- [ ] Enables "Project Knowledge" for file uploads
- [ ] Persistent instructions across conversations
- [ ] Recommended for serious projects

### For Maximum Power (Claude Pro + Claude Code)

- [ ] Full file system access
- [ ] Automated implementation
- [ ] Best for software development projects

## What's NOT Required

You do **NOT** need:

- Programming experience
- Project management certification
- Prior AI framework knowledge
- Technical writing skills

AIXORD is designed for anyone who wants structured AI collaboration.

## Key Terms

Before diving in, understand these terms:

**README** — Short for "Read Me." This is always the FIRST file you should open in any software package. It contains essential instructions for getting started.

**.md files** — Markdown files. These are plain text documents you can open with any text editor (Notepad on Windows, TextEdit on Mac, or VS Code). They use simple formatting like *bold* and # headers.

**.json files** — Data files that store structured information. For AIXORD, these track your project state. Open only when instructed; editing incorrectly can cause issues.

**ZIP file** — A compressed folder containing multiple files. Before you can use the files inside, you must EXTRACT (unpack) it:

- **Windows:** Right-click the ZIP → "Extract All"
- **Mac:** Double-click the ZIP file

Once extracted, open the README.md file first.

## Three Ways to Use AIXORD

AIXORD adapts to your Claude subscription:

### Tier A: Claude Pro + Claude Code

Full automation. Claude Web plans, Claude Code implements.

**Best for:** Software development, complex technical projects.

### Tier B: Claude Pro Only

Guided implementation. Claude plans and provides step-by-step instructions. You execute manually.

**Best for:** Most users, content projects, planning.

### Tier C: Claude Free

Fully manual with guidance. Paste governance each session. Save handoffs locally between conversations.

**Best for:** Trying AIXORD before subscribing, simple projects.

The governance file (AIXORD_GOVERNANCE_V3.1.md) automatically detects your tier and adapts its behavior.

## Check for Updates

AIXORD is actively developed. For the latest:

- **Templates:** Check your Gumroad library for updated downloads
- **Documentation:** Visit pmerit.com/aixord
- **Support:** Email support@pmerit.com

**This Book:** Version 3.1 (December 2025)

\newpage

# Table of Contents

1. Introduction to AIXORD
2. The Authority Model
3. Modes
4. HALT Conditions
5. Session Continuity
6. Quick Start Materials
7. Your First AIXORD Session
8. Common Use Cases
9. AIXORD vs Traditional AI Chat
10. Commands Reference
11. Troubleshooting FAQ
12. Download Your Templates
13. About the Author

\newpage

# Chapter 1: Introduction to AIXORD

Technology is moving faster than ever. AI assistants have become essential tools for building software, writing content, managing projects, and running businesses. But for most people, working with AI feels like herding cats—brilliant conversations that lead nowhere, forgotten context, and projects that never finish.

AIXORD (AI Execution Order) was developed because this chaos is not inevitable. After countless failed AI collaborations, a pattern emerged: the problem isn't the AI—it's the lack of structure.

## What is AIXORD?

AIXORD is a governance framework for human-AI collaboration. It transforms chaotic AI conversations into structured, productive project execution.

**Core Principle:** You (Human) are the Director. AI is your Architect and Commander. Every decision is documented, every action is authorized, and nothing is forgotten between sessions.

## The AIXORD Project Composition Formula

**Sophisticated Version:**

```
Project_Docs → [ Master_Scope : { Σ(Deliverable₁, Deliverable₂,...Dₙ) }
                 where each Deliverable : { Σ(Step₁, Step₂,...Sₙ) } ]
             → Production-Ready_System
```

**Simple Version (Time Analogy):**

```
Steps (Seconds) → Deliverables (Minutes) → Master_Scope (The Hour) = Done
```

Small actions build deliverables. Deliverables build the complete project.

## Why AIXORD Works

Traditional AI conversations suffer from:

- **Context Loss:** AI forgets everything between sessions
- **Decision Drift:** Requirements change without documentation
- **Authority Confusion:** Who decides what?
- **Execution Chaos:** No clear path from idea to completion

AIXORD solves each problem:

| Problem | AIXORD Solution |
|---------|-----------------|
| Context Loss | HANDOFF documents preserve state |
| Decision Drift | Decisions are frozen in DECISION mode |
| Authority Confusion | Clear Director/Architect/Commander roles |
| Execution Chaos | Phase-based flow with checkpoints |

\newpage

# Chapter 2: The Authority Model

AIXORD establishes clear authority boundaries between you and the AI.

## The Three Roles

| Role | Who | Authority |
|------|-----|-----------|
| **Director** | You (Human) | Decides WHAT exists. Approves all decisions. Owns outcomes. |
| **Architect** | Claude Web | Analyzes, questions, plans, specifies, produces HANDOFFs. Does NOT implement. |
| **Commander** | Claude Code | Implements approved plans. Edits files. Ships artifacts. |

## The Golden Rule

**Decisions flow DOWN:** Director → Architect → Commander

**Implementation flows UP:** Commander → Architect → Director for approval

The Director always has final authority. The AI never makes decisions autonomously—it proposes, you approve.

## Why This Matters

Without clear authority:

- AI invents requirements during implementation
- Decisions get made without your knowledge
- Projects drift from original intent
- You lose control of your own project

With AIXORD authority:

- Every decision is explicit and documented
- AI asks before acting on anything significant
- You can trace any outcome back to an approved decision
- The project reflects YOUR vision, not AI assumptions

\newpage

# Chapter 3: Modes

AIXORD operates in distinct modes that determine what actions are permitted.

## DECISION Mode

**Purpose:** Planning, analysis, and decision-making

**Permitted Actions:**
- Brainstorming
- Asking questions
- Analyzing requirements
- Proposing options
- Documenting decisions

**Prohibited Actions:**
- Implementing changes
- Editing files
- Executing code

## EXECUTION Mode

**Purpose:** Implementing approved decisions

**Permitted Actions:**
- Implementing specifications
- Writing code
- Creating files
- Following the approved plan

**Prohibited Actions:**
- Making new decisions
- Changing requirements
- Deviating from specification

## Mode Transitions

Transitions are explicit and require your authorization:

```
DECISION MODE
     ↓
"Decisions are frozen. ENTER EXECUTION MODE."
     ↓
EXECUTION MODE
     ↓
"HALT: [Issue]. Returning to DECISION MODE."
     ↓
DECISION MODE
```

Never allow the AI to transition modes without your explicit command.

\newpage

# Chapter 4: HALT Conditions

HALT is the safety mechanism that prevents projects from going off track.

## When AI Must HALT

The AI will HALT and return to DECISION mode if:

- Requirements are ambiguous
- Multiple valid approaches exist
- Implementation would deviate from approved plan
- A decision contradicts earlier decisions
- Something is outside the approved scope
- Estimated effort significantly exceeds expectations
- External dependency is unavailable or changed

## HALT Is Not Failure

**HALT is the system protecting you from building the wrong thing.**

When AI says "HALT," it's doing its job correctly. It's saying: "I found something that needs your decision before I continue."

## Responding to HALT

When the AI HALTs:

1. Read the HALT reason carefully
2. Make the required decision
3. Document the decision
4. Authorize continuation

Example:

```
AI: "HALT: The specification says 'fast' but doesn't define
     acceptable response time. What is the maximum acceptable
     latency?"

You: "Decision: Maximum acceptable latency is 200ms. Continue."
```

\newpage

# Chapter 5: Session Continuity

AI assistants have no memory between sessions. AIXORD solves this with structured handoffs.

## The HANDOFF Document

Before ending any productive session, generate a HANDOFF:

```markdown
# HANDOFF — [Project Name]
**Date:** [Date]
**Session:** [Number]

## Current State
- Phase: [Current phase]
- Active SCOPE: [Which one]
- Next Step: [What's next]

## Decisions Made This Session
[List of decisions]

## Completed This Session
[List of completed items]

## Carryforward (Incomplete)
[What needs to continue]

## Blockers / Questions
[Anything unresolved]

## Files Modified
[List of files changed]
```

## Starting a New Session

When you start a new session:

1. Paste the governance instructions (or use Project Knowledge)
2. Paste your latest HANDOFF
3. Say: `PMERIT CONTINUE`

The AI will read the handoff and resume exactly where you left off.

## Why This Works

The HANDOFF captures:

- What was decided (so decisions aren't revisited)
- What was done (so work isn't repeated)
- What's next (so momentum continues)
- What's blocked (so issues aren't forgotten)

\newpage

# Chapter 6: Quick Start Materials

Your download includes three quick-reference documents in the quick-start/ folder that will accelerate your AIXORD learning.

## CHEAT SHEET (CHEAT_SHEET.md)

A one-page reference card containing all essential AIXORD commands. We recommend printing this and taping it to your monitor. Within a week, you'll have the commands memorized, but until then, this visual reference keeps you moving without breaking flow.

## COMMAND CARD (COMMAND_CARD.md)

The complete command reference with all modes, states, automatic halt triggers, and quick recipes. This is your comprehensive guide when the Cheat Sheet isn't enough. Keep it open in a browser tab during your first few sessions.

## GOVERNANCE FILE (AIXORD_GOVERNANCE_V3.1.md)

The brain of AIXORD. This file contains all the rules, phases, and behaviors that transform Claude into your intelligent project architect. Copy the entire contents and paste it into your Claude Project's "Set project instructions" dialog.

## 5-Minute Setup

1. Download your AIXORD package from Gumroad (see Appendix for your discount code)
2. Extract the ZIP file
3. Open README.md and spend 2 minutes reviewing the Quick Start
4. Open Claude at claude.ai and create a new Project
5. Paste AIXORD_GOVERNANCE_V3.1.md into the project instructions
6. Start your first session by typing: `PMERIT CONTINUE`

That's it. You're now running AIXORD.

\newpage

# Chapter 7: Your First AIXORD Session

Let's walk through a complete AIXORD session, from setup to execution.

## Step 1: Create Your Claude Project

Open claude.ai and navigate to Projects. Create a new project named "AIXORD [Your Project Name]". In the Project Knowledge section, upload your AIXORD governance file.

## Step 2: Start the Session

In your new project, type:

```
PMERIT CONTINUE
```

Claude will ask for your license email (first time only), detect your tier, and ask what you want to work on.

## Step 3: Discovery (If You Need It)

If you don't have a clear project idea, say:

"I don't know what to build, help me discover."

Claude will ask discovery questions to surface your project from frustrations, wishes, and repetitive tasks.

## Step 4: Brainstorm

Once you have a project direction, Claude enters BRAINSTORM mode:

- What problem are we solving?
- Who will use this?
- What's your budget and timeline?
- What tools do you prefer?

Answer each question. Claude documents your answers.

## Step 5: Options

After brainstorming, Claude presents 2-3 solution approaches:

- Option A: Quick & Simple
- Option B: Balanced
- Option C: Robust & Scalable

Each option includes pros, cons, cost, complexity, and timeline. Choose the one that fits your goals.

## Step 6: Document

Claude generates your PROJECT DOCUMENT with:

- All decisions made
- Master Scope description
- Status Ledger (phases and steps)

Review and approve the document.

## Step 7: Execute

With the document approved, Claude guides implementation:

- Tier A (Pro+Code): Claude Code implements automatically
- Tier B (Pro only): Claude provides step-by-step instructions
- Tier C (Free): Claude guides you through manual execution

## Step 8: End Session

Before closing:

```
PMERIT HANDOFF
```

Claude generates a handoff document. Save it for your next session.

\newpage

# Chapter 8: Common Use Cases

AIXORD adapts to any project. Here are proven applications:

## Software Development

**The Problem:** AI writes code that doesn't match requirements, forgets architecture decisions, and creates inconsistent implementations.

**AIXORD Solution:**

- DECISION mode captures all architecture choices
- Specifications freeze before coding begins
- HALT prevents scope creep
- HANDOFF preserves technical context

**Example Flow:**

1. Director: "Build a REST API for user management"
2. BRAINSTORM: Define endpoints, auth method, database
3. OPTIONS: Compare Express vs FastAPI vs Go
4. DOCUMENT: Generate API specification
5. EXECUTE: Build endpoint by endpoint with verification

## Content Creation

**The Problem:** AI-generated content lacks consistency, drifts from brand voice, and forgets previous decisions about tone and style.

**AIXORD Solution:**

- Define voice and style in DECISION mode
- Freeze brand guidelines before writing
- Track all editorial decisions
- Maintain consistency across sessions

**Example Flow:**

1. Director: "Create a 10-part blog series on productivity"
2. BRAINSTORM: Define audience, tone, themes
3. DOCUMENT: Outline all 10 posts with key points
4. EXECUTE: Write each post following the specification
5. HANDOFF: Track which posts are complete

## Business Planning

**The Problem:** Strategic conversations produce ideas but no actionable plans. Context is lost between planning sessions.

**AIXORD Solution:**

- Structured requirements gathering
- Options with clear cost/benefit analysis
- Documented decisions with rationale
- Progress tracking through Status Ledger

**Example Flow:**

1. Director: "Plan our Q2 marketing strategy"
2. DISCOVERY: Surface goals and constraints
3. BRAINSTORM: Identify channels, budget, timeline
4. OPTIONS: Compare 3 strategic approaches
5. DOCUMENT: Create execution plan with milestones

## Research and Analysis

**The Problem:** Research sprawls without direction. Findings aren't synthesized. Analysis paralysis sets in.

**AIXORD Solution:**

- Define research questions upfront
- Structured information gathering
- Documented findings and sources
- Clear synthesis and recommendations

## Personal Projects

Even personal projects benefit from structure:

- Home renovation planning
- Learning new skills
- Organizing life admin
- Creative writing projects

The scale is smaller, but the chaos is the same. AIXORD works for projects of any size.

\newpage

# Chapter 9: AIXORD vs Traditional AI Chat

Understanding the difference helps you choose when to use each approach.

## Traditional AI Chat

**Best For:**

- Quick questions
- One-off tasks
- Brainstorming without commitment
- Learning and exploration

**Limitations:**

- No memory between sessions
- No decision tracking
- No progress persistence
- Easy to lose context

## AIXORD Governance

**Best For:**

- Multi-session projects
- Team collaboration
- Complex implementations
- Anything requiring accountability

**Advantages:**

- Structured decision-making
- Persistent context via HANDOFF
- Clear authority model
- Progress tracking
- Quality gates via HALT

## When to Use Each

| Situation | Approach |
|-----------|----------|
| "What's the capital of France?" | Traditional chat |
| "Build me a website" | AIXORD |
| "Explain quantum computing" | Traditional chat |
| "Plan my product launch" | AIXORD |
| "Quick code snippet" | Traditional chat |
| "Develop full application" | AIXORD |

## The Transition

You can start in traditional chat and transition to AIXORD when:

- The task grows beyond one session
- You need to track decisions
- Multiple people are involved
- Quality and consistency matter

Simply create a PROJECT DOCUMENT from your chat history and continue with governance.

\newpage

# Chapter 10: Commands Reference

## Primary Commands

| Command | Effect |
|---------|--------|
| `PMERIT CONTINUE` | Resume work — AI reads state and continues |
| `PMERIT DISCOVER` | Enter Discovery mode (find project idea) |
| `PMERIT BRAINSTORM` | Enter Brainstorm mode |
| `PMERIT OPTIONS` | Request solution alternatives |
| `PMERIT DOCUMENT` | Generate/update project document |
| `PMERIT EXECUTE` | Begin implementation |
| `PMERIT STATUS` | Show current Status Ledger |
| `PMERIT HALT` | Stop everything, return to decision-making |
| `PMERIT HANDOFF` | Generate session handoff document |

## Mode Commands

| Command | Effect |
|---------|--------|
| `ENTER DECISION MODE` | Switch to planning/analysis |
| `ENTER EXECUTION MODE` | Switch to implementation |

## Status Symbols

| Symbol | Meaning |
|--------|---------|
| 🧊 | PLANNED — Ready to start |
| 🔓 | ACTIVE — In progress |
| ✅ | IMPLEMENTED — Done, needs verification |
| 🛡️ | VERIFIED — Confirmed working, locked |

\newpage

# Chapter 11: Troubleshooting FAQ

## The AI keeps asking questions instead of doing

**Problem:** You want execution but AI stays in questioning mode.

**Solution:** Explicitly transition modes: "Decisions are frozen. ENTER EXECUTION MODE."

## I lost context when starting a new session

**Problem:** New session starts fresh with no memory of previous work.

**Solution:** Always create a HANDOFF document before ending sessions. Paste it at the start of new sessions.

## The AI is in the wrong mode

**Problem:** You need EXECUTION but the AI acts like it's in DECISION (or vice versa).

**Solution:** Issue explicit mode command: "ENTER EXECUTION MODE" or "ENTER DECISION MODE". Confirm the AI acknowledges the transition.

## Specifications keep getting longer

**Problem:** Trying to capture every detail leads to overwhelming documents.

**Solution:** Use SCOPE decomposition. Break large specifications into smaller, focused SCOPEs. Each SCOPE should be implementable in one session.

## The AI and I disagree about what was decided

**Problem:** Mid-project conflict about requirements.

**Solution:** Reference the documented decisions: "According to our HANDOFF document, we decided X. That decision is frozen."

## HALT keeps triggering

**Problem:** AI HALTs frequently, slowing progress.

**Solution:** This usually means your specifications aren't detailed enough. Spend more time in DECISION mode clarifying requirements before entering EXECUTION.

\newpage

# Appendix A: Quick Reference Card (Chapter 12)

```
┌─────────────────────────────────────────────────────────────┐
│                    AIXORD QUICK REFERENCE                   │
├─────────────────────────────────────────────────────────────┤
│  COMMANDS                                                   │
│  ─────────────────────────────────────────────────────────  │
│  PMERIT CONTINUE    → Resume your project                   │
│  PMERIT DISCOVER    → Find a project idea                   │
│  PMERIT BRAINSTORM  → Shape your project                    │
│  PMERIT OPTIONS     → See solution alternatives             │
│  PMERIT STATUS      → Check progress                        │
│  PMERIT HANDOFF     → Save session state                    │
│  PMERIT HALT        → Stop and reassess                     │
├─────────────────────────────────────────────────────────────┤
│  PHASES                                                     │
│  ─────────────────────────────────────────────────────────  │
│  DISCOVERY → BRAINSTORM → OPTIONS → DOCUMENT → EXECUTE      │
├─────────────────────────────────────────────────────────────┤
│  STATUS SYMBOLS                                             │
│  ─────────────────────────────────────────────────────────  │
│  🧊 PLANNED    🔓 ACTIVE    ✅ IMPLEMENTED    🛡️ VERIFIED   │
├─────────────────────────────────────────────────────────────┤
│  ROLES                                                      │
│  ─────────────────────────────────────────────────────────  │
│  Director (You)      → Decides what exists                  │
│  Architect (Claude)  → Plans and specifies                  │
│  Commander (Code)    → Implements                           │
└─────────────────────────────────────────────────────────────┘
```

\newpage

# Appendix B: Download Your Templates (Chapter 13)

As a book owner, you have access to the AIXORD templates.

## Your Access Code

**Code:** AX-STR-7K9M

Enter this code at checkout for your reader discount.

## Download Link

**Product:** AIXORD Starter
**Regular Price:** $4.99
**Your Price:** FREE (with code)
**URL:** https://meritwise0.gumroad.com/l/aixord-starter

## How to Download

1. Visit the URL above (or type it into your browser)
2. Click "I want this!"
3. Enter the discount code: AX-STR-7K9M
4. Complete checkout ($0.00)
5. Download your ZIP file
6. Extract and start using!

## What's Included

Your download includes ready-to-use templates:

- AIXORD_GOVERNANCE_V3.1.md — The brain (paste into Claude)
- AIXORD_STATE_V3.1.json — State tracking template
- README.md — Quick start guide
- LICENSE.md — License terms
- DISCLAIMER.md — Terms of use
- quick-start/ — Reference materials

## Getting Started

After downloading:

1. Unzip the file to your project folder
2. Open Claude at claude.ai
3. Create a new Project
4. Paste AIXORD_GOVERNANCE_V3.1.md into project instructions
5. Type: `PMERIT CONTINUE`
6. Start collaborating with structure!

## Support

Questions about AIXORD? Email: support@pmerit.com

Visit pmerit.com/aixord for updates and additional resources.

\newpage

# About the Author

Idowu J Gabriel, Sr. is the founder of PMERIT, an educational technology company focused on making AI collaboration productive and accessible.

After years of working with AI assistants on software development, content creation, and business operations, he developed AIXORD to solve the fundamental problem of AI chaos: conversations that go nowhere, forgotten context, and projects that never finish.

AIXORD draws on military operations planning methodology, adapting the discipline of OPORD (Operations Order) for human-AI collaboration. The framework has been battle-tested on production projects and refined through real-world use.

For more information, visit pmerit.com or contact info@pmerit.com.

---

**Authority. Execution. Confirmation.**

---

*© 2025 PMERIT LLC. All Rights Reserved.*

*Version 3.1 — December 2025*

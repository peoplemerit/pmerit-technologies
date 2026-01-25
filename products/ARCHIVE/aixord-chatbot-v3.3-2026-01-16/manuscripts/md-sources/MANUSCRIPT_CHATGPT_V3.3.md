---
title: "AIXORD for ChatGPT Users"
subtitle: "Structured Governance for OpenAI ChatGPT"
author: "Idowu J Gabriel, Sr."
publisher: "PMERIT Publishing"
date: "January 2026"
version: "3.3"
---

\newpage

# AIXORD for ChatGPT Users

## Structured Governance for OpenAI ChatGPT

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

**Product Version:** 3.3
**Published:** January 2026

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

# What You Need to Know (Prerequisites)

Before using AIXORD with ChatGPT, ensure you have:

## Basic Requirements (All Users)

| Requirement | Why |
|-------------|-----|
| OpenAI account | Required to access ChatGPT |
| Web browser | Chrome, Firefox, Safari, or Edge |
| Basic AI chatbot experience | You should have used an AI chatbot at least once |
| File management skills | Download, extract ZIP, navigate folders |
| Copy/paste ability | Transfer text between applications |

## Understanding Your ChatGPT Tier

### ChatGPT Pro ($200/month)

If you subscribe to ChatGPT Pro, you have access to:

- **Unlimited access** — No usage caps on GPT-4o and o1
- **Custom GPTs** — Create persistent AI personas with custom instructions
- **Advanced voice** — Real-time voice conversations
- **Extended context** — Longer conversations without losing track

**AIXORD Experience:** Create a Custom GPT once, use it forever. No pasting governance every session.

### ChatGPT Plus ($20/month)

If you subscribe to ChatGPT Plus:

- **Custom GPTs** — Create persistent AI personas with custom instructions
- **GPT-4o access** — Higher capability model
- **Priority access** — During high-traffic periods
- **File uploads** — Upload documents for reference

**AIXORD Experience:** Create a Custom GPT for persistent AIXORD rules. Same workflow as Pro.

### ChatGPT Free

If you use ChatGPT without a paid subscription:

- No Custom GPT creation
- Limited GPT-4o access
- May have usage limits during peak times
- No file uploads in conversations

**AIXORD Experience:** Paste the governance file at the start of each session. Save HANDOFF documents to maintain continuity.

## NOT Required

You do NOT need:
- Programming experience
- OpenAI API account
- Previous governance framework knowledge
- Technical writing skills

## Recommended Before Starting

1. Read Chapter 9 (Setup) for your specific tier
2. Have a project idea in mind (or use DISCOVER mode to find one)
3. Set aside 10-15 minutes for initial setup

## Key Terms

Before diving in, understand these terms:

**README** — Short for "Read Me." This is always the FIRST file you should open in any software package. It contains essential instructions for getting started.

**.md files** — Markdown files. These are plain text documents you can open with any text editor (Notepad on Windows, TextEdit on Mac, or VS Code). They use simple formatting like *bold* and # headers.

**.json files** — Data files that store structured information. For AIXORD, these track your project state. Open only when instructed; editing incorrectly can cause issues.

**ZIP file** — A compressed folder containing multiple files. Before you can use the files inside, you must EXTRACT (unpack) it:

- **Windows:** Right-click the ZIP → "Extract All"
- **Mac:** Double-click the ZIP file

Once extracted, open the README.md file first.

**Custom GPT** — A personalized ChatGPT with custom instructions that persist across sessions. Available to Plus and Pro subscribers.

## Check for Updates

AIXORD is actively developed. For the latest:

- **Templates:** Check your Gumroad library for updated downloads
- **Documentation:** Visit pmerit.com/aixord
- **Support:** Email support@pmerit.com

**This Book:** Version 3.3 (January 2026)

\newpage

# Table of Contents

**Front Matter**
- Prerequisites (What You Need to Know)

**Part I: AIXORD Foundations**
1. Introduction to AIXORD
2. The Authority Model
3. Modes
4. HALT Conditions

**Part II: The v3.3 Framework**
5. The Two Kingdoms *(NEW in v3.3)*
6. The DAG Dependency System *(NEW in v3.3)*
7. The 7 Quality Dimensions *(NEW in v3.3)*
8. Session Continuity

**Part III: Getting Started with ChatGPT**
9. Setting Up for ChatGPT
10. Understanding Your Download Files
11. Your First AIXORD Session

**Part IV: Going Further**
12. Common Use Cases
13. AIXORD vs Traditional AI Chat
14. Commands Reference
15. Troubleshooting FAQ

**Appendices**
- Appendix A: Quick Reference Card
- Appendix B: Download Your Templates (discount code: AX-GPT-3W7J)
- About the Author

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
| **Architect** | ChatGPT | Analyzes, questions, plans, specifies, produces HANDOFFs. |
| **Commander** | You (Human) | Implements approved plans. Creates files. Ships artifacts. |

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

# Chapter 5: The Two Kingdoms

AIXORD v3.3 introduces the Two Kingdoms model, a fundamental shift in how projects flow from idea to reality. This model separates planning from execution, ensuring you fully define what you want before building it.

## The Ideation Kingdom

The Ideation Kingdom is where ideas take shape. This is the realm of exploration, brainstorming, and planning. Here, nothing is permanent. You can explore options, change directions, and refine your vision without commitment.

The phases in the Ideation Kingdom are:

**DECISION** — The starting point where you choose your direction. Do you have an idea to develop, or do you need help discovering one?

**DISCOVER** — Guided exploration when you do not have a clear project idea. ChatGPT asks targeted questions about your interests, skills, and constraints to generate viable project candidates.

**BRAINSTORM** — Structured ideation when you have a concept but need to define it. Here you establish the core concept, target audience, and success criteria.

**OPTIONS** — Comparative analysis of approaches, technologies, or strategies. Options are evaluated against the 7 Quality Dimensions before selection.

**ASSESS** — Final review before crossing to execution. The Master Scope is compiled, dependencies are mapped, and readiness is confirmed.

## The Ideation Gate

Between the two kingdoms stands the Ideation Gate. This is a deliberate checkpoint that prevents premature execution. You cannot build until you have fully defined what you are building.

The gate requires:

- A defined Master Scope with clear deliverables
- All deliverables enumerated as SCOPEs
- Dependencies mapped in a DAG (Directed Acyclic Graph)
- Quality dimensions evaluated for each major component
- Your explicit command: FINALIZE PLAN

Until you type FINALIZE PLAN, the gate remains closed. This prevents the common mistake of rushing into execution before the plan is solid.

## The Realization Kingdom

The Realization Kingdom is where plans become reality. Once you cross the Ideation Gate, the rules change. Specs are frozen. You build exactly what was defined in the Master Scope.

The phases in the Realization Kingdom are:

**EXECUTE** — Active implementation of approved plans. Each SCOPE is unlocked, built, and verified before moving to the next.

**AUDIT** — Review of implemented work against specifications. Visual verification confirms the build matches the plan.

**VERIFY** — Confirmation that acceptance criteria are met. Each deliverable is checked against its definition.

**LOCK** — Final state where verified work is protected from accidental changes.

## Why Two Kingdoms Matter

The Two Kingdoms model solves a critical problem in AI collaboration: scope creep through premature execution. Without a gate between planning and building, it is too easy to start coding before requirements are clear, then waste time rebuilding when requirements change.

By forcing a clear transition from Ideation to Realization, AIXORD ensures:

- Requirements are complete before implementation begins
- Changes happen in planning, not during building
- ChatGPT knows whether to explore possibilities or execute plans
- Progress is measurable and verifiable

When ChatGPT displays its response header, you will always see which kingdom you are in. This constant reminder helps maintain the discipline that makes AI collaboration productive.

\newpage

# Chapter 6: The DAG Dependency System

Large projects have dependencies. You cannot build the roof before the foundation. You cannot test the API before it exists. AIXORD v3.3 uses a DAG (Directed Acyclic Graph) to map and enforce these dependencies.

## What is a DAG?

A DAG is a graph where connections flow in one direction and never loop back. In AIXORD, each node in the graph is a SCOPE (a deliverable), and each connection represents a dependency.

For example, a web application might have this structure:

```
SCOPE_DATABASE (No dependencies)
    ↓
SCOPE_API (Depends on: DATABASE)
    ↓
SCOPE_FRONTEND (Depends on: API)
    ↓
SCOPE_DEPLOYMENT (Depends on: FRONTEND, API)
```

The DAG enforces that you cannot start SCOPE_API until SCOPE_DATABASE is complete. You cannot start SCOPE_FRONTEND until SCOPE_API is complete. This prevents the chaos of trying to build components that depend on things that do not exist yet.

## How the DAG is Created

During the ASSESS phase in the Ideation Kingdom, before you can pass the Ideation Gate, ChatGPT helps you map your project into a DAG. Each deliverable becomes a SCOPE with:

- A unique identifier (SCOPE_NAME)
- Clear acceptance criteria
- Explicit dependencies (what must be complete first)
- Current status (PLANNED, ACTIVE, IMPLEMENTED, VERIFIED)

## DAG Commands

**SHOW DAG** — Displays the current dependency graph with status indicators for each node.

**DAG STATUS** — Shows a summary table of all SCOPEs, their dependencies, and current states.

**CHECK DEPENDENCIES: [SCOPE]** — Verifies whether a specific SCOPE can be started based on its prerequisites.

## Execution Order

The DAG determines execution order. When you enter the Realization Kingdom, ChatGPT identifies which SCOPEs have no unmet dependencies. These are eligible to start. As each SCOPE is verified complete, new SCOPEs become eligible.

This systematic approach prevents:

- Starting work that cannot be completed due to missing prerequisites
- Forgetting dependencies and creating broken systems
- Losing track of what is done and what remains

## Parallel Execution

When multiple SCOPEs have their dependencies met simultaneously, they can be worked in parallel. The DAG identifies these opportunities automatically. For example, if both SCOPE_MOBILE and SCOPE_WEB depend only on SCOPE_API, and SCOPE_API is verified, both can proceed at the same time.

ChatGPT will note these opportunities: "SCOPE_WEB and SCOPE_MOBILE can proceed in parallel. Which would you like to start?"

\newpage

# Chapter 7: The 7 Quality Dimensions

AIXORD v3.3 evaluates every major decision against seven quality dimensions. This systematic assessment ensures that options are compared objectively and that chosen approaches meet professional standards.

## The Seven Dimensions

### 1. Best Practices

Does this approach follow established patterns and conventions? Best practices represent the accumulated wisdom of the industry. Deviating from them requires strong justification.

Questions to assess:
- Does this follow standard patterns for this type of solution?
- Would an experienced professional recognize this approach?
- Are we reinventing something that already has a proven solution?

### 2. Completeness

Does this cover all requirements? A solution that addresses 80% of needs may seem good enough, but missing features often become critical later.

Questions to assess:
- Does this address every stated requirement?
- Are edge cases considered?
- What is explicitly out of scope and why?

### 3. Accuracy

Is this technically correct? A beautiful plan built on incorrect assumptions fails in execution.

Questions to assess:
- Are the technical claims verifiable?
- Do the proposed technologies actually support our use case?
- Have assumptions been validated?

### 4. Sustainability

Can this be maintained long-term? The best solution today may become a burden tomorrow if it cannot be updated, extended, or handed off to others.

Questions to assess:
- Can this be maintained by someone other than the original creator?
- Will dependencies remain supported?
- Is the approach documented well enough for future changes?

### 5. Reliability

Will this work consistently? Intermittent failures are often worse than consistent ones because they are harder to diagnose and fix.

Questions to assess:
- What happens when things go wrong?
- Are there fallback mechanisms?
- How will errors be detected and reported?

### 6. User-Friendliness

Can the target users actually use this? Technical excellence means nothing if users cannot accomplish their goals.

Questions to assess:
- Is the interface intuitive for the target audience?
- Have we minimized the learning curve?
- Does the flow match how users think about the task?

### 7. Accessibility

Can everyone use this, including those with disabilities? Accessibility is both an ethical obligation and often a legal requirement.

Questions to assess:
- Does this work with screen readers?
- Is color contrast sufficient?
- Can all functions be accessed via keyboard?

## Using the Dimensions

During BRAINSTORM and OPTIONS phases, ChatGPT evaluates proposed approaches against these dimensions. Each dimension receives a status:

- **PASS** — Meets requirements
- **WARN** — Potential concerns identified
- **FAIL** — Does not meet minimum standards

A WARN status does not block progress but should be acknowledged. A FAIL status requires either fixing the issue or explicitly accepting the limitation.

## The Quality Command

**QUALITY CHECK** — Requests a full seven-dimension evaluation of the current plan or proposal.

ChatGPT will display a table showing each dimension, its assessment, and any notes. This makes quality visible and discussable rather than implicit and assumed.

## The Open-Source Priority Stack

When recommending tools, libraries, or platforms, AIXORD applies a priority stack that favors open, sustainable solutions:

**Priority 1: Free Open Source** — Completely free, community-maintained, no vendor lock-in. Always preferred when capability is sufficient.

**Priority 2: Freemium Open Source** — Open source core with paid premium features. Good balance of capability and cost.

**Priority 3: Free Proprietary** — Free to use but owned by a company. Watch for usage limits and potential future pricing.

**Priority 4: Paid Open Source** — Commercial open source with support contracts. Appropriate for enterprise needs.

**Priority 5: Paid Proprietary** — Commercial closed-source solutions. Use only when no viable alternative exists.

When ChatGPT recommends a Priority 4 or 5 solution, it must provide justification: what capability does this provide that lower-priority options cannot match? This prevents defaulting to expensive solutions when simpler alternatives exist.

The command **COST CHECK** requests an evaluation of the current plan's tool choices against this priority stack.

\newpage

# Chapter 8: Session Continuity

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

1. Paste the governance instructions (or use Custom GPT)
2. Paste your latest HANDOFF
3. Say: `PMERIT CONTINUE`

The AI will read the handoff and resume exactly where you left off.

## Why This Works

The HANDOFF captures:

- What was decided (so decisions aren't revisited)
- What was done (so work isn't repeated)
- What's next (so momentum continues)
- What's blocked (so issues aren't forgotten)

## Proactive HANDOFF System (ChatGPT-Specific)

**You don't need to remember to request HANDOFFs.** With v3.3, ChatGPT tracks context usage and generates HANDOFFs automatically.

### How It Works

ChatGPT monitors the conversation and acts at key thresholds:

| Context Level | What ChatGPT Does |
|---------------|------------------|
| ~60% | Alerts you that progress is being tracked |
| ~80% | Generates a HANDOFF proactively — save it! |
| ~95% | Emergency HANDOFF — copy immediately |

### Automatic Triggers

ChatGPT will also generate HANDOFFs when:

- A major milestone is completed
- You transition between phases (BRAINSTORM → EXECUTE)
- You indicate the session is ending
- Before risky operations

### What You Need to Do

When ChatGPT generates a HANDOFF:

1. **Copy it immediately** — Don't continue working first
2. **Save it locally** — As `HANDOFF_[DATE].md`
3. **Start a new session** — Paste governance + HANDOFF

This ensures you never lose work, even if the session ends unexpectedly.

## HANDOFF Recovery

If a session ends without a proper HANDOFF (browser crash, timeout, context exhaustion), use the recovery command:

```
PMERIT RECOVER
```

ChatGPT will guide you through reconstruction:

**Option A:** Paste your last few messages from the old chat
**Option B:** Describe from memory (project, phase, last completed, next step)
**Option C:** Paste your PROJECT_DOCUMENT.md
**Option D:** Paste any old HANDOFF you have saved

After providing information, ChatGPT will show a recovery summary for confirmation before continuing.

### Prevention Tips

1. Save HANDOFFs immediately when ChatGPT generates them
2. Keep your PROJECT_DOCUMENT.md updated
3. Use `PMERIT CHECKPOINT` for mid-session saves during long work

\newpage

# Chapter 9: Setting Up for ChatGPT

This chapter covers setup for ChatGPT Pro, ChatGPT Plus, and ChatGPT Free users. Find your tier and follow those instructions.

---

## Part A: ChatGPT Plus/Pro Setup (Recommended)

If you have ChatGPT Plus or Pro, you can create a **Custom GPT** — a personalized ChatGPT with your governance rules built in. This is a one-time setup that makes every future session instant.

### What Are Custom GPTs?

Custom GPTs are personalized versions of ChatGPT. Each Custom GPT has:
- **Instructions** — Rules the AI follows (where your AIXORD governance goes)
- **Knowledge** — Files the AI can reference (your project documents)
- **Name & Icon** — For easy identification

Think of a Custom GPT as your personal AIXORD assistant that remembers its training.

### Creating Your AIXORD Custom GPT

**Step 1: Access GPT Builder**
1. Go to chat.openai.com
2. Sign in with your OpenAI account
3. Click "Explore GPTs" in the sidebar
4. Click "+ Create" (or "Create a GPT")

**Step 2: Configure the GPT**
1. **Name:** Enter `AIXORD` (or a project-specific name like "AIXORD - My Website")
2. **Instructions:** This is the important part
   - Open `AIXORD_GOVERNANCE_CHATGPT_GPT_V3.3.md` from your download (the condensed version)
   - Copy the ENTIRE contents
   - Paste into the Instructions field

**Step 3: Add Knowledge (Optional but Recommended)**
1. Click "Add files" in the Knowledge section
2. Upload these files:
   - `AIXORD_PHASE_DETAILS_V3.3.md` (detailed phase behaviors)
   - `AIXORD_STATE_CHATGPT_V3.3.json` (state template)
   - Previous HANDOFF files
   - Project requirements
   - Reference materials
3. The GPT will reference these during conversations

### Which Governance File for Custom GPTs?

Your download includes two governance files:

| File | Size | Purpose |
|------|------|---------|
| `AIXORD_GOVERNANCE_CHATGPT_GPT_V3.3.md` | ~13KB | Optimized for Custom GPT Instructions |
| `AIXORD_GOVERNANCE_CHATGPT_V3.3.md` | ~79KB | Full version for paste workflow |

**For Custom GPT users:** Use the condensed `_GPT_V3.3.md` file in Instructions. It's optimized to fit within ChatGPT's limits while retaining all essential functionality.

**Upload to Knowledge:**
- `AIXORD_PHASE_DETAILS_V3.3.md` — Detailed phase behaviors
- `AIXORD_STATE_CHATGPT_V3.3.json` — State tracking template
- Your project files as you create them

**Why two files?**

ChatGPT's Custom GPT Instructions has content limits that occasionally reject larger files. The condensed version (~13KB) fits reliably. The full version (~79KB) is for users who prefer the paste-every-session workflow or need the complete v3.3 features.

### Troubleshooting GPT Save Issues

If you see an error saving your Custom GPT:

1. **Try the condensed file** — Use `AIXORD_GOVERNANCE_CHATGPT_GPT_V3.3.md` instead of the full version
2. **Check for special characters** — Remove any unusual symbols
3. **Try smaller chunks** — Paste half, save, then add the rest
4. **Use paste workflow** — If Custom GPTs won't work, use the paste method (see ChatGPT Free setup)

The condensed file has been tested to save successfully in most cases.

**Step 4: Save**
1. Click "Save"
2. Choose visibility (Private, Anyone with link, or Public)
3. Your AIXORD GPT appears in your GPT list
4. Done! One-time setup complete.

### Using Your AIXORD Custom GPT

**Every Session:**
1. Click your AIXORD GPT from the sidebar
2. Type: `PMERIT CONTINUE`
3. First time: Enter your license email or code
4. When asked about tier, say: `Custom GPT`
5. Start working!

**That's it.** No pasting, no setup, just open and go.

---

## Part B: ChatGPT Free Setup

Without the Custom GPT feature, you'll paste the governance document at the start of each session. It takes about 2 minutes.

### Preparing Your Files

**Step 1: Create a Local Folder**
On your computer, create this structure:
```
AIXORD_Projects/
├── MyProject/
│   ├── docs/
│   │   ├── PROJECT_DOCUMENT.md
│   │   └── handoffs/
│   │       └── HANDOFF_2025-01-01.md
│   └── src/
└── governance/
    └── AIXORD_GOVERNANCE_CHATGPT_V3.3.md
```

**Step 2: Save the Activation Template**
Create a file called `ACTIVATION_TEMPLATE.txt` with:

```
You are now operating under the AIXORD governance framework.
Read and follow ALL instructions below as your operating rules.
When I say "PMERIT CONTINUE", activate this framework.

[PASTE GOVERNANCE HERE]

Confirm you understand by saying "AIXORD ACTIVATED" and then wait for my command.
```

### Starting Each Session

**Step 1: Open ChatGPT**
1. Go to chat.openai.com
2. Click "New chat"

**Step 2: Activate AIXORD**
1. Open your `ACTIVATION_TEMPLATE.txt`
2. Open `AIXORD_GOVERNANCE_CHATGPT_V3.3.md`
3. In the template, replace `[PASTE GOVERNANCE HERE]` with the entire governance content
4. Paste the combined text into ChatGPT
5. Send the message

**Step 3: Wait for Confirmation**
- ChatGPT should respond: "AIXORD ACTIVATED"
- If it doesn't, start a new chat and try again

**Step 4: Continue Your Project**
1. Type: `PMERIT CONTINUE`
2. First time: Enter your license email or code
3. When asked about tier, say: `Free`
4. If continuing a project, paste your most recent HANDOFF
5. Start working!

### Ending Each Session

Before closing:
1. Type: `PMERIT HANDOFF`
2. Copy the entire handoff document ChatGPT generates
3. Save it as `HANDOFF_[DATE].md` in your handoffs folder
4. This is your "save game" for next session

### Tips for Free Tier Users

1. **Request HANDOFFs frequently** — Free tier has smaller context limits
2. **Keep sessions focused** — One major task per session
3. **Save everything locally** — Your computer is your project database
4. **Consider upgrading** — If you use AIXORD regularly, Custom GPTs are worth it

---

## Quick Start Summary

### ChatGPT Plus/Pro (Custom GPT)
1. Create AIXORD Custom GPT (one-time, 5 min)
2. Open GPT → `PMERIT CONTINUE` → Work

### ChatGPT Free
1. New Chat → Paste governance → Wait for "AIXORD ACTIVATED"
2. `PMERIT CONTINUE` → Work → `PMERIT HANDOFF` → Save

\newpage

# Chapter 10: Understanding Your Download Files

When you unzip `aixord-chatgpt-pack.zip`, you'll find 12 files. Here's what each one does and when to use it.

## Core Governance Files

| File | Size | Purpose | When to Use |
|------|------|---------|-------------|
| `AIXORD_GOVERNANCE_CHATGPT_V3.3.md` | 79KB | Main governance framework | Paste into ChatGPT to activate AIXORD |
| `AIXORD_GOVERNANCE_CHATGPT_GPT_V3.3.md` | 13KB | Condensed version | Use in Custom GPT Instructions |
| `AIXORD_STATE_CHATGPT_V3.3.json` | 2KB | State tracking template | Copy when starting a new project |
| `AIXORD_PHASE_DETAILS_V3.3.md` | 20KB | Extended phase behaviors | Reference during sessions |
| `PURPOSE_BOUND_OPERATION_SPEC.md` | 20KB | Core v3.3 specification | Reference for governance rules |

## Tier-Specific Setup Guides

| File | For | Purpose |
|------|-----|---------|
| `AIXORD_CHATGPT_PRO.md` | ChatGPT Pro subscribers ($200/mo) | Pro-specific setup instructions |
| `AIXORD_CHATGPT_PLUS.md` | ChatGPT Plus subscribers ($20/mo) | Plus-specific setup instructions |
| `AIXORD_CHATGPT_FREE.md` | ChatGPT Free users | Free tier setup instructions |

**Important:** These guides teach you HOW to use AIXORD. They are instruction manuals for YOU to read. Do NOT paste these guide files into ChatGPT. Paste `AIXORD_GOVERNANCE_CHATGPT_V3.3.md` instead.

## Legal & License Files

| File | Purpose |
|------|---------|
| `DISCLAIMER.md` | Legal disclaimer and terms — READ FIRST |
| `LICENSE.md` | Your usage rights and terms |
| `LICENSE_KEY.txt` | Your license certificate (proof of purchase) |

Keep these files for your records. The LICENSE_KEY.txt confirms your authorized purchase.

## Quick Start

| File | Purpose |
|------|---------|
| `README.md` | Package overview and quick start instructions |

---

## Quick Decision Tree

Not sure which file to use? Follow this:

```
Which file do I paste into ChatGPT?
│
├─► ALWAYS paste: AIXORD_GOVERNANCE_CHATGPT_V3.3.md
│
└─► NEVER paste: AIXORD_CHATGPT_PRO.md, AIXORD_CHATGPT_PLUS.md, or AIXORD_CHATGPT_FREE.md
                 (These are guides for YOU to read, not for ChatGPT)
```

---

## File Types Explained

All files in your download are plain text files that can be opened with any text editor:

| Extension | What It Means | How to Open |
|-----------|---------------|-------------|
| `.md` | Markdown file (formatted text) | Notepad, VS Code, any text editor |
| `.json` | JSON file (structured data) | Notepad, VS Code, any text editor |
| `.txt` | Plain text file | Notepad, any text editor |

**Tip:** While Notepad works, a code editor like VS Code or Notepad++ will display these files with better formatting and syntax highlighting.

---

## Setting Up Your Project Folder

Before starting any AIXORD project, you need a place to store your files. AIXORD offers two approaches:

### Choose Your Approach

When you first activate AIXORD (after license validation), ChatGPT will ask:

| Option | Name | Best For |
|--------|------|----------|
| **A** | Absolute AIXORD Structure | New users, complex projects, maximum guidance |
| **B** | User-Controlled Structure | Experienced users, existing workflows |

---

### Option A: Absolute AIXORD Structure (Recommended)

If you choose this option, you'll create this exact folder structure:

```
[YOUR_PROJECT_NAME]/
├── 1_GOVERNANCE/
│   └── AIXORD_GOVERNANCE_CHATGPT_V3.3.md
├── 2_STATE/
│   └── AIXORD_STATE.json
├── 3_PROJECT/
│   └── PROJECT_DOCUMENT.md
├── 4_HANDOFFS/
│   └── (session handoffs saved here)
├── 5_OUTPUTS/
│   └── (your deliverables)
└── 6_RESEARCH/
    └── (reference materials)
```

**Why numbered folders?** They sort in logical order in your file browser.

**Verification Required:** After creating this structure, you'll upload a screenshot. ChatGPT will verify each folder exists before proceeding. This ensures you're set up for success.

---

### Option B: User-Controlled Structure

If you prefer your own organization system:

- You manage all file locations
- ChatGPT reminds you to save HANDOFFs but doesn't verify
- You're responsible for maintaining organization
- Recovery from lost sessions may be harder

---

## Common Mistake to Avoid

During setup, some users accidentally paste the quick-start guide instead of the governance file. Here's how to tell them apart:

| If you see this at the top... | It's the... | Action |
|-------------------------------|-------------|--------|
| `# AIXORD GOVERNANCE` | Governance file | Paste this into ChatGPT |
| `# AIXORD for ChatGPT Pro` | Quick-start guide | Don't paste — read it instead |
| `# AIXORD for ChatGPT Plus` | Quick-start guide | Don't paste — read it instead |
| `# AIXORD for ChatGPT Free` | Quick-start guide | Don't paste — read it instead |

The governance file is approximately 79KB. The quick-start guides are smaller (4-5KB).

\newpage

# Chapter 11: Your First AIXORD Session

Let's walk through a complete AIXORD session, from setup to execution.

## Step 1: Set Up (Choose Your Path)

**ChatGPT Plus/Pro Users:**
1. Create your AIXORD Custom GPT (see Chapter 9, Part A)
2. Open the GPT from the sidebar

**ChatGPT Free Users:**
1. Open chat.openai.com → New Chat
2. Paste the activation template + governance (see Chapter 9, Part B)
3. Wait for "AIXORD ACTIVATED"

## Step 2: Start the Session

Type:

```
PMERIT CONTINUE
```

ChatGPT will ask for your license email (first time only), detect your tier, and ask what you want to work on.

## Step 3: Discovery (If You Need It)

If you don't have a clear project idea, say:

"I don't know what to build, help me discover."

ChatGPT will ask discovery questions to surface your project from frustrations, wishes, and repetitive tasks.

## Step 4: Brainstorm

Once you have a project direction, ChatGPT enters BRAINSTORM mode:

- What problem are we solving?
- Who will use this?
- What's your budget and timeline?
- What tools do you prefer?

Answer each question. ChatGPT documents your answers.

## Step 5: Options

After brainstorming, ChatGPT presents 2-3 solution approaches:

- Option A: Quick & Simple
- Option B: Balanced
- Option C: Robust & Scalable

Each option includes pros, cons, cost, complexity, and timeline. Choose the one that fits your goals.

## Step 6: Document

ChatGPT generates your PROJECT DOCUMENT with:

- All decisions made
- Master Scope description
- Status Ledger (phases and steps)

Review and approve the document.

## Step 7: Execute

With the document approved, ChatGPT guides implementation:

- Tier A (Custom GPT): ChatGPT provides guidance with persistent context
- Tier B (Plus/Pro): ChatGPT provides step-by-step instructions
- Tier C (Free): ChatGPT guides you through manual execution

## Step 8: End Session

Before closing:

```
PMERIT HANDOFF
```

ChatGPT generates a handoff document. Save it for your next session.

\newpage

# Chapter 12: Common Use Cases

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

# Chapter 13: AIXORD vs Traditional AI Chat

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

# Chapter 14: Commands Reference

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
| `PMERIT RECOVER` | Start recovery mode (lost session) |
| `PMERIT CHECKPOINT` | Request a checkpoint HANDOFF now |

## Mode Commands

| Command | Effect |
|---------|--------|
| `ENTER DECISION MODE` | Switch to planning/analysis |
| `ENTER EXECUTION MODE` | Switch to implementation |

## Status Symbols

| Symbol | Meaning |
|--------|---------|
| PLANNED | Ready to start |
| ACTIVE | In progress |
| IMPLEMENTED | Done, needs verification |
| VERIFIED | Confirmed working, locked |

\newpage

# Chapter 15: Troubleshooting FAQ

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

## ChatGPT-Specific FAQs

**Q: What are Custom GPTs and do I need them?**
A: Custom GPTs are personalized versions of ChatGPT available to Plus ($20/month) and Pro ($200/month) subscribers. They let you set persistent instructions so you don't have to paste the governance file every session. If you have Plus or Pro, use Custom GPTs — it's a much better experience.

**Q: Why do I have to paste the governance every time on Free?**
A: ChatGPT Free doesn't support Custom GPTs. The only way to give ChatGPT rules is by including them in your message. The paste method ensures AIXORD governance is active each session.

**Q: Can I switch between ChatGPT Free and Plus/Pro?**
A: Yes! If you upgrade to Plus or Pro, create an AIXORD Custom GPT and you're set. Your existing HANDOFF files will still work — just paste them when ChatGPT asks for context.

**Q: ChatGPT said "I don't understand PMERIT" — what happened?**
A: This means the governance wasn't properly loaded. For Free users: start a new chat and paste the full activation template + governance. For Plus/Pro users: make sure you're in your AIXORD Custom GPT, not regular chat.

**Q: Can I have multiple AIXORD projects?**
A: Yes!
- **Plus/Pro:** Create one Custom GPT per project (e.g., "AIXORD - Website", "AIXORD - App")
- **Free:** Use separate HANDOFF files for each project

**Q: How do I add files to my Custom GPT?**
A: In ChatGPT Plus/Pro:
1. Open your AIXORD Custom GPT settings
2. Go to the Knowledge section
3. Click "Add files"
4. Upload your documents (PDF, DOCX, MD, TXT)
5. Save the GPT

**Q: What's the difference between Custom GPT Instructions and Knowledge?**
A:
- **Instructions** = Rules the AI follows (your governance file)
- **Knowledge** = Reference materials the AI can search (your project docs)

Put AIXORD governance in Instructions. Put project documents in Knowledge.

**Q: What is the Proactive HANDOFF System?**
A: In v3.3, ChatGPT automatically monitors context usage and generates HANDOFFs before the session runs out of space. You don't need to remember to request a HANDOFF — ChatGPT tracks this for you. At ~80% context usage, ChatGPT will proactively generate a HANDOFF for you to save.

**Q: My session ended without a HANDOFF. What do I do?**
A: Use the recovery command in a new session:
1. Start a new chat and paste governance
2. Type: `PMERIT RECOVER`
3. Provide whatever you can: old chat messages, memory of what you did, your PROJECT_DOCUMENT.md, or any old HANDOFF
4. ChatGPT will reconstruct context and confirm before continuing

**Q: What's the difference between PMERIT HANDOFF and PMERIT CHECKPOINT?**
A:
- `PMERIT HANDOFF` — Full session handoff for ending a session
- `PMERIT CHECKPOINT` — Lighter mid-session save for long projects

Use CHECKPOINT when you want to save progress but aren't ending the session yet.

**Q: How do I know when context is running low?**
A: ChatGPT will tell you:
- At ~60%: "Context check" notification
- At ~80%: Proactive HANDOFF generation
- At ~95%: Emergency HANDOFF warning

When you see a HANDOFF, save it immediately and start a new session.

\newpage

# Appendix A: Quick Reference Card

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
│  PMERIT RECOVER     → Recover from lost session             │
│  PMERIT CHECKPOINT  → Save mid-session checkpoint           │
├─────────────────────────────────────────────────────────────┤
│  PHASES                                                     │
│  ─────────────────────────────────────────────────────────  │
│  DISCOVERY → BRAINSTORM → OPTIONS → DOCUMENT → EXECUTE      │
├─────────────────────────────────────────────────────────────┤
│  STATUS SYMBOLS                                             │
│  ─────────────────────────────────────────────────────────  │
│  PLANNED    ACTIVE    IMPLEMENTED    VERIFIED               │
├─────────────────────────────────────────────────────────────┤
│  ROLES                                                      │
│  ─────────────────────────────────────────────────────────  │
│  Director (You)      → Decides what exists                  │
│  Architect (ChatGPT) → Plans and specifies                  │
│  Commander (You)     → Implements                           │
└─────────────────────────────────────────────────────────────┘
```

\newpage

# Appendix B: Download Your Templates

As a book owner, you have access to the AIXORD templates.

## Your Access Code

**Code:** AX-GPT-3W7J

Enter this code at checkout for your reader discount.

## Download Link

**Product:** AIXORD ChatGPT Pack
**Regular Price:** $7.99
**Your Price:** FREE (with code)
**URL:** https://meritwise0.gumroad.com/l/aixord-chatgpt

## How to Download

1. Visit the URL above (or type it into your browser)
2. Click "I want this!"
3. Enter the discount code: AX-GPT-3W7J
4. Complete checkout ($0.00)
5. Download your ZIP file
6. Extract and start using!

## What's Included

Your download includes ready-to-use templates:

| File | Purpose |
|------|---------|
| **AIXORD_GOVERNANCE_CHATGPT_V3.3.md** | Main governance file (full version) |
| **AIXORD_GOVERNANCE_CHATGPT_GPT_V3.3.md** | Condensed governance for Custom GPT Instructions |
| **AIXORD_PHASE_DETAILS_V3.3.md** | Detailed phase behaviors |
| **AIXORD_STATE_CHATGPT_V3.3.json** | State tracking template |
| **PURPOSE_BOUND_OPERATION_SPEC.md** | Core v3.3 Purpose-Bound specification |
| **AIXORD_CHATGPT_PRO.md** | Setup guide for ChatGPT Pro |
| **AIXORD_CHATGPT_PLUS.md** | Setup guide for ChatGPT Plus |
| **AIXORD_CHATGPT_FREE.md** | Setup guide for ChatGPT Free |
| **README.md** | Quick start instructions |
| **LICENSE.md** | License terms |
| **LICENSE_KEY.txt** | Your license certificate |
| **DISCLAIMER.md** | Terms of use |

## Getting Started

**ChatGPT Plus/Pro Users:**
1. Unzip the file to your project folder
2. Open chat.openai.com → Explore GPTs → Create
3. Name it "AIXORD"
4. Paste AIXORD_GOVERNANCE_CHATGPT_GPT_V3.3.md into Instructions
5. Upload AIXORD_PHASE_DETAILS_V3.3.md to Knowledge
6. Save the GPT
7. Open your GPT and type: `PMERIT CONTINUE`

**ChatGPT Free Users:**
1. Unzip the file to your project folder
2. Open chat.openai.com → New Chat
3. Paste the activation template + governance file
4. Wait for "AIXORD ACTIVATED"
5. Type: `PMERIT CONTINUE`

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

*© 2026 PMERIT LLC. All Rights Reserved.*

*Version 3.3 — January 2026 (ChatGPT Edition)*

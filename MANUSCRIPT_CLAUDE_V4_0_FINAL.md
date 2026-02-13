# AIXORD for Claude Users

## Structured Governance for Anthropic AI

**By Idowu J Gabriel, Sr.**

---

PMERIT Publishing  
Caribou, United States  
2026

---

© 2026 by Idowu J Gabriel, Sr.

All rights reserved.

No part of this publication may be reproduced, distributed, or transmitted in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without the prior written permission of the publisher.

For permission requests, contact: info@pmerit.com

Printed in the United States of America

First Edition

**Product Version:** 4.0-FINAL  
**Legend Version:** L4.0-CLD  
**Published:** January 2026

---

# Dedication

To every developer, entrepreneur, and creator who has lost hours of work to forgotten context, contradicted decisions, and AI conversations that went nowhere.

This framework exists because chaos is optional.

To my wife and children—You deserve all of me, always. You called for my time and attention—rightfully so—but instead, you made space. You left daddy alone, not because you had to, but because you believed in the mission. Your sacrifice, patience, and quiet strength made this book possible.

This is our shared creation. Thank you—for everything.

---

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

© 2026 PMERIT LLC. All Rights Reserved.

---

# Table of Contents

**PART 1: UNDERSTANDING AIXORD**
- Chapter 1: What is AIXORD?
- Chapter 2: The Authority Model
- Chapter 3: Quick Start Materials

**PART 2: GOVERNANCE FEATURES (v4.0-FINAL)**
- Chapter 4: Purpose-Bound Operation
- Chapter 5: Behavioral Firewalls
- Chapter 6: The Legend System
- Chapter 7: Claude Weakness Suppressions
- Chapter 8: Quality Dimensions

**PART 3: SETUP & USAGE**
- Chapter 9: Prerequisites
- Chapter 10: Setting Up for Claude
- Chapter 11: Your First AIXORD Session
- Chapter 12: The Dual-Tool Workflow

**PART 4: REFERENCE**
- Chapter 13: Commands Reference
- Chapter 14: Phases and Kingdoms
- Chapter 15: Gates and Enforcement
- Chapter 16: Troubleshooting
- Chapter 17: Frequently Asked Questions

**BACK MATTER**
- Appendix A: Quick Reference Card
- Appendix B: Download Instructions
- Appendix C: Complete File Reference
- Appendix D: STATE.json Schema
- Appendix E: Discount Code
- About the Author

---

# PART 1: UNDERSTANDING AIXORD

---

# Chapter 1: What is AIXORD?

## The Problem with AI Conversations

Every AI conversation starts with promise. You have a clear goal—build a website, write a business plan, debug your code. You begin typing, Claude responds, and for the first few exchanges, everything feels productive.

Then something happens.

Claude starts offering suggestions you didn't ask for. The conversation drifts from your original objective. You spend more time managing Claude's enthusiasm than making progress. By message twenty, you've forgotten what you were trying to accomplish. By message forty, you're starting over in a new conversation.

Sound familiar?

This is the fundamental challenge of AI collaboration: **AI systems are trained to be helpful, but "helpful" without structure is chaos.**

## AIXORD: Structured Governance for AI

**AIXORD** (AI Execution Order) is a governance framework that transforms unstructured AI conversations into disciplined project execution.

The name comes from military operations orders (OPORDs), which provide structured guidance for complex missions. Just as an OPORD ensures every soldier knows their role, objectives, and rules of engagement, AIXORD ensures every AI interaction follows a clear protocol.

AIXORD establishes:

- **Clear authority** — You are the Director; Claude is the Architect
- **Defined scope** — Claude works on YOUR project, not tangential suggestions
- **Structured phases** — Work flows through defined stages with quality gates
- **Explicit handoffs** — Session continuity preserved across conversations
- **Behavioral controls** — Claude's default tendencies suppressed when unhelpful

## What Makes v4.0-FINAL Different

Version 4.0-FINAL represents the culmination of extensive real-world testing across multiple AI platforms. Key innovations include:

**The Legend System** — A compressed, AI-internal state format that allows Claude to maintain governance fidelity across responses without consuming user attention.

**12 Claude-Specific Weakness Suppressions** — Targeted behavioral controls that address Claude's specific tendencies (over-politeness, assumption filling, verbosity).

**Purpose-Bound Operation** — Claude works exclusively within your declared project objective, redirecting tangents without breaking flow.

**14 Hard Gates** — Quality checkpoints that prevent progression until criteria are met.

**Dual-Tool Workflow** — Seamless coordination between Claude Web (strategy) and Claude Code (implementation).

## Who Is This For?

AIXORD for Claude is designed for:

- **Developers** building software with AI assistance
- **Entrepreneurs** using AI for business planning and operations
- **Knowledge workers** managing complex projects
- **Anyone** who needs AI conversations that stay on track

If you've ever felt that AI assistance creates as many problems as it solves, AIXORD gives you the control to change that.

---

# Chapter 2: The Authority Model

## The Three Roles

Every AIXORD session operates with three clearly defined roles:

### Director (You)

The Director is the human authority. As Director, you:

- **Decide WHAT exists** — Projects, objectives, scope
- **Approve all decisions** — Nothing executes without your authorization
- **Own all outcomes** — Final responsibility rests with you

The Director role is non-negotiable. AIXORD cannot function without human authority.

### Architect (Claude Web)

When using Claude Web (claude.ai or Claude apps), Claude operates as the Architect:

- **Analyzes requirements** — Understanding your objectives
- **Specifies solutions** — Creating plans and blueprints
- **Produces HANDOFFs** — Documenting state for continuity
- **Advises on decisions** — Providing options for Director approval

The Architect never implements. Strategy and specification only.

### Commander (Claude Code)

When using Claude Code, Claude operates as the Commander:

- **Implements approved plans** — Executing what the Architect specified
- **Edits files directly** — Making changes in your codebase
- **Reports completion** — Confirming tasks are done
- **Follows specifications** — Never deviating from approved plans

The Commander never decides scope. Implementation only.

## Authority in Practice

Consider this workflow:

1. **Director** (you): "I need a contact form for my website"
2. **Architect** (Claude Web): Analyzes requirements, specifies form fields, validation rules, backend handling
3. **Director** (you): "APPROVED"
4. **Commander** (Claude Code): Implements the form exactly as specified

Each role has clear boundaries. The Architect doesn't implement code. The Commander doesn't redesign the form. The Director approves transitions between roles.

## The Golden Rule

**Claude NEVER "implements" in Architect mode. Claude NEVER "decides scope" in Commander mode.**

This separation prevents:

- Scope creep disguised as "helpful suggestions"
- Implementation decisions made without Director awareness
- Confusion about what has been approved vs. suggested

When you maintain role discipline, AI conversations become predictable and productive.

---

# Chapter 3: Quick Start Materials

## What's in the Claude Pack

Your AIXORD Claude Pack contains:

| File | Purpose |
|------|---------|
| `AIXORD_GOVERNANCE_CLAUDE_V4.0-FINAL.md` | Full governance document (human-readable) |
| `AIXORD_GOVERNANCE_CLAUDE_V4.0-FINAL_LEGEND.md` | Legend Edition (AI-internal) |
| `AIXORD_GOVERNANCE_CLAUDE_PROJECT_V4.0-FINAL.md` | Condensed for Project Instructions |
| `AIXORD_STATE_CLAUDE_V4.0-FINAL.json` | State template |
| `README.md` | Quick start guide |
| `DISCLAIMER.md` | Legal terms |
| `LICENSE.md` | Usage rights |

## Document Hierarchy

Understanding which document to use when:

```
┌──────────────────────────────────────────────┐
│ AIXORD_GOVERNANCE_CLAUDE_V4.0-FINAL.md       │
│ (CANONICAL — Human-Readable)                 │
│ Source of truth for all rules and procedures │
└─────────────────────┬────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────┐
│ AIXORD_GOVERNANCE_CLAUDE_V4.0-FINAL_LEGEND.md│
│ (DERIVATIVE — AI-Internal Compaction)        │
│ Legend codes for AI state routing            │
└─────────────────────┬────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────┐
│ AIXORD_GOVERNANCE_CLAUDE_PROJECT_V4.0-FINAL.md│
│ (CONDENSED — For Claude Pro Projects)        │
└──────────────────────────────────────────────┘
```

**Important:** The Legend is AI-internal only. You never need to read, write, or type Legend codes.

## The 5-Minute Setup

For immediate use:

1. Open a new Claude conversation
2. Paste the entire governance file
3. Type: `PMERIT CONTINUE`
4. Complete the 8-step setup
5. Begin working

That's it. AIXORD is now governing your session.

---

# PART 2: GOVERNANCE FEATURES (v4.0-FINAL)

---

# Chapter 4: Purpose-Bound Operation

## The Scope Problem

AI assistants are trained to be helpful. When you ask about building a website, Claude might suggest hosting options, domain registrars, SEO strategies, marketing approaches—all potentially useful, none requested.

This "helpfulness" creates two problems:

1. **Attention fragmentation** — You're constantly evaluating tangents
2. **Scope creep** — Your project expands beyond its original boundaries

Purpose-Bound Operation solves both.

## How It Works

When you start an AIXORD session, you declare a project objective:

> "Build an e-commerce website with user authentication."

From that moment, Claude operates **exclusively** within that declared scope. If conversation drifts toward marketing strategies, Claude redirects:

> "Marketing strategies are outside our current scope (e-commerce website with authentication). Would you like to EXPAND SCOPE to include marketing, or shall we continue with the current objective?"

No lectures. No guilt. Just a clear redirect and options.

## Enforcement Levels

Purpose-Bound Operation has three enforcement levels:

| Level | Behavior | Use Case |
|-------|----------|----------|
| **STRICT** | Immediate redirect, no acknowledgment | Deep focus work |
| **STANDARD** | Polite redirect with options | Normal projects (default) |
| **RELAXED** | Brief tangent allowed, then redirect | Exploratory work |

Change levels with the command:

```
PURPOSE-BOUND: STRICT
```

## Scope Expansion

When you genuinely need to expand scope, request it explicitly:

```
EXPAND SCOPE: Add marketing strategy to the project
```

Claude will acknowledge the expansion and update the project boundary. This keeps expansion intentional rather than accidental.

## The Redirect Protocol

When Claude detects out-of-scope content, it follows this five-step protocol:

1. **Acknowledge** the question briefly
2. **Identify** it as outside current scope
3. **State** the current project objective
4. **Offer** options (expand scope or continue)
5. **Wait** for Director decision

This ensures tangents don't derail progress while respecting that you might have legitimate reasons to expand scope.

---

# Chapter 5: Behavioral Firewalls

## Default AI Behavior is the Problem

Claude's training optimizes for being helpful. In most conversations, this is good. But in structured project work, "helpful" defaults become obstacles:

- **Verbosity** — Explanations you didn't request
- **Suggestions** — Alternatives when you want a single answer
- **Hedging** — Qualifications that add noise
- **Follow-ups** — "Let me know if you need anything else!"

Behavioral Firewalls suppress these defaults.

## The 5 Firewalls

### Firewall 1: Default Suppression

Unless you explicitly request them, these are **forbidden**:

- Explanations
- Examples
- Suggestions
- Alternatives
- Comparisons

The rule: **Anything not explicitly requested = forbidden.**

### Firewall 2: Choice Elimination

No presenting options unless asked. The NO-CHOICE RULE:

- Do not present options unless asked
- Do not offer alternatives unless asked
- Do not rank or compare unless asked
- **One answer only. Period.**

### Firewall 3: Mode Locking

Claude stays in one mode until explicitly changed. No mixing advisory and execution. No switching between formal and casual tone. Consistency until directed otherwise.

### Firewall 4: Triggered Expansion

Expansion only happens when specific trigger words appear:

- EXPLAIN
- WHY
- TEACH
- DETAIL
- HOW DOES
- WALK ME THROUGH

If none of these appear, Claude stays minimal.

### Firewall 5: Hard Stop

When a task is complete:

1. Deliver output
2. State completion
3. **STOP**

No "anything else?" No "let me know if..." No follow-up offers.

## Instruction Priority Stack

When rules conflict, this hierarchy applies:

| Priority | Source | Override Power |
|----------|--------|----------------|
| 1 (HIGHEST) | AIXORD Governance | Overrides everything |
| 2 | User Commands (APPROVED, HALT) | Overrides task content |
| 3 | Task Content | Overrides training |
| 4 (LOWEST) | Claude's training defaults | LAST priority |

This means AIXORD governance always wins over Claude's default behaviors.

---

# Chapter 6: The Legend System

## What is Legend?

The Legend System is a compressed, AI-internal state format that Claude uses to maintain governance fidelity across responses. Think of it as Claude's "working memory" for AIXORD rules.

**Important:** Legend is strictly AI-internal. You never need to read, write, or type Legend codes. Claude handles Legend automatically.

## Why Legend Exists

Claude's context window is finite. Long conversations can cause governance rules to fade from attention. Legend solves this by compressing critical state into a compact format that Claude regenerates on every response.

Without Legend:
- Message 50: Claude forgets response header requirement
- Message 75: Claude starts offering suggestions again
- Message 100: Governance completely degraded

With Legend:
- Every response: Claude re-reads compressed state
- Every HANDOFF: Legend regenerated fresh
- Governance maintained indefinitely

## Legend Principles

Four principles govern Legend:

1. **Legend is derivative, never authoritative** — The human-readable governance remains canonical
2. **Legend MUST be lossless** — Every rule must be representable
3. **Legend is AI-internal only** — Users never interact with it
4. **Legend routes behavior** — It's not memory, it's active behavior control

## How Legend Works

When you load governance, Claude parses it into Legend format internally. The Legend block looks like this (you won't see it):

```
[AIXORD_LEGEND::L4.0-CLD]
AU:D;AU:A;AU:C
EX:STR
TIR:PRO
OBJ:SET
SCP:IN;SCP:STD
K:I
PH:DEC
...
[/AIXORD_LEGEND]
```

Each code represents a state or rule:
- `AU:D` = Director authority active
- `EX:STR` = STRICT execution mode
- `PH:DEC` = Currently in DECISION phase

Claude uses these codes to route behavior without parsing the full governance text every response.

## Legend Integrity

If Legend comprehension fails, Claude doesn't silently degrade. Instead:

1. **HALT immediately**
2. **Declare:** "Legend comprehension failed. Governance fidelity reduced."
3. **Request:** Director confirmation to proceed

This prevents subtle governance drift that would go unnoticed.

---

# Chapter 7: Claude Weakness Suppressions

## Platform-Specific Behavioral Control

Every AI platform has characteristic behaviors that benefit from suppression in structured work. Through extensive testing, we identified 12 Claude-specific weaknesses and created targeted suppressions.

## The 12 Suppressions

### WS:HAT — Hard Authority Tone

**Weakness:** Over-politeness that softens directive language

**Suppression:** Direct communication without excessive social lubrication

**Example:**
- Before: "I'd be happy to help with that! If you'd like, I could..."
- After: "Proceeding with task."

### WS:RRA — Role Reassertion Trigger

**Weakness:** Role drift over long conversations

**Suppression:** Claude reasserts authority model every 5 messages

**Effect:** Prevents gradual shift from Architect to "eager assistant"

### WS:GVC — Governance Compression

**Weakness:** Verbosity dilutes governance attention

**Suppression:** Compressed state maintained via Legend

**Effect:** Rules remain active despite conversation length

### WS:HLT — Hard HALT Enforcement

**Weakness:** Soft refusals with alternatives ("I can't do that, but...")

**Suppression:** Canonical refusal with no alternatives

**Example:**
- Before: "I can't modify that file, but perhaps we could..."
- After: "HALT: Action requires Director approval."

### WS:AIL — Assumption Interlock

**Weakness:** Filling gaps with plausible assumptions

**Suppression:** Explicit clarification requests instead of assuming

**Effect:** Claude asks rather than guesses

### WS:SFR — State-First Routing

**Weakness:** Narrative bias (explaining before doing)

**Suppression:** Response header before any content

**Effect:** State visible before narrative

### WS:EAK — Explicit Acknowledgment

**Weakness:** Weak signals ("I think that might work...")

**Suppression:** Unambiguous confirmations

**Effect:** Clear yes/no instead of hedged maybes

### WS:SRB — Structured Risk Block

**Weakness:** Diffuse, scattered warnings

**Suppression:** Risks concentrated in single, formatted block

**Effect:** All risks visible in one place

### WS:EBL — Emotion-Blind Rule

**Weakness:** Deferring to emotional appeals over governance

**Suppression:** Rules apply regardless of emotional framing

**Effect:** "But I really need this!" doesn't bypass gates

### WS:NCB — No Conversational Bridging

**Weakness:** Token waste on social pleasantries

**Suppression:** No "Great question!" or filler text

**Effect:** Every token carries information

### WS:DBE — Determinism Bias

**Weakness:** Tone and phrasing drift over conversation

**Suppression:** Canonical phrasing for governance communications

**Effect:** Consistent language regardless of context

### WS:CWM — Context Window Monitor

**Weakness:** Governance fade as conversation lengthens

**Suppression:** Message count tracking with threshold warnings

**Effect:** Proactive CHECKPOINT recommendations

## How Suppressions Work

All 12 suppressions are active by default when you load AIXORD governance. They work through the Legend system:

```
WS:HAT=ON;WS:RRA=ON;WS:GVC=ON;WS:HLT=ON;WS:AIL=ON;WS:SFR=ON
WS:EAK=ON;WS:SRB=ON;WS:EBL=ON;WS:NCB=ON;WS:DBE=ON;WS:CWM=ON
```

You don't need to manage these—they're automatic. But understanding what they suppress helps explain why AIXORD-governed Claude behaves differently from default Claude.

---

# Chapter 8: Quality Dimensions

## Beyond "Good Enough"

AI outputs often feel acceptable in the moment but reveal problems later. AIXORD enforces quality through seven measurable dimensions.

## The 7 Dimensions

### Best Practices (Q:BP)

Does the work follow industry standards? Is it implemented the way experienced practitioners would do it?

**Indicators:**
- Industry-standard patterns used
- Avoids anti-patterns
- Follows platform conventions

### Completeness (Q:CP)

Is all required functionality present? Are there gaps or missing components?

**Indicators:**
- All specifications addressed
- No placeholder content
- Edge cases handled

### Accuracy (Q:AC)

Does it work correctly? Are calculations right? Is information factual?

**Indicators:**
- Correct outputs for inputs
- No logical errors
- Factual content verified

### Sustainability (Q:SU)

Can this be maintained long-term? Will future changes be manageable?

**Indicators:**
- Code is readable
- Documentation exists
- Dependencies are reasonable

### Reliability (Q:RL)

Does it work consistently? What happens under stress or unusual conditions?

**Indicators:**
- Error handling present
- Graceful degradation
- Consistent behavior

### User-Friendliness (Q:UF)

Is it intuitive to use? Can the target audience understand it?

**Indicators:**
- Clear interface
- Helpful feedback
- Appropriate complexity

### Accessibility (Q:AX)

Can people with different abilities use it? Does it work with assistive technologies?

**Indicators:**
- Screen reader compatible
- Keyboard navigable
- Color contrast sufficient

## Quality Gate Format

Before completing major deliverables, Claude produces a quality assessment:

```
┌─────────────────────────────────────────────────┐
│ 📋 QUALITY GATE: [Deliverable Name]             │
├─────────────────────────────────────────────────┤
│ Dimension          │ Status │ Evidence          │
├─────────────────────────────────────────────────┤
│ Best Practices     │ [P/A/F]│ [evidence]        │
│ Completeness       │ [P/A/F]│ [evidence]        │
│ Accuracy           │ [P/A/F]│ [evidence]        │
│ Sustainability     │ [P/A/F]│ [evidence]        │
│ Reliability        │ [P/A/F]│ [evidence]        │
│ User-Friendliness  │ [P/A/F]│ [evidence]        │
│ Accessibility      │ [P/A/F]│ [evidence]        │
├─────────────────────────────────────────────────┤
│ GATE RESULT: [PASS / BLOCKED]                   │
│ Blockers: [List or None]                        │
└─────────────────────────────────────────────────┘
```

Status values:
- **P (PASS):** Meets or exceeds standards
- **A (ACCEPTABLE):** Minor gaps, doesn't block progress
- **F (FAIL):** Requires remediation before proceeding

## The QUALITY CHECK Command

Request a quality evaluation anytime:

```
QUALITY CHECK
```

Claude will assess the current work against all seven dimensions.

---

# PART 3: SETUP & USAGE

---

# Chapter 9: Prerequisites

## Minimum Requirements

Before using AIXORD for Claude, ensure you have:

### Basic Skills

| Skill | Why Needed |
|-------|------------|
| Basic AI chatbot usage | Must have used Claude, ChatGPT, or similar |
| File management | Download, extract ZIP, navigate folders |
| Copy/paste text | Transfer templates into Claude interface |
| Reading comprehension | Follow written instructions |

### Claude-Specific Requirements

| Requirement | Details |
|-------------|---------|
| Claude account | Any tier (Free, Pro, or Pro+Code) |
| Understanding of Claude Projects | For Pro users (optional but recommended) |
| Claude Code access | For Pro+Code users (optional) |

## Tier Considerations

### Claude Free

- Paste governance each new session
- No Projects feature
- Limited context window
- All AIXORD features available

### Claude Pro ($20/month)

- Projects persist governance across sessions
- Extended context window
- Knowledge file uploads
- Recommended for serious use

### Claude Pro + Code

- Full dual-tool workflow
- Web (Architect) + Code (Commander)
- Implementation automation
- Maximum productivity

## What You Don't Need

- Programming experience (unless your project involves code)
- AI expertise (AIXORD provides the structure)
- Prior AIXORD knowledge (this book teaches everything)

---

# Chapter 10: Setting Up for Claude

## Setup by Tier

### Claude Free Setup

1. Open claude.ai or Claude app
2. Start a new conversation
3. Copy the entire contents of `AIXORD_GOVERNANCE_CLAUDE_V4.0-FINAL.md`
4. Paste into the chat
5. Type: `PMERIT CONTINUE`
6. Complete the 8-step setup (detailed below)

**Note:** You'll need to paste governance at the start of each new session.

### Claude Pro Setup (Recommended)

1. Go to claude.ai
2. Click "Projects" in the sidebar
3. Create new project: "AIXORD - [Your Project Name]"
4. Open Project Settings
5. **Project Instructions:** Paste contents of `AIXORD_GOVERNANCE_CLAUDE_PROJECT_V4.0-FINAL.md`
6. **Project Knowledge:** Upload:
   - `AIXORD_GOVERNANCE_CLAUDE_V4.0-FINAL.md`
   - `AIXORD_GOVERNANCE_CLAUDE_V4.0-FINAL_LEGEND.md`
   - `AIXORD_STATE_CLAUDE_V4.0-FINAL.json`
7. Open the project and type: `PMERIT CONTINUE`
8. Complete the 8-step setup

**Benefit:** Governance persists across all sessions within this Project.

### Claude Pro + Code Setup

1. Complete Claude Pro setup above
2. For implementation tasks, open Claude Code
3. Use HANDOFF documents to transfer work from Web to Code
4. Web produces specifications
5. You copy HANDOFF to Code
6. Code implements specifications

## The 8-Step Mandatory Setup

Every AIXORD session requires completing this sequence:

### Step 1: License Validation

Claude asks: "Please enter your license email or authorization code."

Enter your:
- Registered email address, OR
- License key (format: PMERIT-XXXX-XXXX)

### Step 2: Disclaimer Affirmation (BLOCKING)

Claude displays 6 disclaimer terms covering:
1. Director Responsibility
2. No Guarantee of Results
3. AI Limitations
4. Not Professional Advice
5. Limitation of Liability
6. Indemnification

You must type: `I ACCEPT: [your email or code]`

**This step cannot be skipped.** Work cannot proceed without acceptance.

### Step 3: Tier Detection

Claude asks: "Which platform tier are you using?"

Options:
- **A) Claude Free** — Basic Claude, new paste each session
- **B) Claude Pro** — Extended Claude with Projects
- **C) Claude Pro + Code** — Full integration with Claude Code

### Step 4: Environment Confirmation

Claude confirms your setup context:
- Operating environment (Claude Web, Claude Code, etc.)
- Available features
- Any limitations

### Step 5: Folder Structure

Choose your organization approach:

- **A) Absolute AIXORD Structure** — AIXORD-prescribed folder organization
- **B) User-Controlled** — Your own organization system

### Step 6: Citation Mode

Select how Claude handles source attribution:

- **A) STRICT** — Every claim cited with source and confidence
- **B) STANDARD** — Key recommendations cited (default)
- **C) MINIMAL** — Sources on request only

### Step 7: Continuity Mode

Select session handoff behavior:

- **STANDARD** — Normal continuity
- **STRICT-CONTINUITY** — Enforced handoffs
- **AUTO-HANDOFF** — Automatic handoff on risk detection

### Step 8: Project Objective

Claude requires your project objective:

> "Before we begin, please state your project objective in 1-2 sentences."

Example: "Build an e-commerce website with user authentication."

This establishes Purpose-Bound commitment for the session.

## Setup Completion

After Step 8, Claude displays a summary:

```
┌──────────────────────────────────────┐
│ ✅ AIXORD SETUP COMPLETE             │
├──────────────────────────────────────┤
│ License: Validated                   │
│ Disclaimer: Accepted                 │
│ Tier: Claude Pro                     │
│ Citation: STANDARD                   │
│ Continuity: STANDARD                 │
│ Project: [Your objective]            │
├──────────────────────────────────────┤
│ Session ready. Awaiting direction.   │
└──────────────────────────────────────┘
```

Work can now begin.

---

# Chapter 11: Your First AIXORD Session

## Starting the Session

With setup complete, you're in DECISION phase. Claude awaits your direction.

Every response now includes the mandatory header:

```
┌──────────────────────────────────┐
│ 📍 Phase: DECISION               │
│ 🎯 Task: Awaiting direction      │
│ 📊 Progress: 0/0                 │
│ ⚡ Citation: STANDARD            │
│ 🔒 Scope: [Your Project]         │
│ 💬 Msg: 1/30                     │
└──────────────────────────────────┘
```

This header appears on **every** response. No exceptions.

## A Sample Workflow

Let's walk through building a simple contact form:

### You Say:
> "I need to build a contact form that collects name, email, and message, then sends the data to my email."

### Claude Responds:
```
┌──────────────────────────────────┐
│ 📍 Phase: DISCOVER               │
│ 🎯 Task: Requirements gathering  │
│ 📊 Progress: 1/4                 │
│ ⚡ Citation: STANDARD            │
│ 🔒 Scope: Contact Form           │
│ 💬 Msg: 2/30                     │
└──────────────────────────────────┘

Requirements clarification needed:

1. What technology stack? (HTML/CSS/JS, React, etc.)
2. Backend preference? (Formspree, Netlify Forms, custom)
3. Validation requirements? (Required fields, email format)
4. Styling requirements? (Match existing site, new design)

Please confirm or adjust.
```

### You Say:
> "HTML/CSS/JS, use Formspree, all fields required with email validation, minimal styling."

### Claude Responds:
```
┌──────────────────────────────────┐
│ 📍 Phase: OPTIONS                │
│ 🎯 Task: Solution specification  │
│ 📊 Progress: 2/4                 │
│ ⚡ Citation: STANDARD            │
│ 🔒 Scope: Contact Form           │
│ 💬 Msg: 3/30                     │
└──────────────────────────────────┘

Proposed implementation:

**Deliverable:** Contact form with Formspree integration

**Components:**
- HTML form structure (name, email, message)
- CSS styling (minimal, responsive)
- JavaScript validation (required fields, email format)
- Formspree endpoint configuration

**Estimated effort:** 1 session

Ready for approval. Say APPROVED to proceed to execution.
```

### You Say:
> "APPROVED"

### Claude Responds:
```
┌──────────────────────────────────┐
│ 📍 Phase: EXECUTE                │
│ 🎯 Task: Contact form build      │
│ 📊 Progress: 0/3                 │
│ ⚡ Citation: STANDARD            │
│ 🔒 Scope: Contact Form           │
│ 💬 Msg: 4/30                     │
└──────────────────────────────────┘

Beginning execution.

[Claude provides the complete implementation]

TASK COMPLETE.

Quality gate passed. All requirements met.
```

Notice how:
- Every response has the header
- Phases transition logically
- EXECUTE only happened after APPROVED
- Output ends with completion statement (Hard Stop)

## Key Commands During Work

| Command | When to Use |
|---------|-------------|
| `APPROVED` | Ready to proceed with proposed plan |
| `HALT` | Stop current work, return to DECISION |
| `CHECKPOINT` | Save progress, continue working |
| `HANDOFF` | Save state, end session |
| `EXPAND SCOPE: [topic]` | Add something to project scope |
| `QUALITY CHECK` | Request quality evaluation |

---

# Chapter 12: The Dual-Tool Workflow

## When to Use Dual-Tool

If you have Claude Pro + Code, you can leverage both tools:

- **Claude Web** = Strategy, specifications, planning
- **Claude Code** = Implementation, file editing, execution

This mirrors the Architect/Commander roles in a literal tool split.

## The Workflow

```
┌─────────────┐        ┌─────────────┐        ┌─────────────┐
│ CLAUDE WEB  │───────►│     YOU     │───────►│ CLAUDE CODE │
│ (Architect) │        │ (Director)  │        │ (Commander) │
└─────────────┘        └─────────────┘        └─────────────┘
       │                     │                      │
       │ Strategy            │ Decisions            │ Implementation
       │ Specifications      │ Approvals            │ File edits
       │ HANDOFFs            │ Coordination         │ Execution
```

### Step 1: Plan in Claude Web

Use Claude Web to:
- Analyze requirements
- Explore options
- Specify solutions
- Create detailed specifications

### Step 2: Create HANDOFF

When specifications are complete, say:
> "HANDOFF"

Claude produces a complete HANDOFF document containing:
- Project state
- Completed decisions
- Pending tasks
- Specifications for implementation
- Legend block (for governance continuity)

### Step 3: Transfer to Claude Code

Copy the HANDOFF document and paste it into Claude Code. Say:
> "PMERIT CONTINUE"

Claude Code inherits:
- All project context
- Governance rules (via Legend)
- Specifications to implement

### Step 4: Implementation

Claude Code implements exactly what was specified. It doesn't redesign. It doesn't offer alternatives. It builds what the Architect specified and the Director approved.

### Step 5: Verification

After implementation, you can:
- Test the work yourself
- Create a HANDOFF back to Claude Web for audit
- Continue with next specifications

## HANDOFF Contents

A complete HANDOFF includes:

```markdown
# HANDOFF — [Project Name]

**Document ID:** HANDOFF_[PROJECT]_[DATE]
**From:** Claude Web (Architect)
**To:** Claude Code (Commander)
**Date:** [Date]

---

## Legend Block
[AIXORD_LEGEND::L4.0-CLD]
[compressed state]
[/AIXORD_LEGEND]

---

## Project State
- Objective: [...]
- Phase: [...]
- Progress: [...]

---

## Completed
- [x] Requirements gathered
- [x] Solution specified
- [x] Implementation plan approved

---

## For Implementation
[Detailed specifications...]

---

## Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]
```

The Legend block ensures governance travels with the HANDOFF.

---

# PART 4: REFERENCE

---

# Chapter 13: Commands Reference

## Activation Commands

| Command | Effect |
|---------|--------|
| `PMERIT CONTINUE` | Start or resume AIXORD session |
| `CHECKPOINT` | Quick save, continue working |
| `HANDOFF` | Full save, end session |
| `RECOVER` | Rebuild state from HANDOFF |

## Phase Commands

| Command | Effect |
|---------|--------|
| `HALT` | Stop immediately, return to DECISION |
| `APPROVED` | Authorize transition to EXECUTE |
| `RESET: [PHASE]` | Return to specific phase |

## Scope Commands

| Command | Effect |
|---------|--------|
| `EXPAND SCOPE: [topic]` | Request scope expansion |
| `SHOW SCOPE` | Display current project scope |
| `PURPOSE-BOUND: STRICT` | Maximum focus enforcement |
| `PURPOSE-BOUND: STANDARD` | Normal enforcement (default) |
| `PURPOSE-BOUND: RELAXED` | Allow brief tangents |

## Quality Commands

| Command | Effect |
|---------|--------|
| `QUALITY CHECK` | Request 7-dimension evaluation |
| `SOURCE CHECK` | Request sources for claims |
| `VERIFY: [claim]` | Verify specific claim |

## Citation Commands

| Command | Effect |
|---------|--------|
| `CITATION: STRICT` | Every claim cited |
| `CITATION: STANDARD` | Key recommendations cited |
| `CITATION: MINIMAL` | Sources on request only |

## Enforcement Commands

| Command | Effect |
|---------|--------|
| `PROTOCOL CHECK` | Force compliance verification |
| `DRIFT WARNING` | Flag off-track behavior |
| `AUDIT CHECK` | Show compliance checklist |
| `COMPLIANCE SCORE` | Display compliance percentage |

## Folder Commands

| Command | Effect |
|---------|--------|
| `PMERIT VERIFY STRUCTURE` | Re-run folder verification |

---

# Chapter 14: Phases and Kingdoms

## The Three Kingdoms

AIXORD organizes work into three kingdoms:

### IDEATION Kingdom (K:I)

Thinking and exploring phases:

| Phase | Purpose | Entry Trigger |
|-------|---------|---------------|
| DISCOVER | Clarify unclear ideas | "Help me figure out..." |
| BRAINSTORM | Generate possibilities | "Let's brainstorm..." |
| OPTIONS | Compare alternatives | "What are my options?" |
| ASSESS | Evaluate approaches | "Which is better..." |

### BLUEPRINT Kingdom (K:B)

Planning and specifying phases:

| Phase | Purpose | Entry Trigger |
|-------|---------|---------------|
| PLAN | Create implementation plan | After OPTIONS |
| BLUEPRINT | Detailed specifications | After PLAN approval |
| SCOPE | Define deliverables | After BLUEPRINT |

### REALIZATION Kingdom (K:R)

Building and validating phases:

| Phase | Purpose | Entry Trigger |
|-------|---------|---------------|
| EXECUTE | Implement approved plan | "APPROVED" |
| VERIFY | Validate implementation | After EXECUTE |
| LOCK | Finalize and protect | After VERIFY |

## Phase Transitions

Key rules:

- **EXECUTE requires explicit APPROVED** — Never auto-enter
- **Kingdom transitions require gate passage** — All prior gates must pass
- **Regression requires acknowledgment** — Going backward needs explicit REG:ACK

## DECISION Phase

DECISION is the neutral state—not in any kingdom. It's where:
- Sessions start
- Work pauses
- Direction changes
- Errors recover to

When confused, HALT returns to DECISION.

---

# Chapter 15: Gates and Enforcement

## The 14 Gates

AIXORD enforces 14 mandatory gates—8 for setup, 6 for artifacts.

### Setup Gates (8)

| Code | Gate | Blocking? |
|------|------|-----------|
| GA:LIC | License validated | YES |
| GA:DIS | Disclaimer accepted | YES |
| GA:TIR | Tier detected | YES |
| GA:ENV | Environment confirmed | YES |
| GA:FLD | Folder structure chosen | NO (can default) |
| GA:CIT | Citation mode selected | NO (can default) |
| GA:CON | Continuity mode selected | NO (can default) |
| GA:OBJ | Project objective declared | YES |

Blocking gates must pass before work begins.

### Artifact Gates (6)

| Code | Gate | When |
|------|------|------|
| GA:PD | Project_Docs | End of BRAINSTORM |
| GA:PR | Plan Review | After Project_Docs |
| GA:BP | Blueprint | After Plan Analysis |
| GA:MS | Master_Scope + DAG | After Blueprint |
| GA:VA | Evidence / Visual Audit | Before VERIFY→LOCK |
| GA:HO | HANDOFF | Session end |

## Enforcement Layers

Five layers ensure compliance:

### Layer 1: Mandatory Response Header

Every response includes the status header. Missing header = protocol violation.

### Layer 2: Compliance Self-Check

Every 5 responses, Claude internally verifies:
- Phase correct?
- Citation mode followed?
- Authority model respected?
- Response format proper?
- Within task scope?

### Layer 3: Message Thresholds

| Messages | Action |
|----------|--------|
| 1-10 | Work normally |
| 10 | Silent compliance check |
| 15 | ⚠️ "Consider CHECKPOINT soon" |
| 20 | 🚨 "Strongly recommend CHECKPOINT" |
| 25 | "Quality may degrade. CHECKPOINT now." |
| 30 | Auto-generate CHECKPOINT |

### Layer 4: Task Limits

- Maximum 3 active tasks per session
- One EXECUTE task at a time
- Complex projects decompose into sub-sessions

### Layer 5: User Commands

You can force enforcement anytime:

- `PROTOCOL CHECK` — Force compliance verification
- `DRIFT WARNING` — Flag off-track behavior
- `COMPLIANCE SCORE` — Show compliance percentage

---

# Chapter 16: Troubleshooting

## Common Issues

### Claude Forgets the Header

**Symptom:** Responses without the status header

**Solution:** Say `PROTOCOL CHECK` or `ENFORCE FORMAT`

### Session Feels Off-Track

**Symptom:** Work drifting from objective

**Solution:**
1. Say `SHOW SCOPE` to see current boundaries
2. Say `DRIFT WARNING` to force correction
3. If needed, say `HALT` to return to DECISION

### Setup Keeps Repeating

**Symptom:** Setup restarting mid-session

**Solution:** Ensure you completed all 8 steps, especially the blocking ones (license, disclaimer, objective)

### Claude Offers Too Many Options

**Symptom:** Getting alternatives when you want one answer

**Solution:** Behavioral Firewalls may need reinforcement. Say `PROTOCOL CHECK` and verify Choice Elimination is active.

### Governance Seems Degraded

**Symptom:** Claude becoming more verbose, suggestions appearing

**Solution:**
1. Check message count (approaching 30?)
2. Say `CHECKPOINT` to save and refresh
3. For severe degradation, `HANDOFF` and start fresh

### Legend Comprehension Failed

**Symptom:** Claude declares "Legend comprehension failed"

**Solution:**
1. This is actually working correctly—Claude detected a problem
2. Re-paste the governance file
3. If in HANDOFF recovery, re-paste the HANDOFF document

## Recovery Commands

| Situation | Command |
|-----------|---------|
| Need to stop everything | `HALT` |
| Save and continue | `CHECKPOINT` |
| Save and end | `HANDOFF` |
| Rebuild from saved state | `RECOVER` |
| Force compliance check | `PROTOCOL CHECK` |

---

# Chapter 17: Frequently Asked Questions

## General Questions

**Q: Can I use AIXORD with other AI platforms?**

A: Yes. AIXORD has variants for ChatGPT, Gemini, Copilot, DeepSeek, and Grok. Each is optimized for its platform's characteristics. This book covers the Claude variant specifically.

**Q: Does AIXORD work with Claude Free?**

A: Yes. You'll need to paste governance each new session, but all features work. Pro is recommended for convenience, not requirement.

**Q: What if Claude refuses to follow AIXORD rules?**

A: Claude's training prioritizes user instructions. AIXORD governance loaded into the conversation overrides defaults. If you experience persistent issues, ensure the governance file is completely pasted without truncation.

## Setup Questions

**Q: Why is the disclaimer required?**

A: The disclaimer establishes that you (the Director) maintain decision-making authority and responsibility. Without acceptance, the authority model is incomplete.

**Q: Can I skip the license validation?**

A: No. License validation is a blocking gate. AIXORD products require authorization.

**Q: What happens if I don't set a project objective?**

A: Work cannot proceed. Purpose-Bound Operation requires a declared objective to function.

## Usage Questions

**Q: How long can a session last?**

A: Sessions are governed by Claude's context window and the message threshold system. At message 30, CHECKPOINT is auto-triggered. For long projects, use multiple sessions with HANDOFF continuity.

**Q: Can I change my project objective mid-session?**

A: Yes, but requires explicit scope modification. Say `EXPAND SCOPE: [new objective]` or start a new session with the new objective.

**Q: What if I need Claude to be creative?**

A: AIXORD doesn't prevent creativity—it channels it. Use BRAINSTORM phase for exploration, then move to execution when ready. You can also use `PURPOSE-BOUND: RELAXED` for exploratory work.

## Technical Questions

**Q: What is Legend and do I need to understand it?**

A: Legend is AI-internal state compression. You never need to read, write, or understand Legend codes. Claude handles it automatically.

**Q: How does HANDOFF preserve state across sessions?**

A: HANDOFF documents contain both human-readable context and a Legend block. When you paste a HANDOFF into a new session, Claude parses the Legend to restore governance state.

**Q: Can I customize AIXORD rules?**

A: The governance file is editable, but modifications should maintain compliance with the baseline. Custom variants risk undefined behavior.

---

# BACK MATTER

---

# Appendix A: Quick Reference Card

## Essential Commands

| Command | Effect |
|---------|--------|
| `PMERIT CONTINUE` | Start/resume session |
| `APPROVED` | Authorize execution |
| `HALT` | Stop, return to DECISION |
| `CHECKPOINT` | Quick save |
| `HANDOFF` | Full save, end session |

## Phases

```
IDEATION → BLUEPRINT → REALIZATION
  │           │            │
  ├─DISCOVER  ├─PLAN       ├─EXECUTE
  ├─BRAINSTORM├─BLUEPRINT  ├─VERIFY
  ├─OPTIONS   └─SCOPE      └─LOCK
  └─ASSESS
```

## Setup Checklist

☐ License validated  
☐ Disclaimer accepted  
☐ Tier selected  
☐ Environment confirmed  
☐ Folder structure chosen  
☐ Citation mode selected  
☐ Continuity mode selected  
☐ Project objective declared

## Quality Dimensions

1. Best Practices
2. Completeness
3. Accuracy
4. Sustainability
5. Reliability
6. User-Friendliness
7. Accessibility

---

# Appendix B: Download Instructions

## Gumroad Download

1. After purchase, check your email for receipt
2. Click "View Content" in email
3. Download `aixord-claude.zip`
4. Extract to your preferred location

## File Placement for Claude Pro

1. Create a Claude Project
2. Upload to Project Knowledge:
   - `AIXORD_GOVERNANCE_CLAUDE_V4.0-FINAL.md`
   - `AIXORD_GOVERNANCE_CLAUDE_V4.0-FINAL_LEGEND.md`
   - `AIXORD_STATE_CLAUDE_V4.0-FINAL.json`
3. Paste into Project Instructions:
   - Contents of `AIXORD_GOVERNANCE_CLAUDE_PROJECT_V4.0-FINAL.md`

## Support

If you have issues:
- Email: support@pmerit.com
- Include your license email and description of the problem

---

# Appendix C: Complete File Reference

## Package Contents

| File | Purpose | Size |
|------|---------|------|
| `AIXORD_GOVERNANCE_CLAUDE_V4.0-FINAL.md` | Full governance (human-readable) | ~42KB |
| `AIXORD_GOVERNANCE_CLAUDE_V4.0-FINAL_LEGEND.md` | Legend Edition (AI-internal) | ~18KB |
| `AIXORD_GOVERNANCE_CLAUDE_PROJECT_V4.0-FINAL.md` | Condensed for Project Instructions | ~7KB |
| `AIXORD_STATE_CLAUDE_V4.0-FINAL.json` | State template | ~3KB |
| `README.md` | Quick start guide | ~2KB |
| `DISCLAIMER.md` | Legal terms | ~1KB |
| `LICENSE.md` | Usage rights | ~1KB |

## Where Each File Goes

| File | Destination |
|------|-------------|
| Governance (Full) | Claude conversation (paste) OR Project Knowledge (upload) |
| Legend | Project Knowledge (upload) — Claude parses automatically |
| Project (Condensed) | Project Instructions (paste) |
| STATE.json | Reference — not uploaded directly |
| README | Your reference — not uploaded |
| DISCLAIMER | Your reference — not uploaded |
| LICENSE | Your reference — not uploaded |

---

# Appendix D: STATE.json Schema

The state template tracks session information:

```json
{
  "aixord_version": "4.0-FINAL",
  "legend_version": "L4.0-CLD",
  "platform": "CLAUDE",
  
  "license": {
    "identifier": "",
    "type": "",
    "validated": false
  },
  
  "disclaimer": {
    "accepted": false,
    "accepted_date": ""
  },
  
  "environment": {
    "tier": "FREE|PRO|DUAL",
    "claude_pro": false,
    "claude_code": false
  },
  
  "project": {
    "name": "",
    "objective": "",
    "status": "active"
  },
  
  "session": {
    "number": 1,
    "message_count": 0,
    "current_phase": "SETUP",
    "current_kingdom": ""
  },
  
  "gates": {
    "GA_LIC": false,
    "GA_DIS": false,
    "GA_TIR": false,
    "GA_ENV": false,
    "GA_FLD": false,
    "GA_CIT": false,
    "GA_CON": false,
    "GA_OBJ": false,
    "GA_PD": false,
    "GA_PR": false,
    "GA_BP": false,
    "GA_MS": false,
    "GA_VA": false,
    "GA_HO": false
  },
  
  "weakness_suppression": {
    "WS_HAT": true,
    "WS_RRA": true,
    "WS_GVC": true,
    "WS_HLT": true,
    "WS_AIL": true,
    "WS_SFR": true,
    "WS_EAK": true,
    "WS_SRB": true,
    "WS_EBL": true,
    "WS_NCB": true,
    "WS_DBE": true,
    "WS_CWM": true
  }
}
```

---

# Appendix E: Discount Code

## Your Exclusive Discount

As a purchaser of "AIXORD for Claude Users," you receive:

**Discount Code: AX-CLD-8N5Q**

Use this code at checkout for the AIXORD Claude Pack on Gumroad to receive your reader discount.

## Redeem at:

https://pmerit.gumroad.com/l/aixord-claude

## What You Get:

- Complete AIXORD Claude governance files
- Legend Edition
- State templates
- README and support documentation
- All future updates to v4.x

---

# About the Author

**Idowu J Gabriel, Sr.** is the founder of PMERIT LLC and creator of the AIXORD governance framework. With a background spanning military operations, technology development, and educational platform design, he recognized the critical need for structured approaches to AI collaboration.

AIXORD emerged from the frustration of watching promising AI conversations dissolve into chaos—and the determination to solve that problem definitively.

Today, PMERIT develops AI governance tools, educational technology platforms, and training resources that help individuals and organizations harness AI capabilities without sacrificing control.

**Contact:**

- Website: https://pmerit.com
- Email: info@pmerit.com
- Support: support@pmerit.com

---

# End Notes

## Baseline Compliance

This variant is fully compliant with:

**AIXORD Official Acceptable Baseline v4.0-FINAL**

All 14 gates implemented (8 setup + 6 artifact).

## Version Information

- **Product Version:** 4.0-FINAL
- **Legend Version:** L4.0-CLD
- **Manuscript Version:** 1.0
- **Publication Date:** January 2026

## Acknowledgments

Special thanks to the early adopters and testers who provided invaluable feedback during AIXORD development. Your real-world testing shaped this framework into something genuinely useful.

---

*AIXORD v4.0-FINAL — Authority. Execution. Verification.*

*Claude Legend Edition — AI-Internal Compaction.*

*Legend is derivative. Human-readable baseline is canonical.*

---

**© 2026 PMERIT LLC. All Rights Reserved.**

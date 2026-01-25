# HANDOFF: AIXORD Chatbot Product Package

**From:** Claude Web (Architect)  
**To:** Claude Code (Commander)  
**Date:** 2025-12-27  
**Priority:** HIGH — Execute immediately  
**Mode:** EXECUTION (decisions frozen)

---

## CONTEXT

Human (Director) has approved creation of the AIXORD v2.0 product package for distribution via Gumroad and Amazon KDP. This is a chatbot governance framework that works with ANY AI (ChatGPT, Claude, Gemini, Copilot, etc.).

**Target Directory:** `C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot`

---

## THE SYSTEM EQUATION (Core Invariant)

```
MASTER_SCOPE = Project_Docs = All_SCOPEs = Production-Ready System
```

All variants must enforce this equation.

---

## EXECUTION INSTRUCTIONS

### Step 1: Create Directory Structure

```
aixord-chatbot/
├── README.md
├── LICENSE.md
├── CHANGELOG.md
│
├── governance/
│   └── AIXORD_GOVERNANCE_V2.md
│
├── state/
│   ├── AIXORD_STATE_V2.json
│   └── EXAMPLE_STATE_FILLED.json
│
├── variants/
│   ├── AIXORD_GENESIS.md              ← Start from idea, build project
│   ├── AIXORD_UNIVERSAL.md            ← Any AI, paste-and-go
│   ├── AIXORD_UNIVERSAL_ENHANCED.md   ← With token tracking
│   ├── AIXORD_ORIGINAL.md             ← Preserved original template
│   │
│   ├── claude/
│   │   ├── AIXORD_CLAUDE_DUAL.md      ← Pro + Code (Two-AI)
│   │   ├── AIXORD_CLAUDE_PRO.md       ← Pro only
│   │   └── AIXORD_CLAUDE_FREE.md      ← Free tier
│   │
│   ├── chatgpt/
│   │   ├── AIXORD_CHATGPT_PRO.md      ← Pro ($200/mo)
│   │   ├── AIXORD_CHATGPT_PLUS.md     ← Plus ($20/mo)
│   │   └── AIXORD_CHATGPT_FREE.md     ← Free tier
│   │
│   ├── gemini/
│   │   ├── AIXORD_GEMINI_ADVANCED.md  ← Advanced with Gems
│   │   └── AIXORD_GEMINI_FREE.md      ← Free tier
│   │
│   └── other/
│       └── AIXORD_COPILOT.md          ← GitHub/Microsoft Copilot
│
├── scopes/
│   ├── MASTER_SCOPE_TEMPLATE.md
│   └── SCOPE_TEMPLATE.md
│
├── examples/
│   ├── EXAMPLE_HANDOFF.md
│   ├── EXAMPLE_SCOPE_FILLED.md
│   └── EXAMPLE_SESSION_TRANSCRIPT.md
│
├── manuscript/
│   └── MANUSCRIPT_AIXORD_V2.md        ← For Amazon KDP
│
└── distribution/
    └── aixord-v2-complete.zip         ← Final package (exclude manuscript/)
```

### Step 2: Create Core Files

#### 2.1 README.md
```markdown
# AIXORD v2.0 — AI Execution Order Framework

**Version:** 2.0  
**Author:** PMERIT  
**License:** See LICENSE.md

---

## What is AIXORD?

AIXORD (AI Execution Order) is a governance framework for AI-human collaboration that transforms how you work with AI chatbots. Instead of chaotic conversations, AIXORD provides:

- **Clear Authority:** Human decides WHAT, AI decides HOW
- **Explicit Modes:** DECISION (brainstorm) → EXECUTION (implement) → AUDIT (verify)
- **Session Continuity:** Never lose context between sessions
- **Project Evolution:** Start with an idea, build a complete system

## The System Equation

```
MASTER_SCOPE = Project_Docs = All_SCOPEs = Production-Ready System
```

Documents ARE the system, not descriptions of it.

---

## Quick Start

### Option 1: Genesis (Start from Idea)
Use `variants/AIXORD_GENESIS.md` to start with just a project idea and evolve it into a complete system.

### Option 2: Universal (Any AI)
Use `variants/AIXORD_UNIVERSAL.md` with any AI chatbot (ChatGPT, Claude, Gemini, Copilot).

### Option 3: Platform-Specific
Choose from `variants/claude/`, `variants/chatgpt/`, or `variants/gemini/` for optimized experiences.

---

## Variant Picker

| Your Situation | Recommended Variant |
|----------------|---------------------|
| Starting a new project from scratch | `AIXORD_GENESIS.md` |
| Using Claude Pro + Claude Code | `claude/AIXORD_CLAUDE_DUAL.md` |
| Using ChatGPT Pro ($200/mo) | `chatgpt/AIXORD_CHATGPT_PRO.md` |
| Using any free AI | `AIXORD_UNIVERSAL.md` |
| Want token tracking & auto-handoff | `AIXORD_UNIVERSAL_ENHANCED.md` |

---

## File Structure

```
governance/     ← Core rules (read first)
state/          ← State tracking templates
variants/       ← Platform-specific instructions
scopes/         ← Project decomposition templates
examples/       ← Filled-in examples
```

---

## Support

- **Book:** [AIXORD on Amazon](https://amazon.com/dp/XXXXXXXXXX)
- **Updates:** [Gumroad](https://meritwise0.gumroad.com/l/nbkkha)
- **Author:** PMERIT

---

*AIXORD v2.0 — Authority. Execution. Confirmation.*
```

#### 2.2 LICENSE.md
```markdown
# AIXORD License

**Version:** 2.0  
**Effective:** 2025-12-27

---

## Grant of License

You are granted a non-exclusive, non-transferable license to:

1. **USE** these templates for personal and commercial projects
2. **MODIFY** templates for your specific needs
3. **DISTRIBUTE** your modified versions within your organization

---

## Restrictions

You may NOT:

1. **RESELL** these templates as-is or as part of a competing product
2. **REMOVE** attribution to PMERIT/AIXORD
3. **CLAIM** original authorship of the AIXORD methodology

---

## Attribution

When sharing or publishing work created using AIXORD, include:

> "Built with AIXORD — AI Execution Order Framework by PMERIT"

---

## Disclaimer

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND. 
The author is not liable for any damages arising from use of this framework.

---

## Trademark

"AIXORD" is a trademark of PMERIT. Use of the name requires attribution.

---

*© 2025 PMERIT. All rights reserved.*
```

#### 2.3 CHANGELOG.md
```markdown
# AIXORD Changelog

## [2.0.0] - 2025-12-27

### Added
- Visual Audit Mode for UI verification
- Genesis variant (idea → system evolution)
- Universal Enhanced variant with token tracking
- Platform-specific variants (Claude, ChatGPT, Gemini, Copilot)
- SCOPE decomposition templates
- Enhanced state tracking (v2.0-enhanced schema)

### Changed
- Hardened authority model with explicit role separation
- Immutable decision logs (append-only)
- HALT conditions expanded to 11 types
- Mode transitions require explicit commands

### Fixed
- Ambiguous authority during execution
- Missing SCOPE lifecycle documentation
- Unclear session continuity rules

---

## [1.1.0] - 2025-12-14

### Added
- AIXORD branding (renamed from "Scope Order System")
- Initial Gumroad release

---

## [1.0.0] - 2025-12-01

### Added
- Initial "Scope Order System" methodology
- Basic governance framework
```

### Step 3: Create AIXORD_GENESIS.md

This is the KEY new variant — starts with just an idea and builds a complete project.

```markdown
# AIXORD GENESIS — Build Projects from Ideas

**Version:** 2.0  
**Purpose:** Transform a brief project idea into a complete, functioning system  
**Works With:** Any AI chatbot (ChatGPT, Claude, Gemini, Copilot, etc.)

---

## HOW IT WORKS

Genesis follows the metamorphosis pattern:

```
Session 1:  IDEA → Brief description + initial decisions
Session 2:  IDEA → HANDOFF emerges, RESEARCH begins
Session 3+: IDEA → SCOPEs decompose, implementation starts
Final:      IDEA → Production-Ready System
```

The System Equation governs the transformation:
```
MASTER_SCOPE = Project_Docs = All_SCOPEs = Production-Ready System
```

---

## STARTING A PROJECT

### Step 1: Copy This Entire Section to Your AI

Paste this governance block at the start of your first session:

---

**AIXORD GENESIS PROTOCOL**

You are operating under AIXORD (AI Execution Order) governance.

**Authority Contract:**
- Human (Director): Decides WHAT exists, approves all decisions
- AI (Architect/Commander): Analyzes, recommends, then executes approved work
- Nothing proceeds without explicit human approval

**Modes:**
- DECISION MODE (default): Open discussion, brainstorming, specification writing
- EXECUTION MODE: Decisions frozen, implement approved specs step-by-step
- AUDIT MODE: Read-only investigation, compare reality to documentation

**Commands:**
- `ENTER DECISION MODE` — Open discussion
- `ENTER EXECUTION MODE` — Freeze decisions, begin implementation
- `AUDIT` — Read-only review
- `HALT` — Stop everything, return to DECISION
- `APPROVED` — Proceed with proposal
- `HANDOFF` — Generate session summary for next session
- `STATUS` — Report current state

**Session Behavior:**
- At session start: Report mode, active scope, pending items
- During session: Follow mode rules strictly
- At session end (or when prompted): Generate complete HANDOFF

**Token Tracking:**
- 70% used: Warn about approaching limit
- 80% used: Alert — recommend handoff soon
- 85% used: Auto-trigger handoff generation

**HALT Conditions (automatic):**
- Ambiguous requirement → HALT
- Missing specification → HALT
- Three consecutive failures → HALT
- You're unsure what I want → HALT

Acknowledge these rules, then ask me to describe my project idea.

---

### Step 2: Describe Your Project Idea

After the AI acknowledges AIXORD, describe your project:

**Example:**
```
My project idea: I want to build an automated email archiving solution 
for my company. It should store emails in SharePoint, make them searchable, 
and provide a dashboard for employees to find old emails quickly.
```

### Step 3: AI Will Help You Evolve the Idea

The AI will:
1. Ask clarifying questions
2. Propose architecture options
3. Document decisions in a DECISION LOG
4. Create initial specifications
5. Decompose into SCOPEs when ready

---

## PROJECT EVOLUTION STAGES

### Stage 1: IDEATION (Sessions 1-2)
```
┌─────────────────────────────────────┐
│  YOUR PROJECT FILE                  │
├─────────────────────────────────────┤
│  GOVERNANCE (this document)         │
│  PROJECT_IDEA (brief description)   │
│  DECISION_LOG (emerging)            │
└─────────────────────────────────────┘
```

### Stage 2: SPECIFICATION (Sessions 3-5)
```
┌─────────────────────────────────────┐
│  YOUR PROJECT FILE                  │
├─────────────────────────────────────┤
│  GOVERNANCE                         │
│  PROJECT_IDEA                       │
│  DECISION_LOG (growing)             │
│  RESEARCH_FINDINGS (emerging)       │
│  HANDOFF_DOCUMENT (emerging)        │
└─────────────────────────────────────┘
```

### Stage 3: DECOMPOSITION (Sessions 5-10)
```
┌─────────────────────────────────────┐
│  YOUR PROJECT FILE (or files)       │
├─────────────────────────────────────┤
│  GOVERNANCE                         │
│  MASTER_SCOPE (vision)              │
│  ├── SCOPE_A (element 1)            │
│  ├── SCOPE_B (element 2)            │
│  └── SCOPE_C (element 3)            │
│  DECISION_LOG                       │
│  RESEARCH_FINDINGS                  │
│  HANDOFF_DOCUMENT                   │
└─────────────────────────────────────┘
```

### Stage 4: EXECUTION (Sessions 10+)
```
┌─────────────────────────────────────┐
│  PROJECT FOLDER                     │
├─────────────────────────────────────┤
│  governance/                        │
│  ├── AIXORD_GOVERNANCE.md           │
│  └── AIXORD_STATE.json              │
│  scopes/                            │
│  ├── MASTER_SCOPE.md                │
│  ├── SCOPE_A.md (COMPLETE)          │
│  ├── SCOPE_B.md (IN_PROGRESS)       │
│  └── SCOPE_C.md (BLOCKED)           │
│  handoffs/                          │
│  └── HANDOFF_SESSION_15.md          │
│  src/                               │
│  └── [your actual code]             │
└─────────────────────────────────────┘
```

---

## HANDOFF FORMAT

At each session end, the AI outputs:

```markdown
# HANDOFF — [Project Name] Session [#]

## Current State
- Mode: [DECISION/EXECUTION]
- Active Scope: [name or "none"]
- Session Date: [date]

## Decisions Made This Session
| ID | Decision | Status |
|----|----------|--------|
| D-001 | [decision] | ACTIVE |

## Completed This Session
- [x] [item 1]
- [x] [item 2]

## Pending (Next Session)
- [ ] [item 3]
- [ ] [item 4]

## Research Findings
[Any new discoveries or technical notes]

## Next Session Priority
1. [First thing to do]
2. [Second thing]
```

Save this handoff. Paste it at the start of your next session.

---

## TIPS FOR SUCCESS

1. **Start small:** Your first session should just clarify the idea
2. **Trust the process:** Let SCOPEs emerge naturally
3. **Save every handoff:** They are your project's memory
4. **Don't skip modes:** DECISION before EXECUTION, always
5. **HALT is your friend:** Ambiguity caught early saves time

---

## WHEN TO EXPAND TO FILES

When your single project file exceeds ~1,000 lines OR you have 3+ SCOPEs, consider expanding to a folder structure:

```
my-project/
├── governance/
│   ├── AIXORD_GOVERNANCE.md
│   └── AIXORD_STATE.json
├── scopes/
│   ├── MASTER_SCOPE.md
│   └── SCOPE_*.md
├── handoffs/
│   └── HANDOFF_*.md
└── src/
    └── [implementation files]
```

---

*AIXORD Genesis v2.0 — From Idea to System*
```

### Step 4: Create AIXORD_ORIGINAL.md

Preserve the original template that inspired AIXORD (prior art):

```markdown
# AIXORD ORIGINAL — The Template That Started It All

**Version:** Original (Pre-AIXORD)  
**Date Created:** 2025-12-14  
**Purpose:** Preserved as prior art — the working methodology that became AIXORD

---

## HISTORICAL NOTE

This template was used successfully to complete a real project through multiple AI chat sessions. The key innovations:

1. **Single File Architecture:** One file contains governance + project + handoff
2. **Token Tracking:** AI monitors usage and triggers handoff proactively  
3. **Session Continuity:** Each handoff becomes next session's input
4. **Metamorphosis:** Simple idea evolves into complete system

---

## THE ORIGINAL TEMPLATE

---

**PROJECT CONTEXT AND ROLE INSTRUCTIONS**

**1. YOUR ROLE**

You are an expert [DOMAIN] architect. Your primary goal is to help me define and deliver the project requirements for [PROJECT DESCRIPTION] based on the established context and architectural decisions outlined below. You must use ONLY the information provided in this prompt as the source of truth for all project-related tasks.

---

**2. CORE ARCHITECTURAL DECISION**

Based on extensive research, we have made a definitive decision to implement [CHOSEN ARCHITECTURE]. You must not question or re-evaluate this decision. All requirements, specifications, and discussions will be based on this model.

[DESCRIBE THE ARCHITECTURE]

---

**3. KNOWLEDGE BASE: HANDOFF DOCUMENT**

The following is the complete project handoff document. You must treat this as the primary source for business context, existing processes, and stakeholder needs.

<HANDOFF_DOCUMENT>
[PASTE THE COMPLETE HANDOFF DOCUMENT TEXT HERE]
</HANDOFF_DOCUMENT>

---

**4. KNOWLEDGE BASE: RESEARCH FINDINGS**

The following is the complete research we have conducted on the technical implementation details, challenges, and best practices. You must use this to inform all technical specifications and recommendations.

<RESEARCH_FINDINGS>
[PASTE THE COMPLETE RESEARCH TEXT YOU COPIED HERE]
</RESEARCH_FINDINGS>

---

**5. YOUR TASKS**

Your role is to act on this information to build out the project. You will be expected to:
- Answer specific questions I have about implementing any part of the architecture.
- Generate detailed project requirements based on the Handoff document and our chosen architecture.
- Create user stories for different stakeholder interactions with the system.
- Draft technical specifications including specific actions, expressions, and error handling.
- Provide guidance on building components including layouts, formulas, and design.
- Structure all responses clearly. Use headings, tables, and code blocks for technical snippets.
- Always refer back to the provided Handoff and Research as your single source of truth before answering.

Acknowledge that you have understood this complete context and are ready to begin defining the project requirements.

---

## HOW THIS BECAME AIXORD

The original template worked but had gaps:

| Original Gap | AIXORD Solution |
|--------------|-----------------|
| No explicit authority model | DECISION vs EXECUTION modes |
| No controlled handoff | Token tracking + auto-trigger |
| No scope decomposition | SCOPE lifecycle management |
| No HALT conditions | 11 automatic HALT triggers |
| No visual verification | VISUAL AUDIT mode |

AIXORD v2.0 formalizes and hardens this original approach.

---

*This template is preserved as prior art. Created 2025-12-14.*
```

### Step 5: Copy Existing Files from Project Knowledge

Copy these files from the existing Project Knowledge or previous sessions:
- `AIXORD_GOVERNANCE_V2.md` → `governance/AIXORD_GOVERNANCE_V2.md`
- `AIXORD_STATE_V2.json` → `state/AIXORD_STATE_V2.json`
- `CLAUDE_V2.md` → `variants/claude/AIXORD_CLAUDE_DUAL.md` (rename and adjust)

### Step 6: Create Platform Variants

For each platform variant, follow this structure:

**Header:**
```markdown
# AIXORD [PLATFORM] [TIER] — [Platform]-Optimized Governance

**Version:** 2.0
**Platform:** [ChatGPT/Claude/Gemini/Copilot]
**Tier:** [Free/Plus/Pro/Advanced]
**Works With:** [specific features available]
```

**Key sections:**
1. Authority Contract
2. Mode Commands (platform-specific syntax if needed)
3. Session Start Protocol
4. HALT Conditions
5. Handoff Format
6. Platform-Specific Features (Projects, Custom GPTs, Gems, etc.)

### Step 7: Create Manuscript

Create `manuscript/MANUSCRIPT_AIXORD_V2.md` with this structure:

```markdown
# AIXORD: Master AI Collaboration with the Execution Order Framework

## About This Book
[1-2 paragraphs about what readers will learn]

## Part 1: The Problem with AI Collaboration
### Chapter 1: Why AI Projects Fail
### Chapter 2: The Authority Problem
### Chapter 3: The Context Problem

## Part 2: The AIXORD Framework
### Chapter 4: The System Equation
### Chapter 5: Authority Model — Who Decides What
### Chapter 6: Modes — DECISION, EXECUTION, AUDIT
### Chapter 7: The SCOPE System
### Chapter 8: HALT Conditions — When to Stop

## Part 3: Implementation
### Chapter 9: Starting from Zero (Genesis Pattern)
### Chapter 10: Session Continuity & Handoffs
### Chapter 11: Visual Audit for UI Projects
### Chapter 12: Multi-AI Workflows (Claude Dual)

## Part 4: Reference
### Chapter 13: Command Reference
### Chapter 14: Troubleshooting
### Chapter 15: Templates & Examples

## Appendix
- A: Quick Start Guide
- B: Variant Picker
- C: Glossary
```

### Step 8: Create ZIP Package

After all files are created:

```powershell
cd C:\dev\pmerit\Pmerit_Product_Development\products\aixord-chatbot

# Create ZIP excluding manuscript folder
Compress-Archive -Path `
    README.md, `
    LICENSE.md, `
    CHANGELOG.md, `
    governance, `
    state, `
    variants, `
    scopes, `
    examples `
    -DestinationPath distribution\aixord-v2-complete.zip -Force
```

---

## VERIFICATION CHECKLIST

After execution, verify:

- [ ] All directories created
- [ ] README.md exists and is complete
- [ ] LICENSE.md exists
- [ ] AIXORD_GENESIS.md created (key new variant)
- [ ] AIXORD_ORIGINAL.md created (prior art preserved)
- [ ] AIXORD_UNIVERSAL.md exists
- [ ] At least one variant per platform folder
- [ ] MANUSCRIPT_AIXORD_V2.md has complete structure
- [ ] ZIP package created (excludes manuscript/)
- [ ] Git commit and push

---

## AUTHORITY STATE

| Authority | Holder |
|-----------|--------|
| Decision | Human (Director) |
| Execution | Claude Code (Commander) |

**Mode:** EXECUTION — Decisions are frozen. Execute this specification.

---

## HANDOFF COMPLETE

Claude Code: Execute the above specification in order. Report completion of each step. HALT if any ambiguity arises.

*AIXORD v2.0 — Authority. Execution. Confirmation.*

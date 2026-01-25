# AIXORD for Lean Six Sigma Teams

**AI Execution Governance Integrated with DMAIC Methodology**

**Version:** 1.0  
**AIXORD Version:** 3.3  
**Publisher:** PMERIT LLC  
**Date:** January 2026

---

## Executive Summary

### The Problem

Organizations using Lean Six Sigma have proven methodologies for human-driven process improvement. But when teams adopt AI assistants (ChatGPT, Claude, Gemini, Copilot), they lose the discipline that makes Six Sigma work:

- **No tollgate reviews** — AI moves from ideation to execution without approval
- **No dependency tracking** — AI doesn't respect prerequisite relationships
- **No quality dimensions** — AI optimizes for speed, not CTQ characteristics
- **No control phase** — AI completes tasks without verification or documentation

The result: AI becomes a source of rework, inconsistency, and quality escapes.

### The Solution

**AIXORD** (AI Execution Order) brings governance to AI-assisted work. AIXORD v3.3 introduces features that map directly to DMAIC:

| DMAIC Phase | AIXORD v3.3 Feature |
|-------------|---------------------|
| **Define** | DECISION phase, MASTER_SCOPE |
| **Measure** | DISCOVER phase, 7 Quality Dimensions |
| **Analyze** | BRAINSTORM, OPTIONS, ASSESS phases |
| **— Tollgate —** | **🚪 IDEATION GATE** (blocking checkpoint) |
| **Improve** | EXECUTE phase (Realization Kingdom) |
| **Control** | AUDIT, VERIFY, LOCK phases |

### Proof of Impact

| Metric | Traditional Approach | AIXORD + AI |
|--------|----------------------|-------------|
| **PowerApp Delivery** | Months (Lean Six Sigma process) | 1 week |
| **Process Automation** | 2+ technical employees | 1 person (non-technical) |

AIXORD doesn't replace Lean Six Sigma — it extends your methodology to AI-assisted work.

---

## Part 1: AIXORD Fundamentals for Six Sigma Practitioners

### 1.1 The Authority Model

Six Sigma has defined roles (Champion, Black Belt, Green Belt). AIXORD has parallel roles for AI interaction:

| AIXORD Role | Six Sigma Equivalent | Responsibility |
|-------------|----------------------|----------------|
| **Director** (Human) | Project Champion / Belt | Decides WHAT to do, approves all gates |
| **AI Assistant** | Process Support | Recommends HOW, executes approved plans |

**Golden Rule:** The AI is never the decision-maker. You are the Director. You own outcomes.

### 1.2 The Two Kingdoms Framework

AIXORD v3.3 introduces a hard separation between planning and doing — philosophically identical to Six Sigma's tollgate discipline.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        IDEATION KINGDOM                                 │
│                                                                         │
│   Purpose: Define WHAT to build/improve                                 │
│   DMAIC Equivalent: Define → Measure → Analyze                          │
│                                                                         │
│   Phases: DECISION → DISCOVER → BRAINSTORM → OPTIONS → ASSESS           │
│                                                                         │
│   Output: MASTER_SCOPE (locked specification)                           │
│                                                                         │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
                      ┌────────────────────────┐
                      │    🚪 IDEATION GATE    │
                      │                        │
                      │   TOLLGATE REVIEW      │
                      │                        │
                      │  Director must approve │
                      └────────────┬───────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       REALIZATION KINGDOM                               │
│                                                                         │
│   Purpose: Build WHAT was defined                                       │
│   DMAIC Equivalent: Improve → Control                                   │
│                                                                         │
│   Phases: EXECUTE → AUDIT → VERIFY → LOCK                               │
│                                                                         │
│   Input: Locked MASTER_SCOPE (immutable until UNLOCK)                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Why This Matters for Six Sigma Teams

Without AIXORD, AI assistants will:
- Jump from problem statement to solution (skipping Measure/Analyze)
- Propose solutions without evaluating alternatives
- Begin implementation without approval
- Complete tasks without documentation

With AIXORD, AI assistants:
- Cannot execute until Ideation Gate passes
- Must evaluate options before recommending
- Require explicit "APPROVED" to proceed
- Document everything in structured formats

---

## Part 2: DMAIC-to-AIXORD Mapping

### 2.1 Define Phase → DECISION + DISCOVER

**DMAIC Activities:**
- Identify the problem/opportunity
- Define project scope
- Identify stakeholders
- Create project charter

**AIXORD Equivalent:**

```
Director: "PMERIT CONTINUE"
AI: [Activates AIXORD, requests license validation]

Director: "PROJECT OBJECTIVE: Reduce invoice processing time from 5 days to 1 day"

AI: 
┌──────────────────────────────────┐
│ 📍 Phase: DECISION               │
│ 🎯 Task: Define project scope    │
│ 🔒 Scope: INVOICE_OPTIMIZATION   │
└──────────────────────────────────┘

PROJECT OBJECTIVE LOCKED:
"Reduce invoice processing time from 5 days to 1 day"

SIXORD Mapping:
- Problem Statement: ✅ Defined
- Scope: Invoice processing workflow
- Metric: Processing time (days)
- Target: 5 days → 1 day (80% reduction)

Entering DISCOVER phase. What data do you have about the current process?
```

**Key AIXORD Features Used:**
- `PROJECT OBJECTIVE` — Locks the problem statement
- `MASTER_SCOPE` — Equivalent to project charter
- `PURPOSE-BOUND OPERATION` — AI stays focused on stated objective

### 2.2 Measure Phase → DISCOVER + 7 Quality Dimensions

**DMAIC Activities:**
- Measure current performance
- Collect baseline data
- Validate measurement system

**AIXORD Equivalent:**

```
Director: "Here's our current process flow [uploads process map]"

AI:
┌──────────────────────────────────┐
│ 📍 Phase: DISCOVER               │
│ 🎯 Task: Current state analysis  │
│ 🔒 Scope: INVOICE_OPTIMIZATION   │
└──────────────────────────────────┘

CURRENT STATE ANALYSIS:

Process: Invoice Processing
Steps: 12
Handoffs: 7
Wait Time: 80% of total cycle time
Touch Time: 20% of total cycle time

CTQ Mapping to 7 Quality Dimensions:
┌───────────────────┬─────────────────────────────────────┐
│ Dimension         │ Current State Finding               │
├───────────────────┼─────────────────────────────────────┤
│ Best Practices    │ ❌ Manual data entry (no OCR)       │
│ Completeness      │ ⚠️ Missing exception handling       │
│ Accuracy          │ ❌ 15% error rate in data entry     │
│ Sustainability    │ ⚠️ Relies on 2 key employees        │
│ Reliability       │ ❌ No backup process                │
│ User-Friendliness │ ❌ 7 different systems touched      │
│ Accessibility     │ ✅ N/A for back-office process      │
└───────────────────┴─────────────────────────────────────┘

3 Critical dimensions are FAIL status.
```

**Key AIXORD Features Used:**
- `7 QUALITY DIMENSIONS` — Maps to CTQ characteristics
- `DISCOVER` phase — Structured data gathering
- Quantified findings — Not just opinions

### 2.3 Analyze Phase → BRAINSTORM + OPTIONS + ASSESS

**DMAIC Activities:**
- Identify root causes
- Validate root causes with data
- Prioritize improvement opportunities

**AIXORD Equivalent:**

```
Director: "BRAINSTORM root causes"

AI:
┌──────────────────────────────────┐
│ 📍 Phase: BRAINSTORM             │
│ 🎯 Task: Root cause analysis     │
│ 🔒 Scope: INVOICE_OPTIMIZATION   │
└──────────────────────────────────┘

ROOT CAUSE ANALYSIS (5 Whys Applied):

Primary Delay: Manual data entry (3 days of 5-day cycle)
├── Why? No OCR/automation
├── Why? Legacy system has no API
├── Why? Vendor no longer supports integration
├── Why? Contract locked until 2027
└── Root Cause: VENDOR LOCK-IN on invoice system

Secondary Delay: Approval routing (1.5 days)
├── Why? Paper-based approval signatures
├── Why? "We've always done it this way"
└── Root Cause: PROCESS INERTIA

Ready for OPTIONS phase to evaluate solutions?

Director: "OPTIONS"

AI:
┌──────────────────────────────────┐
│ 📍 Phase: OPTIONS                │
│ 🎯 Task: Solution alternatives   │
│ 🔒 Scope: INVOICE_OPTIMIZATION   │
└──────────────────────────────────┘

SOLUTION OPTIONS:

Option A: RPA Bot for Data Entry
├── Cost: $15,000 implementation + $500/month
├── Impact: 3 days → 0.5 days
├── Open-Source Alternative: ❌ None at required scale
├── Risk: Medium (requires maintenance)
└── Tag: [COST-JUSTIFIED]

Option B: AI-Powered OCR + Workflow
├── Cost: $200/month (cloud service)
├── Impact: 3 days → 0.25 days
├── Open-Source Alternative: ⚠️ Tesseract (lower accuracy)
├── Risk: Low (managed service)
└── Tag: [OSS-AVAILABLE]

Option C: Vendor Renegotiation
├── Cost: Unknown
├── Impact: Uncertain
├── Risk: High (2027 contract)
└── Tag: [NOT RECOMMENDED]

COST JUSTIFICATION (Per AIXORD Open-Source Priority Stack):
Option B selected over Tesseract because: 98% accuracy vs 85% accuracy
on handwritten invoices. Cost difference ($200/mo) justified by 
$2,000/month in error correction labor savings.

Director approval required to proceed: "APPROVED: Option B"
```

**Key AIXORD Features Used:**
- `BRAINSTORM` phase — Structured ideation
- `OPTIONS` phase — Side-by-side comparison
- `OPEN-SOURCE PRIORITY STACK` — Cost justification discipline
- `MOSA COMPLIANCE` — Vendor lock-in awareness

### 2.4 Tollgate Review → IDEATION GATE

**DMAIC Activity:**
- Formal review with stakeholders
- Approval to proceed to Improve phase

**AIXORD Equivalent:**

```
Director: "GATE STATUS"

AI:
┌─────────────────────────────────────────────────────────────────────────┐
│ 🚪 IDEATION GATE CHECKLIST                                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ STRUCTURAL COMPLETENESS                                                 │
│ ☑ MASTER_SCOPE defined with clear objective                             │
│ ☑ All Deliverables enumerated (D₁: OCR, D₂: Workflow, D₃: Training)    │
│ ☑ All Steps per Deliverable defined                                     │
│ ☑ DAG dependencies mapped                                               │
│ ☑ Acceptance criteria per Deliverable                                   │
│                                                                         │
│ 7 QUALITY DIMENSIONS                                                    │
│ ☑ Best Practices verified (using industry OCR standards)                │
│ ☑ Completeness assessed (all invoice types covered)                     │
│ ☑ Accuracy validated (98% target documented)                            │
│ ☑ Sustainability evaluated (vendor SLA in place)                        │
│ ☑ Reliability considered (fallback to manual documented)                │
│ ☑ User-Friendliness reviewed (3 systems → 1 system)                     │
│ ☐ Accessibility: N/A (back-office)                                      │
│                                                                         │
│ MOSA COMPLIANCE                                                         │
│ ☑ Modularity verified (OCR service independent of workflow)             │
│ ☑ Open standards used (REST API, JSON format)                           │
│ ☑ Vendor lock-in avoided (can switch OCR providers)                     │
│                                                                         │
│ COST OPTIMIZATION                                                       │
│ ☑ Open-source solutions evaluated                                       │
│ ☑ Paid solution justified (see OPTIONS phase)                           │
│                                                                         │
│ AUTHORIZATION                                                           │
│ ☐ Director typed: FINALIZE PLAN                                         │
│                                                                         │
│ Gate Status: [ ] BLOCKED  [X] READY                                     │
└─────────────────────────────────────────────────────────────────────────┘

All items complete. Type "FINALIZE PLAN" to lock specifications 
and enter Realization Kingdom.

Director: "FINALIZE PLAN"

AI:
┌─────────────────────────────────────────────────────────────────────────┐
│ ✅ IDEATION GATE PASSED                                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ MASTER_SCOPE is now LOCKED                                              │
│                                                                         │
│ Entering REALIZATION KINGDOM                                            │
│                                                                         │
│ Execution Order (from DAG):                                             │
│ 1. SCOPE_OCR (no dependencies)                                          │
│ 2. SCOPE_WORKFLOW (depends on OCR)                                      │
│ 3. SCOPE_TRAINING (depends on WORKFLOW)                                 │
│                                                                         │
│ First eligible SCOPE: SCOPE_OCR                                         │
│                                                                         │
│ Command: UNLOCK: SCOPE_OCR to begin                                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Key AIXORD Features Used:**
- `IDEATION GATE` — Blocking checkpoint (like tollgate)
- `FINALIZE PLAN` — Explicit approval required
- `DAG DEPENDENCIES` — Shows execution order
- Specifications LOCKED — No scope creep

### 2.5 Improve Phase → EXECUTE (Realization Kingdom)

**DMAIC Activities:**
- Implement solutions
- Pilot changes
- Validate results

**AIXORD Equivalent:**

```
Director: "UNLOCK: SCOPE_OCR"

AI:
┌──────────────────────────────────┐
│ 📍 Phase: EXECUTE                │
│ 🎯 Task: Implement OCR service   │
│ 🔒 Scope: SCOPE_OCR              │
│ 🏰 Kingdom: REALIZATION          │
└──────────────────────────────────┘

SCOPE_OCR EXECUTION PLAN:

Step 1: Configure OCR service account
Step 2: Build invoice template mappings
Step 3: Create API integration
Step 4: Test with sample invoices (n=100)
Step 5: Validate 98% accuracy target

Proceeding with Step 1...

[AI executes each step, reports results]

SCOPE_OCR COMPLETE:
- Accuracy achieved: 97.8% (within tolerance of 98% target)
- Processing time: 4 seconds per invoice
- Ready for AUDIT

Command: "AUDIT" to verify results
```

**Key AIXORD Features Used:**
- `EXECUTE` phase — Implementation only (no redesign)
- `SCOPE` focus — One deliverable at a time
- Step-by-step execution — Matches pilot methodology
- Quantified results — Data-driven validation

### 2.6 Control Phase → AUDIT + VERIFY + LOCK

**DMAIC Activities:**
- Implement control plan
- Document standard work
- Monitor ongoing performance

**AIXORD Equivalent:**

```
Director: "AUDIT"

AI:
┌──────────────────────────────────┐
│ 📍 Phase: AUDIT                  │
│ 🎯 Task: Verify SCOPE_OCR        │
│ 🔒 Scope: SCOPE_OCR              │
└──────────────────────────────────┘

AUDIT RESULTS:

Acceptance Criteria Check:
☑ 98% accuracy target: PASS (97.8% achieved, within tolerance)
☑ Processing time <10 seconds: PASS (4 seconds)
☑ All invoice types supported: PASS (12/12 templates)
☑ Error handling documented: PASS
☑ Rollback procedure documented: PASS

Control Documentation Generated:
- Standard Operating Procedure: SOP_INVOICE_OCR_v1.0.md
- Monitoring Dashboard: [link]
- Alert Thresholds: <95% accuracy triggers review

SCOPE_OCR Status: VERIFIED

Command: "LOCK: SCOPE_OCR" to finalize

Director: "LOCK: SCOPE_OCR"

AI:
┌──────────────────────────────────┐
│ 🔒 SCOPE_OCR: LOCKED             │
│                                  │
│ Status: VERIFIED + LOCKED        │
│ Cannot be modified without       │
│ REASSESS command                 │
│                                  │
│ Next eligible SCOPE: SCOPE_WORKFLOW │
└──────────────────────────────────┘
```

**Key AIXORD Features Used:**
- `AUDIT` phase — Formal verification
- `VERIFY` + `LOCK` — Control plan equivalent
- Documentation generated — Standard work captured
- Immutable until `REASSESS` — Prevents drift

---

## Part 3: DAG Dependencies for Complex Projects

### 3.1 Value Stream Mapping → DAG Visualization

Six Sigma practitioners use Value Stream Maps. AIXORD uses DAGs (Directed Acyclic Graphs) for the same purpose:

```
         ┌──────────────┐
         │ SCOPE_OCR    │ ← Root node (no dependencies)
         │ (D₁)         │
         └──────┬───────┘
                │
                ▼
         ┌──────────────┐
         │SCOPE_WORKFLOW│ ← Depends on OCR
         │ (D₂)         │
         └──────┬───────┘
                │
                ▼
         ┌──────────────┐
         │SCOPE_TRAINING│ ← Depends on WORKFLOW
         │ (D₃)         │
         └──────────────┘
```

### 3.2 DAG Rules = Prerequisite Discipline

| DAG Rule | Six Sigma Equivalent |
|----------|----------------------|
| Cannot execute until dependencies VERIFIED | Cannot pilot until design complete |
| Topological execution order | Critical path sequencing |
| Cycle prevention | No circular dependencies |
| Parallel eligibility | Independent improvements can run simultaneously |

### 3.3 DAG Commands

| Command | Effect |
|---------|--------|
| `SHOW DAG` | Display dependency graph |
| `DAG STATUS` | Show which SCOPEs are eligible |
| `CHECK DEPENDENCIES: [scope]` | Verify prerequisites |

---

## Part 4: When Plans Need to Change (PDCA Integration)

Six Sigma uses PDCA (Plan-Do-Check-Act) for iterative improvement. AIXORD v3.3 includes a **Scope Reassessment Protocol** for the same purpose:

### 4.1 Three Levels of Reassessment

| Level | Command | When to Use | PDCA Equivalent |
|-------|---------|-------------|-----------------|
| **Surgical Fix** | `REASSESS: [SCOPE]` | One component failed | Act (adjust one element) |
| **Major Pivot** | `GATE REOPEN: [reason]` | Entire plan needs rethinking | Return to Plan |
| **Fresh Start** | `RESET: DECISION` | Project concept must change | New PDCA cycle |

### 4.2 Example: Scope Reassessment

```
Director: "The OCR service doesn't handle handwritten invoices. We need to rethink."

Director: "REASSESS: SCOPE_OCR"

AI:
SCOPE_OCR unlocked for reassessment.

What blocked progress on SCOPE_OCR?
□ Technical limitation?
□ Dependency issue?
□ Requirements unclear?

Once you explain, we'll explore alternatives in OPTIONS phase.

Director: "Technical limitation - vendor OCR doesn't support handwritten text"

AI:
┌──────────────────────────────────┐
│ 📍 Phase: OPTIONS                │
│ 🎯 Task: Reassess SCOPE_OCR      │
│ ⚠️ Status: REASSESSMENT MODE     │
└──────────────────────────────────┘

REVISED OPTIONS:

Option B-1: Different OCR vendor (handwriting support)
├── Cost: $400/month
├── Accuracy on handwritten: 92%
└── Tag: [COST-JUSTIFIED]

Option B-2: Hybrid approach (OCR + manual review for handwritten)
├── Cost: $200/month + 2 hours/week labor
├── Accuracy: 100% (human verified)
└── Tag: [OSS-AVAILABLE]

Option B-3: Eliminate handwritten invoices (policy change)
├── Cost: $0
├── Impact: Requires vendor compliance
└── Tag: [PROCESS CHANGE]

Director approval required for revised approach.
```

### 4.3 Anti-Abuse Safeguards

To prevent reassessment from becoming scope creep:

1. **Reason required** — Cannot reassess without stating why
2. **Logged permanently** — All reassessments in Decision Ledger
3. **Escalating friction** — 3rd reassessment of same SCOPE triggers review
4. **Director reminder** — "If the plan is fundamentally wrong, reassess. If you're avoiding difficulty, push through."

---

## Part 5: The AIXORD Trail — Audit-Ready Documentation

### 5.1 Why Trail Matters for Six Sigma

Six Sigma requires documentation at every phase. AIXORD produces this automatically:

| Six Sigma Requirement | AIXORD Artifact | Generated When |
|-----------------------|-----------------|----------------|
| Project Charter | MASTER_SCOPE | DECISION phase |
| Baseline Data | DISCOVER outputs | MEASURE equivalent |
| Root Cause Analysis | BRAINSTORM outputs + Reasoning Traces | ANALYZE equivalent |
| Solution Selection | OPTIONS comparison + Decision Ledger | ANALYZE equivalent |
| Tollgate Approval | Ideation Gate passage + Director approval | Gate review |
| Implementation Record | EXECUTE outputs per SCOPE | IMPROVE equivalent |
| Control Plan | AUDIT results + LOCK status | CONTROL equivalent |
| Lessons Learned | HANDOFF carryforward | Project closeout |

### 5.2 Trail Artifacts Explained

| Artifact | Content | Persistence |
|----------|---------|-------------|
| **Decision Ledger** | Every APPROVED decision with timestamp | Permanent |
| **HANDOFF Documents** | Session state, incomplete tasks, next steps | Per session |
| **STATE.json** | Current project snapshot | Live |
| **SCOPE Files** | Requirements, specs, research findings | Per deliverable |
| **Reasoning Traces** | Why AI recommended what it did | Per response |
| **Assumption Disclosures** | What AI assumed, confidence levels | Per response |

### 5.3 Compliance Value

**For Auditors:**
- Complete decision trail with timestamps
- Clear separation: AI recommended, human approved
- Reproducible process documentation

**For Regulators:**
- Proof of human oversight (APPROVED required for all decisions)
- Quality dimension evaluations documented
- Gate passage criteria met

**For Legal Protection:**
- "How did you build this?" — here's the complete trail
- Due diligence documentation
- Accountability chain: Director → AI Assistant

### 5.4 Sample Trail Output

After a Six Sigma project, your AIXORD trail includes:

```
PROJECT: Invoice Processing Optimization
├── MASTER_SCOPE.md           ← Project charter equivalent
├── DECISION_LEDGER.md        ← All approvals with timestamps
├── SCOPE_OCR/
│   ├── REQUIREMENTS.md       ← What was specified
│   ├── RESEARCH_FINDINGS.md  ← What was learned
│   ├── AUDIT_RESULTS.md      ← Verification evidence
│   └── STATUS: LOCKED        ← Control confirmation
├── SCOPE_WORKFLOW/
│   └── [same structure]
├── HANDOFF_SESSION_1.md      ← Session 1 state
├── HANDOFF_SESSION_2.md      ← Session 2 state
└── STATE.json                ← Final project state
```

**This trail proves:** What was decided, why it was decided, who approved it, and what was verified.

---

## Part 6: Implementation Guide

### 5.1 Prerequisites

| Requirement | Details |
|-------------|---------|
| AI Platform | ChatGPT Plus/Pro, Claude Pro, Gemini Advanced, or Copilot |
| Six Sigma Knowledge | Green Belt or higher recommended |
| AIXORD Package | Platform-specific governance files |

### 5.2 Setup Steps

1. **Download** AIXORD package for your AI platform
2. **Configure** AI with governance file (Custom GPT, Claude Project, or Gem)
3. **Activate** with "PMERIT CONTINUE" command
4. **Validate** license and accept disclaimer
5. **Set** project objective (your Six Sigma problem statement)

### 5.3 Daily Workflow

| Six Sigma Activity | AIXORD Command |
|--------------------|----------------|
| Start project | `PROJECT OBJECTIVE: [problem statement]` |
| Gather data | Work in `DISCOVER` phase |
| Analyze root causes | Use `BRAINSTORM` phase |
| Evaluate solutions | Use `OPTIONS` phase |
| Approve plan | `FINALIZE PLAN` (passes Ideation Gate) |
| Implement | Work in `EXECUTE` phase |
| Verify results | Use `AUDIT` phase |
| Lock improvements | `LOCK: [SCOPE]` |
| Document handoff | `HANDOFF` |

### 5.4 Integration with Existing Tools

AIXORD complements, not replaces, your existing tools:

| Your Tool | Use For | AIXORD Handles |
|-----------|---------|----------------|
| Minitab | Statistical analysis | Interpreting results, next steps |
| Value Stream Maps | Process visualization | DAG dependencies |
| Control Charts | Monitoring | Audit criteria definition |
| A3 Reports | Communication | MASTER_SCOPE + HANDOFF documents |

---

## Part 7: Command Reference for Six Sigma Teams

### Planning Commands (Ideation Kingdom)

| Command | Effect |
|---------|--------|
| `PROJECT OBJECTIVE: [text]` | Lock problem statement |
| `DISCOVER` | Enter data gathering phase |
| `BRAINSTORM` | Enter root cause analysis |
| `OPTIONS` | Enter solution evaluation |
| `ASSESS` | Enter quality assessment |
| `GATE STATUS` | Show Ideation Gate checklist |
| `QUALITY CHECK: [deliverable]` | Run 7 Dimensions |
| `FINALIZE PLAN` | Attempt to pass gate |

### Execution Commands (Realization Kingdom)

| Command | Effect |
|---------|--------|
| `UNLOCK: [SCOPE]` | Begin work on scope |
| `EXECUTE` | Implementation mode |
| `AUDIT` | Verification mode |
| `LOCK: [SCOPE]` | Finalize scope |
| `SHOW DAG` | Display dependencies |

### Control Commands

| Command | Effect |
|---------|--------|
| `REASSESS: [SCOPE]` | Unlock one scope for replanning |
| `GATE REOPEN: [reason]` | Return to Ideation Kingdom |
| `CHECKPOINT` | Save state without ending |
| `HANDOFF` | Full documentation, end session |

---

## Appendix A: DMAIC ↔ AIXORD Quick Reference

```
┌─────────────────────────────────────────────────────────────────────────┐
│ DMAIC → AIXORD MAPPING                                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌─────────┐   ┌─────────┐   ┌─────────┐                                │
│ │ DEFINE  │ → │DECISION │ + │DISCOVER │  PROJECT OBJECTIVE set         │
│ └─────────┘   └─────────┘   └─────────┘                                │
│                                                                         │
│ ┌─────────┐   ┌─────────┐   ┌─────────────────┐                        │
│ │ MEASURE │ → │DISCOVER │ + │7 QUALITY DIMS   │  Baseline data         │
│ └─────────┘   └─────────┘   └─────────────────┘                        │
│                                                                         │
│ ┌─────────┐   ┌───────────┐   ┌─────────┐   ┌────────┐                 │
│ │ ANALYZE │ → │BRAINSTORM │ + │ OPTIONS │ + │ ASSESS │  Root cause     │
│ └─────────┘   └───────────┘   └─────────┘   └────────┘                 │
│                                                                         │
│              ┌─────────────────────────────────┐                        │
│              │    🚪 IDEATION GATE             │  ← TOLLGATE REVIEW    │
│              │       FINALIZE PLAN             │                        │
│              └─────────────────────────────────┘                        │
│                                                                         │
│ ┌─────────┐   ┌─────────┐                                              │
│ │ IMPROVE │ → │ EXECUTE │  Implementation (specs locked)               │
│ └─────────┘   └─────────┘                                              │
│                                                                         │
│ ┌─────────┐   ┌───────┐   ┌────────┐   ┌──────┐                        │
│ │ CONTROL │ → │ AUDIT │ + │ VERIFY │ + │ LOCK │  Control plan          │
│ └─────────┘   └───────┘   └────────┘   └──────┘                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Appendix B: Case Study Template

Use this template to document your AIXORD + Six Sigma projects:

```
PROJECT: [Name]
DMAIC PHASE: [Current]
AIXORD VERSION: 3.3

PROBLEM STATEMENT:
[From PROJECT OBJECTIVE]

BASELINE METRICS:
| Metric | Before | Target | Current |
|--------|--------|--------|---------|
|        |        |        |         |

ROOT CAUSES IDENTIFIED:
1. [From BRAINSTORM phase]
2. 
3. 

SOLUTION SELECTED:
[From OPTIONS phase with justification]

DAG STRUCTURE:
[From SHOW DAG command]

RESULTS:
| Deliverable | Status | Acceptance Criteria Met |
|-------------|--------|-------------------------|
| SCOPE_1     |        |                         |
| SCOPE_2     |        |                         |

CONTROL MEASURES:
[From AUDIT + LOCK phases]

LESSONS LEARNED:
[From HANDOFF carryforward]
```

---

## Appendix C: Obtaining AIXORD

### Available Packages

| Platform | Product | Price |
|----------|---------|-------|
| Claude | AIXORD for Claude | $9.99 |
| ChatGPT | AIXORD for ChatGPT | $9.99 |
| Gemini | AIXORD for Gemini | $7.99 |
| Copilot | AIXORD for Copilot | $7.99 |
| All Platforms | AIXORD Professional | $19.99 |

### Download

Visit: **pmerit.gumroad.com**

### Discount for This Guide

Use code: **AX-LSS-ENTERPRISE** for 20% off any AIXORD package.

---

*AIXORD for Lean Six Sigma — Bringing governance to AI-assisted process improvement.*

*© 2026 PMERIT LLC. All rights reserved.*

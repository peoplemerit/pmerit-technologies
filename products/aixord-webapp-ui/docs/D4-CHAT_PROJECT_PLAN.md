# D4-CHAT PROJECT PLAN

**Document Type:** Comprehensive Project Plan
**Version:** 13.0 (Session 53 — Second Audit Remediation + Error Tracking + Unit Tests)
**Date:** 2026-02-15 (Updated: Sessions 34-53 — Full governance enforcement + TDL + PCC + PTX + BQL + GFB + DPF + CGC-01 + Security Audit + Second Audit Remediation deployed)
**Entity:** PMERIT Technologies LLC
**Governance:** AIXORD v4.3 → v4.4.1 → v4.4 → v4.4.3 → v4.5 → v4.5.1 → v4.5.2 → **v4.5.3 (Second Audit Remediation)**
**Source Files:** Audit Report v5.0, AIXORD Baseline v4.5, Compact Core v4.5-C, 40+ sandbox files, HANDOFF-CGC-01_CONSOLIDATED_GAP_CLOSURE.md, HANDOFF-COPILOT-AUDIT-01 (16 findings), Second D4-CHAT Platform Audit Report (11 GAPs — 8 valid, 3 incorrect), Third D4-CHAT Platform Audit Report (13 findings — 3 inaccurate, 4 already accepted, 3 accepted new, 1 deferred, 2 acknowledged future)
**Last Updated By:** Commander — Session 53 (Second Audit Remediation: error tracking, LEGACY_TOKEN_DEADLINE, 30 new unit tests, doc cleanup — 193/193 tests passing)

---

## TABLE OF CONTENTS

1. [Project Identity & Vision](#1-project-identity--vision)
2. [AIXORD Governance Alignment](#2-aixord-governance-alignment)
3. [Utility Objectives](#3-utility-objectives)
4. [Value Proposition](#4-value-proposition)
5. [Target Users](#5-target-users)
6. [Completion Status](#6-completion-status)
7. [Directory Structure](#7-directory-structure)
8. [Technology Stack](#8-technology-stack)
9. [Database Architecture](#9-database-architecture)
10. [API Reference](#10-api-reference)
11. [AIXORD Gate Implementation](#11-aixord-gate-implementation)
12. [Security & Privacy Governance](#12-security--privacy-governance)
13. [Development Issues](#13-development-issues)
14. [Session History Summary](#14-session-history-summary)
15. [Related Assets & Documentation](#15-related-assets--documentation)
16. [Roadmap & Next Steps](#16-roadmap--next-steps)
17. [Recovery Commands](#17-recovery-commands)

---

## 1. PROJECT IDENTITY & VISION

### 1.1 Project Overview

| Field | Value |
|-------|-------|
| **Project Code** | D4-CHAT |
| **Full Name** | AIXORD D4 Web Application - Governed AI Chat Platform |
| **Parent Entity** | PMERIT Technologies LLC |
| **Governance System** | AIXORD v4.5 |
| **Blueprint** | AIXORD_PLATFORM_BLUEPRINT_D4.md |
| **Started** | 2026-01-24 |
| **Target Launch** | MVP Ready |
| **Current Status** | **~100% Functional (All API Methods Wired)** |

### 1.2 Vision Statement

Transform D4 from a project dashboard into a **full governed AI chat platform** where:

- Users interact with AI through a governed interface (not ChatGPT.com/Claude.ai)
- AIXORD gates enforce governance before any AI call is made
- Model Router handles intelligent provider selection with cost policy
- Subscription system enforces usage limits and BYOK support
- All decisions are auditable through a decision ledger
- Security & Privacy governance protects sensitive data (AIXORD v4.3)

### 1.3 Product Positioning

D4-CHAT is part of the **AIXORD Product Portfolio**:

```
AIXORD Product Ecosystem (Two-Axis Model)
├── Axis A — Capability Products (Model-Agnostic)
│   ├── D1 — AIXORD Core Package (Rules, Roles, Phases, Gates)
│   ├── D3 — AIXORD Developer SDK (Programmatic Governance)
│   ├── D4 — AIXORD Web App (State Persistence, Audit) ← THIS PROJECT
│   └── D5 — AIXORD Companion (Browser Extension)
│
└── Axis B — Context Variants (AI-Specific Reality)
    ├── Claude Variant
    ├── ChatGPT Variant
    ├── Gemini Variant
    └── 7 additional variants
```

### 1.4 AIXORD Formula Alignment

Per AIXORD v4.5, D4-CHAT follows the canonical transformation chain:

```
Project_Docs → Master_Scope → Deliverables → Steps → Production-Ready System
```

**Conservation Law:**
```
EXECUTION_TOTAL = VERIFIED_REALITY + FORMULA_EXECUTION
```

---

## 2. AIXORD GOVERNANCE ALIGNMENT

### 2.1 AIXORD v4.5.1 Governance Reference

| Property | Value |
|----------|-------|
| **Version** | 4.5.1 |
| **Status** | RELEASE-READY |
| **Patch Sources** | PATCH-APX-01, PATCH-FML-01, PATCH-RA-01, PATCH-ENH-01, PATCH-SSC-01, PATCH-GCP-01, PATCH-GKDL-01, PATCH-SPG-01, PATCH-CCS-01, ENH-4/5/6 (v4.4.1), PATCH-LEM-01 (v4.4.2), HO-BRAINSTORM-VALUE-01, HO-PLAN-BLUEPRINT-01, HO-BLUEPRINT-EXECUTE-01, HO-INTEGRITY-EXECUTE-01, HO-DOCTRINE-VALUE-01, HO-DISCOVER-BRAINSTORM-TOKEN-01, HO-INTEGRITY-AVL-01, HO-SECURITY-ROTATION-01, PATCH-SCOPE-CLARIFY-01 (v4.4.3), PATCH-NUMBERING-01 (v4.4.3), PATCH-ENG-01 (v4.5 — Engineering Governance), **PATCH-GATE-RECONCILIATION-01**, **HANDOFF-CGC-01 (v4.5.1 — Consolidated Gap Closure)** |
| **Parts** | I–XIV (14 parts) |
| **Gates** | 29 total: 10 Setup + 6 Security + 7 Execution + 6 Agent (PATCH-GATE-RECONCILIATION-01) |
| **Phases** | SETUP → DISCOVER → BRAINSTORM → PLAN → BLUEPRINT (incl. SCOPE) → EXECUTE → AUDIT → VERIFY → LOCK |

### 2.2 Authority Model Implementation

D4-CHAT implements the AIXORD Authority Model:

| Role | Actor | Implementation in D4-CHAT |
|------|-------|---------------------------|
| **Director** | Human User | Makes decisions via UI, approves actions |
| **Architect** | AI (Router) | Recommends model selection, validates requests |
| **Commander** | AI (Execution) | Executes approved AI calls within bounds |

### 2.3 Gate Implementation Status

#### Setup Gates (10 Steps per AIXORD v4.5)

| Gate | Name | D4-CHAT Status | Implementation |
|------|------|----------------|----------------|
| GA:LIC | License Check | ✅ Backend ready | Subscription validation |
| GA:DIS | Disclaimer | ✅ Implemented | DisclaimerGate.tsx + DisclaimerContext.tsx |
| GA:TIR | Tier Detection | ✅ Implemented | Subscription tier system |
| GA:ENV | Environment | ✅ Auto-detected | Browser environment |
| GA:FLD | Folder Structure | ✅ IndexedDB | File system access API |
| GA:CIT | Citation Mode | ✅ Implemented | GovernanceRibbon.tsx + MiniBar.tsx |
| GA:CON | Continuity Mode | ✅ Session persistence | State API |
| GA:OBJ | Objective | ✅ Project creation | Project objective field |
| GA:RA | Reality Classification | ✅ Implemented | GREENFIELD/BROWNFIELD/LEGACY |
| **GS:DC** | Data Classification | ⏳ NEW in v4.3 | Requires implementation |

#### Execution Gates

| Gate | Name | D4-CHAT Status |
|------|------|----------------|
| FX | Formula Bound | ⏳ SDK integration pending |
| PD | Plan Defined | ✅ Phase tracking |
| PR | Plan Reviewed | ✅ Decision ledger |
| BP | Blueprint Ready | ✅ Project state |
| MS | Master Scope | ⏳ Full SDK pending |
| VA | Validation | ⏳ E2E testing |
| HO | Handoff Ready | ✅ State export |

#### Security Gates (AIXORD v4.3 SPG-01 → v4.5.1 CGC-01 Resource-Level)

| Gate | Phase | Purpose | D4-CHAT Status |
|------|-------|---------|----------------|
| GS:DC | Setup | Data classification declared | ✅ **Implemented** — Project-level + resource-level classification (CGC-01 GAP-2) |
| GS:DP | Execute | Data protection requirements | ✅ **Implemented** — Retention policy calculation, data protection rules (CGC-01 GAP-2) |
| GS:AC | Execute | Access controls appropriate | ✅ Auth system |
| GS:AI | Execute | AI usage complies with classification | ✅ **Implemented** — `enforceAIExposureControl()` utility + exposure log (CGC-01 GAP-2) |
| GS:JR | Execute | Jurisdiction compliance | ✅ **Implemented** — Jurisdiction review endpoint, compliance tracking (CGC-01 GAP-2) |
| GS:RT | Lock | Retention/deletion policy | ✅ **Implemented** — Retention calculation per classification level (CGC-01 GAP-2) |
| GS:SA | Execute | Secret access audit | ✅ **Implemented** — `auditSecretAccess()` utility + audit log (CGC-01 GAP-2) |

### 2.4 AIXORD Law Compliance

#### Authority Laws (L-AU)

| Law | Requirement | D4-CHAT Implementation |
|-----|-------------|------------------------|
| L-AU1 | Require APPROVED/EXECUTE | Router validates subscription |
| L-AU2 | Halt on silence | Request timeout handling |
| L-AU3 | Clarify ambiguous approval | UI confirmation dialogs |
| L-AU4 | RSK:REQ override | ⏳ Risk acceptance flow |

#### Governance Completion Laws (L-GCP — NEW v4.3)

| Law | Requirement | D4-CHAT Status |
|-----|-------------|----------------|
| L-GCP1 | Reconciliation Triad | ⏳ Audit trail present, reconciliation pending |
| L-GCP2 | CLAIMED = VERIFIED | ✅ Decision ledger |
| L-GCP3 | DoD required for VERIFY | ⏳ Per-deliverable DoD |
| L-GCP4 | Verification + Validation | ⏳ E2E testing framework |
| L-GCP5 | UX failure = governance failure | ✅ Error boundaries |
| L-GCP6 | CSR for 10+ sessions | ✅ Session history archived |
| L-GCP7 | Divergence requires DIR decision | ⏳ UI notification |

#### Knowledge Derivation Laws (L-GKDL — NEW v4.3)

| Law | Requirement | D4-CHAT Status |
|-----|-------------|----------------|
| L-GKDL1 | Derived knowledge is governed | ✅ All outputs logged |
| L-GKDL2 | Sessions=evidence, artifacts=authoritative | ✅ Message persistence |
| L-GKDL3 | No derivation from unverified | ⏳ Verification gate |
| L-GKDL4 | CSR → FAQ → SOM → SDG order | ⏳ Knowledge artifacts |
| L-GKDL5 | AI-derived = DRAFT until approved | ⏳ Approval workflow |
| L-GKDL6 | Authority hierarchy | ✅ State precedence |
| L-GKDL7 | Anti-Archaeology | ✅ CSR concept |

#### Security & Privacy Laws (L-SPG — NEW v4.3)

| Law | Requirement | D4-CHAT Status |
|-----|-------------|----------------|
| L-SPG1 | Declare sensitivity before execution | ✅ Resource-level classification API (CGC-01 GAP-2) |
| L-SPG2 | Security = GATE CONDITIONS | ✅ GS:DC/DP/AI/JR/RT/SA enforced (CGC-01) |
| L-SPG3 | No raw PII/PHI to AI without auth | ✅ `enforceAIExposureControl()` utility (CGC-01) |
| L-SPG4 | Unknown = highest protection | ✅ Default behavior |
| L-SPG5 | GS:DC required for setup | ✅ Resource + project-level classification (CGC-01) |
| L-SPG6 | GS:AI required for execution | ✅ AI exposure control enforcement (CGC-01) |
| L-SPG7 | Regulatory = CONSTRAINTS | ✅ Jurisdiction review endpoint (CGC-01 GS:JR) |
| L-SPG8 | User rights = CAPABILITIES | ⏳ Data subject rights |
| L-SPG9 | When in doubt, PROTECT | ✅ Principle applied |
| L-SPG10 | Cross-border compliance | ✅ GS:JR jurisdiction compliance (CGC-01) |

#### Credential Compromise & Sanitization Laws (L-CCS — NEW v4.4)

| Law | Requirement | D4-CHAT Status |
|-----|-------------|----------------|
| L-CCS1 | GA:CCS activates on credential exposure | ✅ CCS incident system |
| L-CCS2 | All execution halts until sanitization | ✅ CCS blocking gate |
| L-CCS3 | CCS lifecycle mandatory | ✅ 7-phase lifecycle API |
| L-CCS4 | Incomplete phase → GA:CCS blocking | ✅ Phase tracking |
| L-CCS5 | Director attestation required | ✅ CCS-04 artifact |
| L-CCS6-7 | Old credential rejected, new works | ✅ Verification tests |
| L-CCS8-10 | Containment + audit artifacts | ✅ 5 CCS artifacts |

#### Layered Execution Mode Laws (L-LEM — NEW v4.4.2)

| Law | Requirement | D4-CHAT Status |
|-----|-------------|----------------|
| L-LEM1-2 | LEM is doctrine, not gate/phase; inside EXECUTE only | ✅ Path B Phase 1 |
| L-LEM3-4 | Blueprint → layers; 4 checks per layer | ✅ execution_layers table + API |
| L-LEM5-6 | Failed layer blocks; verified outputs frozen | ✅ No Broken State rule |
| L-LEM7-8 | LEM recommended not blocking; ENH:PD affects visibility | ✅ Optional enforcement |

#### Blueprint & Phase Contract Laws (L-BRN, L-PLN, L-BPX — NEW v4.4.2)

| Law | Requirement | D4-CHAT Status |
|-----|-------------|----------------|
| L-BRN1-7 | Brainstorm output contract (options, assumptions, kill conditions) | ✅ Validation engine + ≥3 brainstorm check (CGC-01 GAP-6/7) |
| L-PLN1-8 | Plan solid input contract (assumption resolution, option selection) | ✅ DAG required validator (CGC-01 GAP-7) |
| L-BPX1-10 | Blueprint execution-ready contract (scopes, DAG, DoD, ADRs) | ✅ Deliverables complete check (CGC-01 GAP-7) |
| L-BPX11 | SCOPE is sub-step of BLUEPRINT (v4.4.3) | ✅ Aligned |
| L-IVL1-11 | Integrity validation (5 checks before EXECUTE) | ✅ Tests pass check + integration test suite (CGC-01 GAP-7/8) |
| L-AVL1-10 | AUDIT→VERIFY→LOCK functional integrity (DTL) | ⏳ Decision ledger partial |

#### Engineering Governance Laws (L-ADG, L-IVR, L-ITR, L-OPS — NEW v4.5)

| Law | Requirement | D4-CHAT Status |
|-----|-------------|----------------|
| L-ADG1 | COMPLEX Blueprint requires SAR | ⏳ Not yet applicable (task class not yet COMPLEX) |
| L-ADG2-3 | Interface contracts per boundary; missing = Blueprint INCOMPLETE | ⏳ Future (architectural governance) |
| L-ADG4 | SAR governed artifact; changes require DIR approval | ⏳ Future |
| L-ADG5-6 | Data model governance for persistent state | ⏳ Future |
| L-ADG7 | Architectural fitness functions | ⏳ Future |
| L-IVR1-3 | Integration verification levels (Unit→Integration→System→Acceptance) | ⏳ Future (integration testing framework) |
| L-IVR4-7 | System verification for COMPLEX; results in DTL | ⏳ Future |
| L-ITR1-2 | Iteration ≠ Regression; 4 scope levels | ⏳ Future (iteration governance) |
| L-ITR3-7 | Governed re-entry protocol; iteration budget | ⏳ Future |
| L-OPS1-2 | Operational readiness levels L0–L3; declared in Blueprint | ⏳ **Current: ~L1 (deployed, basic monitoring)** |
| L-OPS3 | L1+ deployment, rollback, health endpoint, logging | ✅ Partial (deployed, health endpoint exists) |
| L-OPS4-5 | L2+ alerting, dashboards, incident response | ⏳ Future (production readiness) |
| L-OPS6-8 | LOCK requires ORL checklist PASS; deployment strategy required | ⏳ Future |

---

## 3. UTILITY OBJECTIVES

### 3.1 Core Objectives

| ID | Objective | Description | Status |
|----|-----------|-------------|--------|
| OBJ-1 | **Governed Chat** | Replace uncontrolled AI chat with phase-gated, auditable conversations | ✅ Infrastructure Complete |
| OBJ-2 | **Model Abstraction** | Route AI requests through intelligent model selection (cost/quality policy) | ✅ DEPLOYED |
| OBJ-3 | **State Persistence** | Persist project state, phases, gates, and decisions across sessions | ✅ DEPLOYED |
| OBJ-4 | **Usage Control** | Enforce subscription tiers and usage limits | ✅ API Ready |
| OBJ-5 | **BYOK Support** | Allow users to bring their own API keys with platform fee model | ✅ Architecture Complete |
| OBJ-6 | **Audit Trail** | Append-only decision ledger for governance accountability | ✅ DEPLOYED |
| OBJ-7 | **Local File Integration** | User-selected folder linkage via Browser File System Access API | ⏳ UI Pending |
| OBJ-8 | **Security Governance** | Data classification and AI exposure controls (v4.3) | ⏳ NEW |

### 3.2 D5 Web Workspace Responsibilities

| Responsibility | Description | Status |
|----------------|-------------|--------|
| Chat input (user prompts) | Text input for AI interaction | ✅ UI present |
| Project selection | Choose active AIXORD project | ✅ Working |
| Phase visualization | Display current phase (B/P/E/R) | ✅ PhaseSelector.tsx |
| Gate status display | Show gates with pass/fail state | ✅ GateTracker.tsx |
| Artifact picker | Select/attach HANDOFFs, Blueprints, local files | ⏳ Partial |
| Local folder linkage | User-selected folder via Browser API | ✅ FolderPicker.tsx |
| Data classification | Declare data sensitivity (v4.3) | ⏳ NEW |

### 3.3 Design Principles (AIXORD Aligned)

| Principle | Implementation | Status |
|-----------|----------------|--------|
| Products request outcomes | Intent + tier → Router chooses provider/model | ✅ |
| Humans see rich text | Frontend renders markdown | ✅ |
| Models see compact state + deltas | Capsule protocol | ✅ |
| Deterministic before probabilistic | Gate validation before AI call | ⏳ |
| No product selects model directly | Router only | ✅ |
| When in doubt, PROTECT | Default highest protection | ✅ |

### 3.4 UI Architecture — Progressive Disclosure via Assistance Mode

**Source:** Session 15 (Director + Architect)
**Status:** SPECIFIED — Implementation deferred to Path B

The platform implements Progressive Disclosure governed by the existing Assistance Mode
(GUIDED / ASSISTED / EXPERT) from `UserSettingsContext.tsx`. This addresses the UI density
problem where governance panels (17 gate indicators, model lists, session info) compress
the user's workspace and create intimidation for new users.

| Mode | Left Panel | Right Panel | Chat Area |
|------|-----------|-------------|-----------|
| **GUIDED** | Phase stepper only. Gates hidden — enforced silently. | Collapsed by default. Toggle for Project Info. No model details. | Maximum width. |
| **ASSISTED** | Phase stepper + Setup Gates (collapsible). Work Gates hidden until Execute. | Collapsible. Project Info visible. Session Info on expand. | Wide. |
| **EXPERT** | Full display — all gates, all status. Collapsible sections. | Full display — models, metrics, session data. All collapsible. | Standard. |

**Key Principles:**
- Gates still enforce governance in ALL modes — they just aren't visually exposed in GUIDED/ASSISTED
- Every panel is collapsible with chevron/toggle regardless of mode
- Chat area expands to fill reclaimed space
- Users can override mode per-session

**Implementation:** Conditional rendering based on `assistanceMode` from `UserSettingsContext` + CSS for collapsible sections. No new components required.

### 3.5 Metrics & Analytics

**Source:** Session 15 (Director observation from live platform)
**Status:** SPECIFIED — Data exists, aggregation/display missing

The platform already captures per-message cost, latency, tokens, provider, and model in
response metadata (visible in chat as "$0.0032 · 3634ms · 265 tokens"). Missing is
aggregation at session, project, and account levels.

| Level | Metrics | Display Location | Status |
|-------|---------|-----------------|--------|
| **Message** | Cost, tokens, latency, model, provider | Chat bubbles | ✅ Already shown |
| **Session** | Total cost, total tokens, avg latency, message count | Session Info panel | Partial |
| **Project** | Cumulative cost, token distribution by model class, cost trend | Activity tab | ⏳ Blank (D-015) |
| **Account** | Total spend, usage by project, budget alerts | Settings or Analytics page | ⏳ Missing |

**Implementation Notes:**
- Backend already stores all raw data in messages table
- Session/project aggregation requires SQL queries on existing data (no new tables)
- Activity tab content (currently blank) should display project-level metrics
- Account-level requires new aggregation endpoint

---

## 4. VALUE PROPOSITION

### 4.1 User Value

| Value | Benefit | Status |
|-------|---------|--------|
| **Governance Visibility** | See exactly why actions are blocked or allowed | ✅ Gate UI |
| **Cost Control** | Budget limits enforced at router level | ✅ Router budgets |
| **Provider Flexibility** | Multi-provider with automatic fallback | ✅ 4 providers |
| **Audit Compliance** | Complete decision history for regulated environments | ✅ Decisions API |
| **Session Continuity** | Pick up where you left off across sessions | ✅ State persistence |
| **Data Protection** | Security governance per AIXORD v4.3 | ⏳ NEW |

### 4.2 Business Value

| Value | Benefit | Status |
|-------|---------|--------|
| **Subscription Revenue** | Tiered pricing with BYOK discount option | ✅ Architecture |
| **Manuscript Integration** | KDP/Gumroad purchase → platform discount | ✅ Endpoints deployed |
| **Enterprise Ready** | Governance + audit for compliance | ✅ Foundation |
| **Platform Stickiness** | State persistence creates switching cost | ✅ Working |

### 4.3 Pricing Tiers

| Tier | Monthly | Key Mode | AI Costs | Requests/mo | Status |
|------|---------|----------|----------|-------------|--------|
| TRIAL | $0 | BYOK | User Pays | 50 | ✅ Active |
| MANUSCRIPT_BYOK | $14.99 one-time | BYOK | User Pays | 500 | ✅ Endpoint |
| BYOK_STANDARD | $9.99 | BYOK | User Pays | 1,000 | ✅ Endpoint |
| PLATFORM_STANDARD | $19.99 | Platform | Included | 500 | ✅ Endpoint |
| PLATFORM_PRO | $49.99 | Platform | Included | 2,000 | ✅ Endpoint |
| ENTERPRISE | Custom | Either | Custom | Custom | ⏳ Contact |

---

## 5. TARGET USERS

### 5.1 User Categories

| Category | Description | Typical Tier | Primary Needs |
|----------|-------------|--------------|---------------|
| **Casual Explorers** | Try AIXORD governance concepts | TRIAL | Low barrier, basic chat |
| **Manuscript Readers** | Purchased KDP/Gumroad products | MANUSCRIPT_BYOK | Discount, practice with book |
| **Solo Developers** | Individual builders with API keys | BYOK_STANDARD | Cost control, higher limits |
| **Teams** | Small teams needing collaboration | PLATFORM_STANDARD | Shared state, team audit |
| **Power Users** | Heavy daily usage | PLATFORM_PRO | High limits, priority routing |
| **Enterprise** | Regulated environments | ENTERPRISE | Custom SLA, compliance, security governance |

### 5.2 User Journey

```
1. Discovery → Free trial (BYOK required)          ✅ Working
   ↓
2. Activation → Redeem manuscript code OR subscribe ✅ Endpoints Ready
   ↓
3. Engagement → Create projects, governed chat      ✅ Working
   ↓
4. Retention → State persistence, decision history  ✅ Working
   ↓
5. Expansion → Upgrade tier for more requests       ✅ UI Complete
```

---

## 6. COMPLETION STATUS

### 6.1 Executive Summary

| Metric | V5.0 Audit | V6.0 Audit | V7.0 | V8.0 | V9.0 | V10.0 | V11.0 | V12.0 | V13.0 (Current) | Change |
|--------|------------|------------|------|------|------|-------|-------|------|------------------|--------|
| **Code Written** | ~96% | ~98% | ~99% | ~99%+ | ~99.5% | ~99.8% | ~99.9% | ~100% | **~100%** | — |
| **Functional E2E** | ~96% | ~98% | ~99% | ~99%+ | ~99.5% | ~99.8% | ~99.9% | ~100% | **~100%** | — |
| **Deployed & Working** | ~96% | ~98% | ~99% | ~99%+ | ~99.5% | ~99.8% | ~99.9% | ~100% | **~100%** | — |
| **AIXORD v4.5.1 Compliance** | ~70% | ~90% | ~95% | ~97% | ~99% | ~97% | ~98% | ~99.5% | **~99.5%** | — |
| **D3 SDK Integration** | N/A | 40% | **100%** | **100%** | **100%** | **100%** | **100%** | **100%** | **100%** | — |
| **Path C (Image/Evidence)** | N/A | N/A | 0% | **100%** | **100%** | **100%** | **100%** | **100%** | **100%** | — |
| **Path B (Proactive Debug)** | N/A | N/A | 0% | **33%** | **33%** | **33%** | **33%** | **50%** | **50%** (Phase 1/3 + E2E tested) | — |
| **Vision API (ENH-4)** | N/A | N/A | N/A | ~33% | **100%** | **100%** | **100%** | **100%** | **100%** (3/3 providers) | — |
| **SPG-01 Content Redaction** | N/A | N/A | N/A | TODO | **100%** | **100%** | **100%** | **100%** | **100%** | — |
| **Session Graph (v4.4)** | N/A | N/A | N/A | N/A | N/A | **100%** | **100%** | **100%** | **100%** (5/5 phases) | — |
| **Part XIV Engineering (v4.5)** | N/A | N/A | N/A | N/A | N/A | **100%** | **100%** | **100%** | **100%** (9/9 areas + CRUD) | — |
| **Prompt Caching (D14-15)** | N/A | N/A | N/A | N/A | N/A | N/A | **100%** | **100%** | **100%** (Anthropic+OpenAI) | — |
| **Session Metrics (D10-11)** | N/A | N/A | N/A | N/A | N/A | N/A | **100%** | **100%** | **100%** (endpoint+UI) | — |
| **Project Metrics (D16)** | N/A | N/A | N/A | N/A | N/A | N/A | **100%** | **100%** | **100%** (endpoint+UI) | — |
| **Backend/Frontend Bridge** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** (All APIs wired) | — |
| **Blueprint Governance (L-BPX)** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** (Scopes+Deliverables+IVL+DAG) | — |
| **Workspace Binding (GA:ENV)** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** (3-step wizard+scaffold+auto-check) | — |
| **Hard Gate Enforcement** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** (Block AI call when gates fail) | NEW |
| **Phase Awareness Payloads** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** (Compact bounded phase context) | NEW |
| **Finalize Phase Transaction** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** (Governance-grade transitions) | NEW |
| **Non-Software Project Types** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** (project_type + reduced gates) | NEW |
| **Director Review Packet** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** (Mandatory before phase advance) | NEW |
| **Context Awareness Bridge** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** (Tier 1+2: security/redaction/data/evidence/CCS) | — |
| **Brainstorm Validation Engine** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** (5 BLOCK + 4 WARN checks, artifact API) | NEW |
| **Task Delegation Layer** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** (Assignments, escalations, standups, task board) | NEW |
| **Work Order Injection** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** (AI system prompt enrichment in EXECUTE phase) | NEW |
| **Structured AI Output Blocks** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** (PROGRESS/SUBMISSION/ESCALATION/STANDUP parsing) | NEW |
| **Phase Validators (VD-CI-01 A3)** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** (P4-P6, E1-E4, R1-R2 checks) | NEW |
| **Quality Warning Override (VD-CI-01 A4)** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** (3-way finalize + override modal) | NEW |
| **Integration Tests (TDL-01 Task 8 + SYS-02)** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** (141 tests: validators+override+TDL+rate-limit+execution-layers) | +64 |
| **Project Continuity Capsule (PCC-01)** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** (Tier 4 context + Memory panel) | — |
| **Phase Transition Experience (PTX-01)** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** (Artifact save prompt + finalize UX) | NEW |
| **Brainstorm Quality Loop (BQL-01)** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** (Readiness scoring + AI fix loop) | NEW |
| **Artifact State Class (GFB-01 R3)** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** (DRAFT→ACTIVE→FROZEN lifecycle) | NEW |
| **Gate-Aware Fitness Blocking (GFB-01 R2)** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** (WARN policy on EXECUTE finalize) | NEW |
| **REASSESS Protocol (GFB-01 R6)** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** (3-level friction + modal + audit) | NEW |
| **Cold-Start Null Guards (DPF-01 T1)** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** (Tiers 1C/2D/2F/3 try/catch) | NEW |
| **PTX-01 Timing Gap Fix (DPF-01 T2)** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** (200ms Tier 5 retry) | NEW |
| **Interaction SOP (DPF-01 T3)** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** (AI stops delegating governance assessment) | NEW |
| **Phase Output Contracts (DPF-01 T4)** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** (4-phase structured output rules) | — |
| **DB Schema Reconciliation (Migrations 026-029)** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** (FK cascades, conversations, rate_limits, users.name) | NEW |
| **SYS-02 Execution Layer E2E Tests** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** (59 tests: state machine, sequential enforcement, verification) | NEW |
| **Zod Removal + Lightweight Validation** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** (validateBody.ts + schemas/common.ts rewritten) | NEW |
| **Copilot PR Integration** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** (PRs #5, #6 merged — Project Plan v9.0 + manuscript fixes) | — |
| **Conservation Law Tests (CGC-01 GAP-4)** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** (EXECUTION_TOTAL = VERIFIED_REALITY + FORMULA_EXECUTION) | NEW |
| **Phase Contract Validators (CGC-01 GAP-5/6/7/8)** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** (L-BRN, L-PLN, L-BPX, L-IVL enforcement) | NEW |
| **Resource-Level Security (CGC-01 GAP-2/3)** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** (GS:DC/DP/AI/JR/RT/SA + classify/audit endpoints + SecurityDashboard) | NEW |
| **Worker-Auditor Architecture (CGC-01 GAP-1)** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** (5 agents, registry, executor loop, HITL, AgentDashboard + ApprovalGate) | NEW |
| **Conservation Law Migration (CGC-01 GAP-9/10)** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** (Migrations 030-037, numbering reconciliation) | — |
| **Security Audit Remediation (COPILOT-AUDIT-01)** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** | **100%** (8 fixes, 7 accepted, 1 deferred — 16 findings triaged) | — |
| **PBKDF2 Password Hashing** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** | **100%** (100K iter, per-user salt, transparent SHA-256→PBKDF2 migration) | — |
| **Session Token Hashing** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** | **100%** (SHA-256 one-way hash, plaintext fallback + backfill) | — |
| **API Key Encryption at Rest** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** | **100%** (AES-256-GCM, transparent plaintext→encrypted migration) | — |
| **CSP + Security Headers** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** | **100%** (6 headers via Cloudflare Pages `_headers` file) | — |
| **X-Request-ID Correlation** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** | **100%** (UUID per request, propagated in response) | — |
| **CORS Preview Deployment Support** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** | **100%** (Dynamic origin callback for *.pages.dev subdomains) | — |
| **Structured Error Tracking** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** (errorTracker.ts + app.onError + ErrorBoundary reporting) | NEW |
| **Legacy Token Deadline** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** (LEGACY_TOKEN_DEADLINE 2026-03-15, auto-disable plaintext fallback) | NEW |
| **Crypto + Auth + Error Unit Tests** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** (30 new tests: crypto 18, errorTracker 7, requireAuth 5) | NEW |
| **Second Audit Validation** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** (11 GAPs validated: 8 accurate, 3 incorrect — docs cleaned) | NEW |
| **Third Audit Triage (COPILOT-AUDIT-03)** | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | **100%** (13 findings: 3 inaccurate, 4 already accepted, 3 accepted new, 1 deferred, 2 ack'd future) | NEW |

### 6.2 Deliverable Matrix

| ID | Deliverable | Status | % Complete |
|----|-------------|--------|------------|
| D1 | Model Router Worker | ✅ DEPLOYED | 100% |
| D2 | SDK Integration | ✅ **COMPLETE** | **100%** |
| D3 | Chat UI Components | ✅ COMPLETE | 100% |
| D4 | Gate Display | ✅ COMPLETE | 100% |
| D5 | Phase Tracker | ✅ COMPLETE | 100% |
| D6 | Settings Page | ✅ COMPLETE | 95% |
| D7 | State Persistence | ✅ DEPLOYED | 100% |
| D8 | Subscription/Billing | ✅ DEPLOYED | 95% |
| D9 | Message Persistence | ✅ DEPLOYED | 100% |
| D10 | Usage Statistics | ✅ DEPLOYED | 100% |
| D11 | Security Governance (v4.3) | ✅ **COMPLETE** | **100%** |
| D12 | Knowledge Artifacts (GKDL-01) | ✅ DEPLOYED | 100% |
| D13 | D5 Companion Integration | ✅ CODE COMPLETE | 95% |
| D14 | Part XIV Engineering Governance | ✅ **DEPLOYED** | **100%** |
| D15 | Blueprint Governance (L-BPX, L-IVL) | ✅ **DEPLOYED** | **100%** |
| D16 | Workspace Binding (Unified GA:ENV + GA:FLD) | ✅ **DEPLOYED** | **100%** |
| D17 | Hard Gate Enforcement (Block AI when gates fail) | ✅ **DEPLOYED** | **100%** |
| D18 | Phase Awareness Payloads (Compact bounded AI context) | ✅ **DEPLOYED** | **100%** |
| D19 | Finalize Phase Transaction (Governance-grade transitions) | ✅ **DEPLOYED** | **100%** |
| D20 | Non-Software Project Types (project_type + reduced gates) | ✅ **DEPLOYED** | **100%** |
| D21 | Director Review Packet (Mandatory before phase advance) | ✅ **DEPLOYED** | **100%** |
| D22 | Context Awareness Bridge (HANDOFF-PR-01) | ✅ **DEPLOYED** | **100%** |
| D23 | Brainstorm Validation Engine (HANDOFF-VD-CI-01 A1+A2) | ✅ **DEPLOYED** | **100%** |
| D24 | Task Delegation Layer — Backend (HANDOFF-TDL-01 Tasks 1-2) | ✅ **DEPLOYED** | **100%** |
| D25 | Task Delegation Layer — Full-Stack (HANDOFF-TDL-01 Tasks 3-7) | ✅ **DEPLOYED** | **100%** |
| D26 | Phase Validators — Strengthened (HANDOFF-VD-CI-01 A3) | ✅ **DEPLOYED** | **100%** |
| D27 | Quality Warning Override (HANDOFF-VD-CI-01 A4) | ✅ **DEPLOYED** | **100%** |
| D28 | Integration Test Suite (TDL-01 Task 8 + SYS-02) | ✅ **COMPLETE** | **100%** |
| D29 | Project Continuity Capsule — Full-Stack (HANDOFF-PCC-01) | ✅ **DEPLOYED** | **100%** |
| D30 | Phase Transition Experience (HANDOFF-PTX-01) | ✅ **DEPLOYED** | **100%** |
| D31 | Brainstorm Quality Loop (HANDOFF-BQL-01) | ✅ **DEPLOYED** | **100%** |
| D32 | Artifact State Class (HANDOFF-GFB-01 R3) | ✅ **DEPLOYED** | **100%** |
| D33 | Gate-Aware Fitness Blocking (HANDOFF-GFB-01 R2) | ✅ **DEPLOYED** | **100%** |
| D34 | REASSESS Protocol (HANDOFF-GFB-01 R6) | ✅ **DEPLOYED** | **100%** |
| D35 | Cold-Start Null Guards (HANDOFF-DPF-01 T1) | ✅ **DEPLOYED** | **100%** |
| D36 | PTX-01 Timing Gap Fix (HANDOFF-DPF-01 T2) | ✅ **DEPLOYED** | **100%** |
| D37 | Interaction SOP (HANDOFF-DPF-01 T3) | ✅ **DEPLOYED** | **100%** |
| D38 | Phase Output Contracts (HANDOFF-DPF-01 T4) | ✅ **DEPLOYED** | **100%** |
| D39 | DPF-01 Diagnostic Fixes | ✅ **DEPLOYED** | **100%** |
| D40 | DB Schema Reconciliation (Migrations 026-029) | ✅ **DEPLOYED** | **100%** |
| D41 | SYS-02 Execution Layer E2E Test Suite | ✅ **COMPLETE** | **100%** |
| D42 | Zod Removal + Lightweight Validation | ✅ **DEPLOYED** | **100%** |
| D43 | Conversation Persistence (SYS-01) | ✅ **DEPLOYED** | **100%** |
| D44 | Conservation Law Tests (HANDOFF-CGC-01 GAP-4) | ✅ **COMPLETE** | **100%** |
| D45 | Phase Contract Validators — L-BRN (HANDOFF-CGC-01 GAP-5) | ✅ **COMPLETE** | **100%** |
| D46 | Phase Contract Validators — L-PLN (HANDOFF-CGC-01 GAP-6) | ✅ **COMPLETE** | **100%** |
| D47 | Phase Contract Validators — L-BPX (HANDOFF-CGC-01 GAP-7) | ✅ **COMPLETE** | **100%** |
| D48 | Phase Contract Validators — L-IVL (HANDOFF-CGC-01 GAP-8) | ✅ **COMPLETE** | **100%** |
| D49 | Migration Numbering Reconciliation (HANDOFF-CGC-01 GAP-9) | ✅ **DEPLOYED** | **100%** |
| D50 | Resource-Level Security — Backend (HANDOFF-CGC-01 GAP-2/3) | ✅ **DEPLOYED** | **100%** |
| D51 | Resource-Level Security — Frontend (HANDOFF-CGC-01 GAP-2) | ✅ **DEPLOYED** | **100%** |
| D52 | Worker-Auditor Architecture — Backend (HANDOFF-CGC-01 GAP-1) | ✅ **DEPLOYED** | **100%** |
| D53 | Worker-Auditor Architecture — Frontend (HANDOFF-CGC-01 GAP-1) | ✅ **DEPLOYED** | **100%** |
| D54 | Security Audit Remediation — Crypto & Auth (HANDOFF-COPILOT-AUDIT-01) | ✅ **DEPLOYED** | **100%** |
| D55 | Security Audit Remediation — Headers & Observability (HANDOFF-COPILOT-AUDIT-01) | ✅ **DEPLOYED** | **100%** |
| D56 | CORS Preview Deployment Support | ✅ **DEPLOYED** | **100%** |
| D57 | Structured Error Tracking (errorTracker.ts + app.onError + ErrorBoundary) | ✅ **DEPLOYED** | **100%** |
| D58 | Legacy Token Deadline (LEGACY_TOKEN_DEADLINE 2026-03-15) | ✅ **DEPLOYED** | **100%** |
| D59 | Crypto + Auth + Error Unit Tests (30 new tests — 193/193 total) | ✅ **COMPLETE** | **100%** |
| D60 | Third Audit Triage (HANDOFF-COPILOT-AUDIT-03 — 13 findings validated) | ✅ **COMPLETE** | **100%** |

**Total Deliverables:** 60 (D1-D60)

**Note (PATCH-CGC-01, GAP-9):** Session 23 sprint deliverables (§16.10) used internal numbering D7-D16 that maps to the main deliverable matrix as follows: Sprint-D10+D11 (Session Metrics) = main D10 (Usage Statistics). Sprint-D14+D15 (Prompt Caching) are implementation details within D1 (Model Router Worker). The main D1-D43 numbering is canonical.

### 6.3 API Endpoint Status (190+ Endpoints across 24 Modules)

```
ROUTER ENDPOINTS (4):          ALL ✅ VERIFIED (incl. hard gate enforcement before AI call)
AUTH ENDPOINTS (9):            ALL ✅ VERIFIED (incl. email verify, password reset, username recovery)
PROJECTS ENDPOINTS (5):        ALL ✅ VERIFIED (incl. project_type field for non-software projects)
STATE ENDPOINTS (5):           ALL ✅ VERIFIED (incl. GA:ENV, GA:FLD, GA:BP, GA:IVL auto-checks + POST finalize + brainstorm validation + fitness blocking + REASSESS protocol)
DECISIONS ENDPOINTS (2):       ALL ✅ VERIFIED
MESSAGES ENDPOINTS (4):        ALL ✅ VERIFIED (incl. batch create, session_id filter)
BILLING ENDPOINTS (5):         ALL ✅ DEPLOYED
GITHUB ENDPOINTS (5):          ALL ✅ DEPLOYED (connect, callback[D12:fixed], status, disconnect, repos)
EVIDENCE ENDPOINTS (3):        ALL ✅ DEPLOYED (sync, list, triad)
KNOWLEDGE ENDPOINTS (7):       ALL ✅ DEPLOYED (CRUD, approve, generate-csr)
CCS ENDPOINTS (11):            ALL ✅ DEPLOYED (incident lifecycle — v4.4)
SECURITY ENDPOINTS (8):        ALL ✅ DEPLOYED (project-level SPG-01 + resource-level classify, classifications, resource, jurisdiction, secrets audit — CGC-01 GAP-2)
USAGE ENDPOINTS (3):           ALL ✅ DEPLOYED (current, history, projects[D16] — H1/H2)
IMAGE ENDPOINTS (5):           ALL ✅ DEPLOYED (Path C — upload, list, get, url, delete)
LAYER ENDPOINTS (10):          ALL ✅ DEPLOYED (Path B — CRUD + start/complete/verify/fail/retry/evidence)
SESSION ENDPOINTS (7):         ALL ✅ DEPLOYED (Session Graph — create, list, get, update, graph, edge, metrics[D10])
ENGINEERING ENDPOINTS (35):    ALL ✅ DEPLOYED (Part XIV — SAR, contracts, fitness, tests, budget, readiness, rollback, alerts, knowledge, compliance)
BLUEPRINT ENDPOINTS (12):      ALL ✅ DEPLOYED (L-BPX — scopes CRUD, deliverables CRUD, validate, integrity, DAG, summary)
WORKSPACE ENDPOINTS (4):       ALL ✅ DEPLOYED (Unified GA:ENV — get, update, delete, status)
BRAINSTORM ENDPOINTS (5):      ALL ✅ DEPLOYED (HANDOFF-VD-CI-01 + BQL-01 — create/get artifact, validate, get validation, readiness)
ASSIGNMENT ENDPOINTS (20):     ALL ✅ DEPLOYED (HANDOFF-TDL-01 — CRUD, lifecycle, escalation, standup, task board)
CONTINUITY ENDPOINTS (7):      ALL ✅ DEPLOYED (HANDOFF-PCC-01 — capsule, session detail, decisions, artifacts, pins CRUD)
AGENT ENDPOINTS (14):          ALL ✅ DEPLOYED (CGC-01 GAP-1 — agent CRUD, task CRUD, orchestrate, execute, approve, audit-log)
```

See §10.1 for complete endpoint matrix with paths and methods.

---

## 7. DIRECTORY STRUCTURE

### 7.1 Backend: Router Worker

```
pmerit-technologies/products/aixord-router-worker/
├── migrations/                          # 29 SQL migration files
│   ├── 0001_subscriptions.sql           # Subscriptions, usage, audit_log
│   ├── 002_backend_schema.sql           # Users, projects, sessions, gates, phase
│   ├── 003_messages_schema.sql          # Messages table for chat history
│   ├── 004_model_selection_logs.sql     # Model selection audit trail
│   ├── 005_github_evidence.sql          # GitHub evidence (3 tables, 9 indexes)
│   ├── 006_knowledge_artifacts.sql      # Knowledge artifacts (GKDL-01)
│   ├── 007_ccs_governance.sql           # CCS incidents/artifacts/verification
│   ├── 008_fix_phase_constraint.sql     # Phase constraint fix
│   ├── 009_spg01_security_governance.sql # Data classification, AI exposure
│   ├── 010_auth_verification.sql        # Email verification tokens (consolidated)
│   ├── 011_trial_and_metering.sql       # Trial expiration, usage tracking (H1/H2)
│   ├── 012_image_metadata.sql           # Image evidence metadata (Path C)
│   ├── 013_execution_layers.sql         # Execution layers (Path B)
│   ├── 014_sessions.sql                 # Session Graph Model (v4.4 — project_sessions + session_edges)
│   ├── 015_engineering_governance.sql   # Part XIV Engineering Governance (9 tables — SAR, contracts, fitness, tests, budget, readiness, rollback, alerts, knowledge)
│   ├── 016_blueprint_governance.sql    # Blueprint Governance (3 tables — scopes, deliverables, integrity_reports + 6 indexes)
│   ├── 017_workspace_binding.sql       # Workspace Binding (1 table — workspace_bindings + 1 index)
│   ├── 021_brainstorm_artifacts.sql    # Brainstorm artifacts (HANDOFF-VD-CI-01 — versioned artifacts + indexes)
│   ├── 022_task_assignments.sql        # Task Delegation Layer (HANDOFF-TDL-01 — task_assignments, escalation_log, standup_reports + 7 indexes)
│   ├── 023_continuity.sql             # Project Continuity Capsule (HANDOFF-PCC-01 — continuity_pins + decision_ledger alterations)
│   ├── 026_schema_reconciliation.sql  # Schema reconciliation (decisions CASCADE, ghost tables, missing columns)
│   ├── 027_fix_user_fk_cascades.sql   # FK cascades SET NULL (images, knowledge_artifacts, github_evidence)
│   ├── 028_conversations.sql          # Conversations + conversation_messages tables (SYS-01)
│   ├── 028_user_name_column.sql       # Add name column to users table
│   ├── 029_rate_limits.sql            # Rate limiting table
│   ├── 030_conservation_law.sql       # Conservation law tests (CGC-01 GAP-4)
│   ├── 031_phase_contracts.sql        # Phase contract validations (CGC-01 GAP-5-8)
│   ├── 032_deliverable_numbering.sql  # Deliverable numbering map (CGC-01 GAP-9)
│   ├── 033_numbering_fixes.sql        # Missing indexes/constraints (CGC-01 GAP-10)
│   ├── 034_resource_security.sql      # Resource-level security classifications (CGC-01 GAP-2/3)
│   ├── 035_agent_state.sql            # Agent instances (CGC-01 GAP-1)
│   ├── 036_task_queue.sql             # Agent task queue (CGC-01 GAP-1)
│   └── 037_agent_audit.sql            # Agent audit log (CGC-01 GAP-1)
├── src/
│   ├── api/                             # Backend API handlers (24 modules)
│   │   ├── auth.ts                      # 9 endpoints: register, login, me, logout,
│   │   │                                #   verify-email, resend-verification,
│   │   │                                #   forgot-password, reset-password, recover-username
│   │   ├── projects.ts                  # 5 endpoints: CRUD + list
│   │   ├── state.ts                     # 5 endpoints: get, update, toggle gate, set phase, finalize (+ brainstorm validation)
│   │   ├── decisions.ts                 # 2 endpoints: create, list
│   │   ├── messages.ts                  # 3 endpoints: list, create, clear (+batch, session_id)
│   │   ├── sessions.ts                  # 6 endpoints: create, list, get, update, graph, edge (v4.4)
│   │   ├── github.ts                    # 5 endpoints: connect, callback, status, disconnect, repos
│   │   ├── evidence.ts                  # 3 endpoints: sync, list, triad
│   │   ├── knowledge.ts                 # 7 endpoints: CRUD, approve, generate-csr
│   │   ├── ccs.ts                       # 11 endpoints: CCS incident lifecycle (v4.4)
│   │   ├── security.ts                  # 8 endpoints: data classification (SPG-01) + resource-level (CGC-01 GAP-2)
│   │   ├── usage.ts                     # 2 endpoints: current, history (H1/H2)
│   │   ├── images.ts                    # 5 endpoints: upload, list, get, url, delete (Path C)
│   │   ├── layers.ts                    # 5 endpoints: CRUD + verify (Path B)
│   │   ├── engineering.ts               # 35 endpoints: Part XIV Engineering Governance (SAR, contracts, fitness, tests, budget, readiness, rollback, alerts, knowledge, compliance)
│   │   ├── brainstorm.ts               # 4 endpoints: brainstorm artifacts CRUD + validation engine (HANDOFF-VD-CI-01)
│   │   ├── assignments.ts              # 20 endpoints: task assignments CRUD, lifecycle, escalation, standup, task board (HANDOFF-TDL-01)
│   │   ├── continuity.ts              # 7 endpoints: project continuity capsule, session detail, decisions, artifacts, pins CRUD (HANDOFF-PCC-01)
│   │   └── agents.ts                  # 14 endpoints: agent CRUD, task CRUD, orchestrate, execute, approve, audit-log (CGC-01 GAP-1)
│   ├── agents/                          # Multi-agent architecture (CGC-01 GAP-1)
│   │   ├── registry.ts                  # Agent definitions (5 agents), competency routing, cost tiers
│   │   └── executor.ts                  # Worker-Auditor loop, retry logic, fallback models
│   ├── middleware/
│   │   ├── requireAuth.ts               # Bearer token auth middleware
│   │   ├── validateBody.ts              # Lightweight body validation (zod-compatible interface)
│   │   └── entitlement.ts               # Usage limit checking (H1/H2 metering)
│   ├── billing/
│   │   ├── index.ts                     # Billing exports
│   │   ├── stripe.ts                    # Stripe checkout/portal/webhook
│   │   └── gumroad.ts                   # Gumroad license activation
│   ├── providers/
│   │   ├── index.ts                     # Provider registry + execution
│   │   ├── anthropic.ts                 # Claude API (+ multimodal vision support)
│   │   ├── openai.ts                    # OpenAI API (+ multimodal vision support)
│   │   ├── google.ts                    # Gemini API (+ multimodal vision support)
│   │   └── deepseek.ts                  # DeepSeek API
│   ├── routing/
│   │   ├── table.ts                     # Model class routing table
│   │   ├── intent-map.ts                # Tier/intent/mode → class mapping
│   │   ├── affinity-selector.ts         # PATCH-MOD-01 affinity-based selection
│   │   ├── selection-log.ts             # Model selection audit logging
│   │   ├── key-resolver.ts              # BYOK API key resolution
│   │   ├── subscription.ts              # Subscription validation
│   │   └── fallback.ts                  # Fallback execution logic
│   ├── config/
│   │   └── model-affinities.ts          # Intent → provider affinity mapping
│   ├── services/
│   │   └── evidence-fetch.ts            # GitHub evidence fetching service
│   ├── schemas/
│   │   ├── router.ts                    # Request validation schemas
│   │   └── common.ts                    # Lightweight validation schemas (no zod dependency)
│   ├── utils/
│   │   ├── cost.ts                      # Cost estimation per model
│   │   └── errorTracker.ts              # Structured error logging (JSON for wrangler tail)
│   ├── index.ts                         # Main entry point (Hono app, route registration)
│   └── types.ts                         # All type definitions (~817 lines)
├── tests/                              # Test suite (193 tests — 9 test files)
│   ├── helpers.ts                      # Mock D1, factory functions
│   ├── phase-validators.test.ts       # 23 tests: brainstorm validation, PLAN/EXECUTE/REVIEW checks
│   ├── warning-override.test.ts       # 12 tests: three-way finalize, override audit
│   ├── tdl-lifecycle.test.ts          # 42 tests: status transitions, DAG, escalation, standup
│   ├── conservationLaw.test.ts        # 22 tests: conservation law enforcement
│   ├── execution-layers.test.ts       # 59 tests: layer state machine, sequential enforcement
│   ├── rateLimit.test.ts              # 5 tests: rate limiting middleware (atomic upsert mock)
│   ├── crypto.test.ts                 # 18 tests: AES-GCM roundtrip, SHA-256, PBKDF2 verify
│   ├── errorTracker.test.ts           # 7 tests: structured JSON output, context metadata
│   └── requireAuth.test.ts            # 5 tests: token auth, legacy fallback, backfill
├── vitest.config.ts                    # Vitest configuration
├── wrangler.toml                        # Cloudflare config (D1 + R2 bindings)
├── package.json
└── tsconfig.json
```

**Total: 45+ TypeScript source files, 24 API modules, 190+ endpoints, 193 tests across 9 test files**

### 7.2 Frontend: WebApp UI

```
pmerit-technologies/products/aixord-webapp-ui/
├── src/
│   ├── components/
│   │   ├── chat/                        # Chat components
│   │   │   ├── ChatWindow.tsx           # Main chat display
│   │   │   ├── ChatInput.tsx            # Input with mode selector
│   │   │   ├── MessageBubble.tsx        # Individual message component
│   │   │   ├── ImageUpload.tsx          # Image upload modal (Path C)
│   │   │   ├── ImageDisplay.tsx         # Image rendering via blob URLs (Path C)
│   │   │   ├── types.ts                 # Chat type definitions
│   │   │   └── index.ts                 # Barrel exports
│   │   ├── layout/                      # Ribbon layout (Session 18c + 27)
│   │   │   ├── TabBar.tsx               # Top tab strip (Governance/Blueprint/Tasks/Memory/Security/Evidence/Engineering/Info) + hiddenTabs
│   │   │   ├── MiniBar.tsx              # 36px governance strip (hybrid ribbon UI — Session 27)
│   │   │   ├── Ribbon.tsx               # Collapsible ribbon container
│   │   │   └── StatusBar.tsx            # Bottom status bar
│   │   ├── ribbon/                      # Ribbon tab content
│   │   │   ├── GovernanceRibbon.tsx     # Governance tab (gates, phase, decisions)
│   │   │   ├── EvidenceRibbon.tsx       # Evidence tab (GitHub, images)
│   │   │   ├── InfoRibbon.tsx           # Info tab (project metadata)
│   │   │   ├── EngineeringRibbon.tsx   # Engineering tab (Part XIV compliance)
│   │   │   └── SecurityRibbon.tsx      # Security tab (data classification, gates)
│   │   ├── governance/                  # Governance UI components
│   │   │   ├── SecurityGates.tsx        # Security gate display/toggle (SPG-01)
│   │   │   ├── DataClassification.tsx   # PII/PHI/Financial form (GS:DC)
│   │   │   ├── GateTracker.tsx          # Gate status tracking
│   │   │   ├── DecisionLog.tsx          # Decision record log
│   │   │   └── CheckpointModal.tsx      # ECP verification modal (Path B)
│   │   ├── evidence/                    # Evidence components
│   │   │   ├── EvidencePanel.tsx        # GitHub evidence display
│   │   │   ├── ReconciliationTriad.tsx  # Planned/Claimed/Verified visual
│   │   │   ├── GitHubConnect.tsx        # GitHub OAuth connection UI
│   │   │   └── FileExplorer.tsx         # File attachment explorer
│   │   ├── knowledge/                   # Knowledge artifact components
│   │   │   └── KnowledgeArtifacts.tsx   # Artifact list/create/manage (GKDL-01)
│   │   ├── ccs/                         # Credential Compromise components (v4.4)
│   │   │   ├── CCSIncidentBanner.tsx    # Incident notification banner
│   │   │   ├── CCSIncidentPanel.tsx     # Detailed incident management
│   │   │   └── CCSLifecycleTracker.tsx  # Phase tracking (DETECT→UNLOCK)
│   │   ├── session/                     # Session Graph components (v4.4)
│   │   │   ├── NewSessionModal.tsx      # Session creation modal (type + edge selection)
│   │   │   └── SessionList.tsx          # Compact session list with status badges
│   │   ├── execution/                   # Proactive Debugging components (Path B)
│   │   │   └── LayerProgressPanel.tsx   # Execution layer progress tracking
│   │   ├── onboarding/                  # User onboarding
│   │   │   ├── OnboardingChecklist.tsx  # Onboarding checklist
│   │   │   └── TourOverlay.tsx          # Feature tour overlay
│   │   ├── billing/                     # Billing/subscription UI
│   │   │   ├── TrialBanner.tsx          # Trial expiration banner (H1)
│   │   │   ├── UsageMeter.tsx           # Usage display with cost (H2)
│   │   │   └── UpgradeBanner.tsx        # Upgrade CTA banner
│   │   ├── Layout.tsx                   # Main layout (header + sidebar + outlet)
│   │   ├── Sidebar.tsx                  # Navigation (+ active indicator)
│   │   ├── ErrorBoundary.tsx            # Error boundary
│   │   ├── ProjectCard.tsx              # Project card (Dashboard)
│   │   ├── PhaseSelector.tsx            # Phase selection UI
│   │   ├── ActivityLog.tsx              # Activity display
│   │   ├── FileAttachment.tsx           # File attachment component
│   │   ├── FolderPicker.tsx             # Folder selection UI
│   │   ├── ChatErrorMessage.tsx         # Chat error display
│   │   ├── TaskBoard.tsx               # Kanban task board (HANDOFF-TDL-01 — status columns, priority badges, lifecycle actions)
│   │   ├── EscalationBanner.tsx        # Escalation decision banners (HANDOFF-TDL-01 — options, recommendation, resolve)
│   │   ├── StandupCard.tsx             # Structured standup reports (HANDOFF-TDL-01 — completed/blocked/next)
│   │   ├── ProjectMemoryPanel.tsx     # Project continuity memory panel (HANDOFF-PCC-01 — timeline, decisions, pins, progress)
│   │   ├── SecurityDashboard.tsx     # Resource-level security dashboard (CGC-01 GAP-2 — classification list, audit log)
│   │   ├── AgentDashboard.tsx        # Multi-agent status dashboard (CGC-01 GAP-1 — agents, tasks, 5s polling)
│   │   └── ApprovalGate.tsx          # HITL approval modal (CGC-01 GAP-1 — audit report, findings, feedback)
│   ├── contexts/
│   │   ├── AuthContext.tsx              # Auth state (token, user, login/logout)
│   │   ├── UserSettingsContext.tsx      # Subscription, API keys, preferences
│   │   └── DisclaimerContext.tsx        # Disclaimer/legal gate state (GA:DIS)
│   ├── hooks/
│   │   ├── useApi.ts                    # useProjects, useProjectState hooks
│   │   ├── useChat.ts                   # Chat state + router integration
│   │   ├── useSessions.ts              # Session Graph lifecycle (v4.4)
│   │   ├── useLayers.ts                 # Execution layer lifecycle (Path B)
│   │   ├── useKnowledgeArtifacts.ts     # Knowledge artifact CRUD (GKDL-01)
│   │   ├── useEngineering.ts           # Engineering governance hook (Part XIV)
│   │   ├── useBlueprint.ts             # Blueprint governance hook (L-BPX, L-IVL)
│   │   ├── useAssignments.ts           # Task delegation hook (HANDOFF-TDL-01 — assignments, escalations, standups, task board)
│   │   └── useContinuity.ts           # Project continuity hook (HANDOFF-PCC-01 — capsule state, pin management)
│   ├── lib/
│   │   ├── api.ts                       # Complete API client (~3400 lines, 20 modules)
│   │   ├── sdk.ts                       # AIXORD SDK wrapper (~791 lines)
│   │   ├── fileSystem.ts                # File system access utilities
│   │   └── storage.ts                   # LocalStorage persistence
│   ├── pages/
│   │   ├── Landing.tsx                  # Public homepage
│   │   ├── Login.tsx                    # Login (email/password + API key)
│   │   ├── Signup.tsx                   # Registration with email verification
│   │   ├── VerifyEmail.tsx              # Email verification flow
│   │   ├── ForgotPassword.tsx           # Password reset request
│   │   ├── ResetPassword.tsx            # Password reset confirmation
│   │   ├── Dashboard.tsx                # Project overview + statistics
│   │   ├── Chat.tsx                     # AI chat landing with quick actions
│   │   ├── Project.tsx                  # Project workspace (ribbon layout)
│   │   ├── Settings.tsx                 # Subscription + API keys + preferences
│   │   ├── Pricing.tsx                  # Public pricing page (Stripe checkout)
│   │   ├── Activity.tsx                 # Activity history (stub)
│   │   ├── Analytics.tsx                # Analytics dashboard (stub)
│   │   └── docs/                        # Documentation pages
│   │       ├── DocsLayout.tsx           # Docs layout wrapper
│   │       ├── DocsIndex.tsx            # Docs homepage
│   │       ├── QuickStart.tsx           # Getting started guide
│   │       ├── Features.tsx             # Feature documentation
│   │       ├── ApiKeys.tsx              # API key setup guide
│   │       └── Troubleshooting.tsx      # Troubleshooting guide
│   ├── App.tsx                          # Main app (routes + context providers)
│   └── main.tsx                         # Entry point
├── package.json
├── vite.config.ts
└── tsconfig.json
```

**Total: 80+ TypeScript/TSX source files, 11 component subdirectories, ~14,000+ lines**

### 7.2a Frontend Routes (App.tsx)

| Route | Component | Type | Purpose |
|-------|-----------|------|---------|
| `/` | Landing | Public | Homepage |
| `/login` | Login | Public | Authentication |
| `/signup` | Signup | Public | Registration |
| `/verify-email` | VerifyEmail | Public | Email verification |
| `/forgot-password` | ForgotPassword | Public | Password reset request |
| `/reset-password` | ResetPassword | Public | Password reset |
| `/dashboard` | Dashboard | Protected | Project overview |
| `/chat` | Chat | Protected | AI chat landing |
| `/project/:id` | Project | Protected | Main workspace (ribbon) |
| `/settings` | Settings | Protected | Subscription/preferences |
| `/pricing` | Pricing | Public | Pricing + checkout |
| `/activity` | Activity | Protected | Activity history |
| `/analytics` | Analytics | Protected | Analytics dashboard |
| `/docs/*` | DocsLayout | Public | Documentation (5 sub-pages) |

### 7.3 Related Directories

| Directory | Purpose |
|-----------|---------|
| `pmerit-technologies/products/aixord-companion/` | D5 Browser Extension |
| `pmerit-technologies/products/AIXORD-Variants/` | AI-specific manuscript variants |
| `pmerit-technologies/products/variant-bundles/` | Bundled variant packages |
| `pmerit/sandbox/` | Development artifacts |
| `pmerit/sandbox/archive/D4-CHAT-2026-01-31/` | Archived documentation |

---

## 8. TECHNOLOGY STACK

### 8.1 Frontend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI framework |
| React DOM | 19.2.0 | DOM rendering |
| React Router | 7.13.0 | Client-side routing |
| TypeScript | ~5.9.3 | Type safety |
| Vite | 7.2.4 | Build tool |
| Tailwind CSS | 4.1.18 | Styling |
| ESLint | 9.39.1 | Linting |

### 8.2 Backend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Cloudflare Workers | Latest | Serverless runtime |
| Hono | 4.0.0 | Web framework |
| D1 Database | Latest | SQLite serverless DB |
| TypeScript | 5.3.3 | Type safety |
| Wrangler | 4.63.0 | Deployment |
| Vitest | 4.0.18 | Testing |

### 8.3 AI Providers

| Provider | Models | Use Case | Status |
|----------|--------|----------|--------|
| Anthropic | claude-sonnet-4-5, claude-opus-4-5, claude-3-5-haiku | HIGH_QUALITY, FRONTIER | ✅ Active |
| OpenAI | gpt-4o, gpt-4o-mini, gpt-4.5-preview | Fallback, FAST_ECONOMY | ✅ Active |
| Google | gemini-2.0-flash, gemini-2.0-pro | ULTRA_CHEAP, FAST_VERIFY | ✅ Active |
| DeepSeek | deepseek-chat | ULTRA_CHEAP alternative | ✅ Active |

### 8.4 External Services

| Service | Purpose | Status |
|---------|---------|--------|
| Stripe | Subscription billing | ✅ Endpoints deployed |
| Gumroad | License verification | ✅ Endpoint deployed |
| Cloudflare Pages | Frontend hosting | ✅ Deployed |
| Cloudflare Workers | Backend hosting | ✅ Deployed |
| Cloudflare D1 | Database | ✅ Active |
| Cloudflare R2 | Image object storage (`aixord-images`) | ✅ Active (Path C) |
| Resend | Transactional emails (verification, password reset) | ✅ Active |
| GitHub OAuth | External evidence integration | ✅ Active |

---

## 9. DATABASE ARCHITECTURE

### 9.1 D1 Database Info

| Field | Value |
|-------|-------|
| Database Name | aixord-db |
| Database ID | 4222a800-ec94-479b-94d2-f1beaa7d01d9 |
| Type | Cloudflare D1 (SQLite) |
| Binding | `DB` |

### 9.2 Table Schema (59 Tables — 33 Migrations + 3 Inline)

#### Core Tables (migrations 001-002)
```sql
users (id, email, password_hash, created_at, updated_at)
sessions (id, user_id → users, token, expires_at, created_at)
projects (id, owner_id → users, name, objective,
          reality_classification, conserved_scopes, project_type, created_at, updated_at)
project_state (project_id → projects, phase, gates JSON, capsule JSON, phase_locked JSON, reassess_count INTEGER, updated_at)
project_gates (project_id, gate_id, status, updated_at)
subscriptions (id, user_id, tier, key_mode, stripe_subscription_id, status, current_period_end)
usage (user_id, period, request_count, token_count, cost_cents)
audit_log (id, user_id, action, details, created_at)
```

#### Feature Tables (migrations 003-006)
```sql
messages (id, project_id → projects, session_id → project_sessions, role, content, metadata JSON, created_at)
decisions (id, project_id → projects, decision_type, description, actor, metadata JSON, created_at)
model_selection_logs (id, request_id, intent, tier, mode, selected_model, provider, fallback_count, created_at)
github_connections (id, user_id, project_id, access_token_encrypted, repo_owner, repo_name, created_at)
github_evidence (id, project_id, evidence_type, title, description, triad_category, source_url, metadata JSON, created_at)
knowledge_artifacts (id, project_id, type, title, content, status, derivation_source, authority_level, version, created_at, updated_at)
knowledge_faq_entries (id, artifact_id, question, answer, category, created_at)
```

#### Governance Tables (migrations 007-011)
```sql
ccs_incidents (id, project_id, credential_type, phase, severity, description, created_at, resolved_at)
ccs_artifacts (id, incident_id, artifact_type, content, created_by, created_at)
ccs_verification_tests (id, incident_id, test_type, result, evidence, created_at)
data_classification (project_id → projects, pii, phi, financial, legal, minor_data, jurisdiction, regulations JSON, ai_exposure, updated_at)
ai_exposure_log (id, project_id, request_id, classification, exposure_level, redacted, authorized_by, created_at)
usage_tracking (id, user_id, period, request_count, token_count, cost_cents, trial_expires_at)
```

#### Path C + Path B Tables (migrations 012-013)
```sql
image_metadata (id, project_id, user_id, filename, content_type, size_bytes, r2_key, evidence_type, caption, created_at)
execution_layers (id, project_id, session_id, layer_number, title, description, status, expected_input, expected_output, actual_output, verification_method, verification_result, locked_at, created_at, updated_at)
```

#### Session Graph Tables (migration 014 — v4.4)
```sql
project_sessions (id, project_id → projects, session_number, session_type, status, phase, capsule_snapshot, summary, message_count, token_count, cost_usd, started_at, closed_at, created_by)
session_edges (id, from_session_id → project_sessions, to_session_id → project_sessions, edge_type, metadata, created_at)
-- session_type: DISCOVER, BRAINSTORM, BLUEPRINT, EXECUTE, AUDIT, VERIFY_LOCK
-- edge_type: CONTINUES, DERIVES, SUPERSEDES, FORKS, RECONCILES
-- status: ACTIVE, CLOSED, ARCHIVED
```

#### Blueprint Governance Tables (migration 016 — v4.5 L-BPX, L-IVL)
```sql
blueprint_scopes (id, project_id → projects, parent_scope_id → self, name, tier, purpose, boundary, assumptions JSON, assumption_status, inputs, outputs, notes, created_at, updated_at)
blueprint_deliverables (id, project_id → projects, scope_id → blueprint_scopes, name, description, dod_evidence_spec, dod_verification_method, dod_quality_bar, dod_failure_modes, status, created_at, updated_at)
blueprint_integrity_reports (id, project_id → projects, formula_check, structural_check, dag_check, deliverable_check, assumption_check, all_passed, totals JSON, issues JSON, run_at)
-- Integrity checks: formula (conservation law), structural (scopes→deliverables→DoD), DAG (acyclic), deliverable (100% coverage), assumption (all reviewed)
```

#### Workspace Binding Tables (migration 017 — Unified GA:ENV + GA:FLD)
```sql
workspace_bindings (id, project_id → projects UNIQUE, folder_name, folder_template, permission_level, scaffold_generated, github_connected, github_repo, binding_confirmed, bound_at, updated_at)
-- folder_template: 'web-app' | 'documentation' | 'general' | 'user-controlled'
-- permission_level: 'read' | 'readwrite'
-- Client-side folder handles persist in IndexedDB (fileSystem.ts); this table stores server-side metadata for gate auto-checks
```

#### Evidence + Messages FK Fixes (migrations 018-019)
```sql
-- migration 018: Added session_id to github_evidence for session attribution
-- migration 019: Rebuilt messages table — fixed broken FK (session_id was resolving to auth sessions instead of project_sessions)
```

#### Images FK Cascade Fix (migration 020)
```sql
-- migration 020: Rebuilt images table with ON DELETE CASCADE on project_id FK
-- Original migration 012 had FOREIGN KEY (project_id) REFERENCES projects(id) without CASCADE
-- This caused DELETE project to fail with FK constraint violation
```

#### Governance Enforcement Tables (inline migrations — Sessions 34-37)
```sql
-- Session 36: decision_ledger table — audit trail for governance transactions
decision_ledger (id INTEGER PRIMARY KEY AUTOINCREMENT, project_id TEXT NOT NULL,
                 action TEXT NOT NULL, phase_from TEXT, phase_to TEXT,
                 decided_by TEXT NOT NULL, gate_snapshot TEXT, artifact_snapshot TEXT,
                 decided_at TEXT NOT NULL,
                 FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE)
-- Index: idx_decision_ledger_project on project_id

-- Session 36: phase_locked column on project_state
-- ALTER TABLE project_state ADD COLUMN phase_locked TEXT DEFAULT '[]'
-- JSON array of finalized phases that cannot be re-entered

-- Session 37: project_type column on projects
-- ALTER TABLE projects ADD COLUMN project_type TEXT DEFAULT 'software'
-- Values: 'software', 'general', 'research', 'legal', 'personal'
```

#### Brainstorm Artifacts (migration 021 — HANDOFF-VD-CI-01, extended by 024 — GFB-01)
```sql
brainstorm_artifacts (id, project_id → projects, version, options JSON, assumptions JSON,
                      decision_criteria JSON, kill_conditions JSON, recommendation, generated_by,
                      status ['DRAFT'|'ACTIVE'|'FROZEN'|'HISTORICAL'|'SUPERSEDED'],
                      superseded_by TEXT, created_at, updated_at)
-- Indexes: idx_brainstorm_project_version, idx_brainstorm_project_status
-- State lifecycle: DRAFT → ACTIVE (on BRAINSTORM finalize) → FROZEN (on REVIEW finalize)
--                  HISTORICAL (natural version replacement), SUPERSEDED (REASSESS-driven)
```

#### Task Delegation Layer (migration 022 — HANDOFF-TDL-01)
```sql
task_assignments (id, project_id → projects, deliverable_id → blueprint_deliverables,
                  session_id → project_sessions, priority ['P0'|'P1'|'P2'], sort_order,
                  status ['BACKLOG'|'ASSIGNED'|'IN_PROGRESS'|'BLOCKED'|'SUBMITTED'|'ACCEPTED'|'REJECTED'|'PAUSED'],
                  authority_scope JSON, escalation_triggers JSON,
                  progress_notes, progress_percent, completed_items JSON, remaining_items JSON,
                  blocked_reason, blocked_since, submitted_at, submission_summary, submission_evidence JSON,
                  reviewed_at, reviewed_by, review_verdict, review_notes,
                  assigned_at, assigned_by, started_at, completed_at, updated_at)
escalation_log (id, project_id → projects, assignment_id → task_assignments,
                decision_needed, options JSON, recommendation, recommendation_rationale,
                status ['OPEN'|'RESOLVED'|'DEFERRED'], resolution, resolved_by, resolved_at, created_at)
standup_reports (id, project_id → projects, session_id → project_sessions,
                report_number, working_on, completed_since_last JSON, in_progress JSON,
                blocked JSON, next_actions JSON, estimate_to_completion,
                escalations_needed JSON, message_number, created_at)
-- Indexes: assignments (project, session, deliverable, status), escalations (assignment, status), standups (session)
```

#### Project Continuity Capsule (migration 023 — HANDOFF-PCC-01)
```sql
-- ALTER TABLE decision_ledger ADD COLUMN summary TEXT
-- ALTER TABLE decision_ledger ADD COLUMN supersedes_decision_id TEXT
continuity_pins (id, project_id → projects, pin_type ['decision'|'artifact'|'constraint'|'session'],
                 target_id, label, pinned_by, pinned_at)
-- UNIQUE(project_id, pin_type, target_id) — prevents duplicate pins
-- Index: idx_continuity_pins_project
```

#### Artifact State Class (migration 024 — HANDOFF-GFB-01 R3)
```sql
-- ALTER TABLE brainstorm_artifacts ADD COLUMN superseded_by TEXT DEFAULT NULL
-- Backfill: DRAFT → ACTIVE for projects past BRAINSTORM phase
```

#### REASSESS Protocol (migration 025 — HANDOFF-GFB-01 R6)
```sql
-- ALTER TABLE project_state ADD COLUMN reassess_count INTEGER DEFAULT 0
reassessment_log (id, project_id → projects, level [1|2|3], phase_from, phase_to,
                  reason, review_summary, artifact_impact, created_at)
-- Level 1: Surgical Fix (same kingdom, reason ≥ 20 chars)
-- Level 2: Major Pivot (cross kingdom, ACTIVE artifacts → SUPERSEDED)
-- Level 3: Fresh Start (3rd+ reassessment, review summary ≥ 50 chars)
-- Index: idx_reassessment_project
```

#### Schema Reconciliation (migrations 026-029 — Session 49)
```sql
-- migration 026: FK cascades on decisions, ghost table cleanup, missing columns
-- migration 027: FK cascades SET NULL on images, knowledge_artifacts, github_evidence
-- migration 028: conversations + conversation_messages tables (SYS-01)
-- migration 028b: Add name column to users table
-- migration 029: rate_limits table
```

#### Conservation Law + Phase Contracts (migrations 030-033 — CGC-01 Phase 1)
```sql
-- migration 030: conservation_law_tests — EXECUTION_TOTAL = VERIFIED_REALITY + FORMULA_EXECUTION
conservation_law_tests (id, project_id → projects, test_type, execution_total, verified_reality,
                        formula_execution, delta, passed, evidence JSON, created_at)
-- migration 031: phase_contract_validations — L-BRN, L-PLN, L-BPX, L-IVL enforcement
phase_contract_validations (id, project_id → projects, phase, law_code, validation_type,
                            passed, details JSON, validator_version, created_at)
-- migration 032: deliverable_numbering_map — Canonical D-number tracking
deliverable_numbering_map (id, project_id → projects, deliverable_id → blueprint_deliverables,
                           d_number, scope_path, canonical_name, created_at)
-- migration 033: Missing index/constraint fixes
```

#### Resource-Level Security (migration 034 — CGC-01 Phase 2 GAP-2/3)
```sql
security_classifications (id, project_id → projects, resource_type, resource_id,
                          classification ['PUBLIC'|'INTERNAL'|'CONFIDENTIAL'|'RESTRICTED'],
                          pii, phi, financial, minor_data, jurisdiction, regulations JSON,
                          ai_exposure_allowed, retention_days, classified_by, review_status, reviewed_by,
                          reviewed_at, created_at, updated_at)
secret_access_log (id, project_id → projects, secret_key, access_type ['READ'|'WRITE'|'ROTATE'|'DELETE'],
                   user_id, ip_address, user_agent, created_at)
-- Indexes: project+resource_type, project+resource_type+resource_id UNIQUE, project+classification
```

#### Worker-Auditor Multi-Agent Architecture (migrations 035-037 — CGC-01 Phase 3 GAP-1)
```sql
agent_instances (id, project_id → projects, agent_type ['SUPERVISOR'|'WORKER'|'AUDITOR'],
                 agent_key, model_provider, model_id, status ['INITIALIZING'|'ACTIVE'|'PAUSED'|
                 'WAITING_APPROVAL'|'EXECUTING'|'COMPLETED'|'FAILED'|'TERMINATED'],
                 checkpoint_state, tokens_used, wu_consumed, parent_agent_id → self, created_at, updated_at)
agent_tasks (id, project_id → projects, agent_id → agent_instances, supervisor_id → agent_instances,
             task_type [11 types], task_description, acceptance_criteria JSON, master_scope,
             dag_dependencies JSON, status [9 states], execution_mode ['AUTONOMOUS'|'USER_GUIDED'|'HYBRID'],
             worker_output, audit_report JSON, attempt_count, max_attempts, confidence_score,
             logic_score, procedural_score, validation_score, readiness_score,
             approved_by, approved_at, approval_feedback, created_at, updated_at)
agent_audit_log (id, project_id → projects, agent_id, task_id, event_type [23 types],
                 event_data, supervisor_id, worker_id, auditor_id,
                 human_actor_id, human_decision, human_feedback,
                 latency_ms, tokens_in, tokens_out, cost_usd, wu_delta,
                 security_classification, created_at)
-- Indexes: project, agent, task, event_type, created_at, human_actor
```

### 9.3 R2 Object Storage

| Field | Value |
|-------|-------|
| Bucket Name | aixord-images |
| Binding | `IMAGES` |
| Purpose | Image evidence storage (Path C / ENH-4) |
| Max File Size | 10 MB |
| Allowed Types | JPEG, PNG, GIF, WebP, SVG+XML |

---

## 10. API REFERENCE

### 10.1 Complete Endpoint Matrix (102 Endpoints)

| Category | Endpoint | Method | Status | Source |
|----------|----------|--------|--------|--------|
| **Router (4)** | /v1/router/health | GET | ✅ | index.ts |
| | /v1/router/models | GET | ✅ | index.ts |
| | /v1/router/execute | POST | ✅ | index.ts |
| | /v1/router/quote | POST | ✅ | index.ts |
| **Auth (9)** | /api/v1/auth/register | POST | ✅ | auth.ts |
| | /api/v1/auth/login | POST | ✅ | auth.ts |
| | /api/v1/auth/me | GET | ✅ | auth.ts |
| | /api/v1/auth/logout | POST | ✅ | auth.ts |
| | /api/v1/auth/verify-email | POST | ✅ | auth.ts |
| | /api/v1/auth/resend-verification | POST | ✅ | auth.ts |
| | /api/v1/auth/forgot-password | POST | ✅ | auth.ts |
| | /api/v1/auth/reset-password | POST | ✅ | auth.ts |
| | /api/v1/auth/recover-username | POST | ✅ | auth.ts |
| **Projects (5)** | /api/v1/projects | GET/POST | ✅ | projects.ts |
| | /api/v1/projects/:id | GET/PUT/DELETE | ✅ | projects.ts |
| **State (5)** | /api/v1/state/:projectId | GET/PUT | ✅ | state.ts |
| | /api/v1/state/:projectId/phase | PUT | ✅ | state.ts |
| | /api/v1/state/:projectId/gates/:id | PUT | ✅ | state.ts |
| | /api/v1/projects/:id/phases/:phase/finalize | POST | ✅ | state.ts |
| **Decisions (2)** | /api/v1/projects/:id/decisions | GET/POST | ✅ | decisions.ts |
| **Messages (4)** | /api/v1/projects/:id/messages | GET/POST/DELETE | ✅ | messages.ts |
| | /api/v1/projects/:id/messages/batch | POST | ✅ | messages.ts |
| **Billing (5)** | /v1/billing/webhook/stripe | POST | ✅ | index.ts |
| | /v1/billing/checkout | POST | ✅ | stripe.ts |
| | /v1/billing/portal | POST | ✅ | stripe.ts |
| | /v1/billing/activate/gumroad | POST | ✅ | gumroad.ts |
| | /v1/billing/activate/kdp | POST | ✅ | index.ts |
| **GitHub (5)** | /api/v1/github/connect | POST | ✅ | github.ts |
| | /api/v1/github/callback | GET | ✅ | github.ts |
| | /api/v1/github/status/:projectId | GET | ✅ | github.ts |
| | /api/v1/github/disconnect/:projectId | DELETE | ✅ | github.ts |
| | /api/v1/github/repos | GET | ✅ | github.ts |
| **Evidence (3)** | /api/v1/evidence/sync/:projectId | POST | ✅ | evidence.ts |
| | /api/v1/evidence/:projectId | GET | ✅ | evidence.ts |
| | /api/v1/evidence/:projectId/triad | GET | ✅ | evidence.ts |
| **Knowledge (7)** | /api/v1/projects/:id/knowledge | GET/POST | ✅ | knowledge.ts |
| | /api/v1/projects/:id/knowledge/:id | GET/PUT/DELETE | ✅ | knowledge.ts |
| | /api/v1/projects/:id/knowledge/:id/approve | POST | ✅ | knowledge.ts |
| | /api/v1/projects/:id/knowledge/generate-csr | POST | ✅ | knowledge.ts |
| **CCS (11)** | /api/v1/projects/:id/ccs/status | GET | ✅ | ccs.ts |
| | /api/v1/projects/:id/ccs/incidents | POST/GET | ✅ | ccs.ts |
| | /api/v1/projects/:id/ccs/incidents/:id | GET | ✅ | ccs.ts |
| | /api/v1/projects/:id/ccs/incidents/:id/phase | PUT | ✅ | ccs.ts |
| | /api/v1/projects/:id/ccs/incidents/:id/artifacts | POST/GET | ✅ | ccs.ts |
| | /api/v1/projects/:id/ccs/incidents/:id/verify | POST/GET | ✅ | ccs.ts |
| | /api/v1/projects/:id/ccs/incidents/:id/attest | POST | ✅ | ccs.ts |
| | /api/v1/projects/:id/ccs/incidents/:id/unlock | POST | ✅ | ccs.ts |
| **Security (3)** | /api/v1/projects/:id/data-classification | POST/GET/PUT | ✅ | security.ts |
| **Usage (2)** | /api/v1/usage | GET | ✅ | usage.ts |
| | /api/v1/usage/history | GET | ✅ | usage.ts |
| **Images (5)** | /api/v1/projects/:id/images | POST/GET | ✅ | images.ts |
| | /api/v1/projects/:id/images/:id | GET/DELETE | ✅ | images.ts |
| | /api/v1/projects/:id/images/:id/url | GET | ✅ | images.ts |
| **Layers (5)** | /api/v1/projects/:id/layers | POST/GET | ✅ | layers.ts |
| | /api/v1/projects/:id/layers/:id | GET/PUT | ✅ | layers.ts |
| | /api/v1/projects/:id/layers/:id/verify | POST | ✅ | layers.ts |
| **Sessions (6)** | /api/v1/projects/:id/sessions | POST/GET | ✅ | sessions.ts |
| | /api/v1/projects/:id/sessions/:id | GET/PUT | ✅ | sessions.ts |
| | /api/v1/projects/:id/sessions/:id/graph | GET | ✅ | sessions.ts |
| | /api/v1/projects/:id/sessions/:id/edges | POST | ✅ | sessions.ts |
| **Engineering (35)** | /api/v1/projects/:id/engineering/sar | POST/GET | ✅ | engineering.ts |
| | /api/v1/projects/:id/engineering/sar/:id | GET/PUT/DELETE | ✅ | engineering.ts |
| | /api/v1/projects/:id/engineering/contracts | POST/GET | ✅ | engineering.ts |
| | /api/v1/projects/:id/engineering/contracts/:id | GET/PUT/DELETE | ✅ | engineering.ts |
| | /api/v1/projects/:id/engineering/fitness | POST/GET | ✅ | engineering.ts |
| | /api/v1/projects/:id/engineering/fitness/:id | GET/PUT/DELETE | ✅ | engineering.ts |
| | /api/v1/projects/:id/engineering/tests | POST/GET | ✅ | engineering.ts |
| | /api/v1/projects/:id/engineering/tests/:id | GET/PUT/DELETE | ✅ | engineering.ts |
| | /api/v1/projects/:id/engineering/budget | POST/GET | ✅ | engineering.ts |
| | /api/v1/projects/:id/engineering/budget/:id | GET/PUT | ✅ | engineering.ts |
| | /api/v1/projects/:id/engineering/readiness | POST/GET | ✅ | engineering.ts |
| | /api/v1/projects/:id/engineering/readiness/:id | GET/PUT | ✅ | engineering.ts |
| | /api/v1/projects/:id/engineering/rollback | POST/GET | ✅ | engineering.ts |
| | /api/v1/projects/:id/engineering/rollback/:id | GET/PUT/DELETE | ✅ | engineering.ts |
| | /api/v1/projects/:id/engineering/alerts | POST/GET | ✅ | engineering.ts |
| | /api/v1/projects/:id/engineering/alerts/:id | GET/PUT/DELETE | ✅ | engineering.ts |
| | /api/v1/projects/:id/engineering/knowledge | POST/GET | ✅ | engineering.ts |
| | /api/v1/projects/:id/engineering/knowledge/:id | GET/PUT/DELETE | ✅ | engineering.ts |
| | /api/v1/projects/:id/engineering/compliance | GET | ✅ | engineering.ts |
| **Blueprint (12)** | /api/v1/projects/:id/blueprint/scopes | POST/GET | ✅ | blueprint.ts |
| | /api/v1/projects/:id/blueprint/scopes/:id | GET/PUT/DELETE | ✅ | blueprint.ts |
| | /api/v1/projects/:id/blueprint/deliverables | POST/GET | ✅ | blueprint.ts |
| | /api/v1/projects/:id/blueprint/deliverables/:id | GET/PUT/DELETE | ✅ | blueprint.ts |
| | /api/v1/projects/:id/blueprint/validate | POST | ✅ | blueprint.ts |
| | /api/v1/projects/:id/blueprint/integrity | GET | ✅ | blueprint.ts |
| | /api/v1/projects/:id/blueprint/dag | GET | ✅ | blueprint.ts |
| | /api/v1/projects/:id/blueprint/summary | GET | ✅ | blueprint.ts |
| **Workspace (4)** | /api/v1/projects/:id/workspace | GET/PUT/DELETE | ✅ | workspace.ts |
| | /api/v1/projects/:id/workspace/status | GET | ✅ | workspace.ts |
| **Brainstorm (4)** | /api/v1/projects/:id/brainstorm/artifacts | POST/GET | ✅ | brainstorm.ts |
| | /api/v1/projects/:id/brainstorm/validate | POST | ✅ | brainstorm.ts |
| | /api/v1/projects/:id/brainstorm/validation | GET | ✅ | brainstorm.ts |
| **Assignments (20)** | /api/v1/projects/:id/assignments | POST/GET | ✅ | assignments.ts |
| | /api/v1/projects/:id/assignments/batch | POST | ✅ | assignments.ts |
| | /api/v1/projects/:id/assignments/:id | GET/PUT/DELETE | ✅ | assignments.ts |
| | /api/v1/projects/:id/assignments/:id/start | POST | ✅ | assignments.ts |
| | /api/v1/projects/:id/assignments/:id/progress | POST | ✅ | assignments.ts |
| | /api/v1/projects/:id/assignments/:id/submit | POST | ✅ | assignments.ts |
| | /api/v1/projects/:id/assignments/:id/accept | POST | ✅ | assignments.ts |
| | /api/v1/projects/:id/assignments/:id/reject | POST | ✅ | assignments.ts |
| | /api/v1/projects/:id/assignments/:id/pause | POST | ✅ | assignments.ts |
| | /api/v1/projects/:id/assignments/:id/resume | POST | ✅ | assignments.ts |
| | /api/v1/projects/:id/assignments/:id/block | POST | ✅ | assignments.ts |
| | /api/v1/projects/:id/escalations | POST/GET | ✅ | assignments.ts |
| | /api/v1/projects/:id/escalations/:id/resolve | POST | ✅ | assignments.ts |
| | /api/v1/projects/:id/standups | POST/GET | ✅ | assignments.ts |
| | /api/v1/projects/:id/taskboard | GET | ✅ | assignments.ts |
| **Continuity (7)** | /api/v1/projects/:id/continuity | GET | ✅ | continuity.ts |
| | /api/v1/projects/:id/continuity/sessions/:sid | GET | ✅ | continuity.ts |
| | /api/v1/projects/:id/continuity/decisions | GET | ✅ | continuity.ts |
| | /api/v1/projects/:id/continuity/artifacts | GET | ✅ | continuity.ts |
| | /api/v1/projects/:id/continuity/pins | GET | ✅ | continuity.ts |
| | /api/v1/projects/:id/continuity/pins | POST | ✅ | continuity.ts |
| | /api/v1/projects/:id/continuity/pins/:pinId | DELETE | ✅ | continuity.ts |

### 10.2 Router Execute Contract

```typescript
// POST /v1/router/execute
Request: {
  product: 'AIXORD_COPILOT' | 'PMERIT_CHATBOT',
  intent: 'CHAT' | 'VERIFY' | 'EXTRACT' | 'CLASSIFY' | 'RAG_VERIFY' | 'BRAINSTORM' | 'SUMMARIZE' | 'IMPLEMENT' | 'AUDIT',
  mode: 'ECONOMY' | 'BALANCED' | 'PREMIUM',
  subscription: { tier, key_mode, user_api_key? },
  capsule: { objective, phase, constraints?, decisions?, open_questions?, session_graph? },
  delta: { user_input, selection_ids?, artifact_refs? },
  budget?: { max_cost_usd?, max_input_tokens?, max_output_tokens? },
  trace: { project_id, session_id, request_id, user_id }
}

Response (Backend): {
  status: 'OK' | 'BLOCKED' | 'RETRIED' | 'ERROR',  // Backend vocabulary
  content: string,
  model_used: { provider, model },
  usage: { input_tokens, output_tokens, cost_usd, latency_ms },
  verification?: { verdict: 'PASS'|'WARN'|'FAIL', flags: [] },
  error?: string
}
// Note: SDK maps OK/RETRIED → SUCCESS, BLOCKED → BLOCKED, else → ERROR
// Fix applied Session 17 (commit b0dc207)
```

---

## 11. AIXORD GATE IMPLEMENTATION

### 11.1 Gate Chain (per AIXORD v4.5)

```
Setup Gates (10 Steps):
LIC → DIS → TIR → ENV → FLD → CIT → CON → OBJ → RA → DC

Execution Gates:
FX → PD → PR → BP → MS → VA → HO

Security Gates (Integrated):
GS:DC (Setup) → GS:DP + GS:AC + GS:AI + GS:JR (Execute) → GS:RT (Lock)
```

### 11.2 D4-CHAT Gate UI Components

| Component | Gates Displayed | Status |
|-----------|-----------------|--------|
| GovernanceRibbon.tsx | All setup + work gates (phase stepper + pills) | ✅ Present |
| WorkspaceSetupWizard.tsx | GA:ENV + GA:FLD (3-step wizard) | ✅ Present |
| BlueprintPanel.tsx | GA:BP + GA:IVL (scopes, deliverables, validation) | ✅ Present |
| Project.tsx | Combined view (ribbon + wizard + panels) | ✅ Present |
| Settings.tsx | Subscription tier | ✅ Present |

### 11.3 Gate Enforcement Logic

```typescript
// Location: aixord-router-worker/src/api/state.ts
// Phase exit validation + gate auto-checks:

// GA:ENV auto-check: workspace binding must exist + be confirmed
// GA:FLD auto-check: workspace binding must have folder linked
// GA:BP auto-check: blueprint scopes > 0, deliverables > 0, all DoDs complete
// GA:IVL auto-check: latest integrity report has all_passed = 1

// Location: aixord-router-worker/src/routing/subscription.ts
async function validateSubscription(request, db) {
  // GA:LIC - License check (tier validation)
  // GA:TIR - Tier enforcement
  // Budget limits per tier
}
```

### 11.4 Hard Gate Enforcement (Session 35 — NEW)

**Principle:** AI models cannot be governed. Only AI execution can be governed. Governance lives outside the model — in the Router.

```typescript
// Location: aixord-router-worker/src/index.ts
// BEFORE any AI model call, check required gates per phase

const PHASE_REQUIRED_GATES: Record<string, string[]> = {
  BRAINSTORM: ['GA:LIC', 'GA:DIS', 'GA:TIR'],
  PLAN: ['GA:LIC', 'GA:DIS', 'GA:TIR', 'GA:ENV', 'GA:FLD'],
  EXECUTE: ['GA:LIC', 'GA:DIS', 'GA:TIR', 'GA:ENV', 'GA:FLD', 'GA:BP', 'GA:IVL'],
  REVIEW: ['GA:LIC', 'GA:DIS', 'GA:TIR', 'GA:ENV', 'GA:FLD', 'GA:BP', 'GA:IVL']
};

// If gates fail → return governance_block JSON (HTTP 200), AI model NEVER called
// Response: { type: 'governance_block', failed_gates: [...], phase, message }
```

**Frontend Handling:**
- `GovernanceBlockError` class in `sdk.ts` — thrown when governance_block detected
- `MessageBubble.tsx` renders governance block card (violet theme, shield icon)
- Block card shows failed gates with remediation actions and quick-action links

### 11.5 Gate Key Normalization (Session 35)

All gate keys use canonical `GA:` (setup) and `GW:` (work) prefix format. Legacy bare keys (`LIC`, `DIS`, `TIR`, etc.) eliminated from:
- Backend: `projects.ts` initialGates
- Frontend: `GateTracker.tsx`, `MiniBar.tsx`, `GovernanceRibbon.tsx`, `sdk.ts`
- Database: D1 migration normalized existing project_state rows

### 11.6 Security Gates Sync (Session 34)

Capsule security gates now enriched from authoritative `security_gates` DB table:
- `GET /state/:projectId` — merges DB security gates into capsule response
- `POST /v1/router/execute` — enriches request.capsule before routing
- Eliminates stale capsule data causing false gate failures

---

## 12. SECURITY & PRIVACY GOVERNANCE

### 12.1 Data Classification (SPG-01 — NEW in v4.3)

| Category | AI Exposure Default | D4-CHAT Status |
|----------|---------------------|----------------|
| PII | CONFIDENTIAL | ⏳ Pending implementation |
| PHI | RESTRICTED | ⏳ Pending implementation |
| Financial | CONFIDENTIAL | ⏳ Pending implementation |
| Legal | RESTRICTED | ⏳ Pending implementation |
| Minor Data | RESTRICTED | ⏳ Pending implementation |

### 12.2 AI Exposure Classification

| Classification | AI Exposure | D4-CHAT Handling |
|----------------|-------------|------------------|
| PUBLIC | Full content allowed | ✅ Default |
| INTERNAL | Content allowed; results may log | ⏳ Pending |
| CONFIDENTIAL | Redacted/masked only | ⏳ Pending |
| RESTRICTED | DIR authorization required | ⏳ Pending |
| PROHIBITED | No AI exposure ever | ⏳ Pending |

### 12.3 Compliance Requirements

Per L-SPG7, regulatory obligations are governance CONSTRAINTS:

| Regulation | Applicability | D4-CHAT Status |
|------------|---------------|----------------|
| GDPR | EU users | ⏳ Data subject rights |
| CCPA | California users | ⏳ Privacy policy |
| HIPAA | PHI handling | ⏳ Not applicable yet |

### 12.4 Engineering Governance Alignment (Part XIV — NEW v4.5)

Part XIV (§64–69) governs **how the system being built is technically sound, integratable, iterable, and operable**. It adds no new gates, phases, or authority changes — but extends Blueprint acceptance criteria (§10.9.11) and AUDIT→VERIFY→LOCK criteria (§10.13.10) for STANDARD and COMPLEX task classes.

#### 12.4.1 Current Task Classification

D4-CHAT is classified as **COMPLEX** (multi-component, multi-provider, persistent state, API boundaries, deployed production system). Part XIV requirements are **mandatory**.

#### 12.4.2 Architectural Decision Governance (§64) Status

> **Session 22 Update:** Full CRUD infrastructure implemented — 9 tables, 35 API endpoints, frontend UI (Engineering tab + ribbon + panel). All items below updated to reflect deployed status.

| Requirement | D4-CHAT Status | Evidence |
|-------------|----------------|----------|
| System Architecture Record (SAR) | ✅ **IMPLEMENTED** | `system_architecture_records` table + CRUD API + UI (Session 22). 7 SAR elements as governed artifact |
| Component Map | ✅ Documented | §7 Directory Structure (Router Worker, WebApp UI, D1, R2) |
| Interface Contracts | ✅ **IMPLEMENTED** | `interface_contracts` table + CRUD API + UI (Session 22). Producer/consumer/contract_type/idempotency |
| Data Flow | ⏳ Not formalized | Data flows exist in implementation but not declared as governed artifact |
| State Ownership | ✅ Implicit | D1 database owns state; R2 owns images; client owns session state |
| Data Model Governance (§64.5) | ✅ Partial | §9 Database Architecture documents schema; migration strategy via numbered migrations (15 migrations) |
| Fitness Functions (§64.6) | ✅ **IMPLEMENTED** | `fitness_functions` table + CRUD API + UI (Session 22). Dimension/target/threshold/status tracking |

#### 12.4.3 Integration Verification (§65) Status

| Requirement | D4-CHAT Status | Notes |
|-------------|----------------|-------|
| Unit verification | ✅ Partial | Vitest configured; individual endpoints tested |
| Integration verification | ✅ **IMPLEMENTED** | `integration_tests` table + CRUD API + UI (Session 22). 4 levels: UNIT/INTEGRATION/SYSTEM/ACCEPTANCE |
| System verification | ✅ **IMPLEMENTED** | `integration_tests` table supports SYSTEM level test records with result tracking |
| Acceptance verification | ✅ **IMPLEMENTED** | `integration_tests` table supports ACCEPTANCE level; scope/criteria/result fields |

#### 12.4.4 Iteration Protocols (§66) Status

| Requirement | D4-CHAT Status | Notes |
|-------------|----------------|-------|
| Iteration budget | ✅ **IMPLEMENTED** | `iteration_budget` table + CRUD API + UI (Session 22). Scope/budgeted/actual/status tracking |
| Iteration log | ✅ Implicit + Governed | Session history (§14) + `iteration_budget` table tracks iterations per scope |
| Governed re-entry | ⏳ Not formalized | Phase changes occur but without Part XIV governance protocol |

#### 12.4.5 Operational Readiness (§67) Status

| Requirement | D4-CHAT Status | Level |
|-------------|----------------|-------|
| **Declared Level** | **L2 (Governed)** — deployed, health endpoint, alerting + readiness framework | Target: L3 |
| Deployment method | ✅ Documented | §17.3 Deployment Commands (Wrangler deploy) |
| Rollback strategy | ✅ **IMPLEMENTED** | `rollback_strategies` table + CRUD API + UI (Session 22). Component/method/recovery_time/prerequisites |
| Health endpoint | ✅ Exists | `/v1/router/health` |
| Logging strategy | ✅ **Structured** | JSON-structured error logging via `errorTracker.ts` (wrangler tail compatible) |
| Error reporting | ✅ **Implemented** | `app.onError()` handler + `ErrorBoundary.tsx` structured reporting |
| System documentation | ✅ This document | Project plan serves as system documentation |
| Dependency inventory | ✅ Partial | package.json exists; no formal update strategy |
| Alerting | ✅ **IMPLEMENTED** | `alert_configurations` table + CRUD API + UI (Session 22). SEV1-4 severity, conditions, notification channels |
| Incident response | ⏳ Not documented | CCS handles credential incidents; no general incident framework |
| Knowledge transfer | ✅ **IMPLEMENTED** | `knowledge_transfers` table + CRUD API + UI (Session 22). Type/status/assignee/audience tracking |
| Operational Readiness | ✅ **IMPLEMENTED** | `operational_readiness` table + CRUD API + UI (Session 22). L0-L3 checklists per component |

#### 12.4.6 Part XIV Roadmap Items

| Priority | Item | Part XIV Reference | Status |
|----------|------|--------------------|--------|
| P2 | Formalize SAR as governed artifact | §64.3 | ✅ **IMPLEMENTED** (Session 22) |
| P2 | Define interface contracts for all API boundaries | §64.4 | ✅ **IMPLEMENTED** (Session 22) |
| P3 | Define architectural fitness functions | §64.6 | ✅ **IMPLEMENTED** (Session 22) |
| P2 | Implement integration test framework | §65.3 | ✅ **IMPLEMENTED** (Session 22) |
| P3 | Define iteration budget for remaining work | §66.5 | ✅ **IMPLEMENTED** (Session 22) |
| P2 | Document rollback strategy | §67.3 | ✅ **IMPLEMENTED** (Session 22) |
| P2 | Configure alerting for critical failures | §67.4 | ✅ **IMPLEMENTED** (Session 22) |
| P3 | Create operational readiness checklist | §67.7 | ✅ **IMPLEMENTED** (Session 22) |
| P3 | Produce knowledge transfer artifact | §67.6 | ✅ **IMPLEMENTED** (Session 22) |

**All 9 Part XIV roadmap items closed in Session 22. Full-stack CRUD infrastructure deployed.**

---

## 13. DEVELOPMENT ISSUES

### 13.1 Fixed Issues

| Session | Issue | Root Cause | Fix | Status |
|---------|-------|------------|-----|--------|
| 4 | Login returns 404 | No auth endpoints | Added backend APIs | ✅ |
| 4 | Auth response mismatch | Response structure | Fixed api.ts parsing | ✅ |
| 4 | Column mismatches | snake_case vs camelCase | Transform functions | ✅ |
| Post-4 | Invalid Date display | Date parsing | normalizeDate() | ✅ |
| Post-4 | White screen on create | Navigation method | React Router | ✅ |
| 5 | No usage stats | Missing aggregation | UsageStatsPanel | ✅ |
| 29 | Messages 500 error | Undeployed worker + broken FK | Deploy + migration 019 | ✅ |
| 30 | TRIAL users forced BYOK | TRIAL in BYOK_REQUIRED_TIERS | Removed from BYOK list | ✅ |
| 31 | UAT: governance prompt, empty state, UX | Multiple frontend issues | NLP file detection, UI fixes | ✅ |
| 32 | DELETE project 500 | images FK missing CASCADE + no try/catch | Migration 020 + batch DELETE | ✅ |
| 33 | GitHub OAuth callback 401 | `requireAuth` blocked `/callback` | Exempt callback from auth middleware | ✅ |
| 33 | DELETE project 500 (still) | Missing tables in batch (artifacts, state) | Added all FK-referencing tables | ✅ |
| 26b | DELETE project 500 (still) | `scope_id` column doesn't exist in `blueprint_integrity_reports` | Changed to `project_id` | ✅ |
| 49 | 11 TypeScript errors (backend) | zod not installed but imported; unsafe D1 casts; missing AuthContext export; Hono status code types | Rewrote validateBody.ts + schemas/common.ts without zod; fixed casts in layers.ts, security.ts, index.ts, subscription.ts | ✅ |
| 49 | Stale ChatWindow export | ChatWindow moved to `_orphaned/` but still in chat/index.ts barrel | Removed stale export | ✅ |
| 49 | DB migration 027 column mismatch | Live knowledge_artifacts has 19 cols, migration expected 10 | Adapted migration to match live schema | ✅ |
| 49 | DB migration 027 github_evidence mismatch | Live table has 17 cols, migration expected 9 | Adapted migration to match live schema | ✅ |

### 13.2 Known Issues

| # | Issue | Impact | Priority | Status |
|---|-------|--------|----------|--------|
| 1 | ~~Chat UI not connected to Router~~ | Core feature | HIGH | ✅ RESOLVED (Session 7+) |
| 2 | ~~State not initialized on create~~ | UX friction | MEDIUM | ✅ RESOLVED (Session 6+) |
| 3 | ~~AIXORD v4.3 gates not implemented~~ | Compliance | MEDIUM | ✅ RESOLVED (Session 10) |
| 4 | ~~Data classification UI missing~~ | Security | MEDIUM | ✅ RESOLVED (Session 7+) |

**All critical issues resolved as of Session 10.**

### 13.3 Technical Debt

| Item | Description | Remediation |
|------|-------------|-------------|
| ~~SDK not used~~ | ~~Direct API calls~~ | ~~Integrate D3 SDK~~ ✅ RESOLVED (Session 13) |
| ~~Mock tasks~~ | ~~Dashboard mock data~~ | ~~Implement task system~~ ✅ RESOLVED (Session 42 — TDL) |
| Local settings | Not persisted | Backend storage |
| Dependabot branches stale | 4 branches on old main | Close stale router-worker multi; review 3 minor bumps |

### 13.4 Backlog Items

| ID | Title | Source | Priority | Status |
|----|-------|--------|----------|--------|
| UI-GOV-001 | Differentiate phase indicators from gate checkpoints in UI | HO-BASELINE-UPDATE-01, PATCH-UI-GOVERNANCE-01 | P2 | OPEN |

**UI-GOV-001 Detail:**
- **Requirement:** Gates must be visually distinct from phases.
  - Gates: prominent, blocking (red/green status, requires action)
  - Phases: informational, non-blocking (breadcrumb or progress indicator)
- **Doctrine Reference:** AIXORD Baseline §10.11.5.5 — Authority Clarity Doctrine ("Phase != Authority", "Gates Grant Permission")

---

## 14. SESSION HISTORY SUMMARY

### 14.1 Session Timeline

| Session | Date | Focus | Outcome |
|---------|------|-------|---------|
| 0_* | 01/29 | Initial concept | Blueprint foundation |
| 1_* | 01/30 | Router implementation | Providers configured |
| 2_* | 01/30 | Frontend completion | Build errors resolved |
| 3_* | 01/31 | Login bug discovery | Root cause identified |
| 4_* | 01/31 | **Backend enablement** | Auth/Projects working |
| **5_*** | **02/01** | **Usage Stats + AIXORD v4.3** | **Patches applied, audit complete** |
| **6_*** | **02/01** | **HANDOFF-D4-WORKSPACE implementation** | **D1-D6 delivered, components created** |
| **7_*** | **02/01** | **Component integration + Local File System** | **DecisionLog/ActivityLog integrated, File System Access API** |
| **8_*** | **02/01** | **HANDOFF-D4-RECTIFICATION + PATCH-MOD-01** | **Filename fixes, Multi-Model Governance deployed** |
| **9_*** | **02/01** | **Disclaimer Gate + Auth Fix + PATCH-GITHUB-01 FULL** | **GA:DIS, auth persistence, G1-G8 GitHub Evidence ALL COMPLETE** |
| **10_*** | **02/01** | **GKDL-01 + CORS + D5 Sync + GateTracker** | **Knowledge API+UI, aixord.pmerit.com domain, GateTracker v4.3 (17 gates)** |
| **11_*** | **02/02** | **UX Error Guidance + Docs** | **H2 implemented, H3 documentation pages** |
| **12_*** | **02/02** | **Stripe Price IDs + Session continuation** | **Real price IDs, audit continuation** |
| **13_*** | **02/02** | **SPG-01 Backend + D3 SDK Integration** | **security.ts API, migration 009, SDK client (sdk.ts), chat governance binding** |
| **14_*** | **02/03** | **Live debugging marathon — Auth, BYOK, Phase, Model fixes** | **D-003, D-010, D-013, D-011 resolved. Chat functional with known BYOK/status fixes pending** |
| **15_*** | **02/04** | **Path C approved — Image/Evidence Foundation** | **Strategic paths defined (A/B/C), Path B+C approved, HANDOFF produced** |
| **16_*** | **02/04** | **Status mismatch fix (cutoff mid-session)** | **DEF-01 fix started, session ran out of context** |
| **17_*** | **02/04** | **Commander GAP/Defect Report** | **DEF-01/02 fixed (chat working), IGAP-01/02 + DGAP-01-08 identified, 6 commits pushed** |
| **18_*** | **02/04** | **Archive + Path C execution** | **Consolidated ref v2.0, 33 files archived, Path C D4/D5 docs, D1-D3 code** |
| **18a_*** | **02/04** | **Path C Corrective (3 fixes)** | **Image display blob URLs, AI vision base64 multimodal, GitHub Connect gate removal** |
| **18b_*** | **02/04** | **Path B Phase 1 — Proactive Debugging** | **execution_layers table (013), Layer CRUD API (12 endpoints), LayerProgressPanel, CheckpointModal, useLayers hook, AI system prompt mods, I/O Sanitization** |
| **18c_*** | **02/04** | **Ribbon UI Refactor** | **TabBar, Ribbon, StatusBar, GovernanceRibbon, InfoRibbon, EvidenceRibbon — Project.tsx rewritten to ribbon layout** |
| **18d_*** | **02/04** | **Sidebar Active Indicator** | **Purple left border accent + background tint on active nav item** |
| **19_*** | **02/05** | **Document audit, reconciliation plan, & implementation** | **Audited PROJECT_PLAN, BASELINE, COMPACT_CORE — corrections applied. Created RECONCILIATION_PLAN. Implemented P1 (content redaction, DoD gate), P2 (OpenAI+Google vision), P3 (Activity page, Analytics page, migration 010 consolidation). 6 divergences → 0.** |
| **20_*** | **02/06** | **Session Graph Model (AIXORD v4.4)** | **UI scrolling UX improvements (recovered ~140px), hamburger nav dropdown, Session Graph Model: 5-phase implementation (DB migration 014, sessions API 6 endpoints, NewSessionModal, SessionList, useSessions hook, capsule enrichment). Deployed backend + frontend.** |
| **21_*** | **02/07** | **AIXORD v4.5 Baseline Alignment** | **Part XIV Engineering Governance drafted (§64-69), integrated into baseline v4.5, compact core v4.5-C updated, project plan aligned (v2.6→v2.7)** |
| **22_*** | **02/07** | **Part XIV Full-Stack Implementation** | **9 DB tables (migration 015), 35 API endpoints (engineering.ts), frontend types/API client/hook, Engineering tab + EngineeringRibbon + EngineeringPanel, GA:ENG non-blocking gate. All 9 roadmap items CLOSED. Compliance ~85%→~97%.** |
| **23_*** | **02/07** | **D7-D16 Feature Sprint** | **CollapsibleSection, Progressive Disclosure (assistanceMode), Clipboard Image Paste, Session Metrics (endpoint+UI), Prompt Caching (Anthropic+OpenAI), GitHub OAuth Fix, Project Metrics endpoint.** |
| **24_*** | **02/07** | **Backend/Frontend Bridge Sprint** | **SecurityRibbon (new), CCS incident creation, Engineering CRUD (create/delete 9 areas), SessionGraph visualization, GitHub repo selection, image management, evidence sync, clear messages, project edit, project metrics UI in Analytics. All unused API methods wired.** |
| **25_*** | **02/07** | **Tier 1 Phase Exit Enforcement** | **Phase transitions now contractual: backend validates gate requirements before allowing forward transitions (403 + missingGates). Frontend shows blocked phases (dimmed, red dot, tooltip). Fixed 14 TS errors from Session 24. Deployed backend + frontend.** |
| **26_*** | **02/07** | **Blueprint Governance (L-BPX, L-IVL)** | **Full post-blueprint implementation: migration 016 (3 tables, 6 indexes), blueprint.ts API (12 endpoints), BlueprintPanel.tsx (CRUD scopes/deliverables/validation/DAG), BlueprintRibbon.tsx, useBlueprint hook. GA:BP + GA:IVL gate auto-checks. PLAN exit now requires GA:BP + GA:IVL.** |
| **27_*** | **02/07** | **Session 18 Strategic Alignment Review** | **Reviewed Architect Session 18 for D4-CHAT alignment. Identified 7 action items. Resolved baseline Part VI doctrinal conflict (chatbot-era → D4-CHAT enforcement platform). Approved unified GA:ENV workspace binding design.** |
| **28_*** | **02/07** | **Unified GA:ENV Workspace Binding** | **3-step wizard (Local Workspace → GitHub → Confirmation). migration 017 (workspace_bindings table), workspace.ts API (4 endpoints), workspaceTemplates.ts (4 templates), scaffoldGenerator.ts (recursive writer activating createDirectory/createFile), WorkspaceSetupWizard.tsx. GA:ENV/GA:FLD gate auto-checks. GovernanceRibbon violet pills with gear icon.** |
| **29_*** | **02/07** | **Capsule Enrichment + Evidence Session Tagging** | **Capsule workspace context (bound/folder/template/permissions/github flows through sdk→router→AI prompt). Evidence session attribution (migration 018 — session_id column + index on github_evidence, sync pipeline passes session_id). Capsule lineage enrichment (messageCount per prior session, summary truncation at 200 chars, fallback text for null summaries). Git housekeeping (Session 23 commit pushed).** |
| **30_*** | **02/07** | **Platform Key Enablement + Messages FK Fix** | **TRIAL users now use platform-provided API keys (no BYOK setup required). Fixed messages table FK constraint (migration 019 — rebuild without broken session_id FK to wrong table). JSON parse resilience (api.ts request() + routerApi.execute()). Backend deployed missing worker. Pricing page updated (TRIAL shows "Platform API keys included" + "14-day trial period"). 3 backend files + 2 frontend files changed.** |
| **31_*** | **02/07** | **UAT P0 Fixes (Governance Prompt, Empty State, UX)** | **NLP file reference detection (P0-3), governance prompt fix, empty state improvements, multiple UX fixes. 2 commits (a759a6f, 74384d8).** |
| **32_*** | **02/08** | **DELETE Project Cascade Fix** | **images table FK missing ON DELETE CASCADE — migration 020 rebuilds table. DELETE endpoint rewritten with batch child table deletion (29 statements) + try/catch error handling. Commit b482997.** |
| **33_*** | **02/08** | **GitHub OAuth 401 + DELETE Cascade Completion** | **OAuth callback: exempted GET /callback from requireAuth middleware (GitHub redirect has no Bearer token). DELETE: added 4 missing tables (artifacts, state, ccs_artifacts, ccs_verification_tests). Session edges expanded to cover to_session_id. Commit 3469731.** |
| **26b_*** | **02/08** | **DELETE Cascade scope_id Column Fix** | **Root cause: blueprint_integrity_reports uses project_id NOT scope_id. Fixed column references + simplified blueprint_deliverables to direct project_id. Both GitHub OAuth and DELETE project confirmed working. Commit 70709e0.** |
| **34_*** | **02/09** | **Dependabot + Security Gates Sync + Gate Refresh** | **Dependabot fix: wrangler 3→4, vitest 1→4, 7 vulns → 0 (65d63d6). Security_gates capsule sync from DB (a8b9aba). Delayed 2.5s gate re-eval after message send (f53fde6). All deployed.** |
| **35_*** | **02/09** | **Gate Key Normalization + Hard Gate Enforcement** | **All gate keys normalized to GA:/GW: prefix — bare keys eliminated from codebase + D1 migration (693e4af). Hard gate enforcement: PHASE_REQUIRED_GATES blocks AI model call when governance gates fail, GovernanceBlockError in SDK, violet block card in MessageBubble (da3f5d2).** |
| **36_*** | **02/09** | **Phase Awareness Payload + Finalize Phase Transaction** | **Phase Awareness Payloads replace governance prose (~40% token reduction) — role/allowed/forbidden/exit_artifact per phase (3df14ed). Finalize Phase: POST /phases/:phase/finalize with authority check, gate validation, artifact validation, decision_ledger logging, phase locking (8435974).** |
| **37_*** | **02/09** | **Non-Software Project Types** | **project_type column (software/general/research/legal/personal). Non-software: auto-pass GA:BP/GA:IVL/GW:QA/GW:DEP, hidden Blueprint/Security/Engineering tabs, adapted AI system prompt (010fb9a).** |
| **38_*** | **02/09** | **Director Review Packet** | **AI required to present structured Review Packet (summary, questions, adjustments, transition prompt) before suggesting phase advance. Activated dead review_prompt field from PHASE_PAYLOADS (e87299d).** |
| **39_*** | **02/09** | **Context Awareness Bridge (HANDOFF-PR-01)** | **_context_awareness on RouterRequest — Tier 1A (security gates visibility), 1B (redaction awareness), 1C (data classification), 2D (evidence context for EXECUTE/REVIEW), 2F (CCS incident awareness). AI can explain/warn/guide without authority (6a57536).** |
| **40_*** | **02/09** | **Brainstorm Validation Engine (HANDOFF-VD-CI-01 A1+A2)** | **brainstorm_artifacts table (migration 021), brainstorm.ts API (4 endpoints), validation engine (5 BLOCK + 4 WARN checks), state.ts finalize integration, frontend artifact extraction + display badge. Commit d18212c.** |
| **41_*** | **02/09** | **Task Delegation Layer — Backend (HANDOFF-TDL-01 Tasks 1-2)** | **task_assignments + escalation_log + standup_reports tables (migration 022, 7 indexes), assignments.ts API (20 endpoints: CRUD, lifecycle, escalation, standup, task board). DAG enforcement, decision ledger logging, Conservation Law compliance. Commit 1750a9f.** |
| **42_*** | **02/09** | **Task Delegation Layer — Full-Stack (HANDOFF-TDL-01 Tasks 3-7)** | **EXECUTE phase payload rewritten with TDL rules, work order injection (active assignments in AI prompt), structured output format (PROGRESS/SUBMISSION/ESCALATION/STANDUP blocks), context enrichment pipeline (Tier 3: task_delegation queries). Frontend: assignmentsApi (api.ts), useAssignments hook, TaskBoard.tsx (kanban), EscalationBanner.tsx, StandupCard.tsx, MessageBubble block parsing, Tasks tab in TabBar, Project.tsx wiring. Commit 5d0bff8.** |
| **43_*** | **02/09** | **Phase Validators + Warning Override + Integration Tests (VD-CI-01 A3+A4, TDL-01 Task 8)** | **Strengthened phase validators: PLAN P4-P6 (scope boundaries, deliverables DoD, orphan check), EXECUTE E1-E4 (messages, assignments resolved, deliverables accepted, submission evidence), REVIEW R1-R2 (review activity, review summary). Three-way finalize response (REJECTED/WARNINGS/APPROVED). Quality warning override mechanism: backend QUALITY_OVERRIDE audit trail in decision_ledger, frontend modal with required reason. Integration test suite: 77 tests across 3 files (phase-validators 23, warning-override 12, tdl-lifecycle 42) via Vitest. Deployed backend + frontend.** |
| **44_*** | **02/09** | **Project Continuity Capsule — Full-Stack (HANDOFF-PCC-01)** | **Migration 023 (continuity_pins table, decision_ledger summary+supersedes columns). continuity.ts API (7 endpoints: computed capsule from 14 queries, session detail, decisions, artifacts, pins CRUD). getProjectContinuityCompact() for ≤500-token system prompt injection. Router Tier 4 context pipeline. Prompt rendering: === PROJECT CONTINUITY === block + CONTINUITY CONFLICT detection rule in fallback.ts. Frontend: continuityApi (api.ts), useContinuity hook, ProjectMemoryPanel.tsx (progress, timeline, decisions, pins, escalations), Memory tab in TabBar, RETRIEVE + CONTINUITY CONFLICT block parsing in MessageBubble. Deployed backend + frontend.** |
| **45_*** | **02/10** | **Phase Transition Experience (HANDOFF-PTX-01)** | **Brainstorm artifact save prompt: after artifact save, shimmer-bordered "AI built your Brainstorm Artifact" panel with Finalize button. Readiness-based finalize prompt (BQL-01 Layer 2c): readiness indicator with per-dimension pills (✓/⚠/✗), "Ask AI to improve" button when not ready. Frontend-only change in Project.tsx. Deployed.** |
| **46_*** | **02/10** | **Brainstorm Quality Loop (HANDOFF-BQL-01)** | **Layer 1: Quality requirements block in BRAINSTORM phase payload (fallback.ts). Layer 2a: computeBrainstormReadiness() function + GET /readiness endpoint (brainstorm.ts). Layer 2b: Tier 5B readiness in system prompt (index.ts + fallback.ts). Layer 2c: Frontend readiness indicator + "Ask AI to improve" button (Project.tsx). Layer 2d: Warning modal enhancement with "Ask AI to Fix" purple button (Project.tsx). Deployed backend + frontend.** |
| **47_*** | **02/10** | **Governance Foundation Bridging (HANDOFF-GFB-01)** | **Task 2 (R3): Artifact State Class — migration 024 (superseded_by column + backfill), BRAINSTORM finalize DRAFT→ACTIVE, REVIEW finalize ACTIVE→FROZEN, new artifact marks previous HISTORICAL, Tier 5 state display. Task 1 (R2): Fitness Blocking — WARN policy on EXECUTE finalize, failing dimensions in warnChecks, Tier 6B quality dimensions advisory. Task 3 (R6): REASSESS Protocol — migration 025 (reassess_count + reassessment_log table), 3-level friction (L1 Surgical, L2 Major Pivot, L3 Fresh Start), frontend modal with level-aware UI (color-coded, character counters, artifact impact warnings), Tier 6C reassessment history. Commit 45bbd8b. Deployed backend + frontend.** |
| **48_*** | **02/10** | **Diagnostic + Prompt Fixes (HANDOFF-DPF-01)** | **Task 1 (P0): Cold-start null guards — Tiers 1C/2D/2F/3 wrapped in try/catch to prevent INTERNAL_ERROR on new projects. Task 2 (P1): PTX-01 timing gap — 200ms retry on Tier 5 artifact query when messageCount > 5. Task 3: Interaction SOP — INTERACTION RULES block in system prompt preventing AI from delegating governance assessment + Finalize action directive replacing review_prompt. Task 4: Phase Output Contracts — PHASE_OUTPUT_CONTRACTS map with structured output rules for all 4 phases (BRAINSTORM/PLAN/EXECUTE/REVIEW). Task 5: GFB-01 verification — confirmed readiness endpoint null handling + REASSESS artifact lifecycle. Commit d0b14ec. Deployed backend + frontend.** |
| **49_*** | **02/12** | **Infrastructure Sync + DB Migrations + SYS-02 E2E Tests** | **Merged 2 Copilot agent PRs (#5 D4-CHAT Project Plan v9.0, #6 manuscript fixes) via GitHub GraphQL API (draft→ready→squash merge). Fixed 11 backend TS errors: rewrote validateBody.ts + schemas/common.ts to remove zod dependency, fixed D1 unsafe casts in layers.ts/security.ts/index.ts/subscription.ts. Fixed stale ChatWindow barrel export. Commit 6754a13 (71 files, +8003/-460). Ran all 5 D1 migrations (026-029) on aixord-db — adapted 027 to match live schemas (19-col knowledge_artifacts, 17-col github_evidence). New tables: conversations, conversation_messages, rate_limits. New column: users.name. Created SYS-02 execution layer E2E test suite (59 tests: state machine transitions, sequential enforcement, single-active constraint, deletion/modification rules, verification, retry mechanics, batch creation). Full test suite: 141/141 passing across 5 files. Reviewed 4 Dependabot branches (router-worker multi is stale, 3 minor bumps on secondary products).** |
| **52_*** | **02/15** | **Security Audit Remediation (HANDOFF-COPILOT-AUDIT-01)** | **GitHub Copilot security audit triage: 16 findings → 8 fixed, 7 accepted, 1 deferred. Created shared crypto module (utils/crypto.ts — AES-GCM, SHA-256, PBKDF2). PBKDF2 password hashing (100K iterations, per-user 16-byte salt, transparent SHA-256→PBKDF2 migration on login). Session token hashing (SHA-256 one-way hash stored in token_hash, plaintext fallback + backfill for 7-day migration window). API key encryption at rest (AES-256-GCM with random IV, transparent plaintext→encrypted migration). Server-side logout endpoint wired to frontend. CSP + 5 security response headers via Cloudflare Pages `_headers` file. X-Request-ID correlation middleware (UUID per request). Frontend regex alignment for API key validation. CORS dynamic origin callback for Pages preview deployments (*.aixord-webapp-ui.pages.dev). Migrations 038-039 applied to production D1. 161/163 tests passing (2 pre-existing rateLimit failures). Commits 583898a, f8e05d9, c3e4515 on deploy/gap-closure-cgc-01, merged to main. Worker deployed (f1da8c91), Pages deployed (b026d3d8). Full E2E verification: registration, login, /auth/me, API key save+retrieve+decrypt, logout+invalidation, security headers, X-Request-ID — all confirmed via live production testing.** |
| **53_*** | **02/15** | **Second Audit Remediation + Error Tracking + Unit Tests** | **Resolved 5 outstanding items: 7 Dependabot vulnerabilities fixed (npm audit fix on MCP server + companion), 2 pre-existing rateLimit test failures fixed (mock DB updated for atomic upsert pattern), stale deploy branch deleted, backup SQL files cleaned up + .gitignore rule, package-lock staged. Commit 83da227. Validated Second D4-CHAT Platform Audit Report: 11 GAPs evaluated → 8 accurate, 3 incorrect (vision TODOs already implemented, GA:DIS/GA:CIT already implemented). Cleaned up stale doc references that led to incorrect findings. Added LEGACY_TOKEN_DEADLINE (2026-03-15) to requireAuth.ts + auth.ts — plaintext token fallback auto-disables after deadline. Created errorTracker.ts (structured JSON error logging for wrangler tail), integrated app.onError() handler in index.ts, added structured error reporting in ErrorBoundary.tsx. Created 30 new unit tests: crypto.test.ts (18 — AES-GCM roundtrip, SHA-256, PBKDF2 verify), errorTracker.test.ts (7 — structured output, context metadata, stack truncation), requireAuth.test.ts (5 — token auth, legacy fallback, backfill). Total test suite: 193/193 passing across 9 test files. Commits 83da227 + 98bbf72 pushed to main.** |

### 14.2 Key Learnings (Aligned with L-GCP)

1. **Audit before claiming completion** — L-GCP1 Reconciliation Triad
2. **Test E2E, not just code existence** — L-GCP4 Verification + Validation
3. **Schema-code alignment critical** — Column name consistency
4. **Response structure matters** — API contract adherence
5. **Sessions are temporary, artifacts endure** — L-SSC1

---

## 15. RELATED ASSETS & DOCUMENTATION

### 15.1 Governance Documents (AIXORD v4.5)

| Document | Version | Purpose |
|----------|---------|---------|
| AIXORD_OFFICIAL_ACCEPTABLE_BASELINE_v4_5.md | **v4.5** | Full governance rules (Parts I–XIV, 29 gates, 9 phases) |
| AIXORD_v4_5_COMPACT_CORE.md | **v4.5-C** | Compact reference (~29 law blocks) |
| PATCH-ENG-01 | **Applied (v4.5)** | Part XIV Engineering Governance (§64–69) |
| PATCH-SCOPE-CLARIFY-01 | Applied (v4.4.3) | SCOPE as Blueprint sub-step |
| PATCH-LEM-01 | Applied (v4.4.2) | Layered Execution Mode |
| HO-*-01 (9 handoffs) | Applied (v4.4.2) | Phase contracts, integrity, doctrine |
| PATCH-CCS-01 | Applied (v4.4) | Credential Compromise & Sanitization |
| PATCH-GCP-01 | Applied (v4.3) | Governance Completion |
| PATCH-GKDL-01 | Applied (v4.3) | Knowledge Derivation Layer |
| PATCH-SPG-01 | Applied (v4.3) | Security & Privacy Governance |

### 15.2 Project Documents

| Document | Location | Purpose |
|----------|----------|---------|
| D4-CHAT_PROJECT_STATUS_AUDITED.md | sandbox/ | Audit Report v5.0 |
| AIXORD_PLATFORM_BLUEPRINT_D4.md | sandbox/archive/ | Original blueprint |
| MODEL_ROUTER_SPEC.md | sandbox/archive/ | Router contract |

### 15.3 AIXORD Artifact Types (v4.5)

Per AIXORD v4.5-C, the following artifact types apply:

**Core Artifacts:**
- Project_Docs, AIXORD_Formula, Blueprint, Master_Scope, HANDOFF

**GCP-01 Artifacts:**
- DEFINITION_OF_DONE, UX_GOVERNANCE_RECORD, CONSOLIDATED_SESSION_REFERENCE

**GKDL-01 Artifacts:**
- FAQ_REFERENCE, SYSTEM_OPERATION_MANUAL, SYSTEM_DIAGNOSTICS_GUIDE

**SPG-01 Artifacts:**
- DATA_CLASSIFICATION_DECLARATION, AI_EXPOSURE_LOG, COMPLIANCE_AUDIT_TRAIL, USER_RIGHTS_REQUEST_LOG

**CCS-01 Artifacts (v4.4):**
- CCS-01: EXPOSURE_REPORT, CCS-02: CONTAINMENT_RECORD, CCS-03: ROTATION_PROOF, CCS-04: FORWARD_SAFETY_ATTESTATION, CCS-05: AUDIT_TRAIL

**ENG-01 Artifacts (v4.5 — Part XIV):**
- SYSTEM_ARCHITECTURE_RECORD (SAR), INTERFACE_CONTRACT, ITERATION_LOG, OPERATIONAL_READINESS_CHECKLIST

---

## 16. ROADMAP & NEXT STEPS

### 16.1 Immediate (This Week)

| Priority | Task | AIXORD Alignment | Status |
|----------|------|------------------|--------|
| ~~P0~~ | ~~Connect ChatWindow to Router API~~ | Core functionality | ✅ DONE |
| ~~P0~~ | ~~Initialize project state on creation~~ | UX governance (L-GCP5) | ✅ DONE |
| P1 | Test billing flow E2E | Revenue enablement | ⏳ Pending |

### 16.2 Short-term (Next 2 Weeks)

| Priority | Task | AIXORD Alignment | Status |
|----------|------|------------------|--------|
| ~~P1~~ | ~~Implement GS:DC Data Classification Gate~~ | L-SPG5 | ✅ UI Complete |
| ~~P1~~ | ~~Integrate D3 SDK into webapp~~ | Formula binding (L-FX) | ✅ **COMPLETE (Session 13)** |
| ~~P1~~ | ~~AI Exposure controls enforcement~~ | L-SPG3, L-SPG6 | ✅ **BACKEND COMPLETE (Session 13)** |
| ~~P2~~ | ~~Content redaction for CONFIDENTIAL~~ | L-SPG3 | ✅ **COMPLETE (Session 19 — BF-5)** |
| ~~P2~~ | ~~Definition of Done per deliverable~~ | L-GCP3 | ✅ **COMPLETE (Session 19 — PC-5, GA:DOD gate)** |

### 16.3 Medium-term (Next Month)

| Priority | Task | AIXORD Alignment | Status |
|----------|------|------------------|--------|
| P2 | Full SPG-01 Security Gates enforcement | L-SPG1-10 | ⏳ UI done, enforcement pending |
| P2 | Manuscript redemption E2E | Business value | ⏳ Endpoints ready |
| ~~P3~~ | ~~GKDL-01 Knowledge artifacts~~ | L-GKDL1-7 | ✅ DONE (Session 10) |
| ~~P3~~ | ~~D5 Companion integration~~ | Product ecosystem | ✅ DONE (Session 10) |

### 16.4 Phase 4: External Evidence Integration (P2)

**Spec:** HANDOFF-D4-GITHUB-EVIDENCE
**Target Version:** AIXORD v4.4

| Task | Priority | Effort | Status |
|------|----------|--------|--------|
| G1: Project Plan Update | P2 | 0.5h | ✅ COMPLETE |
| G2: Backend Types & Artifacts | P2 | 1-2h | ✅ COMPLETE (Session 9) |
| G3: GitHub OAuth Endpoints | P2 | 2-3h | ✅ COMPLETE (Session 9) |
| G4: Evidence Fetch Service | P2 | 2-3h | ✅ COMPLETE (Session 9) |
| G5: Database Migration | P2 | 1h | ✅ COMPLETE (Session 9) |
| G6: Frontend Assistance Mode | P2 | 2-3h | ✅ COMPLETE (Session 9) |
| G7: Evidence Display Components | P2 | 2-3h | ✅ COMPLETE (Session 9) |
| G8: PATCH-GITHUB-01 Documentation | P2 | 1h | ✅ COMPLETE (Session 9) |

**Total Actual:** ~14 hours (Session 9)
**Status:** ✅ **PHASE 4 COMPLETE** — All deliverables implemented and deployed

**Design Principles:**
- **Evidence, not Authority** — GitHub informs verification; never controls state
- **Progressive Disclosure** — Non-technical users see no GitHub references (GUIDED mode)
- **Read-Only** — No write operations to GitHub
- **Graceful Degradation** — System works fully without GitHub connection

**New Artifact Type:** EXTERNAL_EVIDENCE_LOG
**New Security Gate:** GS:EV (External Evidence Validated)
**New Law Family:** L-EV (Evidence Laws)

**Implementation Files (Session 9):**
- Backend: `src/api/github.ts` (545 lines), `src/api/evidence.ts` (203 lines), `src/services/evidence-fetch.ts`
- Frontend: `GitHubConnect.tsx`, `EvidencePanel.tsx`, `UserSettingsContext.tsx` (AssistanceMode)
- Database: `migrations/005_github_evidence.sql` (3 tables, 9 indexes)
- Documentation: `docs/PATCH-GITHUB-01.md`

**Remaining:** Configure GitHub OAuth secrets (manual step — DONE per Session 9)

**~~CRITICAL NOTE (Session 17 Audit — IGAP-01):~~** ~~Phase 4 code is complete but `GitHubConnect.tsx` and `EvidencePanel.tsx` are **never imported or rendered** in any page.~~ **✅ RESOLVED (Session 18 — D3 + Ribbon UI):** Both components now wired into `EvidenceRibbon.tsx` and rendered in Project page ribbon layout.

### 16.4a Phase 5a: Image/Evidence Foundation (P0 — COMPLETE)

**Source:** Session 15 (Claude Web Architecture Review)
**Handoff:** HANDOFF-D4-PATH-C-IMAGE-EVIDENCE
**Status:** ✅ **COMPLETE** — Executed Session 18 + Corrective Session 18a

| Task | Priority | Status |
|------|----------|--------|
| R2 Bucket creation + wrangler binding | P0 | ✅ COMPLETE (Session 18 — D1) |
| Image metadata migration (012) | P0 | ✅ COMPLETE (Session 18 — D1) |
| Image upload/retrieval API (5 endpoints) | P0 | ✅ COMPLETE (Session 18 — D1) |
| Chat UI image upload component | P0 | ✅ COMPLETE (Session 18 — D2) |
| Chat UI image display component | P0 | ✅ COMPLETE (Session 18 — D2, fixed 18a) |
| Evidence Panel wiring (IGAP-01 resolution) | P1 | ✅ COMPLETE (Session 18 — D3) |
| Image-as-evidence display | P1 | ✅ COMPLETE (Session 18 — D3) |

**Path C Corrective (Session 18a — 3 fixes):**
- Image display: switched to blob URL approach for reliable rendering
- AI vision: added `/base64` endpoint + Anthropic multimodal content blocks
- GitHub Connect: removed EXPERT mode gate so all users can access

**Implementation Files:**
- Backend: `src/api/images.ts` (5 endpoints), migration `012_image_metadata.sql`
- Frontend: `ImageUpload.tsx`, `ImageDisplay.tsx`
- Evidence: `EvidencePanel.tsx` + `GitHubConnect.tsx` wired into `EvidenceRibbon.tsx`

### 16.5 Phase 5: Proactive Debugging Architecture (P1-STRATEGIC)

**Source:** Session 7 (ChatGPT Strategic), Session 15 (Claude Web Architecture Review), Session 16 (Blueprint)
**Target Version:** AIXORD v4.5 (Part XIV §64-67 aligned)
**Status:** ✅ **PHASE 1 COMPLETE** (Session 18b) — Phase 2 & 3 pending

**Core Value Proposition:**
> "AIXORD helps you build complex things one verified step at a time, so you don't waste months debugging."

This phase implements the platform's differentiating feature set — converting the chat-based
execution model from reactive debugging (big plan → big build → big failure → big debugging)
to proactive debugging (build → sanitize → execute → verify → lock → add next layer).

**Blueprint:** Produced by Architect (Session 16), approved by Director. 9 features, 3 phases, 17 deliverables.

| Component | Priority | Description | Status |
|-----------|----------|-------------|--------|
| Layered Execution Mode | P1 | Decompose blueprints into numbered Action Layers with tracked progression | ✅ COMPLETE (Session 18b) |
| I/O Sanitization | P1 | Each step declares expected input/output shapes with validation | ✅ COMPLETE (Session 18b) |
| Execution Checkpoints (ECP) | P1 | Hard verification boundaries after critical actions — must pass before next layer | ✅ COMPLETE (Session 18b) |
| No Broken State Rule | P1 | Failed step blocks forward progress; success locks state | ✅ COMPLETE (Session 18b) |
| Post-Execution Failure Analysis Gate | P2 | Forces root cause analysis before retry — blocks re-execution without learning | ⏳ Phase 2 |
| Blueprint Assumption Review (BAR) | P2 | Extract and research assumptions before execution — pre-execution risk reduction | ⏳ Phase 2 |

**Phase 1 Implementation (Session 18b):**
- Database: `execution_layers` table (migration `013_execution_layers.sql`)
- Backend: Layer CRUD API — 12 endpoints in `src/api/layers.ts`
- Frontend: `LayerProgressPanel.tsx`, `CheckpointModal.tsx`, `useLayers.ts` hook
- AI: `buildLayeredExecutionPrompt()` in system prompt with I/O sanitization

**Phase 2 (Pending):** Post-Execution Failure Analysis Gate, Blueprint Assumption Review
**Phase 3 (Pending):** Advanced features (visual layer graph, auto-decomposition, metrics)

### 16.6 Ribbon UI Refactor (Session 18c — COMPLETE)

**Source:** Session 16 (Architect handoff — HANDOFF-D4-RIBBON-UI-REFACTOR)
**Status:** ✅ **COMPLETE** — Microsoft Word-inspired layout

Replaced 3-column layout with modern ribbon-based architecture:

| Component | Description | Status |
|-----------|-------------|--------|
| `TabBar.tsx` | Top tab strip (Governance, Info, Evidence) | ✅ COMPLETE |
| `Ribbon.tsx` | Collapsible ribbon container | ✅ COMPLETE |
| `StatusBar.tsx` | Bottom status bar with kingdom/phase/gates | ✅ COMPLETE |
| `GovernanceRibbon.tsx` | Governance tab content (gates, decisions, phases) | ✅ COMPLETE |
| `InfoRibbon.tsx` | Info tab content (project details, knowledge) | ✅ COMPLETE |
| `EvidenceRibbon.tsx` | Evidence tab content (GitHub connect, evidence panel, images) | ✅ COMPLETE |
| `Project.tsx` rewrite | Full page rewrite from 3-column to ribbon layout | ✅ COMPLETE |

**Layout:** `TabBar` → `Ribbon` (collapsible) → `Chat area` → `StatusBar`

### 16.7 Sidebar Active Indicator (Session 18d — COMPLETE)

**Source:** Session 16 (Architect handoff — HANDOFF-D4-SIDEBAR-ACTIVE-INDICATOR)
**Status:** ✅ **COMPLETE**

Purple left border accent (`border-left: 3px solid #7c3aed`) + background tint on active navigation item in `Sidebar.tsx`.

### 16.8 Session 19 Reconciliation Implementation (COMPLETE)

**Source:** D4-CHAT_RECONCILIATION_PLAN.md v1.0
**Status:** ✅ **ALL P1/P2/P3 COMPLETE** — 6 divergences → 0

| Item | ID | Priority | Description | Status |
|------|-----|----------|-------------|--------|
| Content redaction | BF-5 | P1 | SPG-01 L-SPG3 — PII/PHI/minor data masking before AI calls | ✅ COMPLETE |
| DoD enforcement gate | PC-5 | P1 | GA:DOD warning gate during REVIEW phase | ✅ COMPLETE |
| OpenAI vision support | BF-3 | P2 | image_url base64 data URI format for GPT-4o vision | ✅ COMPLETE |
| Google/Gemini vision support | BF-4 | P2 | inline_data parts for Gemini multimodal | ✅ COMPLETE |
| Activity page build-out | FB-4 | P3 | Full implementation — projects+decisions timeline with filters | ✅ COMPLETE |
| Analytics page build-out | FB-5 | P3 | Full implementation — usage cards, bar chart, period table | ✅ COMPLETE |
| Migration 010 consolidation | BF-9 | P3 | Merged 010_auth_verification_fix.sql into 010_auth_verification.sql | ✅ COMPLETE |

**Implementation Files (Session 19):**
- Backend: `src/utils/redaction.ts` (NEW — content redaction utility)
- Backend: `src/index.ts` (redaction config wiring for CONFIDENTIAL)
- Backend: `src/routing/fallback.ts` (redaction application in buildMessages)
- Backend: `src/providers/openai.ts` (vision support — image_url format)
- Backend: `src/providers/google.ts` (vision support — inline_data format)
- Backend: `src/providers/index.ts` (image pass-through to OpenAI + Google)
- Backend: `src/types.ts` (RedactionConfig interface)
- Backend: `migrations/010_auth_verification.sql` (consolidated, SQLite-safe)
- Frontend: `src/lib/sdk.ts` (GA:DOD gate check in checkGates)
- Frontend: `src/pages/Activity.tsx` (rewritten — full activity timeline)
- Frontend: `src/pages/Analytics.tsx` (rewritten — usage dashboard)

**Reconciliation Triad Status (L-GCP1):**
- ✅ PLANNED = All items documented in plan
- ✅ CLAIMED = All code exists and compiles
- ⏳ VERIFIED = Pending deployment + E2E testing

### 16.9 Session Graph Model — AIXORD v4.4 (Session 20 — COMPLETE)

**Source:** Director brainstorm (Session 20) — Minimal Session Graph Model specification
**Status:** ✅ **ALL 5 PHASES COMPLETE** — Fully deployed and verified

The Session Graph Model introduces formal session tracking as a directed graph. Each project
session is a node with a type, and sessions can be connected via typed edges. This enables
governed session continuity — the platform's core differentiating feature.

#### Session Node Types

| Type | Code | Purpose |
|------|------|---------|
| DISCOVER | D | Explore problem space |
| BRAINSTORM | B | Generate ideas and solutions |
| BLUEPRINT | BP | Design architecture and plan |
| EXECUTE | E | Implement the solution |
| AUDIT | A | Review and verify work |
| VERIFY_LOCK | VL | Final verification and sign-off |

#### Edge Types (Directed Relationships)

| Edge Type | Semantics | Example |
|-----------|-----------|---------|
| CONTINUES | Direct continuation | S1 → S2: "pick up where left off" |
| DERIVES | Based on insights | S3 → S5: "uses findings from S3" |
| SUPERSEDES | Replaces approach | S4 → S6: "S6 replaces S4's approach" |
| FORKS | Alternative path | S2 → S3: "explore alternate direction" |
| RECONCILES | Merges outcomes | S3+S4 → S5: "combines both approaches" |

#### Implementation Phases

| Phase | Scope | Status |
|-------|-------|--------|
| **Phase A** | TabBar "+ New Session" + navigation fix, session indicator (S{n}) | ✅ COMPLETE |
| **Phase B** | Database — `014_sessions.sql` migration (`project_sessions`, `session_edges`, `messages.session_id`) | ✅ COMPLETE |
| **Phase C** | Backend API — `sessions.ts` (6 endpoints) + `messages.ts` session-aware filtering | ✅ COMPLETE |
| **Phase D** | Frontend — `NewSessionModal`, `SessionList`, `useSessions` hook, `InfoRibbon` session panel | ✅ COMPLETE |
| **Phase E** | Router capsule enrichment — `session_graph` in capsule with current session + lineage | ✅ COMPLETE |

#### Implementation Files (Session 20)

**Backend:**
- `migrations/014_sessions.sql` (NEW — project_sessions, session_edges, messages.session_id)
- `src/api/sessions.ts` (NEW — 6 endpoints: create, list, get, update, graph, edge)
- `src/api/messages.ts` (UPDATED — session_id filter on GET, session_id storage on POST, message_count increment)
- `src/index.ts` (UPDATED — sessions route registration)

**Frontend:**
- `src/components/session/NewSessionModal.tsx` (NEW — session creation with type + edge selection)
- `src/components/session/SessionList.tsx` (NEW — compact session list with status badges + type colors)
- `src/hooks/useSessions.ts` (NEW — session lifecycle management hook)
- `src/lib/api.ts` (UPDATED — sessionsApi client, SessionType/EdgeType/ProjectSession types, messages session_id support)
- `src/lib/sdk.ts` (UPDATED — sessionGraph in SendOptions + capsule enrichment)
- `src/components/layout/TabBar.tsx` (UPDATED — onNewSession, projectId, sessionNumber props, "+ New Session" menu item, S{n} indicator)
- `src/components/ribbon/InfoRibbon.tsx` (UPDATED — 4-column layout with SessionList panel)
- `src/pages/Project.tsx` (UPDATED — useSessions integration, session-aware message CRUD, NewSessionModal, capsule session_graph context)

**Deployments:**
- Backend: Version `d352a91e` (aixord-router-worker)
- Frontend: Cloudflare Pages (aixord-webapp-ui)
- Database: `project_sessions`, `session_edges` tables + 6 indexes applied to D1

### 16.10 Session 23 — D7-D16 Feature Sprint (COMPLETE)

**Source:** D4-CHAT Blueprint remaining deliverables
**Status:** ✅ **ALL D7-D16 COMPLETE** (D13 was already complete prior to session)

| ID | Feature | Description | Status |
|----|---------|-------------|--------|
| **D7** | CollapsibleSection | Reusable collapsible UI component with chevron, badge support | ✅ COMPLETE |
| **D8** | Progressive Disclosure | `assistanceMode` (GUIDED/ASSISTED/EXPERT) controls StatusBar indicator visibility, mode selector | ✅ COMPLETE |
| **D9** | Clipboard Image Paste | `onPaste` handler on chat textarea, auto-adds pasted images as SCREENSHOT evidence | ✅ COMPLETE |
| **D10** | Session Metrics Endpoint | `GET /sessions/:id/metrics` — aggregates tokens, cost, latency, model usage from message metadata | ✅ COMPLETE |
| **D11** | Session Metrics UI | InfoRibbon shows backend metrics (model usage breakdown, avg latency) when available | ✅ COMPLETE |
| **D12** | GitHub OAuth Fix | Callback redirect changed from `/settings` to `/project/:projectId` | ✅ COMPLETE |
| **D13** | Lightbox Modal | Click-to-expand image viewer — **already complete in ImageDisplay.tsx** | ✅ ALREADY DONE |
| **D14** | Anthropic Prompt Caching | `anthropic-beta: prompt-caching-2024-07-31` header, `cache_control` on system prompt, cache pricing | ✅ COMPLETE |
| **D15** | OpenAI Prompt Caching | Automatic server-side caching (GPT-4o+), cached_tokens reported in usage | ✅ COMPLETE |
| **D16** | Project/Account Metrics | `GET /usage/projects` — per-project aggregation (sessions, messages, tokens, cost) | ✅ COMPLETE |

#### Implementation Files (Session 23)

**Frontend (New):**
- `src/components/CollapsibleSection.tsx` (D7 — reusable collapsible section)

**Frontend (Updated):**
- `src/components/layout/StatusBar.tsx` (D8 — assistanceMode progressive disclosure, D9 — onPaste clipboard handler)
- `src/components/ribbon/InfoRibbon.tsx` (D11 — sessionMetrics prop, model usage display)
- `src/pages/Project.tsx` (D8 — assistanceMode wiring, D9 — handlePasteImage, D10 — sessionMetrics fetch)
- `src/lib/api.ts` (D10 — SessionMetrics type + getMetrics method, D16 — ProjectMetrics type + projectMetrics method)

**Backend (Updated):**
- `src/api/sessions.ts` (D10 — GET /:projectId/sessions/:sessionId/metrics endpoint)
- `src/api/github.ts` (D12 — callback redirect to `/project/:projectId` instead of `/settings`)
- `src/api/usage.ts` (D16 — GET /usage/projects endpoint)
- `src/providers/anthropic.ts` (D14 — cache_control blocks, beta header, cache pricing)
- `src/providers/openai.ts` (D15 — cached_tokens parsing, documentation)
- `src/types.ts` (D14-15 — cache fields in ProviderResponse)

### 16.11 Session 24 — Backend/Frontend Bridge Sprint (COMPLETE)

**Source:** Comprehensive audit of unused backend endpoints vs unused frontend API methods
**Status:** ✅ **ALL GAPS BRIDGED** (Only `api.messages.createBatch` intentionally skipped — low-priority batch import)

| Bridge | Description | API Methods Wired | Status |
|--------|-------------|-------------------|--------|
| **SecurityRibbon** | New ribbon tab — data classification toggles, security gates status, AI exposure level | `security.getClassification`, `security.setClassification`, `security.getGates` | ✅ COMPLETE |
| **CCS Incident Creation** | Modal form for reporting credential compromises | `ccs.createIncident` | ✅ COMPLETE |
| **CCS Incident History** | History tab in CCSIncidentPanel listing all incidents | `ccs.listIncidents` | ✅ COMPLETE |
| **Engineering CRUD** | Create/delete operations for all 9 Part XIV areas | `engineering.create*` (9), `engineering.delete*` (7) | ✅ COMPLETE |
| **Session Graph Viz** | Visual session timeline with edge display and creation | `sessions.getGraph`, `sessions.createEdge` | ✅ COMPLETE |
| **GitHub Repo Selection** | Select repo after OAuth connect in EvidenceRibbon | `github.listRepos`, `github.selectRepo` | ✅ COMPLETE |
| **Image Management** | Image gallery with delete capability in EvidenceRibbon | `images.list`, `images.delete` | ✅ COMPLETE |
| **Evidence Sync** | Sync button triggers evidence refresh | `evidence.sync`, `evidence.list` | ✅ COMPLETE |
| **Clear Messages** | Trash icon in StatusBar clears conversation | `messages.clear` | ✅ COMPLETE |
| **Project Edit** | Inline project name editing in InfoRibbon | `projects.update` | ✅ COMPLETE |
| **Project Metrics UI** | Per-project metrics table in Analytics page | `usage.projectMetrics` | ✅ COMPLETE |

#### Implementation Files (Session 24)

**Frontend (New):**
- `src/components/ribbon/SecurityRibbon.tsx` — Data classification + security gates + AI exposure UI
- `src/components/CCSCreateIncidentModal.tsx` — Credential compromise incident form
- `src/components/session/SessionGraph.tsx` — Visual session timeline with edges

**Frontend (Updated):**
- `src/components/layout/TabBar.tsx` — Added 'security' tab
- `src/pages/Project.tsx` — Major: SecurityRibbon, CCS creation, GitHub repos, image mgmt, evidence sync, clear messages, project update
- `src/components/ribbon/EvidenceRibbon.tsx` — Repo selection, sync button, image delete
- `src/components/EngineeringPanel.tsx` — Full CRUD (create forms + delete buttons for all 9 areas)
- `src/components/ribbon/InfoRibbon.tsx` — SessionGraph integration, clickable project name edit
- `src/pages/Analytics.tsx` — Per-project metrics table
- `src/components/layout/StatusBar.tsx` — Clear messages button
- `src/components/CCSIncidentPanel.tsx` — Incident history tab

#### API Coverage After Session 24

| Category | Total Methods | Wired to UI | Coverage |
|----------|--------------|-------------|----------|
| Auth | 3 | 3 | 100% |
| Projects | 5 | 5 | 100% |
| Messages | 5 | 4 | 80% (createBatch skipped) |
| Sessions | 7 | 7 | 100% |
| State/Decisions | 4 | 4 | 100% |
| Router | 1 | 1 | 100% |
| GitHub | 4 | 4 | 100% |
| Evidence | 3 | 3 | 100% |
| Images | 5 | 5 | 100% |
| Security | 5 | 5 | 100% |
| CCS | 6 | 6 | 100% |
| Layers | 12 | 12 | 100% |
| Engineering | 35 | 35 | 100% |
| Knowledge | 3 | 3 | 100% |
| Usage | 3 | 3 | 100% |
| **TOTAL** | **101** | **100** | **99%** |

### 16.12 Session 25 — Tier 1 Phase Exit Enforcement (COMPLETE)

**Source:** Governance extension analysis — AIXORD baseline 8-phase model vs D4-CHAT 4-phase model
**Status:** ✅ **TIER 1 COMPLETE** (Phase transitions now contractual, not navigational)

#### Phase Exit Gate Requirements

| Phase | Exit Gates Required | Gate Labels | Auto-Check |
|-------|-------------------|-------------|------------|
| BRAINSTORM | GA:LIC, GA:DIS, GA:TIR | License, Disclaimer, Tier | Manual |
| PLAN | GA:ENV, GA:FLD, GA:BP, GA:IVL | Environment, Folder, Blueprint, Integrity | ✅ All auto-checked |
| EXECUTE | GW:PRE, GW:VAL, GW:VER | Prerequisites, Validation, Verification | Manual |
| REVIEW | (none — terminal phase) | — | — |

- **Backward transitions** governed by REASSESS Protocol (GFB-01 R6) — 3-level friction with mandatory reason
- **Forward transitions** blocked until exit gates satisfied
- **Admin override** via `force: true` parameter

#### Implementation Details

**Backend (state.ts):**
- `PHASE_ORDER` constant — phase ordering for transition direction
- `PHASE_EXIT_REQUIREMENTS` constant — gate-to-phase mapping with human-readable labels
- `checkPhaseTransition()` function — validates gate satisfaction for forward moves
- `PUT /phase` endpoint — returns 403 with `{ error, message, missingGates }` when blocked
- Accepts `force: true` for admin override

**Frontend (GovernanceRibbon.tsx):**
- Client-side mirror of `PHASE_EXIT_REQUIREMENTS` for pre-validation
- `getMissingExitGates()` function — checks gates before API call
- Blocked phases: dimmed appearance, red dot indicator, "!" badge, tooltip with missing gate names
- `phaseError` prop — displays red error banner from backend 403 response

**Frontend (Project.tsx):**
- `phaseError` state — captures 403 error message + missing gates
- `handleSetPhase` — catches `APIError` with statusCode 403, extracts missingGates

**Frontend (api.ts):**
- `setPhase()` — custom fetch for 403 handling, attaches `missingGates` array to APIError

#### Session 25 Bug Fixes (from Session 24)

| File | Error | Fix |
|------|-------|-----|
| EngineeringPanel.tsx | Wrong enum values, unused import | Replaced `EngineeringCompliance` with specific type imports, added proper casts |
| SecurityRibbon.tsx | Invalid `'FULL'`/`'NONE'` AIExposureLevel | Replaced with valid 5-level cascade (PUBLIC/INTERNAL/CONFIDENTIAL/RESTRICTED/PROHIBITED) |
| SessionGraph.tsx | Wrong `getGraph` shape, wrong `createEdge` signature | Fixed to `{outgoing, incoming}`, 4-arg signature |
| Project.tsx | Wrong type casts for images/evidence/repos/CCS | Fixed response shapes (`.images`, `.evidence`, `.repos`), CCS API params |
| CCSCreateIncidentModal.tsx | Wrong API signature fields | Added ExposureSource dropdown, exposureDescription/impactAssessment textareas |

### 16.13 Session 26 — Blueprint Governance (L-BPX, L-IVL) (COMPLETE)

**Source:** AIXORD v4.5 Baseline — Post-Blueprint Execution-Ready Contract (L-BPX) + Integrity Validation (L-IVL)
**Status:** ✅ **ALL 6 PHASES COMPLETE** — Fully deployed

| Phase | Scope | Status |
|-------|-------|--------|
| **Phase 1** | Migration 016 — 3 tables (blueprint_scopes, blueprint_deliverables, blueprint_integrity_reports) + 6 indexes | ✅ COMPLETE |
| **Phase 2** | Backend — blueprint.ts API (12 endpoints: scopes CRUD, deliverables CRUD, validate, integrity, DAG, summary) | ✅ COMPLETE |
| **Phase 3** | Frontend types — api.ts types (BlueprintScope, BlueprintDeliverable, IntegrityReport, DAGNode, etc.) + blueprintApi client | ✅ COMPLETE |
| **Phase 4** | Frontend hook — useBlueprint.ts (loadScopes, loadDeliverables, loadSummary, loadDAG) | ✅ COMPLETE |
| **Phase 5** | Frontend UI — BlueprintPanel.tsx (480 lines, 4 sections: Scopes/Deliverables/Validation/DAG), BlueprintRibbon.tsx, TabBar + GovernanceRibbon + Project.tsx wiring | ✅ COMPLETE |
| **Phase 6** | Build + deploy + verify — backend af9b9eb7, migration applied, frontend deployed | ✅ COMPLETE |

**Gate Auto-Checks:**
- `GA:BP` — validates scopes > 0, deliverables > 0, all DoDs complete
- `GA:IVL` — validates latest integrity report has all_passed = 1
- PLAN exit now requires: GA:ENV + GA:FLD + GA:BP + GA:IVL

**Implementation Files:**
- Backend: `src/api/blueprint.ts` (NEW — 12 endpoints), `migrations/016_blueprint_governance.sql`
- Backend: `src/api/state.ts` (UPDATED — GA:BP + GA:IVL auto-check logic)
- Frontend: `src/components/BlueprintPanel.tsx` (NEW), `src/components/ribbon/BlueprintRibbon.tsx` (NEW), `src/hooks/useBlueprint.ts` (NEW)
- Frontend: `src/lib/api.ts` (UPDATED — blueprint types + client), `src/pages/Project.tsx` (UPDATED — wiring)
- Frontend: `src/components/layout/TabBar.tsx` (UPDATED — 'blueprint' tab), `GovernanceRibbon.tsx` (UPDATED — GA:IVL gate)

### 16.14 Session 28 — Unified GA:ENV Workspace Binding (COMPLETE)

**Source:** Architect Session 18 design — Items #3-5 (folder templates, scaffold generation, GitHub linkage)
**Status:** ✅ **ALL 5 PHASES COMPLETE** — Fully deployed

**Design Decision:** GA:ENV becomes "Bind your project workspace" — a substantive 3-part setup flow. GA:FLD is satisfied as a side-effect of Part 1 (folder selection). Baseline Part VI Path Security constraints are chatbot-era; D4-CHAT's consent-based Browser File System Access API IS the structural enforcement.

| Phase | Scope | Status |
|-------|-------|--------|
| **Phase 1** | Migration 017 — workspace_bindings table (folder metadata, template, permissions, scaffold status, github linkage, confirmation) | ✅ COMPLETE |
| **Phase 2** | Backend — workspace.ts API (4 endpoints: GET/PUT/DELETE workspace, GET status) + state.ts GA:ENV/GA:FLD auto-checks | ✅ COMPLETE |
| **Phase 3** | Frontend — workspaceTemplates.ts (4 templates) + scaffoldGenerator.ts (recursive writer using existing createDirectory/createFile) | ✅ COMPLETE |
| **Phase 4** | Frontend — WorkspaceSetupWizard.tsx (3-step: Local Workspace → GitHub → Confirmation, ~390 lines) | ✅ COMPLETE |
| **Phase 5** | Frontend wiring — api.ts (workspaceApi + types), Project.tsx (auto-detect first-time, wizard overlay), GovernanceRibbon.tsx (ENV/FLD pills → wizard) | ✅ COMPLETE |

**Folder Templates:**

| Template | Target | Unique Folders |
|----------|--------|----------------|
| Web Application | Developers | `src/`, `public/`, `tests/`, `docs/` |
| Documentation | Non-dev, compliance | `documents/`, `templates/`, `exports/` |
| General | Catch-all | `workspace/`, `output/` |
| User Controlled | Power users | (empty — user manages) |

All templates include invariant `aixord/` governance directory (STATE.json, HANDOFF/, BLUEPRINT/, ARTIFACTS/, AUDIT/).

**Gate Auto-Checks:**
- `GA:ENV` — validates workspace binding exists + binding_confirmed = true
- `GA:FLD` — validates workspace binding has folder_name set

**Existing Code Activated:**
- `fileSystem.ts` — `createDirectory()`, `createFile()`, `writeFileContent()` (existed since Session 7, never called until now)
- `FolderPicker.tsx` — embedded in wizard Step 1
- `GitHubConnect.tsx` — embedded in wizard Step 2

**Implementation Files:**
- Backend: `src/api/workspace.ts` (NEW — 4 endpoints), `migrations/017_workspace_binding.sql` (NEW)
- Backend: `src/api/state.ts` (UPDATED — GA:ENV + GA:FLD auto-check), `src/index.ts` (UPDATED — route mount)
- Frontend: `src/lib/workspaceTemplates.ts` (NEW), `src/lib/scaffoldGenerator.ts` (NEW), `src/components/WorkspaceSetupWizard.tsx` (NEW)
- Frontend: `src/lib/api.ts` (UPDATED — workspaceApi + types), `src/pages/Project.tsx` (UPDATED — wizard wiring), `GovernanceRibbon.tsx` (UPDATED — ENV/FLD → wizard)

### 16.15 Session 29 — Capsule Enrichment + Evidence Session Tagging (COMPLETE)

**Source:** Architect Session 18 HANDOFF — D4-CHAT — Session 24 (4 priorities)
**Status:** ✅ **ALL 4 PRIORITIES COMPLETE** — Fully deployed

| Priority | Scope | Status |
|----------|-------|--------|
| **P1** | Git housekeeping — commit 18 uncommitted Session 23 files (Blueprint governance + Workspace binding), push to remote | ✅ COMPLETE (commit `d4d5096`) |
| **P2** | Capsule workspace extension — workspace binding context (bound, folder_name, template, permission_level, scaffold_generated, github_connected, github_repo) flows through `sdk.ts` → `router.ts` schema → `fallback.ts` AI system prompt | ✅ COMPLETE |
| **P3** | Evidence session tagging — migration 018 adds `session_id TEXT REFERENCES project_sessions(id)` + index to `github_evidence`. Sync pipeline (`evidence-fetch.ts`) accepts sessionId, all 5 upsertEvidence calls pass it. Frontend sends `activeSession.id` on sync | ✅ COMPLETE |
| **P4** | Capsule lineage enrichment — prior session entries include `messageCount` (from `message_count` column). Summary truncated at 200 chars. Null summaries get fallback: `"{type} session with {n} messages"` | ✅ COMPLETE |

**Implementation Files:**
- Backend: `migrations/018_evidence_session_id.sql` (NEW — ALTER TABLE + index)
- Backend: `src/services/evidence-fetch.ts` (UPDATED — sessionId param, upsertEvidence session_id)
- Backend: `src/api/evidence.ts` (UPDATED — POST sync accepts session_id from body)
- Backend: `src/types.ts` (UPDATED — Capsule interface: session_graph + workspace)
- Backend: `src/schemas/router.ts` (UPDATED — capsule passthrough with type guards)
- Backend: `src/routing/fallback.ts` (UPDATED — session graph + workspace in AI system prompt)
- Frontend: `src/lib/sdk.ts` (UPDATED — SendOptions: sessionGraph lineage messageCount, workspace)
- Frontend: `src/lib/api.ts` (UPDATED — RouterRequest capsule types, evidenceApi.sync sessionId)
- Frontend: `src/pages/Project.tsx` (UPDATED — workspaceStatus state, lineage messageCount + summary truncation, evidence sync session_id)

**Commit:** `1a66118` — `feat(d4-chat): Session 24 — Capsule workspace/lineage enrichment + evidence session tagging`

---

### 16.16 Session 30 — Platform Key Enablement + Messages FK Fix (COMPLETE)

**Source:** User-reported chat errors → debugging → TRIAL platform key requirement
**Status:** ✅ **COMPLETE** — Fully deployed

#### Problem 1: Messages 500 Internal Server Error

Chat was returning `500 Internal Server Error` with non-JSON "Internal Server Error" text response, crashing the frontend JSON parser.

**Root Causes:**
1. Backend Worker was not deployed after Session 29 (only frontend + migration were deployed)
2. `messages` table had broken FK constraint — `ALTER TABLE ADD COLUMN session_id TEXT REFERENCES project_sessions(id)` was resolved by SQLite/D1 to reference the auth `sessions` table instead of `project_sessions`
3. Frontend `request()` and `routerApi.execute()` called `response.json()` without try/catch, crashing on non-JSON error responses

**Fixes:**
- **Migration 019** (`019_fix_messages_session_fk.sql`) — Rebuilds messages table without broken FK. Uses `PRAGMA foreign_keys=OFF`, creates `messages_new`, copies data, drops old, renames, recreates indexes
- **`api.ts` request() helper** — Changed to `response.text()` + `JSON.parse()` with try/catch, throws clean `APIError` with `PARSE_ERROR` code
- **`api.ts` routerApi.execute()`** — Same text-first JSON parse pattern
- **Commit:** `61de73e`

#### Problem 2: TRIAL Users Require Platform Keys

TRIAL users were forced into BYOK mode (must provide their own API keys). User requested that Free Trial users should be able to chat immediately using platform-provided API keys, same as paid Platform plans.

**Changes (4 files):**

| File | Change |
|------|--------|
| `key-resolver.ts` | Removed `TRIAL` from `BYOK_REQUIRED_TIERS` → now `['MANUSCRIPT_BYOK', 'BYOK_STANDARD']` |
| `subscription.ts` | Removed `TRIAL` from `byokTiers` validation → TRIAL users can send `key_mode: 'PLATFORM'` |
| `auth.ts` | Default TRIAL response returns `keyMode: 'PLATFORM'` (was `'BYOK'`). Removed `TRIAL` from `byokTiers` at line 352 |
| `UserSettingsContext.tsx` | Default `keyMode` changed from `'BYOK'` to `'PLATFORM'` |

#### Problem 3: Pricing Page Mismatch

Free Trial pricing card showed "Bring Your Own Keys (BYOK)" which was no longer accurate.

**Fix:**
- `Pricing.tsx` — TRIAL features updated: `'Platform API keys included'` + `'14-day trial period'` (was `'Bring Your Own Keys (BYOK)'` + `'7-day audit retention'`)

**TRIAL Enforcement Guards (verified):**

| Guard | Limit | Error Code | Enforcement Location |
|-------|-------|-----------|---------------------|
| Time | 14 days from registration | `TRIAL_EXPIRED` (403) | `index.ts` lines 124-132 |
| Requests | 50/month | `ALLOWANCE_EXHAUSTED` (429) | `index.ts` lines 143-148 |
| Projects | 1 | `TIER_LIMITS.TRIAL.maxProjects` | Project creation |

**Flow for TRIAL users after fix:**
1. User registers → 14-day `trial_expires_at` set
2. Login → `refreshSubscription()` → backend returns `keyMode: 'PLATFORM'`
3. SDK sends `key_mode: 'PLATFORM'` without `user_api_key`
4. Backend `resolveApiKey()` uses environment platform keys (Anthropic, OpenAI, Google, DeepSeek)
5. Chat works immediately — no API key setup needed
6. After 50 requests or 14 days → blocked with upgrade prompt

### 16.17 Sessions 31-33 + 26b — UAT Fix Sprint (LOCKED)

**Source:** Director UAT re-testing on `aixord.pmerit.com`
**Status:** :lock: **LOCKED** — Both issues confirmed working by Director (02/08)

#### P0-1: DELETE Project 500 Internal Server Error

| Session | Issue | Root Cause | Fix | Status |
|---------|-------|------------|-----|--------|
| 32 | DELETE returns 500 | `images` FK missing CASCADE + no try/catch | Migration 020 (rebuild images table) + batch DELETE with 29 child tables | :lock: LOCKED |
| 33 | DELETE still 500 | `artifacts` and `state` tables missing from batch | Added 4 missing tables (artifacts, state, ccs_artifacts, ccs_verification_tests) | :lock: LOCKED |
| 26b | DELETE still 500 | `D1_ERROR: no such column: scope_id` | `blueprint_integrity_reports` uses `project_id`, not `scope_id`. Fixed column reference | :lock: LOCKED |

**Final batch DELETE (projects.ts):** 33 statements covering all 29 FK-referencing tables + 4 grandchild tables.

**Tables in cascade order:**
1. Grandchildren: `layer_evidence`, `blueprint_integrity_reports`, `blueprint_deliverables`, `session_edges`, `ccs_artifacts`, `ccs_verification_tests`
2. Direct children: `blueprint_scopes`, `images`, `github_evidence`, `github_connections`, `workspace_bindings`, `messages`, `decisions`, `execution_layers`, `project_sessions`, `knowledge_artifacts`, `ccs_incidents`, `data_classification`, `ai_exposure_log`, `security_gates`, `system_architecture_records`, `interface_contracts`, `fitness_functions`, `integration_tests`, `iteration_budget`, `operational_readiness`, `rollback_strategies`, `alert_configurations`, `knowledge_transfers`, `artifacts`, `state`, `project_state`
3. Target: `projects`

#### P0-2: GitHub OAuth Returns Error

| Session | Issue | Root Cause | Fix | Status |
|---------|-------|------------|-----|--------|
| 24-31 | GitHub OAuth 404 | Wrangler secret name/value confusion + stale OAuth App | Multiple secret resets | Superseded |
| 26 | GitHub OAuth rebuild | Director registered fresh OAuth App | Set new Client ID `Ov23li5XCMKrhaBpeAmP` + new secret | :lock: LOCKED |
| 33 | Callback returns 401 | `github.use('/*', requireAuth)` blocks `/callback` — GitHub redirect has no Bearer token | Exempt `/callback` from auth middleware | :lock: LOCKED |

**OAuth flow after fix:**
1. User clicks "Connect GitHub" → `POST /github/connect` (authenticated)
2. Backend constructs authorize URL with `c.env.GITHUB_CLIENT_ID` → returns URL
3. Frontend redirects browser to GitHub consent screen
4. User approves → GitHub redirects to `GET /callback?code=...&state=...` (NO auth token)
5. Callback exchanges code for access token → encrypts → stores → redirects to project page

**Implementation files changed:**
- `src/api/github.ts` — Conditional auth middleware (skip on `/callback`)
- `src/api/projects.ts` — Batch DELETE with correct column names for all 33 statements
- `migrations/020_fix_images_fk_cascade.sql` — Rebuild images table with CASCADE

**Commits:**
- `b482997` — Session 32: DELETE cascade fix + migration 020
- `3469731` — Session 33: GitHub OAuth 401 + DELETE cascade completion
- `70709e0` — Session 26b: scope_id column fix (final fix)

**Deployments:**
- Backend: `4965eef1` (Session 26b — final working version)

### 16.18 Session 34 — Dependabot + Security Gates Sync (COMPLETE)

**Source:** Outstanding Session 26 issues + UAT bug report
**Status:** :lock: **LOCKED** — All 4 tasks complete, deployed

| Task | Commit | Description | Status |
|------|--------|-------------|--------|
| Dependabot fix | `65d63d6` | wrangler 3.114.17 → 4.63.0, vitest 1.6.1 → 4.0.18, 7 vulns → 0 | :lock: LOCKED |
| Security gates sync | `a8b9aba` | Capsule enriched from DB security_gates table in GET /state + router execute | :lock: LOCKED |
| Delayed gate re-eval | `f53fde6` | 2.5s delayed re-evaluation after message send for waitUntil sync | :lock: LOCKED |

**Root Cause (security gates bug):** Capsule security_gates initialized at project creation with all-false defaults, never updated when security API modified the security_gates table. GET /state and router execute both returned stale data.

**Fix:** Both `state.ts` GET and `index.ts` execute now query `security_gates` table and merge authoritative values into capsule before returning. `types.ts` updated with `security_gates` field on Capsule interface.

### 16.19 Session 35 — Gate Key Normalization + Hard Gate Enforcement (COMPLETE)

**Source:** Architect Handoff Session 22 — Tasks 4b + 1
**Status:** :lock: **LOCKED** — Deployed, all gates normalized

#### Gate Key Normalization (Task 4b)

| Scope | Before | After |
|-------|--------|-------|
| Backend initialGates | `LIC: false, DIS: false, ...` | `'GA:LIC': false, 'GA:DIS': false, ...` |
| Frontend GateTracker | Bare key arrays | `GateID` type with `GA:`/`GW:` prefix |
| Frontend MiniBar/GovernanceRibbon/SDK | `gates['GP']` | `gates['GA:GP']` |
| D1 Database | Mixed bare + prefixed keys | All prefixed, bare keys removed |

**Commit:** `693e4af` — 5 files changed, 52 insertions, 45 deletions

#### Hard Gate Enforcement (Task 1 — P0)

**Core Principle:** "D4-CHAT does not make models governed. It makes ungoverned models impossible to use."

| Component | Implementation | Status |
|-----------|----------------|--------|
| Backend `index.ts` | `PHASE_REQUIRED_GATES` config, `checkGovernanceGates()` function, `governance_block` JSON response | :lock: LOCKED |
| Frontend `sdk.ts` | `GovernanceBlockError` class, detects `governance_block` response type | :lock: LOCKED |
| Frontend `MessageBubble.tsx` | Governance block card (violet theme, shield icon, failed gates list, remediation actions) | :lock: LOCKED |
| Frontend `Project.tsx` | Catches `GovernanceBlockError`, renders actionable error in chat | :lock: LOCKED |

**Commit:** `da3f5d2` — 4 files changed, 170 insertions

### 16.20 Session 36 — Phase Awareness Payload + Finalize Phase (COMPLETE)

**Source:** Architect Handoff Session 22 — Tasks 2 + 3
**Status:** :lock: **LOCKED** — Deployed

#### Phase Awareness Payload (Task 2)

Replaced verbose governance prose in AI system prompt with compact, structured Phase Awareness Payloads. ~40% system prompt token reduction.

```
=== PHASE CONTEXT ===
Phase: BRAINSTORM
Role: Architect (advisory — you do NOT decide completion)
Allowed: generate_options, surface_assumptions, define_kill_conditions, ...
Forbidden: select_option, design_architecture, execute_code, ...
Exit requires: Brainstorm Output Artifact (Director must click Finalize)
```

**Commit:** `3df14ed` — 1 file changed, 108 insertions, 43 deletions

#### Finalize Phase Transaction (Task 3)

`POST /api/v1/projects/:projectId/phases/:phase/finalize` — governance-grade phase transitions:

| Step | Validation | Error Code |
|------|-----------|------------|
| 1. Authority check | Must be project owner (Director) | `AUTHORITY_DENIED` (403) |
| 2. Phase validation | Must match current phase | `PHASE_MISMATCH` (400) |
| 3. Gate validation | All exit gates must be satisfied | `GATES_UNSATISFIED` (400) |
| 4. Artifact validation | Phase-specific structural checks | `ARTIFACT_VALIDATION_FAILED` (400) |
| 5. Phase advance | Set next phase | — |
| 6. Decision ledger | Log in `decision_ledger` table | — |
| 7. Phase lock | Prevent regression to finalized phase | — |

**Frontend:** "Finalize Phase → Next" button in GovernanceRibbon (visible when exit gates satisfied).

**Commit:** `8435974` — 4 files changed, 293 insertions

### 16.21 Session 37 — Non-Software Project Types (COMPLETE)

**Source:** Architect Handoff Session 22 — Task 5
**Status:** :lock: **LOCKED** — Deployed

| Project Type | Gates Required | Hidden Tabs | Auto-Passed Gates |
|-------------|---------------|-------------|-------------------|
| `software` | All (default) | None | None |
| `general` | GA:LIC, GA:DIS, GA:TIR only | Blueprint, Security, Engineering | GA:BP, GA:IVL, GW:QA, GW:DEP |
| `research` | GA:LIC, GA:DIS, GA:TIR only | Blueprint, Security, Engineering | GA:BP, GA:IVL, GW:QA, GW:DEP |
| `legal` | GA:LIC, GA:DIS, GA:TIR only | Blueprint, Security, Engineering | GA:BP, GA:IVL, GW:QA, GW:DEP |
| `personal` | GA:LIC, GA:DIS, GA:TIR only | Blueprint, Security, Engineering | GA:BP, GA:IVL, GW:QA, GW:DEP |

**Implementation:**
- Backend: `project_type` column, type-aware gate initialization, system prompt adaptation
- Frontend: Type selector in Dashboard create modal, `hiddenTabs` prop on TabBar/MiniBar
- AI prompt: `PROJECT TYPE: {type}` label with domain adaptation note

**Commit:** `010fb9a` — 8 files changed, 99 insertions, 16 deletions

### 16.22 Session 38 — Director Review Packet (COMPLETE)

**Source:** ChatGPT Session 11 analysis — behavioral gap identified
**Status:** :lock: **LOCKED** — Deployed

Closes the behavioral gap: governance was correct but the Director experience was reactive, not guided. The AI is now required to present a structured Review Packet before suggesting phase transition.

| Section | Content |
|---------|---------|
| **Phase Summary** | 2-4 sentences on what was accomplished |
| **Review Question** | Phase-specific question from `review_prompt` |
| **Open Questions** | Blocking vs. optional, or "none remain" |
| **Suggested Adjustments** | Refinements before moving on, or "none needed" |
| **Transition Prompt** | "Click Finalize {PHASE} to advance, or tell me what to adjust" |

Also activated the previously dead `review_prompt` field from `PHASE_PAYLOADS` — now injected into system prompt.

**Commit:** `e87299d` — 1 file changed, 34 insertions, 8 deletions

### 16.23 Session 39 — Context Awareness Bridge / HANDOFF-PR-01 (COMPLETE)

**Source:** HANDOFF-PR-01 (Phase Review Packet & Contextual Awareness Bridge)
**Status:** :lock: **LOCKED** — Deployed

**Principle:** "Context may be visible. Authority remains external. Enforcement stays outside the model."

| Tier | Feature | What AI Sees | Status |
|------|---------|-------------|--------|
| **1A** | Security gates visibility | `GS:DC`, `GS:AC`, `GS:AI` status flags | :lock: LOCKED |
| **1B** | Redaction awareness | `active: true, reason: PII_PHI_PROTECTION` | :lock: LOCKED |
| **1C** | Data classification | PII/PHI/minor/financial/legal + exposure level | :lock: LOCKED |
| **2D** | Evidence context | Commits verified, PRs merged, CI status (EXECUTE/REVIEW only) | :lock: LOCKED |
| **2F** | CCS incident awareness | Active incidents + restricted credential list | :lock: LOCKED |

**Architecture (3 files, 202 lines):**
- `types.ts` — `ContextAwareness` interface + `_context_awareness` on `RouterRequest`
- `index.ts` — Router enrichment (5 DB queries after existing security gate enrichment)
- `fallback.ts` — New `=== CONTEXT AWARENESS ===` block in system prompt

**Commit:** `6a57536` — 3 files changed, 202 insertions

### 16.24 Session 40 — Brainstorm Validation Engine / HANDOFF-VD-CI-01 A1+A2 (COMPLETE)

**Source:** HANDOFF-VD-CI-01 (Validation Depth + Contextual Intelligence) — Tasks A1 + A2
**Status:** :lock: **LOCKED** — Deployed

| Task | Feature | Implementation | Status |
|------|---------|---------------|--------|
| **A1** | Brainstorm artifact storage | migration 021, brainstorm.ts API (4 endpoints), frontend extraction | :lock: LOCKED |
| **A2** | Validation engine | 5 BLOCK checks (option count, assumptions, kill conditions, criteria, empty sections) + 4 WARN checks (distinct, measurable, verifiable, global assumptions) | :lock: LOCKED |

**Architecture (5 files, ~500 lines):**
- `migrations/021_brainstorm_artifacts.sql` — versioned artifact table with JSON columns
- `src/api/brainstorm.ts` — 4 endpoints + validation engine (exported for state.ts)
- `src/api/state.ts` — BRAINSTORM finalize now runs full artifact validation
- Frontend `api.ts` — brainstormApi client, `Project.tsx` — artifact extraction, `MessageBubble.tsx` — badge

**Commit:** `d18212c` — 8 files changed, ~500 insertions

### 16.25 Sessions 41-42 — Task Delegation Layer / HANDOFF-TDL-01 (COMPLETE)

**Source:** HANDOFF-TDL-01 (Task Delegation Layer) — 8 Tasks across 4 Sessions
**Status:** :lock: **LOCKED** — All sessions deployed

**Principle:** "D4-CHAT transforms from a governed chat tool into a governed work management platform."

| Session | Tasks | Focus | Commit | Status |
|---------|-------|-------|--------|--------|
| Session 1 | Tasks 1-2 | DB schema + backend API | `1750a9f` | :lock: LOCKED |
| Session 2-4 | Tasks 3-7 | System prompt + frontend full-stack | `5d0bff8` | :lock: LOCKED |

**Backend (Router Worker):**
- **Migration 022:** 3 tables (task_assignments 28 cols, escalation_log 12 cols, standup_reports 13 cols) + 7 indexes
- **assignments.ts:** 20 endpoints — CRUD (assign, batch, list, detail, update, delete), Lifecycle (start, progress, submit, accept, reject, pause, resume, block), Escalation (create, list, resolve), Standup (post, list), TaskBoard (aggregated kanban view)
- **DAG enforcement:** Upstream dependencies must be DONE/VERIFIED/LOCKED/CANCELLED before assignment
- **Conservation Law:** Accepted deliverables update status to DONE (locked)
- **Decision ledger logging:** All lifecycle events recorded via `logDecision()`
- **EXECUTE phase payload:** Rewritten with TDL behavioral rules (work from assignments, structured output blocks)
- **Work order injection:** Active assignments rendered into AI system prompt with priority, progress, definition of done
- **Structured output format:** AI instructed to emit PROGRESS UPDATE, SUBMISSION, ESCALATION, STANDUP blocks
- **Context enrichment pipeline:** Tier 3 task_delegation queries (assignments + escalations + standup cadence)
- **Standup cadence detection:** AI prompted to post standup every ~5 messages

**Frontend (WebApp UI):**
- **api.ts:** assignmentsApi (full CRUD, lifecycle, escalation, standup, task board) + TypeScript types
- **useAssignments.ts:** Hook managing assignments, escalations, standups, task board state with auto-fetch
- **TaskBoard.tsx:** Kanban board with 6 status columns, priority badges, progress bars, lifecycle actions
- **EscalationBanner.tsx:** Decision-needed banners with options, AI recommendation, resolve input
- **StandupCard.tsx:** Structured standup report cards (working on, completed, blocked, next, estimate)
- **MessageBubble.tsx:** Parses structured AI output blocks into inline color-coded cards
- **TabBar.tsx:** Added Tasks tab (7th tab after Engineering)
- **Project.tsx:** useAssignments hook, Tasks ribbon panel, auto-extraction of structured blocks from AI responses

### 16.26 Session 43 — Phase Validators + Warning Override + Integration Tests / HANDOFF-VD-CI-01 A3+A4, TDL-01 Task 8 (COMPLETE)

**Source:** HANDOFF-VD-CI-01 (Tasks A3, A4) + HANDOFF-TDL-01 (Task 8)
**Status:** :lock: **LOCKED** — Deployed + tests passing

**Phase Validators (VD-CI-01 A3) — state.ts:**
- **PLAN phase (P4-P6):** scope_boundaries_defined (no NULL/empty boundaries), deliverables_have_dod (non-empty dod_evidence_spec), no_orphan_deliverables (LEFT JOIN scopes check)
- **EXECUTE phase (E1-E4):** execution_messages_exist (renamed), assignments_resolved (no ASSIGNED/IN_PROGRESS remaining), deliverables_accepted (at least 1 ACCEPTED), submission_evidence (all SUBMITTED/ACCEPTED have non-empty evidence). E2-E4 conditional on totalAssignments > 0 (backward compat)
- **REVIEW phase (R1-R2):** review_activity (≥2 assistant messages in REVIEW sessions), review_summary (active session summary ≥20 chars)

**Quality Warning Override (VD-CI-01 A4) — state.ts + api.ts + Project.tsx:**
- **Three-way finalize response:** REJECTED (422, BLOCK checks fail) → WARNINGS (200, WARNs fail, no override) → APPROVED (200, all pass or override)
- **Backend:** Parse `override_warnings` + `override_reason` from body, log QUALITY_OVERRIDE to decision_ledger with check names + reason
- **Frontend:** Warning modal with textarea for reason, Override & Finalize button, state management (pendingWarnings, warningPhase, overrideReason)

**Integration Tests (TDL-01 Task 8) — Vitest:**
- **phase-validators.test.ts (23 tests):** Brainstorm validation BLOCK/WARN checks, PLAN/EXECUTE/REVIEW check expectations
- **warning-override.test.ts (12 tests):** Three-way decision logic, audit trail, edge cases
- **tdl-lifecycle.test.ts (42 tests):** Status transitions, full lifecycle, DAG enforcement, escalation protocol, standup reports, conservation law

### 16.27 Session 44 — Project Continuity Capsule / HANDOFF-PCC-01 (COMPLETE)

**Source:** HANDOFF-PCC-01 (Project Continuity Capsule) — 8 Tasks across 2 Sessions
**Status:** :lock: **LOCKED** — Full-stack deployed

**Principle:** "D4-CHAT gains institutional memory — each session starts with complete project awareness, not a blank slate."

**Backend (Router Worker):**
- **Migration 023:** ALTER decision_ledger (add summary TEXT, supersedes_decision_id TEXT), CREATE continuity_pins (id, project_id, pin_type, target_id, label, pinned_by, pinned_at + UNIQUE constraint)
- **continuity.ts (7 endpoints):** Computed capsule (14 D1 queries), session detail, decisions (with ?action filter), artifacts (with ?type filter), pins CRUD (GET/POST/DELETE)
- **getProjectContinuityCompact():** Builds ≤500-token string for AI system prompt (project+phase, sessions, decisions, active work, escalations, pins, deliverable stats)
- **Router Tier 4:** Non-fatal PCC injection between Tier 3 (TDL) and context assignment
- **types.ts:** Added `continuity?: string` to ContextAwareness interface

**Frontend (WebApp UI):**
- **fallback.ts:** `=== PROJECT CONTINUITY ===` block rendering + CONTINUITY RULE + `=== CONTINUITY CONFLICT ===` format instruction
- **api.ts:** continuityApi (getCapsule, getSessionSummary, getDecisions, getArtifacts, getPins, createPin, deletePin) + ContinuityCapsule/ContinuityPin interfaces
- **useContinuity.ts:** Hook managing capsule state, loading, error, refresh, pinItem, unpinItem
- **ProjectMemoryPanel.tsx:** Progress summary with bar, selected approach, pinned items, session timeline, key decisions (pin/unpin), active work, open escalations, rejected approaches
- **MessageBubble.tsx:** RETRIEVE + CONTINUITY CONFLICT block parsing with inline styled cards (cyan + orange)
- **TabBar.tsx:** Added Memory tab (8th tab, between Tasks and Security)
- **Project.tsx:** useContinuity hook integration, ProjectMemoryPanel rendering for 'memory' tab

### 16.28 Sessions 45-46 — Phase Transition Experience + Brainstorm Quality Loop / HANDOFF-PTX-01 + HANDOFF-BQL-01 (COMPLETE)

**Source:** HANDOFF-PTX-01 (Phase Transition Experience) + HANDOFF-BQL-01 (Brainstorm Quality Loop)
**Status:** :lock: **LOCKED** — Deployed

**HANDOFF-PTX-01 — Phase Transition Experience:**

Closes the UX gap: after artifact save, the Director sees a clear next-step prompt instead of silence.

| Component | Description | Status |
|-----------|-------------|--------|
| Brainstorm artifact save prompt | Shimmer-bordered panel "AI built your Brainstorm Artifact" with version badge + Finalize button | :lock: LOCKED |
| Readiness-based finalize prompt | Replaces static prompt with readiness indicator + per-dimension pills | :lock: LOCKED |

**HANDOFF-BQL-01 — Brainstorm Quality Loop (4 Layers):**

| Layer | Feature | Implementation | Status |
|-------|---------|---------------|--------|
| **1** | Quality requirements in AI prompt | `BRAINSTORM QUALITY REQUIREMENTS` block in PHASE_PAYLOADS (fallback.ts) — per-dimension instruction | :lock: LOCKED |
| **2a** | Readiness scoring endpoint | `computeBrainstormReadiness()` function (~120 lines), GET /:projectId/brainstorm/readiness endpoint | :lock: LOCKED |
| **2b** | Readiness in system prompt | Tier 5B — `=== BRAINSTORM READINESS ===` block with per-dimension status + instruction | :lock: LOCKED |
| **2c** | Frontend readiness indicator | Amber/green readiness panel, per-dimension pills (✓/⚠/✗), "Ask AI to improve" button | :lock: LOCKED |
| **2d** | Warning modal enhancement | "Ask AI to Fix" purple button in quality warning override modal — sends failing checks to AI | :lock: LOCKED |

**Readiness Dimensions (4):**
- `options` — ≥3 distinct options with unique reasoning
- `assumptions` — ≥3 labeled HIGH/MEDIUM/LOW assumptions
- `kill_conditions` — ≥2 measurable kill conditions with metrics
- `decision_criteria` — ≥3 weighted decision criteria

**Implementation Files:**
- Backend: `src/api/brainstorm.ts` (UPDATED — computeBrainstormReadiness + GET readiness endpoint)
- Backend: `src/routing/fallback.ts` (UPDATED — Layer 1 quality block + Tier 5B readiness rendering)
- Backend: `src/index.ts` (UPDATED — Tier 5B readiness computation + export)
- Frontend: `src/pages/Project.tsx` (UPDATED — readiness state, readiness indicator, "Ask AI to improve" button, "Ask AI to Fix" button in warning modal)
- Frontend: `src/lib/api.ts` (UPDATED — BrainstormReadinessData types + brainstormApi.getReadiness())

**Commits:** `d127821` (PTX-01 + BQL-01 combined)

### 16.29 Session 47 — Governance Foundation Bridging / HANDOFF-GFB-01 (COMPLETE)

**Source:** HANDOFF-GFB-01 (Governance Foundation Bridging) — 3 Tasks (R2, R3, R6)
**Status:** :lock: **LOCKED** — All 3 tasks deployed

**Principle:** "Governance artifacts have lifecycle semantics. Phase regression is governed, not casual. Quality dimensions inform decisions."

#### Task 2 (R3): Artifact State Class

Extends brainstorm artifact `status` with lifecycle semantics:

| State | Meaning | Transition Trigger |
|-------|---------|-------------------|
| `DRAFT` | Work in progress, fully mutable | Initial creation |
| `ACTIVE` | Current governing artifact | BRAINSTORM finalize |
| `FROZEN` | Immutable, locked | REVIEW finalize (terminal) |
| `HISTORICAL` | Superseded by newer version | New artifact created |
| `SUPERSEDED` | Explicitly replaced via REASSESS | L2/L3 reassessment |

**Implementation:**
- Migration 024: `superseded_by TEXT` column + backfill DRAFT→ACTIVE
- `state.ts` finalize: BRAINSTORM→ACTIVE, REVIEW→FROZEN transitions
- `brainstorm.ts` create: previous DRAFT/ACTIVE→HISTORICAL with `superseded_by` reference
- `index.ts` Tier 5: artifact state displayed in system prompt
- `types.ts`: `brainstorm_artifact_state` on ContextAwareness

#### Task 1 (R2): Gate-Aware Fitness Blocking

| Phase | Policy | Behavior |
|-------|--------|----------|
| EXECUTE | WARN | Failing fitness functions surface as overridable quality warnings in finalize modal |

**Implementation:**
- `state.ts` finalize: `FITNESS_PHASE_POLICY` config, queries `fitness_functions` table, adds failures to `warnChecks`
- `index.ts` Tier 6B: fitness function status query (total, passing, failing dimensions)
- `fallback.ts` Tier 6B: `=== QUALITY DIMENSIONS ===` block with pass/fail status
- `types.ts`: `fitness_status` on ContextAwareness

#### Task 3 (R6): REASSESS Protocol

Three-level friction for phase regression:

| Level | Trigger | Requirements | Artifact Impact |
|-------|---------|-------------|----------------|
| **L1 — Surgical Fix** | Same kingdom (B↔P or E↔R) | reason ≥ 20 chars | None |
| **L2 — Major Pivot** | Cross kingdom (E/R → B/P) | reason ≥ 20 chars | ACTIVE artifacts → SUPERSEDED |
| **L3 — Fresh Start** | 3rd+ reassessment | reason ≥ 20 chars + review_summary ≥ 50 chars | All non-FROZEN → SUPERSEDED |

**Backend Implementation:**
- Migration 025: `reassess_count` column on project_state, `reassessment_log` table (7 columns + FK + index)
- `state.ts` PUT /phase: Complete rewrite — regression detection via PHASE_ORDER, 3-level friction, artifact supersession, decision_ledger + reassessment_log dual logging, `reassess_count` increment
- `index.ts` Tier 6C: reassessment history query (count + last reassessment)
- `fallback.ts` Tier 6C: `=== REASSESSMENT HISTORY ===` block with regression details
- `types.ts`: `reassess_count` + `last_reassessment` on ContextAwareness

**Frontend Implementation:**
- `api.ts`: setPhase accepts `reassessOptions`, handles `REASSESS_REASON_REQUIRED` + `REASSESS_REVIEW_REQUIRED` error codes
- `useApi.ts`: setPhase callback updated to pass reassessOptions
- `Project.tsx`: REASSESS modal state (reassessModal, reassessReason, reassessReview), regression detection in handleSetPhase via PHASE_ORDER comparison, level-aware modal UI (color-coded L1 blue/L2 amber/L3 red, character counters, artifact impact warnings, review summary for L3), handleReassessConfirm with error recovery + system message

**Commit:** `45bbd8b` — 10 files changed, 985 insertions, 43 deletions

### 16.30 Session 48 — Diagnostic + Prompt Fixes / HANDOFF-DPF-01 (COMPLETE)

**Source:** HANDOFF-DPF-01 (Diagnostic + Prompt Fixes) — 5 Tasks
**Status:** :lock: **LOCKED** — All tasks deployed

**Principle:** "Fix the silent failures. Stop the AI from delegating governance. Enforce structured output per phase."

#### Task 1 (P0): Cold-Start INTERNAL_ERROR Null Guards

Root cause: Context pipeline Tiers 1C, 2D, 2F, and 3 lacked try/catch wrappers. On new projects with empty data, queries would throw errors that bubbled up as `INTERNAL_ERROR: An unexpected error occurred`.

**Fix:** Each tier wrapped in individual try/catch blocks with `console.error('Tier X query failed (non-fatal):', err)` — pipeline continues even if individual tiers fail.

| Tier | Query | Risk |
|------|-------|------|
| 1C | `data_classification` | Empty project, no classification row |
| 2D | `external_evidence_log` | No evidence entries |
| 2F | `ccs_incidents` | No CCS incidents |
| 3 | `task_assignments → blueprint_deliverables → blueprint_scopes` | No assignments/deliverables |

#### Task 2 (P1): PTX-01 Timing Gap Fix

**Problem:** After saving a brainstorm artifact, the next message's Tier 5 query would return no artifact due to D1 write propagation latency.

**Fix:** When `messageCount > 5` and Tier 5 returns no artifact, retry after 200ms delay before proceeding with empty context.

#### Task 3: Interaction SOP

**Problem:** AI was asking users governance questions like "Is the plan specific enough to execute?" instead of assessing quality itself.

**Fix:**
- Replaced `review_prompt` in always-visible phase payload with `Finalize action: When the user approves, guide them to click Finalize ${phaseName} in the Governance panel.`
- Added `=== INTERACTION RULES ===` block after phase payload with 6 rules:
  1. AI is responsible for meeting governance quality standards
  2. Never ask user to evaluate DoD, acceptance criteria, or compliance
  3. AI assesses quality, user assesses vision match
  4. Present completed work with decisions highlighted
  5. Ask about GOALS not deliverable structure when uncertain
  6. When user says "Approved" — acknowledge, guide to Finalize, don't restart

#### Task 4: Phase Output Contracts

Added `PHASE_OUTPUT_CONTRACTS` map injected after Interaction Rules. Per-phase structured output requirements:

| Phase | Contract Requirements |
|-------|----------------------|
| BRAINSTORM | 2-5 distinct options, assumptions tagged KNOWN/UNKNOWN/HIGH-RISK, measurable kill conditions, decision criteria. No generic templates. |
| PLAN | ONLY work from Brainstorm artifact. Selected option, resolved assumptions, project-specific deliverables, relative milestones (no "[Completion Date]"), justified tech stack, risks from kill conditions. |
| EXECUTE | Work from Plan artifact. Name deliverable, reference spec, produce concrete output, report progress. |
| REVIEW | Verify each deliverable PASS/FAIL against plan spec. Produce Review Report. |

#### Task 5: GFB-01 Deployment Verification

- **5.1:** Confirmed no CHECK constraint on `brainstorm_artifacts.status` — no migration needed
- **5.2:** Readiness endpoint returns `{ ready: false, artifact_exists: false, dimensions: [] }` on empty projects — no crash
- **5.3:** REASSESS correctly marks artifacts SUPERSEDED for L2+, readiness evaluates latest artifact regardless of status

**Commit:** `d0b14ec` — 2 files changed, 211 insertions, 99 deletions

### 16.31 Sessions 49-51+ — Infrastructure Sync + Consolidated Gap Closure / HANDOFF-CGC-01 (COMPLETE)

**Source:** HANDOFF-CGC-01_CONSOLIDATED_GAP_CLOSURE.md — 10 Gaps, 3 Phases
**Status:** :lock: **LOCKED** — All gaps closed, 3 phases deployed

**Principle:** "Close every gap. Enforce every law. Build the multi-agent architecture."

#### Session 49: Infrastructure Sync
- Copilot PR merge (#5, #6)
- DB migrations 026-029 (schema reconciliation, conversations, rate limits)
- SYS-02 Execution Layer E2E tests (59 tests)
- Zod removal + lightweight validation
- 11 TypeScript error fixes

#### Phase 1 — Conservation Law + Phase Contracts (GAPs 4-10)

| Gap | Description | Deliverable |
|-----|-------------|-------------|
| GAP-4 | Conservation Law Tests | D44 — `conservation_law_tests` table + validation logic |
| GAP-5 | L-BRN Enforcement | D45 — ≥3 brainstorm options validator |
| GAP-6 | L-PLN Enforcement | D46 — DAG required validator |
| GAP-7 | L-BPX Enforcement | D47 — Deliverables complete validator |
| GAP-8 | L-IVL Enforcement | D48 — Tests pass validator |
| GAP-9 | Migration Numbering | D49 — `deliverable_numbering_map` + reconciliation |
| GAP-10 | Numbering Fixes | Included in D49 — Missing constraints/indexes |

**Commit:** `6fd1023` — Phase 1, 10 files, 1,028 insertions

#### Phase 2 — Resource-Level Security (GAPs 2-3)

| Gap | Description | Deliverable |
|-----|-------------|-------------|
| GAP-2 | Security Gate Enforcement | D50/D51 — 5 resource-level endpoints + `enforceAIExposureControl()` + `auditSecretAccess()` + SecurityDashboard |
| GAP-3 | Secret Access Audit | Included in D50 — `secret_access_log` table + audit endpoint |

Backend: Updated `security.ts` from v4.3 to v4.5.1 header, added resource classification, jurisdiction review, secret audit endpoints. Frontend: Added 3 methods to `securityApi`, created `SecurityDashboard.tsx`.

**Commit:** `48dc517` — Phase 2, 7 files, 1,455 insertions

#### Phase 3 — Worker-Auditor Multi-Agent Architecture (GAP-1)

| Component | Description | Deliverable |
|-----------|-------------|-------------|
| Migrations 035-037 | `agent_instances`, `agent_tasks`, `agent_audit_log` tables | D52 |
| `agents/registry.ts` | 5 agent definitions (supervisor, codeWorker, bulkWorker, researchWorker, auditor) | D52 |
| `agents/executor.ts` | Worker-Auditor loop with retry, fallback models | D52 |
| `api/agents.ts` | 14 Hono endpoints (CRUD, orchestrate, execute, approve, audit-log) | D52 |
| `AgentDashboard.tsx` | Real-time agent + task status with 5s polling | D53 |
| `ApprovalGate.tsx` | HITL modal with audit report, findings, feedback | D53 |

Agent registry: 5 agents mapped to preferred models (Claude Sonnet 4, GPT-4o, Gemini 2.5 Pro, DeepSeek Chat) with fallback chains. Executor: Worker → Auditor → (Retry|HITL|Pass) loop, max 3 attempts, readiness metric R = L × P × V. 23 audit event types for full lifecycle tracking.

**Commit:** `29f2124` — Phase 3, 9 files, 1,909 insertions

**Total CGC-01:** 3 commits, 26 files changed, 4,392 insertions, 10 deliverables (D44-D53)

### 16.32 Session 52 — Security Audit Remediation / HANDOFF-COPILOT-AUDIT-01 (COMPLETE)

**Source:** GitHub Copilot Security Audit — 16 findings across backend + frontend
**Status:** :lock: **LOCKED** — 8 fixed, 7 accepted risks (documented), 1 deferred

**Principle:** "Hash passwords properly. Encrypt secrets at rest. Add defense-in-depth headers."

#### Audit Triage Summary

| Category | Count | Action |
|----------|-------|--------|
| **FIX** | 8 | Implemented and deployed |
| **ACCEPT** | 7 | Documented in SECURITY_AUDIT_DECISIONS.md |
| **DEFER** | 1 | Rate limiting IP spoofing (Cloudflare handles) |

#### 8 Fixes Implemented

| Fix | Finding | Description | Deliverable |
|-----|---------|-------------|-------------|
| F1 | Weak password hashing | SHA-256 → PBKDF2 (100K iterations, per-user 16-byte salt) | D54 |
| F2 | Plaintext session tokens | SHA-256 one-way hash stored in `token_hash` column | D54 |
| F3 | API keys stored in plaintext | AES-256-GCM encryption at rest with random 12-byte IV | D54 |
| F4 | No server-side logout | DELETE session by token_hash on `/auth/logout` | D54 |
| F5 | Password min length inconsistency | Aligned registration (was 6) to reset-password (8 chars) | D54 |
| F6 | No security response headers | CSP, X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy | D55 |
| F7 | No request correlation | X-Request-ID middleware (UUID per request) | D55 |
| F8 | Frontend regex misalignment | API key validation patterns aligned to backend | D54 |

#### 7 Accepted Risks

| Risk | Finding | Rationale |
|------|---------|-----------|
| A1 | localStorage for tokens | Bearer token auth (not cookies) — CSRF N/A; established pattern after cookie failures |
| A2 | No CSRF protection | Authorization header auth, not cookie-based — CSRF not applicable |
| A3 | Broad try/catch in routes | Intentional — prevents 500 errors leaking stack traces |
| A4 | API key preview logging | Removed in F3 fix (key-resolver.ts) |
| A5 | Email enumeration via registration | Acceptable for MVP; rate-limited |
| A6 | No account lockout | Rate limiting provides sufficient protection |
| A7 | Token expiry in response | Session tokens are opaque UUIDs; knowing expiry is low risk |

#### Transparent Migration Patterns

All security upgrades use **zero-downtime transparent migration**:

- **Passwords:** Login verifies by `hash_algorithm` column — legacy SHA-256 verified first, then re-hashed with PBKDF2 automatically
- **Session tokens:** `requireAuth` queries `token_hash` first, falls back to plaintext `token` column, backfills hash on legacy match
- **API keys:** `decryptApiKey()` tries AES-GCM decrypt, catches error for plaintext legacy keys — new keys always encrypted

#### New Files (5)

| File | Purpose |
|------|---------|
| `src/utils/crypto.ts` | Shared crypto module: AES-GCM encrypt/decrypt, SHA-256 hash, PBKDF2 hash/verify |
| `migrations/038_password_hash_upgrade.sql` | Adds `password_salt TEXT`, `hash_algorithm TEXT DEFAULT 'sha256'` to users |
| `migrations/039_session_token_hash.sql` | Adds `token_hash TEXT` + index to sessions |
| `public/_headers` (webapp-ui) | Cloudflare Pages security response headers (CSP + 5 headers) |
| `docs/SECURITY_AUDIT_DECISIONS.md` | Documents all 7 accepted risks + 1 deferred with rationale |

#### Modified Files (11)

| File | Changes |
|------|---------|
| `src/api/auth.ts` | PBKDF2 registration + transparent login migration + token hashing + logout |
| `src/middleware/requireAuth.ts` | Token hash lookup with plaintext fallback + backfill |
| `src/api/api-keys.ts` | AES-GCM encrypt on write, decrypt on read |
| `src/routing/key-resolver.ts` | BYOK key decryption, removed key preview logging |
| `src/api/github.ts` | Delegated to shared crypto module |
| `src/index.ts` | Shared crypto import, X-Request-ID middleware, dynamic CORS origin |
| `src/types.ts` | Added `API_KEY_ENCRYPTION_KEY` env var |
| `webapp-ui/src/contexts/AuthContext.tsx` | Server-side logout call |
| `webapp-ui/src/lib/api/auth.ts` | Added `logout()` method |
| `webapp-ui/src/pages/Settings.tsx` | Frontend regex alignment |

#### Deployment Verification (E2E — Live Production)

| Test | Result | Method |
|------|--------|--------|
| Security headers (6) | ✅ PASS | XHR getResponseHeader on all 6 headers |
| PBKDF2 registration | ✅ PASS | POST /auth/register → 201, user created |
| PBKDF2 login | ✅ PASS | POST /auth/login → 200, token returned |
| Token hash auth | ✅ PASS | GET /auth/me → 200 via hashed token lookup |
| API key encrypt/decrypt | ✅ PASS | POST key → GET key → exact match confirmed |
| Server-side logout | ✅ PASS | POST /auth/logout → 200, re-use token → 401 |
| X-Request-ID | ✅ PASS | UUID in response headers on all endpoints |
| CORS preview domains | ✅ PASS | curl preflight returns correct ACAO header |

**Commits:** `583898a` (5 new files), `f8e05d9` (10 modified files), `c3e4515` (CORS fix)
**Branch:** `deploy/gap-closure-cgc-01` → merged to `main`
**Worker Version:** `f1da8c91`
**Pages Deployment:** `b026d3d8`
**Total:** 3 commits, 16 files changed, ~600 insertions, 3 deliverables (D54-D56)

---

## 17. RECOVERY COMMANDS

### 17.1 Resume D4-CHAT Work

```
TECH CONTINUE
Project: D4-CHAT
Status: Backend 100%, Frontend ~100% (all API methods wired to UI)
Governance: AIXORD v4.5.3 (Second Audit Remediation — error tracking, legacy token deadline, unit tests)
Phase Enforcement: Tier 1 ACTIVE (hard gate blocking + Finalize Phase + brainstorm validation + work order injection + continuity conflict detection)
APIs Working: Auth (9), Projects (5), State (5), Decisions (2), Messages (4), Sessions (7), Router (4), GitHub (5), Evidence (3), Images (5), Security (8), CCS (11), Layers (5), Engineering (35), Knowledge (7), Usage (3), Blueprint (12), Workspace (4), Brainstorm (4), Assignments (20), Continuity (7), Agents (14)
Completed: All prior handoffs + HANDOFF-CGC-01 + HANDOFF-COPILOT-AUDIT-01 + Second Audit Remediation + Third Audit Triage (COPILOT-AUDIT-03)
Remaining: HANDOFF-VD-CI-01 Sessions 4+ (B1-B6), Tier 2 (extended phases), Tier 3 (artifact contracts), Path B Phase 2+3, E2E billing test, data population, 2FA (deferred to pre-launch)
Last Session: Session 53 (Third Audit Triage — 13 findings: 3 inaccurate, 4 already accepted, 3 accepted new, 1 deferred)
```

### 17.2 AIXORD Continue Format

Per AIXORD v4.5-C:

```
PMERIT CONTINUE | Session:[N] | Seq:[SSC:SEQ] | Prev:[SSC:PREV]
Project: D4-CHAT
Phase: EXECUTE
Reality: GREENFIELD
Formula: Bound to D4-CHAT Master Scope
Gates: LIC=1, DIS=1, TIR=1, ENV=1, OBJ=1, RA=1
Security: GS:DC=1, GS:DP=1, GS:AC=1, GS:AI=1, GS:JR=1, GS:RT=1, GS:SA=1
```

### 17.3 Deployment Commands

```bash
# Backend
cd C:\dev\pmerit\pmerit-technologies\products\aixord-router-worker
npx wrangler deploy

# Frontend
cd C:\dev\pmerit\pmerit-technologies\products\aixord-webapp-ui
npm run build
npx wrangler pages deploy dist --project-name=aixord-webapp-ui
```

---

## 18. VERIFICATION EVIDENCE

### 18.1 Current Deployments

| Component | URL | Status |
|-----------|-----|--------|
| Router Worker | https://aixord-router-worker.peoplemerit.workers.dev | ✅ LIVE |
| WebApp UI | https://aixord-webapp-ui.pages.dev | ✅ LIVE |

### 18.2 Test Accounts

| Email | Password | Status |
|-------|----------|--------|
| test@example.com | test123 | ✅ Active |
| test2@example.com | testpass123 | ✅ Active |

### 18.3 Reconciliation Triad (L-GCP1)

| Category | PLANNED | CLAIMED | VERIFIED |
|----------|---------|---------|----------|
| Backend APIs | 30 | 30 | 30 ✅ (includes Security API) |
| Frontend Pages | 10 | 10 | 10 ✅ |
| Auth System | Complete | Complete | E2E verified ✅ |
| Router | Complete | Complete | Health check verified ✅ |
| Chat-to-Router | Complete | Complete | E2E verified ✅ |
| State Init | Complete | Complete | Auto-init on create ✅ |
| SPG-01 Gates UI | 6 | 6 | UI components exist ✅ |
| SPG-01 Backend | Complete | Complete | **API + enforcement ✅ (Session 13)** |
| D3 SDK Integration | Complete | Complete | **sdk.ts + hook + chat binding ✅ (Session 13)** |
| GKDL-01 Knowledge | Complete | Complete | API + UI deployed ✅ |
| GateTracker v4.5.1 | 29 gates | 29 gates | Frontend + Companion ✅ (PATCH-GATE-RECONCILIATION-01) |
| D5 Companion Sync | Complete | Complete | API client + hooks ✅ |
| Billing E2E | Complete | Complete | Checkout verified ✅ (Session 13) |
| Session Graph (v4.4) | Complete | Complete | API + UI deployed ✅ (Session 20) |

| Part XIV SAR (v4.5) | Required | ✅ **IMPLEMENTED** | Session 22 — `system_architecture_records` table + CRUD API + UI |
| Part XIV Interface Contracts (v4.5) | Required | ✅ **IMPLEMENTED** | Session 22 — `interface_contracts` table + CRUD API + UI |
| Part XIV Operational Readiness (v4.5) | Required | ✅ **IMPLEMENTED** | Session 22 — `operational_readiness` table + CRUD API + UI (L0-L3) |
| Part XIV All 9 Areas (v4.5) | Required | ✅ **IMPLEMENTED** | Session 22 — 9 tables, 35 endpoints, Engineering tab + ribbon + panel |

| VD-CI-01 Brainstorm Validation | Complete | Complete | ✅ Deployed + E2E verified (Session 40) |
| TDL-01 Task Delegation Layer | Complete | Complete | ✅ Deployed + E2E verified (Sessions 41-42) |
| VD-CI-01 Phase Validators + Override | Complete | Complete | ✅ Deployed + Integration Tests (Session 43) |
| PCC-01 Project Continuity Capsule | Complete | Complete | ✅ Deployed + E2E verified (Session 44) |
| PTX-01 Phase Transition Experience | Complete | Complete | ✅ Deployed + E2E verified (Session 45) |
| BQL-01 Brainstorm Quality Loop | Complete | Complete | ✅ Deployed + E2E verified (Session 46) |
| GFB-01 Governance Foundation Bridging | Complete | Complete | ✅ Deployed + E2E verified (Session 47) |
| DPF-01 Diagnostic Fixes | Complete | Complete | ✅ Deployed + E2E verified (Session 48) |

**No critical divergences remaining for v4.5 scope.**
**Session 20 completed Session Graph Model — 5 phases (DB + API + UI + capsule enrichment).**
**Session 21 aligned project plan to AIXORD v4.5 baseline.**
**Session 22 implemented all 9 Part XIV Engineering Governance artifact types as full-stack CRUD infrastructure. Compliance restored from ~85% to ~97%.**
**Session 23 completed D7-D16 Feature Sprint (CollapsibleSection, Progressive Disclosure, Prompt Caching, Session Metrics, Project Metrics, OAuth Fix).**
**Session 24 bridged all backend/frontend gaps — 100/101 API methods now wired to UI. SecurityRibbon, CCS Creation, Engineering CRUD, SessionGraph Viz, GitHub Repo Selection, Image Management, Evidence Sync, Clear Messages, Project Edit, Project Metrics UI.**
**Session 25 made phase transitions contractual — Tier 1 Phase Exit Enforcement active. Backend validates gate requirements (403 + missingGates). Frontend shows blocked phases. 14 TS errors from Session 24 fixed.**
**Session 29 enriched the capsule (workspace context + lineage messageCount/summary) and added evidence session attribution (migration 018, session_id on github_evidence).**
**Session 30 enabled TRIAL users to use platform-provided API keys (no BYOK setup). Fixed messages table FK constraint (migration 019). Added JSON parse resilience to API client. Updated pricing page.**
**Session 34 fixed Dependabot vulnerabilities (wrangler 4, vitest 4), synced security_gates from DB into capsule, added delayed gate re-eval after message send.**
**Session 35 normalized all gate keys to GA:/GW: prefix format and implemented hard gate enforcement — AI model NEVER called when governance gates fail.**
**Session 36 replaced governance prose with Phase Awareness Payloads (~40% token reduction) and implemented Finalize Phase governance transaction (authority check, gate/artifact validation, decision ledger, phase locking).**
**Session 37 added non-software project types (general/research/legal/personal) with reduced gates and hidden tabs.**
**Session 38 enforced Director Review Packet — AI must present structured review before suggesting phase advance.**
**Session 39 implemented Context Awareness Bridge (HANDOFF-PR-01) — AI sees security gates, redaction status, data classification, evidence context, CCS incidents.**
**All 5 Architect Handoff Session 22 tasks COMPLETE. HANDOFF-PR-01 COMPLETE. Project is ~100% functionally complete. Remaining: Tier 2/3 governance extensions, Path B Phase 2+3, Tier 3 strategic integrations, data population.**
**Session 53 completed Second Audit Remediation — structured error tracking (errorTracker.ts + app.onError + ErrorBoundary), LEGACY_TOKEN_DEADLINE (2026-03-15) for auto-disable of plaintext token fallback, 30 new unit tests (crypto/errorTracker/requireAuth). Total: 193/193 tests passing across 9 files. 59 deliverables (D1-D59).**
**Session 53 also triaged Third Copilot Audit (HANDOFF-COPILOT-AUDIT-03) — 13 findings validated: 3 inaccurate (GAP-C2 wrong about JWTs, GAP-L1 understated at 50%, GAP-L2 Activity tab fully implemented), 4 already accepted from first audit, 3 accepted new (E2E tests, error monitoring, OpenAPI), 1 deferred (2FA to pre-launch), 2 acknowledged future (pen testing, SOC 2). 60 deliverables (D1-D60).**

---

---

## 19. SESSION 13 IMPLEMENTATION SUMMARY

### 19.1 SPG-01 Backend Enforcement

**Files Created:**
- `migrations/009_spg01_security_governance.sql` - 4 tables (data_classification, ai_exposure_log, user_rights_requests, security_gates)
- `src/api/security.ts` - Security API with classification, gates, exposure validation

**Router Integration:**
- Added AI exposure validation in `index.ts` router execute endpoint
- Projects without classification blocked with `AI_EXPOSURE_RESTRICTED`
- Projects with PROHIBITED classification blocked entirely

### 19.2 D3 SDK Integration

**Files Created:**
- `src/lib/sdk.ts` - Full SDK client wrapper (~500 lines)
  - `AIXORDSDKClient` class
  - `useAIXORDSDK` React hook
  - `GateBlockedError` and `AIExposureBlockedError` classes
  - Gate checking (GP, GS:DC, GS:AI)
  - AI exposure validation (L-SPG3, L-SPG4)

**Integration:**
- Modified `Project.tsx` to use SDK for chat
- Replaced direct `api.router.execute()` with `sdkSend()`
- Added governance error handling with L-law references
- Enforcement metadata included in message responses

### 19.3 Billing Verification

- Fixed `PRICE_TO_TIER` mapping with production Stripe price IDs
- Verified checkout endpoint returns valid Stripe URL

---

**END PROJECT PLAN v4.0**

*AIXORD v4.5 — Authority. Formula. Conservation. Verification. Reconciliation. Protection. Engineering Governance.*
*Sessions are governed nodes. Artifacts endure. Architecture must be declared. Boundaries must be verified. Iteration must be governed. Systems must be operable. When in doubt, protect.*
*Governance lives outside the model. AI models cannot be governed. Only AI execution can be governed.*
*Updated: 2026-02-09 (Session 39 — Context Awareness Bridge: HANDOFF-PR-01)*

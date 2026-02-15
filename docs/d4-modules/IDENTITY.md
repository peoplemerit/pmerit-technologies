# D4-CHAT: Identity & Vision

**Module:** Project identity, vision, governance alignment, objectives, value proposition, target users (§1-5)
**Parent Manifest:** `docs/D4-CHAT_PROJECT_PLAN.md`
**Growth Class:** STATIC
**Last Updated:** 2026-02-15 (Session 53)

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
| L-LEM1-2 | LEM is doctrine, not gate/phase; inside EXECUTE only | ✅ Path B Phase 1+2 |
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
| **Project** | Cumulative cost, token distribution by model class, cost trend | Activity tab | ✅ Implemented (Session 19) |
| **Account** | Total spend, usage by project, budget alerts | Settings or Analytics page | ⏳ Missing |

**Implementation Notes:**
- Backend already stores all raw data in messages table
- Session/project aggregation requires SQL queries on existing data (no new tables)
- Activity tab content displays project-level metrics (implemented Session 19 — ActivityTab.tsx)
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


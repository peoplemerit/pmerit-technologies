# D4-CHAT: Architecture

**Module:** Directory structure (backend + frontend) and technology stack (§7-8)
**Parent Manifest:** `docs/D4-CHAT_PROJECT_PLAN.md`
**Growth Class:** SEMI-STATIC
**Last Updated:** 2026-02-15 (Session 53)

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
│   │   ├── crypto.ts                    # AES-GCM, SHA-256, PBKDF2 (encryption/hashing)
│   │   ├── errorTracker.ts              # Structured error logging (JSON for wrangler tail)
│   │   └── redaction.ts                 # Data redaction utilities
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


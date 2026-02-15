# D4-CHAT: Database Architecture

**Module:** D1 database schemas, R2 storage, all 61 tables across 35 migrations (§9)
**Parent Manifest:** `docs/D4-CHAT_PROJECT_PLAN.md`
**Growth Class:** SLOW-GROWTH
**Last Updated:** 2026-02-15 (Session 54)

---

## 9. DATABASE ARCHITECTURE

### 9.1 D1 Database Info

| Field | Value |
|-------|-------|
| Database Name | aixord-db |
| Database ID | 4222a800-ec94-479b-94d2-f1beaa7d01d9 |
| Type | Cloudflare D1 (SQLite) |
| Binding | `DB` |

### 9.2 Table Schema (61 Tables — 35 Migrations + 3 Inline)

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

#### Structured Audit Findings (migrations 040-041 — MOSA-AUDIT-01 Phase 2A)
```sql
audit_findings (id, audit_id → agent_audit_log, finding_type [8 types],
               severity ['CRITICAL'|'HIGH'|'MEDIUM'|'LOW'|'INFO'],
               title, description, file_path, line_number, code_snippet, recommendation,
               disposition ['PENDING'|'FIX'|'ACCEPT'|'DEFER'|'INVALID'],
               disposition_reason, triaged_by → users, triaged_at,
               fixed_in_commit, prior_audit_match, created_at, updated_at)
audit_config (project_id → projects, worker_model, auditor_model,
             auto_audit_on_lock, incremental_by_module,
             diminishing_returns_threshold, critical_auto_halt, high_severity_limit,
             max_context_per_audit, created_at, updated_at)
-- Indexes: audit_id, disposition, severity, file_path, prior_audit_match
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


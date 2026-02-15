# D4-CHAT: API Reference

**Module:** Complete endpoint matrix (200+ endpoints across 25 modules), router execute contract (§10)
**Parent Manifest:** `docs/D4-CHAT_PROJECT_PLAN.md`
**Growth Class:** SLOW-GROWTH
**Last Updated:** 2026-02-15 (Session 56)

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
| **Audit Findings (7)** | /api/v1/projects/:id/audit-findings | POST | ✅ | agents.ts |
| | /api/v1/projects/:id/audit-findings | GET | ✅ | agents.ts |
| | /api/v1/projects/:id/audit-findings/:fid/triage | PUT | ✅ | agents.ts |
| | /api/v1/projects/:id/agents/audit-diff | POST | ✅ | agents.ts |
| | /api/v1/projects/:id/audit-config | GET | ✅ | agents.ts |
| | /api/v1/projects/:id/audit-config | PUT | ✅ | agents.ts |
| | /api/v1/projects/:id/agents/context-budget | GET | ✅ | agents.ts |
| **Audit Gate (3)** | /api/v1/projects/:id/gates/ga-aud | GET | ✅ | agents.ts |
| | /api/v1/projects/:id/agents/diminishing-returns | GET | ✅ | agents.ts |
| | /api/v1/projects/:id/agents/audit-incremental | POST | ✅ | agents.ts |
| **API Keys (5)** | /api/v1/api-keys | GET | ✅ | api-keys.ts |
| | /api/v1/api-keys | POST | ✅ | api-keys.ts |
| | /api/v1/api-keys/:id/reveal | POST | ✅ | api-keys.ts |
| | /api/v1/api-keys/:provider | DELETE | ✅ | api-keys.ts |
| | /api/v1/api-keys/test | POST | ✅ | api-keys.ts |

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


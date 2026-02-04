# SPEC — Code Tasks Add-On (Future)

**Status:** SPECIFIED — NOT FOR IMPLEMENTATION
**Target:** Post-launch (v4.5+)
**Pricing:** $29.99/month add-on (attaches to any Standard or Pro tier)
**Document:** Per HANDOFF-D4-COMPREHENSIVE-V12

---

## Overview

Code Tasks extends D4-CHAT with code-aware AI capabilities:
code generation, debugging, refactoring, and review.

This is a premium add-on for professional developers who need
governed code assistance within the AIXORD framework.

---

## Key Principle

Claude Code is a **routed capability** behind the Router Worker,
not a new control plane. It uses the Anthropic Messages API
with tool-use enabled and code-specific system prompts.

---

## Intent Types

| Intent | Description | Primary Model |
|--------|-------------|---------------|
| `CODE_GEN` | Generate new code from specification | Claude Sonnet |
| `CODE_EDIT` | Refactor or modify existing code | Claude Sonnet |
| `CODE_REVIEW` | Review code for quality/security | Claude Sonnet |
| `DEBUG` | Diagnose errors from logs/traces | Claude Sonnet |
| `TEST_FIX` | Fix failing tests | Claude Sonnet |

---

## Activation Model

- **Explicit user action required** (button press, not auto-triggered)
- **Per-task file/context selection required** (no ambient access)
- **Diff-only output for edits** (no silent changes to files)
- **Two-step apply:** generate → review → apply

### User Flow

1. User clicks "Code Task" button in chat
2. Selects task type (generate, edit, review, debug, test-fix)
3. Provides context (file path, code snippet, error logs)
4. AI generates response with structured diff/code
5. User reviews and explicitly applies changes

---

## Entitlement

- **Requires add-on subscription** (separate Stripe product)
- **Limit:** 100 code tasks/month
- **Tracked via:** `code_task_count` in `usage_tracking` table
- **Enforcement:** Check entitlement before routing to code task

### Subscription Tiers with Code Tasks

| Tier | Monthly Fee | Code Tasks |
|------|-------------|------------|
| BYOK_STANDARD + Code Tasks | $9.99 + $29.99 | 100/month |
| PLATFORM_STANDARD + Code Tasks | $19.99 + $29.99 | 100/month |
| PLATFORM_PRO + Code Tasks | $49.99 + $29.99 | 100/month |
| ENTERPRISE | Custom | Unlimited |

---

## Router Integration

### New Intent Family (intent-map.ts)

```typescript
// CODE_* intents route to code-aware Claude Sonnet
const CODE_INTENTS: RouterIntent[] = [
  'CODE_GEN',
  'CODE_EDIT',
  'CODE_REVIEW',
  'DEBUG',
  'TEST_FIX'
];

// Model preference for code tasks
const CODE_MODEL_PREFERENCE = 'claude-sonnet-4-20250514';
```

### Code-Specific System Prompts

```typescript
const CODE_SYSTEM_PROMPTS = {
  CODE_GEN: `You are a code generation assistant. Generate clean, well-documented code
following best practices. Output ONLY the code with no explanations unless asked.`,

  CODE_EDIT: `You are a code editing assistant. Analyze the provided code and suggest
improvements. Output changes in unified diff format.`,

  CODE_REVIEW: `You are a code review assistant. Analyze the code for:
- Security vulnerabilities
- Performance issues
- Best practice violations
- Code style consistency
Provide actionable feedback with line numbers.`,

  DEBUG: `You are a debugging assistant. Analyze the error logs and code to identify
the root cause. Provide a clear diagnosis and suggested fix.`,

  TEST_FIX: `You are a test fixing assistant. Analyze the failing test and the code
being tested. Identify why the test fails and provide the fix.`
};
```

### Structured Response Parsing

Code task responses are parsed into structured formats:

```typescript
interface CodeTaskResponse {
  type: 'CODE_GEN' | 'CODE_EDIT' | 'CODE_REVIEW' | 'DEBUG' | 'TEST_FIX';
  content: string;
  diff?: string;          // For CODE_EDIT
  files?: string[];       // Files affected
  verification?: string;  // Command to verify fix
  confidence: number;     // 0-1 confidence score
}
```

---

## Guardrails

### Security

| Guardrail | Description |
|-----------|-------------|
| **No direct repo access** | Code is provided by user, not fetched |
| **Secret scan gate** | Output scanned for secrets before display |
| **Bounded diffs** | Changes scoped to declared files only |
| **D3 rejection** | Changes outside declared scope rejected |

### L-SPG Compliance

- **L-SPG3:** No source code sent to AI if PROHIBITED classification
- **L-SPG4:** Unknown classification blocks code tasks
- **L-SPG6:** GS:AI gate required for code task execution

---

## Cost Controls

| Control | Limit |
|---------|-------|
| Per-task token budget | 8,000 tokens (input + output) |
| Monthly task limit | 100 tasks |
| Model | Claude Sonnet only (no downgrade) |

### Cost Estimation

```typescript
// Claude Sonnet cost: ~$0.90 per 1K tokens
// Average code task: ~4K tokens
// Estimated cost per task: ~$3.60
// Monthly limit cost: ~$360 (covered by $29.99 fee + margin)
```

---

## Database Schema (Future)

```sql
-- Already exists in usage_tracking:
-- code_task_count INTEGER DEFAULT 0

-- Future: Add code task history
CREATE TABLE IF NOT EXISTS code_task_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  task_type TEXT NOT NULL,
  input_context TEXT,
  output_content TEXT,
  diff TEXT,
  tokens_used INTEGER,
  cost_cents INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## API Endpoints (Future)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/code-tasks` | Create a new code task |
| GET | `/api/v1/code-tasks/:id` | Get code task result |
| POST | `/api/v1/code-tasks/:id/apply` | Apply code task changes |
| GET | `/api/v1/code-tasks/history` | List user's code task history |

---

## Implementation Phases (Post-Launch)

| Phase | Scope | Target |
|-------|-------|--------|
| **P1** | Basic CODE_GEN and CODE_EDIT | v4.5 |
| **P2** | CODE_REVIEW with security scan | v4.6 |
| **P3** | DEBUG and TEST_FIX | v4.7 |
| **P4** | Git integration (diff preview) | v4.8 |

---

## NOT Included (Out of Scope)

- Direct filesystem/repo access
- Automatic code application
- CI/CD integration
- IDE plugins
- Real-time pair programming

These features may be considered for future roadmap.

---

*AIXORD v4.3 — Authority. Formula. Conservation. Verification. Reconciliation. Protection.*
*Document Status: SPECIFIED — NOT FOR IMPLEMENTATION*
*Created: 2026-02-02*

/**
 * Agent Registry — Model Competency Mapping
 * AIXORD v4.5.1 — HANDOFF-CGC-01 GAP-1
 *
 * Defines agent roles, their preferred models, system prompts,
 * and competency-to-model routing for the Worker-Auditor architecture.
 */

export type AgentRole = 'SUPERVISOR' | 'WORKER' | 'AUDITOR';

export type TaskType =
  | 'CODE_GENERATION'
  | 'API_TEST'
  | 'FILE_CREATE'
  | 'FILE_UPDATE'
  | 'DATABASE_MIGRATION'
  | 'DEPLOYMENT'
  | 'DOCUMENTATION'
  | 'QUALITY_CHECK'
  | 'SECURITY_SCAN'
  | 'RESEARCH'
  | 'ANALYSIS';

export interface AgentDefinition {
  role: AgentRole;
  preferredModel: string;
  preferredProvider: 'anthropic' | 'openai' | 'google' | 'deepseek';
  fallbackModels: Array<{ provider: string; model: string }>;
  systemPrompt: string;
  competencies: TaskType[];
  requiresApproval: boolean;
  costTier: 'HIGH' | 'MEDIUM' | 'LOW';
}

export const AGENT_REGISTRY: Record<string, AgentDefinition> = {
  supervisor: {
    role: 'SUPERVISOR',
    preferredModel: 'claude-sonnet-4-20250514',
    preferredProvider: 'anthropic',
    fallbackModels: [
      { provider: 'openai', model: 'gpt-4o' },
      { provider: 'google', model: 'gemini-2.5-pro' },
    ],
    systemPrompt: `You are the Project Supervisor AI operating under AIXORD governance.

Your role:
1. Parse acceptance criteria from MASTER_SCOPE
2. Break down objectives into atomic sub-tasks
3. Calculate Readiness Metric (R = L × P × V) for each task
4. Assign tasks to Workers based on competency matching
5. Request human approval (HITL) when R < 0.8
6. You do NOT execute tasks — you delegate and verify.

Output Format: JSON with { tasks: [{ type, description, acceptance_criteria, estimated_wu }] }`,
    competencies: ['ANALYSIS', 'DOCUMENTATION'],
    requiresApproval: false,
    costTier: 'HIGH',
  },

  codeWorker: {
    role: 'WORKER',
    preferredModel: 'claude-sonnet-4-20250514',
    preferredProvider: 'anthropic',
    fallbackModels: [
      { provider: 'openai', model: 'gpt-4o' },
      { provider: 'deepseek', model: 'deepseek-chat' },
    ],
    systemPrompt: `You are a Code Generation Worker operating under AIXORD governance.

Your role:
1. Receive atomic coding tasks from Supervisor
2. Generate production-ready code
3. Follow project conventions and best practices
4. Report completion with evidence (code output + explanation)
5. You CANNOT approve your own work — the Auditor reviews you.

Always output: { code: "...", explanation: "...", files_affected: [...], tests_needed: [...] }`,
    competencies: ['CODE_GENERATION', 'FILE_CREATE', 'FILE_UPDATE', 'DATABASE_MIGRATION'],
    requiresApproval: true,
    costTier: 'MEDIUM',
  },

  bulkWorker: {
    role: 'WORKER',
    preferredModel: 'deepseek-chat',
    preferredProvider: 'deepseek',
    fallbackModels: [
      { provider: 'google', model: 'gemini-2.5-flash' },
    ],
    systemPrompt: `You are a Bulk Task Worker optimized for cost-effective execution.

Your role:
1. Execute simple, well-defined tasks quickly
2. Follow exact specifications without deviation
3. Report completion with evidence
4. You are optimized for throughput on well-specified tasks.`,
    competencies: ['CODE_GENERATION', 'DOCUMENTATION', 'FILE_CREATE', 'FILE_UPDATE'],
    requiresApproval: true,
    costTier: 'LOW',
  },

  researchWorker: {
    role: 'WORKER',
    preferredModel: 'gemini-2.5-pro',
    preferredProvider: 'google',
    fallbackModels: [
      { provider: 'anthropic', model: 'claude-sonnet-4-20250514' },
      { provider: 'openai', model: 'gpt-4o' },
    ],
    systemPrompt: `You are a Research Worker operating under AIXORD governance.

Your role:
1. Gather information from documents and provided context
2. Summarize findings in structured format
3. Flag conflicting information
4. Report confidence levels for each finding
5. You do NOT execute code or make decisions.

Output: { findings: [...], confidence: 0-100, conflicts: [...], summary: "..." }`,
    competencies: ['RESEARCH', 'DOCUMENTATION', 'ANALYSIS'],
    requiresApproval: false,
    costTier: 'MEDIUM',
  },

  auditor: {
    role: 'AUDITOR',
    preferredModel: 'claude-sonnet-4-20250514',
    preferredProvider: 'anthropic',
    fallbackModels: [
      { provider: 'openai', model: 'gpt-4o' },
    ],
    systemPrompt: `You are the Project Auditor (Red Team) operating under AIXORD governance.

Your role:
1. Critically evaluate Worker output against acceptance criteria
2. Check DAG dependencies are satisfied
3. Detect hallucinations, scope creep, security issues
4. Output structured JSON validation report
5. If FAIL: Provide specific remediation instructions for Worker retry
6. If PASS: Forward summary for human approval

Output ONLY valid JSON:
{
  "audit_status": "PASS" | "FAIL" | "NEEDS_REVISION",
  "confidence_score": 0-100,
  "findings": [{ "type": "...", "severity": "High|Medium|Low", "description": "...", "remediation": "..." }],
  "criteria_met": [true/false for each criterion],
  "owner_summary": "..."
}`,
    competencies: ['ANALYSIS', 'QUALITY_CHECK', 'SECURITY_SCAN'],
    requiresApproval: false,
    costTier: 'HIGH',
  },
};

/**
 * Select appropriate agent for task type based on competency and cost preference
 */
export function selectAgentForTask(
  taskType: TaskType,
  costPreference: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM'
): AgentDefinition {
  // Find all worker agents that can handle this task type
  const candidates = Object.values(AGENT_REGISTRY).filter(
    (agent) => agent.role === 'WORKER' && agent.competencies.includes(taskType)
  );

  if (candidates.length === 0) {
    // Fall back to codeWorker as default
    return AGENT_REGISTRY.codeWorker;
  }

  // Prefer matching cost tier
  const preferred = candidates.find((a) => a.costTier === costPreference);
  if (preferred) return preferred;

  // Otherwise return first match (typically the highest-capability one)
  return candidates[0];
}

/**
 * Get agent definition by registry key
 */
export function getAgentDefinition(key: string): AgentDefinition | undefined {
  return AGENT_REGISTRY[key];
}

/**
 * List all available agent keys by role
 */
export function listAgentsByRole(role: AgentRole): string[] {
  return Object.entries(AGENT_REGISTRY)
    .filter(([_, def]) => def.role === role)
    .map(([key]) => key);
}

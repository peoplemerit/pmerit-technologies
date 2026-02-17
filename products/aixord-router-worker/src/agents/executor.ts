/**
 * Worker-Auditor Execution Loop
 * AIXORD v4.5.1 — HANDOFF-CGC-01 GAP-1
 *
 * Implements the core Worker → Auditor → (Retry|HITL|Pass) loop
 * for governed multi-agent task execution.
 */

import type { Env, Message, ProviderModel } from '../types';
import { callProvider } from '../providers/index';
import { AGENT_REGISTRY } from './registry';

export interface AuditReport {
  audit_status: 'PASS' | 'FAIL' | 'NEEDS_REVISION';
  confidence_score: number;
  findings: Array<{
    type: string;
    severity: 'High' | 'Medium' | 'Low';
    description: string;
    remediation?: string;
    root_cause?: string;
    root_cause_category?: 'INTEGRITY' | 'VALIDATION' | 'ISOLATION' | 'OBSERVABILITY' | 'PROCESS' | 'DESIGN';
    is_symptom?: boolean;
  }>;
  criteria_met?: boolean[];
  owner_summary: string;
}

export interface WorkerAuditorResult {
  success: boolean;
  workerOutput: string;
  auditReport: AuditReport;
  attempts: number;
  readyForHumanReview: boolean;
  totalTokensUsed: number;
}

/**
 * Resolve the API key for a provider from the environment
 */
function getApiKey(env: Env, provider: string): string {
  // CLEANUP: Single naming convention — PLATFORM_* keys only
  switch (provider) {
    case 'anthropic':
      return env.PLATFORM_ANTHROPIC_KEY;
    case 'openai':
      return env.PLATFORM_OPENAI_KEY;
    case 'google':
      return env.PLATFORM_GOOGLE_KEY;
    case 'deepseek':
      return env.PLATFORM_DEEPSEEK_KEY || '';
    default:
      return '';
  }
}

/**
 * Call a model via the existing provider infrastructure
 */
async function callAgentModel(
  env: Env,
  provider: string,
  model: string,
  messages: Message[]
): Promise<{ text: string; tokensUsed: number }> {
  const candidate: ProviderModel = {
    provider: provider as 'anthropic' | 'openai' | 'google' | 'deepseek',
    model,
  };

  const apiKey = getApiKey(env, provider);
  if (!apiKey) {
    throw new Error(`No API key available for provider: ${provider}`);
  }

  const response = await callProvider(candidate, messages, apiKey, {
    maxOutputTokens: 4096,
    temperature: 0.3,
  });

  return {
    text: response.content,
    tokensUsed: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0),
  };
}

/**
 * Execute Worker-Auditor loop with automatic retries
 *
 * Flow:
 *   1. Worker generates output from task + context
 *   2. Auditor validates output against acceptance criteria
 *   3. If PASS → return for human review
 *   4. If FAIL → feed audit findings back to Worker, retry
 *   5. If max attempts reached → escalate to HITL
 */
export async function executeWorkerAuditorLoop(
  env: Env,
  taskDescription: string,
  acceptanceCriteria: string[],
  masterScope: string,
  dagDependencies: string[],
  maxAttempts: number = 3
): Promise<WorkerAuditorResult> {
  const workerAgent = AGENT_REGISTRY.codeWorker;
  const auditorAgent = AGENT_REGISTRY.auditor;

  let workerOutput = '';
  let auditReport: AuditReport = {
    audit_status: 'FAIL',
    confidence_score: 0,
    findings: [],
    owner_summary: 'Not yet audited',
  };
  let lastAuditFindings = '';
  let totalTokensUsed = 0;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // ─── WORKER PHASE ───────────────────────────────────────────
    const workerMessages: Message[] = [
      { role: 'system', content: workerAgent.systemPrompt },
      {
        role: 'user',
        content: buildWorkerPrompt(
          taskDescription,
          acceptanceCriteria,
          masterScope,
          dagDependencies,
          lastAuditFindings
        ),
      },
    ];

    try {
      const workerResult = await callAgentModel(
        env,
        workerAgent.preferredProvider,
        workerAgent.preferredModel,
        workerMessages
      );
      workerOutput = workerResult.text;
      totalTokensUsed += workerResult.tokensUsed;
    } catch (error) {
      // Try fallback model
      if (workerAgent.fallbackModels.length > 0) {
        const fallback = workerAgent.fallbackModels[0];
        try {
          const fallbackResult = await callAgentModel(
            env,
            fallback.provider,
            fallback.model,
            workerMessages
          );
          workerOutput = fallbackResult.text;
          totalTokensUsed += fallbackResult.tokensUsed;
        } catch {
          return {
            success: false,
            workerOutput: '',
            auditReport: {
              audit_status: 'FAIL',
              confidence_score: 0,
              findings: [{
                type: 'Infrastructure',
                severity: 'High',
                description: `Worker model unavailable: ${error instanceof Error ? error.message : 'Unknown'}`,
              }],
              owner_summary: 'Worker model failed to respond',
            },
            attempts: attempt,
            readyForHumanReview: true,
            totalTokensUsed,
          };
        }
      }
    }

    // ─── AUDITOR PHASE ──────────────────────────────────────────
    const auditorMessages: Message[] = [
      { role: 'system', content: auditorAgent.systemPrompt },
      {
        role: 'user',
        content: buildAuditorPrompt(
          workerOutput,
          masterScope,
          acceptanceCriteria,
          dagDependencies
        ),
      },
    ];

    try {
      const auditorResult = await callAgentModel(
        env,
        auditorAgent.preferredProvider,
        auditorAgent.preferredModel,
        auditorMessages
      );
      totalTokensUsed += auditorResult.tokensUsed;

      // Parse audit response
      const cleanResponse = auditorResult.text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      auditReport = JSON.parse(cleanResponse) as AuditReport;
    } catch {
      auditReport = {
        audit_status: 'FAIL',
        confidence_score: 0,
        findings: [{
          type: 'Infrastructure',
          severity: 'High',
          description: 'Auditor response was not valid JSON',
          remediation: 'Retry with clearer instructions',
        }],
        owner_summary: 'Audit failed to parse — retry recommended',
      };
    }

    // ─── DECISION ───────────────────────────────────────────────
    if (auditReport.audit_status === 'PASS') {
      return {
        success: true,
        workerOutput,
        auditReport,
        attempts: attempt,
        readyForHumanReview: true,
        totalTokensUsed,
      };
    }

    // Prepare feedback for next iteration
    lastAuditFindings = JSON.stringify(auditReport.findings, null, 2);
  }

  // Max retries reached — escalate to human (HITL)
  return {
    success: false,
    workerOutput,
    auditReport,
    attempts: maxAttempts,
    readyForHumanReview: true,
    totalTokensUsed,
  };
}

// ─── Prompt Builders ──────────────────────────────────────────────

function buildWorkerPrompt(
  taskDescription: string,
  acceptanceCriteria: string[],
  masterScope: string,
  dagDependencies: string[],
  previousAuditFindings: string
): string {
  let prompt = `TASK:\n${taskDescription}\n\n`;
  prompt += `ACCEPTANCE CRITERIA:\n${acceptanceCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\n`;
  prompt += `MASTER SCOPE:\n${masterScope}\n\n`;

  if (dagDependencies.length > 0) {
    prompt += `DAG DEPENDENCIES (must be satisfied):\n${dagDependencies.join(', ')}\n\n`;
  }

  if (previousAuditFindings) {
    prompt += `PREVIOUS AUDIT FEEDBACK (address these issues):\n${previousAuditFindings}\n\n`;
  }

  prompt += `Produce production-ready output to satisfy all acceptance criteria.`;
  return prompt;
}

function buildAuditorPrompt(
  workerOutput: string,
  masterScope: string,
  acceptanceCriteria: string[],
  dagDependencies: string[]
): string {
  let prompt = `Audit the following Worker output against the acceptance criteria.\n\n`;
  prompt += `WORKER OUTPUT:\n${workerOutput}\n\n`;
  prompt += `MASTER SCOPE:\n${masterScope}\n\n`;
  prompt += `ACCEPTANCE CRITERIA:\n${acceptanceCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\n`;

  if (dagDependencies.length > 0) {
    prompt += `DAG DEPENDENCIES:\n${dagDependencies.join(', ')}\n\n`;
  }

  prompt += `Respond with ONLY valid JSON (no markdown fences).`;
  return prompt;
}

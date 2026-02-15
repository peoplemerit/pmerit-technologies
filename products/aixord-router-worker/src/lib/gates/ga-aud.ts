/**
 * GA:AUD — Audit Gate
 * AIXORD v4.6 — HANDOFF-AUDIT-FRONTEND-01 Phase 2C.1
 *
 * Validates that cross-model audit has been completed and all critical/high
 * findings have been triaged before allowing phase transitions.
 *
 * Gate Position:
 * - Before BLUEPRINT -> REALIZATION: Optional (recommended for greenfield)
 * - Before VERIFY -> LOCK: Mandatory (blocks LOCK if CRITICAL findings exist)
 * - On-Demand: Director can trigger GA:AUD at any phase
 */

import { Env } from '../../types';

export interface AuditGateResult {
  satisfied: boolean;
  reason?: string;
  details: {
    audit_executed: boolean;
    cross_model_validated: boolean;
    critical_triaged: boolean;
    high_triaged: boolean;
    rationale_documented: boolean;
    diff_reviewed: boolean;
    no_red_flags: boolean;
    findings_summary?: {
      total: number;
      critical: number;
      high: number;
      pending: number;
      recurring_percent: number;
    };
  };
}

export async function validateAuditGate(
  projectId: string,
  env: Env,
  options: {
    required_for_lock?: boolean; // If true, stricter validation
  } = {}
): Promise<AuditGateResult> {
  const { required_for_lock = false } = options;

  // Get most recent audit
  const recentAudit = await env.DB.prepare(`
    SELECT id, task_id, created_at
    FROM agent_audit_log
    WHERE project_id = ?
    ORDER BY created_at DESC
    LIMIT 1
  `).bind(projectId).first();

  if (!recentAudit) {
    return {
      satisfied: !required_for_lock, // Only fail if required for LOCK
      reason: 'No audit found. Run GA:AUD before LOCK transition.',
      details: {
        audit_executed: false,
        cross_model_validated: false,
        critical_triaged: false,
        high_triaged: false,
        rationale_documented: false,
        diff_reviewed: false,
        no_red_flags: false
      }
    };
  }

  // Load audit findings
  const findings = await env.DB.prepare(`
    SELECT
      id,
      finding_type,
      severity,
      disposition,
      disposition_reason,
      prior_audit_match
    FROM audit_findings
    WHERE audit_id = ?
  `).bind(recentAudit.id).all();

  const findingsList = findings.results || [];

  // Check cross-model validation (verify worker != auditor)
  const auditTask = await env.DB.prepare(`
    SELECT parameters
    FROM agent_tasks
    WHERE id = ?
  `).bind(recentAudit.task_id).first();

  let crossModelValidated = false;
  if (auditTask) {
    try {
      const params = JSON.parse(auditTask.parameters as string);
      crossModelValidated = params.worker_model !== params.auditor_model;
    } catch (e) {
      crossModelValidated = false;
    }
  }

  // Compute findings summary
  const total = findingsList.length;
  const critical = findingsList.filter(f => f.severity === 'CRITICAL').length;
  const high = findingsList.filter(f => f.severity === 'HIGH').length;
  const pending = findingsList.filter(f => f.disposition === 'PENDING').length;
  const recurring = findingsList.filter(f => f.prior_audit_match).length;
  const recurringPercent = total > 0 ? (recurring / total) * 100 : 0;

  // Check triage completeness
  const criticalPending = findingsList.filter(
    f => f.severity === 'CRITICAL' && f.disposition === 'PENDING'
  ).length;

  const highPending = findingsList.filter(
    f => f.severity === 'HIGH' && f.disposition === 'PENDING'
  ).length;

  const criticalTriaged = criticalPending === 0;
  const highTriaged = highPending === 0;

  // Check rationale documentation for ACCEPT/DEFER
  const needRationale = findingsList.filter(
    f => ['ACCEPT', 'DEFER'].includes(f.disposition as string) && !f.disposition_reason
  );
  const rationaleDocumented = needRationale.length === 0;

  // Check diff reviewed (if prior audits exist)
  const priorAuditCount = await env.DB.prepare(`
    SELECT COUNT(*) as count
    FROM agent_audit_log
    WHERE project_id = ? AND id != ?
  `).bind(projectId, recentAudit.id).first();

  const hasPriorAudits = (priorAuditCount?.count as number) > 0;
  const diffReviewed = !hasPriorAudits || recurring > 0; // If prior audits exist, recurring findings prove diff was computed

  // Check red flags
  const tooManyCritical = critical > 20;
  const tooManyRecurring = recurringPercent > 50;
  const noRedFlags = !tooManyCritical && !tooManyRecurring;

  // Gate satisfaction logic
  const details = {
    audit_executed: true,
    cross_model_validated: crossModelValidated,
    critical_triaged: criticalTriaged,
    high_triaged: highTriaged,
    rationale_documented: rationaleDocumented,
    diff_reviewed: diffReviewed,
    no_red_flags: noRedFlags,
    findings_summary: {
      total,
      critical,
      high,
      pending,
      recurring_percent: Math.round(recurringPercent)
    }
  };

  const satisfied =
    crossModelValidated &&
    criticalTriaged &&
    (required_for_lock ? highTriaged : true) && // HIGH triage required only for LOCK
    rationaleDocumented &&
    diffReviewed &&
    noRedFlags;

  if (!satisfied) {
    const reasons = [];
    if (!crossModelValidated) reasons.push('Cross-model validation required (worker != auditor)');
    if (!criticalTriaged) reasons.push(`${criticalPending} CRITICAL findings pending triage`);
    if (required_for_lock && !highTriaged) reasons.push(`${highPending} HIGH findings pending triage`);
    if (!rationaleDocumented) reasons.push(`${needRationale.length} ACCEPT/DEFER findings missing rationale`);
    if (!diffReviewed) reasons.push('Audit diff not reviewed (prior audits exist)');
    if (tooManyCritical) reasons.push(`Too many CRITICAL findings (${critical} > 20)`);
    if (tooManyRecurring) reasons.push(`Too many recurring findings (${Math.round(recurringPercent)}% > 50%)`);

    return {
      satisfied: false,
      reason: `GA:AUD not satisfied:\n${reasons.map(r => `- ${r}`).join('\n')}`,
      details
    };
  }

  return {
    satisfied: true,
    details
  };
}

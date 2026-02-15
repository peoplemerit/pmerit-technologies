/**
 * Diminishing Returns Detector
 * AIXORD v4.6 — HANDOFF-AUDIT-FRONTEND-01 Phase 2D.3
 *
 * Analyzes audit history to detect when consecutive audits yield
 * decreasing new findings, suggesting audit frequency should be reduced.
 */

import { Env } from '../types';

export interface DiminishingReturnsResult {
  detected: boolean;
  reason?: string;
  recommendation?: string;
  stats: {
    last_n_audits: number;
    new_findings_trend: number[]; // New findings per audit
    avg_new_findings: number;
    threshold: number;
  };
}

export async function detectDiminishingReturns(
  projectId: string,
  env: Env,
  options: {
    look_back_count?: number; // How many recent audits to analyze
    threshold?: number; // Alert if avg new findings < threshold
  } = {}
): Promise<DiminishingReturnsResult> {
  const { look_back_count = 5, threshold = 5 } = options;

  // Load recent audits
  const audits = await env.DB.prepare(`
    SELECT id, created_at
    FROM agent_audit_log
    WHERE project_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `).bind(projectId, look_back_count).all();

  if (!audits.results || audits.results.length < 3) {
    return {
      detected: false,
      stats: {
        last_n_audits: audits.results?.length || 0,
        new_findings_trend: [],
        avg_new_findings: 0,
        threshold
      }
    };
  }

  // Compute new findings per audit
  const newFindingsTrend = [];
  for (const audit of audits.results) {
    const findings = await env.DB.prepare(`
      SELECT COUNT(*) as count
      FROM audit_findings
      WHERE audit_id = ? AND prior_audit_match IS NULL
    `).bind(audit.id).first();

    newFindingsTrend.push((findings?.count as number) || 0);
  }

  // Compute average
  const avgNewFindings = newFindingsTrend.reduce((sum, n) => sum + n, 0) / newFindingsTrend.length;

  // Detect diminishing returns: if avg < threshold and all recent audits < threshold
  const allBelowThreshold = newFindingsTrend.every(n => n < threshold);
  const detected = avgNewFindings < threshold && allBelowThreshold;

  if (detected) {
    return {
      detected: true,
      reason: `Last ${newFindingsTrend.length} audits averaged ${Math.round(avgNewFindings)} new findings (below threshold of ${threshold})`,
      recommendation: 'Consider pausing audits until next major feature release or architectural change. The codebase has reached a stable state where additional audits yield minimal new insights.',
      stats: {
        last_n_audits: newFindingsTrend.length,
        new_findings_trend: newFindingsTrend,
        avg_new_findings: Math.round(avgNewFindings * 10) / 10,
        threshold
      }
    };
  }

  return {
    detected: false,
    stats: {
      last_n_audits: newFindingsTrend.length,
      new_findings_trend: newFindingsTrend,
      avg_new_findings: Math.round(avgNewFindings * 10) / 10,
      threshold
    }
  };
}

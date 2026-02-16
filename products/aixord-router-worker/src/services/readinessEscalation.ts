/**
 * Readiness Escalation Engine — GAP-2
 * HANDOFF-CGC-01 GAP-2: R-Threshold Automatic Escalation
 *
 * Monitors project readiness (R) and triggers automated actions
 * when thresholds are crossed:
 *
 *   R ≥ 0.8  → READY:    Auto-flip GW:VER gate, log escalation event
 *   R ≥ 0.6  → STAGING:  Auto-flip GW:VAL gate, log progress milestone
 *   R < 0.4  → AT_RISK:  Log warning, suggest corrective actions
 *   R < 0.2  → CRITICAL: Log critical alert for Director attention
 *
 * Called after readiness computation or gate evaluation to check
 * if any threshold-crossing actions should fire.
 */

import { computeProjectReadiness, type ProjectReadiness } from './readinessEngine';

// ─── Types ──────────────────────────────────────────────────────────

export type EscalationLevel = 'CRITICAL' | 'AT_RISK' | 'PROGRESSING' | 'STAGING' | 'READY';

export interface EscalationEvent {
  level: EscalationLevel;
  project_R: number;
  threshold: number;
  message: string;
  auto_actions: string[];
  scope_details?: Array<{
    scope_name: string;
    R: number;
    bottleneck: 'L' | 'P' | 'V' | null;
  }>;
}

export interface EscalationResult {
  escalation: EscalationEvent | null;
  previous_level: EscalationLevel | null;
  level_changed: boolean;
  gates_flipped: string[];
}

// ─── Threshold Configuration ────────────────────────────────────────

const ESCALATION_THRESHOLDS: Array<{
  level: EscalationLevel;
  min_R: number;
  max_R: number;
}> = [
  { level: 'CRITICAL',    min_R: 0,   max_R: 0.2  },
  { level: 'AT_RISK',     min_R: 0.2, max_R: 0.4  },
  { level: 'PROGRESSING', min_R: 0.4, max_R: 0.6  },
  { level: 'STAGING',     min_R: 0.6, max_R: 0.8  },
  { level: 'READY',       min_R: 0.8, max_R: 1.01 },
];

// ─── Core Functions ─────────────────────────────────────────────────

/**
 * Determine the escalation level for a given R score.
 */
export function getEscalationLevel(R: number): EscalationLevel {
  for (const t of ESCALATION_THRESHOLDS) {
    if (R >= t.min_R && R < t.max_R) return t.level;
  }
  return R >= 0.8 ? 'READY' : 'CRITICAL';
}

/**
 * Identify the bottleneck dimension for a scope.
 * The weakest of L, P, V is the bottleneck.
 */
function identifyBottleneck(L: number, P: number, V: number): 'L' | 'P' | 'V' | null {
  if (L === 0 && P === 0 && V === 0) return null;
  const min = Math.min(L, P, V);
  if (min === L) return 'L';
  if (min === P) return 'P';
  return 'V';
}

/**
 * Build escalation message based on level and readiness data.
 */
function buildEscalationMessage(level: EscalationLevel, readiness: ProjectReadiness): string {
  switch (level) {
    case 'CRITICAL':
      return `Project readiness is CRITICAL (R=${readiness.project_R}). Immediate Director attention required. Blueprint quality, execution progress, or validation are severely lacking.`;
    case 'AT_RISK':
      return `Project readiness is AT RISK (R=${readiness.project_R}). Multiple scopes are below minimum thresholds. Review scope priorities and resource allocation.`;
    case 'PROGRESSING':
      return `Project is PROGRESSING (R=${readiness.project_R}). Execution is underway but validation gaps remain. Continue execution and run integrity checks.`;
    case 'STAGING':
      return `Project is in STAGING readiness (R=${readiness.project_R}). Validation threshold met. Run final verification checks before phase advance.`;
    case 'READY':
      return `Project is READY (R=${readiness.project_R}). All thresholds met for phase advancement. Director may approve finalization.`;
  }
}

/**
 * Determine which auto-actions should fire for a given escalation.
 */
function getAutoActions(level: EscalationLevel): string[] {
  switch (level) {
    case 'READY':
      return ['AUTO_FLIP_GW:VER', 'NOTIFY_DIRECTOR_READY', 'PULSE_FINALIZE_BUTTON'];
    case 'STAGING':
      return ['AUTO_FLIP_GW:VAL', 'NOTIFY_PROGRESS_MILESTONE'];
    case 'PROGRESSING':
      return ['LOG_PROGRESS'];
    case 'AT_RISK':
      return ['LOG_WARNING', 'SUGGEST_CORRECTIVE_ACTIONS'];
    case 'CRITICAL':
      return ['LOG_CRITICAL', 'NOTIFY_DIRECTOR_CRITICAL', 'SUGGEST_SCOPE_REDUCTION'];
  }
}

/**
 * Check for R-threshold escalation and execute auto-actions.
 *
 * Called after:
 *   - Gate evaluation (evaluateAllGates)
 *   - WU transfer
 *   - Deliverable status change
 *   - Validation run
 *
 * Returns the escalation event (if threshold changed) and any gates that were auto-flipped.
 */
export async function checkReadinessEscalation(
  db: D1Database,
  projectId: string,
  userId: string
): Promise<EscalationResult> {
  // 1. Compute current readiness
  const readiness = await computeProjectReadiness(db, projectId);
  const currentLevel = getEscalationLevel(readiness.project_R);

  // 2. Get previous escalation level from project_state
  const stateRow = await db.prepare(
    'SELECT escalation_level FROM project_state WHERE project_id = ?'
  ).bind(projectId).first<{ escalation_level: string | null }>();

  const previousLevel = (stateRow?.escalation_level as EscalationLevel) || null;
  const levelChanged = previousLevel !== currentLevel;

  // 3. Build escalation event
  const scopeDetails = readiness.scopes.map(s => ({
    scope_name: s.scope_name,
    R: s.R,
    bottleneck: identifyBottleneck(s.L, s.P, s.V),
  }));

  const escalation: EscalationEvent = {
    level: currentLevel,
    project_R: readiness.project_R,
    threshold: ESCALATION_THRESHOLDS.find(t => t.level === currentLevel)?.min_R || 0,
    message: buildEscalationMessage(currentLevel, readiness),
    auto_actions: getAutoActions(currentLevel),
    scope_details: scopeDetails,
  };

  // 4. Execute auto-actions if level changed
  const gatesFlipped: string[] = [];

  if (levelChanged) {
    // Update escalation level in project_state
    await db.prepare(
      'UPDATE project_state SET escalation_level = ?, updated_at = ? WHERE project_id = ?'
    ).bind(currentLevel, new Date().toISOString(), projectId).run();

    // Auto-flip gates based on escalation level
    const gates = await db.prepare(
      'SELECT gates FROM project_state WHERE project_id = ?'
    ).bind(projectId).first<{ gates: string }>();

    if (gates) {
      const gateMap: Record<string, boolean> = JSON.parse(gates.gates || '{}');

      if (currentLevel === 'READY' && !gateMap['GW:VER']) {
        gateMap['GW:VER'] = true;
        gatesFlipped.push('GW:VER');
      }

      if ((currentLevel === 'STAGING' || currentLevel === 'READY') && !gateMap['GW:VAL']) {
        gateMap['GW:VAL'] = true;
        gatesFlipped.push('GW:VAL');
      }

      if (gatesFlipped.length > 0) {
        await db.prepare(
          'UPDATE project_state SET gates = ?, updated_at = ? WHERE project_id = ?'
        ).bind(JSON.stringify(gateMap), new Date().toISOString(), projectId).run();
      }
    }

    // Log escalation event
    await db.prepare(`
      INSERT INTO readiness_escalation_log (
        project_id, from_level, to_level, project_r,
        auto_actions, gates_flipped, actor_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      projectId,
      previousLevel || 'NONE',
      currentLevel,
      readiness.project_R,
      JSON.stringify(escalation.auto_actions),
      JSON.stringify(gatesFlipped),
      userId
    ).run();
  }

  return {
    escalation: levelChanged ? escalation : null,
    previous_level: previousLevel,
    level_changed: levelChanged,
    gates_flipped: gatesFlipped,
  };
}

/**
 * Get the current escalation status for a project.
 * Lightweight read-only check (no auto-actions).
 */
export async function getEscalationStatus(
  db: D1Database,
  projectId: string
): Promise<{
  level: EscalationLevel;
  project_R: number;
  last_changed: string | null;
  recent_events: Array<{
    from_level: string;
    to_level: string;
    project_r: number;
    created_at: string;
  }>;
}> {
  const readiness = await computeProjectReadiness(db, projectId);
  const level = getEscalationLevel(readiness.project_R);

  const recent = await db.prepare(`
    SELECT from_level, to_level, project_r, created_at
    FROM readiness_escalation_log
    WHERE project_id = ?
    ORDER BY created_at DESC
    LIMIT 10
  `).bind(projectId).all();

  return {
    level,
    project_R: readiness.project_R,
    last_changed: (recent.results?.[0] as any)?.created_at || null,
    recent_events: (recent.results || []) as any[],
  };
}

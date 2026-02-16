/**
 * Gate Auto-Satisfaction Rules Engine
 *
 * AIXORD v4.5 — AI-Governance Phase 2
 *
 * Declarative rules that define when gates should auto-flip.
 * Each gate has:
 *   - evaluator: async function that checks preconditions against D1
 *   - description: human-readable explanation for AI system prompt
 *
 * Called by evaluateAllGates() after key user actions (workspace bind,
 * blueprint create/update, message send, validation run).
 */

import type { Env } from '../types';
import { ALL_TIER_IDS } from '../config/tiers';
import {
  computeProjectReadiness,
  getConservationSnapshot,
  computeReconciliation,
} from './readinessEngine';

// ─── Types ───────────────────────────────────────────────────────────

export interface GateEvalContext {
  db: D1Database;
  projectId: string;
  userId: string;
}

export interface GateEvalResult {
  satisfied: boolean;
  reason: string;
}

export interface GateRule {
  description: string;
  evaluate: (ctx: GateEvalContext) => Promise<GateEvalResult>;
}

export interface GateChangeEntry {
  gateId: string;
  from: boolean;
  to: boolean;
  reason: string;
}

export interface EvaluateResult {
  evaluated: string[];
  changed: GateChangeEntry[];
  gates: Record<string, boolean>;
  phase: string;
}

// ─── Gate Rules (Declarative) ────────────────────────────────────────

export const GATE_RULES: Record<string, GateRule> = {

  // === BRAINSTORM EXIT GATES ===

  'GA:LIC': {
    description: 'License gate — satisfied when user has a valid subscription tier',
    evaluate: async (ctx) => {
      const user = await ctx.db.prepare(
        'SELECT subscription_tier FROM users WHERE id = ?'
      ).bind(ctx.userId).first<{ subscription_tier: string | null }>();
      const satisfied = !!user?.subscription_tier &&
        ALL_TIER_IDS.includes(user.subscription_tier as any);
      return {
        satisfied,
        reason: satisfied
          ? `User has ${user!.subscription_tier} tier`
          : 'No valid subscription tier'
      };
    },
  },

  'GA:DIS': {
    description: 'Disclaimer gate — satisfied when user has engaged with the project (sent ≥1 message)',
    evaluate: async (ctx) => {
      const count = await ctx.db.prepare(
        'SELECT COUNT(*) as cnt FROM messages WHERE project_id = ? AND role = ?'
      ).bind(ctx.projectId, 'user').first<{ cnt: number }>();
      const satisfied = (count?.cnt ?? 0) >= 1;
      return {
        satisfied,
        reason: satisfied
          ? `User has sent ${count!.cnt} message(s)`
          : 'No user messages sent yet'
      };
    },
  },

  'GA:TIR': {
    description: 'Tier gate — satisfied when user has an active subscription',
    evaluate: async (ctx) => {
      const user = await ctx.db.prepare(
        'SELECT subscription_tier FROM users WHERE id = ?'
      ).bind(ctx.userId).first<{ subscription_tier: string | null }>();
      const satisfied = !!user?.subscription_tier &&
        ALL_TIER_IDS.includes(user.subscription_tier as any);
      return {
        satisfied,
        reason: satisfied
          ? `Active tier: ${user!.subscription_tier}`
          : 'No active subscription tier'
      };
    },
  },

  // === PLAN EXIT GATES ===

  'GA:ENV': {
    description: 'Environment gate — satisfied when workspace binding is confirmed',
    evaluate: async (ctx) => {
      const binding = await ctx.db.prepare(
        'SELECT binding_confirmed FROM workspace_bindings WHERE project_id = ?'
      ).bind(ctx.projectId).first<{ binding_confirmed: number }>();
      const satisfied = !!(binding && binding.binding_confirmed);
      return {
        satisfied,
        reason: satisfied
          ? 'Workspace binding confirmed'
          : 'Workspace binding not confirmed'
      };
    },
  },

  'GA:FLD': {
    description: 'Folder gate — satisfied when a project folder is linked',
    evaluate: async (ctx) => {
      const binding = await ctx.db.prepare(
        'SELECT folder_name FROM workspace_bindings WHERE project_id = ?'
      ).bind(ctx.projectId).first<{ folder_name: string | null }>();
      const satisfied = !!(binding && binding.folder_name);
      return {
        satisfied,
        reason: satisfied
          ? `Folder linked: ${binding!.folder_name}`
          : 'No folder linked'
      };
    },
  },

  'GA:BP': {
    description: 'Blueprint gate — satisfied when scopes + deliverables exist with complete DoDs',
    evaluate: async (ctx) => {
      const scopeCount = await ctx.db.prepare(
        'SELECT COUNT(*) as cnt FROM blueprint_scopes WHERE project_id = ?'
      ).bind(ctx.projectId).first<{ cnt: number }>();
      const deliverableCount = await ctx.db.prepare(
        'SELECT COUNT(*) as cnt FROM blueprint_deliverables WHERE project_id = ?'
      ).bind(ctx.projectId).first<{ cnt: number }>();
      const missingDoD = await ctx.db.prepare(
        "SELECT COUNT(*) as cnt FROM blueprint_deliverables WHERE project_id = ? AND (dod_evidence_spec IS NULL OR dod_evidence_spec = '' OR dod_verification_method IS NULL OR dod_verification_method = '')"
      ).bind(ctx.projectId).first<{ cnt: number }>();

      const scopes = scopeCount?.cnt ?? 0;
      const deliverables = deliverableCount?.cnt ?? 0;
      const missing = missingDoD?.cnt ?? 1;
      const satisfied = scopes > 0 && deliverables > 0 && missing === 0;

      return {
        satisfied,
        reason: satisfied
          ? `${scopes} scope(s), ${deliverables} deliverable(s), all DoDs complete`
          : scopes === 0 ? 'No scopes created'
          : deliverables === 0 ? 'No deliverables created'
          : `${missing} deliverable(s) missing DoD`
      };
    },
  },

  'GA:IVL': {
    description: 'Integrity Validation gate — satisfied when latest validation passes all 5 checks',
    evaluate: async (ctx) => {
      const report = await ctx.db.prepare(
        'SELECT all_passed FROM blueprint_integrity_reports WHERE project_id = ? ORDER BY run_at DESC LIMIT 1'
      ).bind(ctx.projectId).first<{ all_passed: number }>();
      const satisfied = !!(report && report.all_passed);
      return {
        satisfied,
        reason: satisfied
          ? 'Latest integrity validation passed all 5 checks'
          : !report ? 'No integrity validation run yet'
          : 'Latest integrity validation has failures'
      };
    },
  },

  // === EXECUTE EXIT GATES (Mathematical Governance) ===

  'GW:PRE': {
    description: 'Pre-execution gate — all scopes have WU allocated, conservation is valid, execution layers exist',
    evaluate: async (ctx) => {
      // 1. Check that WU has been initialized (execution_total_wu > 0)
      const project = await ctx.db.prepare(
        'SELECT execution_total_wu FROM projects WHERE id = ?'
      ).bind(ctx.projectId).first<{ execution_total_wu: number }>();

      const totalWU = project?.execution_total_wu || 0;
      if (totalWU <= 0) {
        return { satisfied: false, reason: 'Project WU budget not initialized' };
      }

      // 2. Check conservation validity
      const conservation = await getConservationSnapshot(ctx.db, ctx.projectId);
      if (!conservation.valid) {
        return {
          satisfied: false,
          reason: `Conservation violation: delta=${conservation.delta} (total=${conservation.total}, formula=${conservation.formula}, verified=${conservation.verified})`,
        };
      }

      // 3. All tier-1 scopes must have WU allocated
      const scopeResult = await ctx.db.prepare(
        'SELECT COUNT(*) as total, SUM(CASE WHEN allocated_wu > 0 THEN 1 ELSE 0 END) as allocated FROM blueprint_scopes WHERE project_id = ? AND tier = 1'
      ).bind(ctx.projectId).first<{ total: number; allocated: number }>();

      const totalScopes = scopeResult?.total || 0;
      const allocatedScopes = scopeResult?.allocated || 0;

      if (totalScopes === 0) {
        return { satisfied: false, reason: 'No scopes defined' };
      }

      if (allocatedScopes < totalScopes) {
        return {
          satisfied: false,
          reason: `${totalScopes - allocatedScopes} of ${totalScopes} scope(s) have no WU allocated`,
        };
      }

      // 4. Execution layers must exist for at least one scope
      const layerCount = await ctx.db.prepare(
        'SELECT COUNT(*) as cnt FROM execution_layers WHERE project_id = ?'
      ).bind(ctx.projectId).first<{ cnt: number }>();

      if ((layerCount?.cnt || 0) === 0) {
        return { satisfied: false, reason: 'No execution layers created' };
      }

      return {
        satisfied: true,
        reason: `${totalScopes} scope(s) with WU allocated, conservation valid, ${layerCount!.cnt} execution layer(s) exist`,
      };
    },
  },

  'GW:VAL': {
    description: 'Validation gate — all active scopes R ≥ 0.6, no FAILING deliverables',
    evaluate: async (ctx) => {
      // 1. Compute project readiness
      const readiness = await computeProjectReadiness(ctx.db, ctx.projectId);

      if (readiness.scopes.length === 0) {
        return { satisfied: false, reason: 'No scopes to validate' };
      }

      // 2. Check that all scopes meet R ≥ 0.6
      const belowThreshold = readiness.scopes.filter(s => s.R < 0.6);
      if (belowThreshold.length > 0) {
        const names = belowThreshold.map(s => `${s.scope_name}(R=${s.R})`).join(', ');
        return {
          satisfied: false,
          reason: `${belowThreshold.length} scope(s) below R≥0.6 threshold: ${names}`,
        };
      }

      // 3. No FAILED execution layers
      const failedLayers = await ctx.db.prepare(
        "SELECT COUNT(*) as cnt FROM execution_layers WHERE project_id = ? AND status = 'FAILED'"
      ).bind(ctx.projectId).first<{ cnt: number }>();

      if ((failedLayers?.cnt || 0) > 0) {
        return {
          satisfied: false,
          reason: `${failedLayers!.cnt} execution layer(s) in FAILED state`,
        };
      }

      return {
        satisfied: true,
        reason: `All ${readiness.scopes.length} scope(s) R≥0.6 (project R=${readiness.project_R}), no failing layers`,
      };
    },
  },

  'GW:VER': {
    description: 'Verification gate — project R ≥ 0.8, all scopes verified, reconciliation has no major divergences',
    evaluate: async (ctx) => {
      // 1. Project-level readiness ≥ 0.8
      const readiness = await computeProjectReadiness(ctx.db, ctx.projectId);

      if (readiness.project_R < 0.8) {
        return {
          satisfied: false,
          reason: `Project R=${readiness.project_R} is below 0.8 threshold`,
        };
      }

      // 2. All scopes must have verified WU > 0 (i.e., WU transfer has occurred)
      const unverified = readiness.scopes.filter(s => s.allocated_wu > 0 && s.verified_wu === 0);
      if (unverified.length > 0) {
        const names = unverified.map(s => s.scope_name).join(', ');
        return {
          satisfied: false,
          reason: `${unverified.length} scope(s) have allocated WU but no verified WU: ${names}`,
        };
      }

      // 3. Conservation must be valid
      if (!readiness.conservation.valid) {
        return {
          satisfied: false,
          reason: `Conservation violation: delta=${readiness.conservation.delta}`,
        };
      }

      // 4. Reconciliation: no major divergences (>20%)
      const reconciliation = await computeReconciliation(ctx.db, ctx.projectId);
      if (reconciliation.has_divergences) {
        const divergent = reconciliation.entries.filter(e => e.requires_attention);
        const names = divergent.map(e => `${e.scope_name}(${e.divergence_pct}%)`).join(', ');
        return {
          satisfied: false,
          reason: `Reconciliation divergences >20%: ${names}`,
        };
      }

      return {
        satisfied: true,
        reason: `Project R=${readiness.project_R}≥0.8, all scopes verified, conservation valid, no reconciliation divergences`,
      };
    },
  },
};

// ─── Core Evaluation Function ────────────────────────────────────────

/**
 * Evaluate all gate rules against current project state.
 * Returns which gates were evaluated, which changed, and the final gate map.
 *
 * Idempotent: calling twice with no data changes produces zero writes.
 */
export async function evaluateAllGates(
  db: D1Database,
  projectId: string,
  userId: string
): Promise<EvaluateResult> {
  // Get current state
  const current = await db.prepare(
    'SELECT gates, phase FROM project_state WHERE project_id = ?'
  ).bind(projectId).first<{ gates: string; phase: string }>();

  if (!current) {
    return { evaluated: [], changed: [], gates: {}, phase: 'BRAINSTORM' };
  }

  const gates: Record<string, boolean> = JSON.parse(current.gates || '{}');
  const evaluated: string[] = [];
  const changed: GateChangeEntry[] = [];
  const ctx: GateEvalContext = { db, projectId, userId };

  // Evaluate each rule
  for (const [gateId, rule] of Object.entries(GATE_RULES)) {
    evaluated.push(gateId);
    try {
      const result = await rule.evaluate(ctx);
      if (result.satisfied !== !!gates[gateId]) {
        changed.push({
          gateId,
          from: !!gates[gateId],
          to: result.satisfied,
          reason: result.reason,
        });
        gates[gateId] = result.satisfied;
      }
    } catch (err) {
      // Skip failed evaluations — don't flip gates on error
      console.warn(`[GateRules] ${gateId} evaluation error:`, err);
    }
  }

  // Persist changes if any gates flipped
  if (changed.length > 0) {
    const now = new Date().toISOString();
    await db.prepare(
      'UPDATE project_state SET gates = ?, updated_at = ? WHERE project_id = ?'
    ).bind(JSON.stringify(gates), now, projectId).run();
  }

  return {
    evaluated,
    changed,
    gates,
    phase: current.phase || 'BRAINSTORM',
  };
}

/**
 * Quick fire-and-forget gate evaluation.
 * Used as a hook after mutations — doesn't block the response.
 * Returns void, swallows errors.
 *
 * GAP-2: Also triggers readiness escalation check after gate evaluation
 * to auto-flip gates and log threshold crossings.
 */
export async function triggerGateEvaluation(
  db: D1Database,
  projectId: string,
  userId: string
): Promise<void> {
  try {
    const result = await evaluateAllGates(db, projectId, userId);

    // GAP-2: Check readiness escalation only during EXECUTE/REVIEW phases
    // (R-scores are only meaningful when execution has started)
    if (result.phase === 'EXECUTE' || result.phase === 'E' ||
        result.phase === 'REVIEW' || result.phase === 'R') {
      try {
        const { checkReadinessEscalation } = await import('./readinessEscalation');
        await checkReadinessEscalation(db, projectId, userId);
      } catch (escalationErr) {
        console.warn('[GateRules] Escalation check failed (non-blocking):', escalationErr);
      }
    }
  } catch (err) {
    console.warn('[GateRules] Background evaluation failed:', err);
  }
}

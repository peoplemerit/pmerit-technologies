/**
 * GovernanceDashboard — Mathematical Governance Metrics Panel
 *
 * Displays:
 * 1. WU Conservation Bar (stacked: verified green, formula yellow, remaining gray)
 * 2. Scope Readiness Cards (L × P × V = R per scope)
 * 3. Reconciliation Panel (PLANNED vs CLAIMED vs VERIFIED)
 * 4. Audit Trail Timeline (scrollable WU events)
 *
 * Fetches data from /governance/dashboard endpoint.
 */

import { useState, useEffect, useCallback } from 'react';
import type {
  GovernanceDashboardData,
  ScopeReadiness,
  ReconciliationEntry,
  WUAuditEvent,
  ConservationSnapshot,
} from '../lib/api/governance';
import { governanceApi } from '../lib/api/governance';

interface GovernanceDashboardProps {
  projectId: string;
  token: string;
  /** Signal to refresh (e.g., after layer changes) */
  refreshKey?: number;
}

// ─── Color Helpers ──────────────────────────────────────────────────

function rScoreColor(r: number): string {
  if (r >= 0.8) return 'text-green-400';
  if (r >= 0.6) return 'text-amber-400';
  if (r >= 0.3) return 'text-orange-400';
  return 'text-red-400';
}

function rScoreBg(r: number): string {
  if (r >= 0.8) return 'bg-green-500/20 border-green-500/30';
  if (r >= 0.6) return 'bg-amber-500/20 border-amber-500/30';
  if (r >= 0.3) return 'bg-orange-500/20 border-orange-500/30';
  return 'bg-red-500/20 border-red-500/30';
}

function eventIcon(type: string): string {
  switch (type) {
    case 'WU_ALLOCATED': return '📦';
    case 'WU_TRANSFERRED': return '✅';
    case 'WU_ADJUSTED': return '🔧';
    case 'WU_DEALLOCATED': return '❌';
    case 'CONSERVATION_CHECK': return '⚖️';
    case 'READINESS_COMPUTED': return '📊';
    default: return '📋';
  }
}

// ─── Sub-Components ─────────────────────────────────────────────────

function ConservationBar({ conservation }: { conservation: ConservationSnapshot }) {
  const { total, formula, verified } = conservation;
  if (total === 0) {
    return (
      <div className="text-gray-500 text-xs text-center py-2">
        No WU budget initialized. Use governance API to set total_wu.
      </div>
    );
  }
  const verifiedPct = total > 0 ? (verified / total) * 100 : 0;
  const formulaPct = total > 0 ? (formula / total) * 100 : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">WU Conservation</span>
        <span className={conservation.valid ? 'text-green-400' : 'text-red-400'}>
          {conservation.valid ? '✓ Valid' : `✗ Delta: ${conservation.delta}`}
        </span>
      </div>
      <div className="h-4 bg-gray-800 rounded-full overflow-hidden flex">
        <div
          className="bg-green-500 transition-all duration-500"
          style={{ width: `${verifiedPct}%` }}
          title={`Verified: ${verified} WU (${verifiedPct.toFixed(1)}%)`}
        />
        <div
          className="bg-amber-500/70 transition-all duration-500"
          style={{ width: `${formulaPct}%` }}
          title={`In Progress: ${formula} WU (${formulaPct.toFixed(1)}%)`}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>
          <span className="inline-block w-2 h-2 bg-green-500 rounded-sm mr-1" />
          Verified: {verified}
        </span>
        <span>
          <span className="inline-block w-2 h-2 bg-amber-500/70 rounded-sm mr-1" />
          Formula: {formula}
        </span>
        <span>Total: {total}</span>
      </div>
    </div>
  );
}

function ReadinessCard({ scope }: { scope: ScopeReadiness }) {
  return (
    <div className={`border rounded-lg p-2.5 ${rScoreBg(scope.R)}`}>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-medium text-gray-200 truncate max-w-[160px]" title={scope.scope_name}>
          {scope.scope_name}
        </span>
        <span className={`text-sm font-bold ${rScoreColor(scope.R)}`}>
          R={scope.R}
        </span>
      </div>
      {/* L × P × V breakdown */}
      <div className="flex gap-2 text-xs">
        <div className="flex-1">
          <div className="text-gray-500 mb-0.5">L</div>
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-400 rounded-full" style={{ width: `${scope.L * 100}%` }} />
          </div>
          <div className="text-gray-400 text-center mt-0.5">{scope.L}</div>
        </div>
        <div className="flex-1">
          <div className="text-gray-500 mb-0.5">P</div>
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-violet-400 rounded-full" style={{ width: `${scope.P * 100}%` }} />
          </div>
          <div className="text-gray-400 text-center mt-0.5">{scope.P}</div>
        </div>
        <div className="flex-1">
          <div className="text-gray-500 mb-0.5">V</div>
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-teal-400 rounded-full" style={{ width: `${scope.V * 100}%` }} />
          </div>
          <div className="text-gray-400 text-center mt-0.5">{scope.V}</div>
        </div>
      </div>
      {/* WU */}
      <div className="flex justify-between text-xs text-gray-500 mt-1.5 pt-1 border-t border-gray-700/30">
        <span>WU: {scope.allocated_wu}</span>
        <span>Verified: {scope.verified_wu}</span>
        <span>{scope.deliverables_done}/{scope.deliverable_count} done</span>
      </div>
    </div>
  );
}

function ReconciliationRow({ entry }: { entry: ReconciliationEntry }) {
  return (
    <div className={`flex items-center gap-2 text-xs py-1.5 px-2 rounded ${
      entry.requires_attention ? 'bg-red-500/10' : 'bg-gray-800/30'
    }`}>
      <span className="text-gray-300 truncate flex-1 min-w-0" title={entry.scope_name}>
        {entry.scope_name}
      </span>
      <span className="text-gray-400 w-14 text-right">{entry.planned_wu}</span>
      <span className="text-amber-400 w-14 text-right">{entry.claimed_wu}</span>
      <span className="text-green-400 w-14 text-right">{entry.verified_wu}</span>
      <span className={`w-12 text-right ${entry.requires_attention ? 'text-red-400 font-bold' : 'text-gray-500'}`}>
        {entry.divergence_pct}%
      </span>
    </div>
  );
}

function AuditEvent({ event }: { event: WUAuditEvent }) {
  const time = new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const date = new Date(event.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' });
  return (
    <div className="flex items-start gap-2 text-xs py-1.5 border-b border-gray-800/50">
      <span className="text-sm">{eventIcon(event.event_type)}</span>
      <div className="flex-1 min-w-0">
        <span className="text-gray-300">
          {event.event_type.replace(/_/g, ' ')}
        </span>
        {event.wu_amount > 0 && (
          <span className="text-amber-400 ml-1">+{event.wu_amount} WU</span>
        )}
        {event.readiness_score !== null && (
          <span className="text-gray-500 ml-1">R={event.readiness_score}</span>
        )}
        {event.notes && (
          <div className="text-gray-600 truncate mt-0.5" title={event.notes}>{event.notes}</div>
        )}
      </div>
      <span className="text-gray-600 shrink-0">{date} {time}</span>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────

export function GovernanceDashboard({ projectId, token, refreshKey }: GovernanceDashboardProps) {
  const [data, setData] = useState<GovernanceDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await governanceApi.getDashboard(projectId, token);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load governance data');
    } finally {
      setLoading(false);
    }
  }, [projectId, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-violet-500 border-t-transparent" />
        <span className="ml-2 text-gray-400 text-xs">Loading governance metrics…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-400 text-xs">{error}</p>
        <button
          onClick={fetchData}
          className="mt-2 text-xs text-violet-400 hover:text-violet-300 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { readiness, reconciliation, audit_trail } = data;

  return (
    <div className="space-y-4 text-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
          Mathematical Governance
        </h3>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold ${rScoreColor(readiness.project_R)}`}>
            R = {readiness.project_R}
          </span>
          <button
            onClick={fetchData}
            disabled={loading}
            className="text-gray-500 hover:text-gray-300 transition-colors"
            title="Refresh"
          >
            <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* 1. Conservation Bar */}
      <ConservationBar conservation={readiness.conservation} />

      {/* 2. Scope Readiness Cards */}
      {readiness.scopes.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs text-gray-500">Scope Readiness (R = L × P × V)</span>
          <div className="space-y-1.5">
            {readiness.scopes.map((scope) => (
              <ReadinessCard key={scope.scope_id} scope={scope} />
            ))}
          </div>
        </div>
      )}

      {/* 3. Reconciliation Panel */}
      {reconciliation.entries.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Reconciliation Triad</span>
            {reconciliation.has_divergences && (
              <span className="text-xs text-red-400">⚠ Divergences detected</span>
            )}
          </div>
          {/* Header */}
          <div className="flex items-center gap-2 text-xs text-gray-600 px-2">
            <span className="flex-1">Scope</span>
            <span className="w-14 text-right">Plan</span>
            <span className="w-14 text-right">Claim</span>
            <span className="w-14 text-right">Verify</span>
            <span className="w-12 text-right">Δ%</span>
          </div>
          {reconciliation.entries.map((entry) => (
            <ReconciliationRow key={entry.scope_id} entry={entry} />
          ))}
        </div>
      )}

      {/* 4. Audit Trail */}
      {audit_trail.length > 0 && (
        <div className="space-y-1">
          <span className="text-xs text-gray-500">Recent WU Events</span>
          <div className="max-h-40 overflow-y-auto">
            {audit_trail.map((event) => (
              <AuditEvent key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {readiness.scopes.length === 0 && readiness.conservation.total === 0 && (
        <div className="text-center py-6 text-gray-600 text-xs">
          <p>No mathematical governance data yet.</p>
          <p className="mt-1">Initialize WU budget and allocate to scopes to begin tracking.</p>
        </div>
      )}
    </div>
  );
}

export default GovernanceDashboard;

/**
 * GateStatusAUD — GA:AUD Gate Status Display
 * AIXORD v4.6 — HANDOFF-AUDIT-FRONTEND-01 Phase 2C.3
 *
 * Displays GA:AUD gate status with detailed breakdown
 * of satisfaction criteria. Shows SATISFIED/BLOCKED state
 * with individual checklist items.
 */

import React, { useState, useEffect } from 'react';
import { API_BASE } from '../lib/api/config';

interface GateStatusProps {
  projectId: string;
  requiredForLock?: boolean;
}

export function GateStatusAUD({ projectId, requiredForLock = false }: GateStatusProps) {
  const [gateResult, setGateResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGateStatus();
  }, [projectId, requiredForLock]);

  async function loadGateStatus() {
    setLoading(true);
    try {
      const token = localStorage.getItem('session_token');
      const response = await fetch(
        `${API_BASE}/projects/${projectId}/gates/ga-aud?required_for_lock=${requiredForLock}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to load gate status');

      const data = await response.json();
      setGateResult(data);
    } catch (error) {
      console.error('Load gate status error:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="animate-pulse bg-gray-800/50 h-12 rounded-xl border border-gray-700/50"></div>;
  }

  if (!gateResult) {
    return (
      <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/30 rounded-xl p-3">
        Failed to load GA:AUD status
      </div>
    );
  }

  const { satisfied, reason, details } = gateResult;
  const summary = details.findings_summary;

  return (
    <div className={`border-2 rounded-xl p-4 ${
      satisfied
        ? 'border-green-500/50 bg-green-500/5'
        : 'border-red-500/50 bg-red-500/5'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
            satisfied ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {satisfied ? 'P' : 'B'}
          </div>
          <h3 className="text-sm font-semibold text-white">GA:AUD — Audit Gate</h3>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
          satisfied
            ? 'bg-green-500/20 text-green-400 border-green-500/30'
            : 'bg-red-500/20 text-red-400 border-red-500/30'
        }`}>
          {satisfied ? 'SATISFIED' : 'BLOCKED'}
        </span>
      </div>

      {!satisfied && reason && (
        <div className="mb-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
          <pre className="whitespace-pre-wrap font-sans">{reason}</pre>
        </div>
      )}

      {summary && (
        <div className="mb-3 grid grid-cols-5 gap-2">
          <div className="bg-gray-800/50 rounded-lg p-2 text-center">
            <p className="text-[10px] text-gray-500">Total</p>
            <p className="text-sm font-semibold text-white">{summary.total}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-2 text-center">
            <p className="text-[10px] text-gray-500">Critical</p>
            <p className="text-sm font-semibold text-red-400">{summary.critical}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-2 text-center">
            <p className="text-[10px] text-gray-500">High</p>
            <p className="text-sm font-semibold text-orange-400">{summary.high}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-2 text-center">
            <p className="text-[10px] text-gray-500">Pending</p>
            <p className="text-sm font-semibold text-gray-400">{summary.pending}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-2 text-center">
            <p className="text-[10px] text-gray-500">Recurring</p>
            <p className="text-sm font-semibold text-orange-400">{summary.recurring_percent}%</p>
          </div>
        </div>
      )}

      <div className="space-y-1.5 text-xs">
        {[
          { key: 'audit_executed', label: 'Audit executed' },
          { key: 'cross_model_validated', label: 'Cross-model validation (worker != auditor)' },
          { key: 'critical_triaged', label: 'All CRITICAL findings triaged' },
          { key: 'high_triaged', label: 'All HIGH findings triaged' },
          { key: 'rationale_documented', label: 'Triage rationale documented (ACCEPT/DEFER)' },
          { key: 'diff_reviewed', label: 'Audit diff reviewed (if prior audits exist)' },
          { key: 'no_red_flags', label: 'No red flags (<20 critical, <50% recurring)' },
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center gap-2">
            <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] shrink-0 ${
              details[key]
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400'
            }`}>
              {details[key] ? '\u2713' : '\u2717'}
            </span>
            <span className="text-gray-400">{label}</span>
          </div>
        ))}
      </div>

      <button
        onClick={loadGateStatus}
        className="mt-3 text-xs text-violet-400 hover:text-violet-300 font-medium"
      >
        Refresh Status
      </button>
    </div>
  );
}

export default GateStatusAUD;

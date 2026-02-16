/**
 * AuditHistory — Audit Timeline with Diff Comparison
 * AIXORD v4.6 — HANDOFF-AUDIT-FRONTEND-01 Phase 2B.2
 *
 * Timeline view of all audits for a project with:
 * - Metrics per audit (total, new, recurring, severity/disposition breakdown)
 * - Compare any two audits (visual diff: NEW/RECURRING/RESOLVED)
 * - Diminishing returns detection alert
 */

import { useState, useEffect } from 'react';
import { API_BASE } from '../lib/api/config';

interface AuditSummary {
  id: string;
  created_at: string;
  task_id: string;
  total_findings: number;
  new_findings: number;
  recurring_findings: number;
  resolved_findings: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  info_count: number;
  pending_count: number;
  fix_count: number;
  accept_count: number;
  defer_count: number;
  invalid_count: number;
}

interface AuditHistoryProps {
  projectId: string;
  onSelectAudit?: (auditId: string) => void;
  onCompareAudits?: (audit1Id: string, audit2Id: string) => void;
}

export function AuditHistory({ projectId, onSelectAudit, onCompareAudits: _onCompareAudits }: AuditHistoryProps) {
  const [audits, setAudits] = useState<AuditSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedAudits, setSelectedAudits] = useState<string[]>([]);
  const [diffData, setDiffData] = useState<any>(null);

  useEffect(() => {
    loadAuditHistory();
  }, [projectId]);

  async function loadAuditHistory() {
    setLoading(true);
    try {
      const token = localStorage.getItem('session_token');

      // Load all audits
      const auditsResponse = await fetch(
        `${API_BASE}/projects/${projectId}/agents/audit-log`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!auditsResponse.ok) throw new Error('Failed to load audits');

      const auditsData = await auditsResponse.json();
      const auditList = auditsData.audits || [];

      // For each audit, load findings summary
      const summaries: AuditSummary[] = [];
      for (const audit of auditList) {
        const findingsResponse = await fetch(
          `${API_BASE}/projects/${projectId}/audit-findings?audit_id=${audit.id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!findingsResponse.ok) continue;

        const findingsData = await findingsResponse.json();
        const findings = findingsData.findings || [];

        const summary: AuditSummary = {
          id: audit.id,
          created_at: audit.created_at,
          task_id: audit.task_id,
          total_findings: findings.length,
          new_findings: findings.filter((f: any) => !f.prior_audit_match).length,
          recurring_findings: findings.filter((f: any) => f.prior_audit_match).length,
          resolved_findings: 0, // Computed via diff
          critical_count: findings.filter((f: any) => f.severity === 'CRITICAL').length,
          high_count: findings.filter((f: any) => f.severity === 'HIGH').length,
          medium_count: findings.filter((f: any) => f.severity === 'MEDIUM').length,
          low_count: findings.filter((f: any) => f.severity === 'LOW').length,
          info_count: findings.filter((f: any) => f.severity === 'INFO').length,
          pending_count: findings.filter((f: any) => f.disposition === 'PENDING').length,
          fix_count: findings.filter((f: any) => f.disposition === 'FIX').length,
          accept_count: findings.filter((f: any) => f.disposition === 'ACCEPT').length,
          defer_count: findings.filter((f: any) => f.disposition === 'DEFER').length,
          invalid_count: findings.filter((f: any) => f.disposition === 'INVALID').length
        };

        summaries.push(summary);
      }

      // Sort by date (newest first)
      summaries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setAudits(summaries);
    } catch (error) {
      console.error('Load audit history error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function compareAudits() {
    if (selectedAudits.length !== 2) {
      alert('Select exactly 2 audits to compare');
      return;
    }

    try {
      const token = localStorage.getItem('session_token');
      const response = await fetch(
        `${API_BASE}/projects/${projectId}/agents/audit-diff`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            current_audit_id: selectedAudits[0],
            compare_audit_id: selectedAudits[1]
          })
        }
      );

      if (!response.ok) throw new Error('Diff failed');

      const data = await response.json();
      setDiffData(data.diff);
    } catch (error) {
      console.error('Audit diff error:', error);
      alert('Failed to compare audits');
    }
  }

  function toggleAuditSelection(auditId: string) {
    setSelectedAudits(prev => {
      if (prev.includes(auditId)) {
        return prev.filter(id => id !== auditId);
      } else if (prev.length < 2) {
        return [...prev, auditId];
      } else {
        // Replace oldest selection
        return [prev[1], auditId];
      }
    });
  }

  // Detect diminishing returns
  const diminishingReturns = audits.length >= 3 &&
    audits.slice(0, 3).every(a => a.new_findings < 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold bg-blue-500/20 text-blue-400">
              AH
            </div>
            <h3 className="text-sm font-semibold text-white">Audit History</h3>
            <span className="text-xs text-gray-500">{audits.length} total audits</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setCompareMode(!compareMode);
                if (compareMode) {
                  setSelectedAudits([]);
                  setDiffData(null);
                }
              }}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                compareMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {compareMode ? 'Exit Compare' : 'Compare Audits'}
            </button>

            {compareMode && selectedAudits.length === 2 && (
              <button
                onClick={compareAudits}
                className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-xs font-medium transition-colors"
              >
                Show Diff
              </button>
            )}
          </div>
        </div>

        {/* Diminishing Returns Alert */}
        {diminishingReturns && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg mb-3">
            <div className="flex items-start gap-2">
              <span className="text-yellow-400 text-sm shrink-0">!</span>
              <div>
                <h4 className="text-xs font-semibold text-yellow-400">Diminishing Returns Detected</h4>
                <p className="text-[10px] text-yellow-400/70 mt-0.5">
                  Last 3 audits yielded &lt;5 new findings each. Consider pausing audits until next major feature release.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Diff View (if active) */}
        {diffData && (
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg mb-3">
            <h4 className="text-xs font-semibold text-blue-400 mb-2">Audit Comparison</h4>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-lg font-bold text-green-400">{diffData.new}</p>
                <p className="text-[10px] text-gray-500">New Findings</p>
              </div>
              <div>
                <p className="text-lg font-bold text-orange-400">{diffData.recurring}</p>
                <p className="text-[10px] text-gray-500">Recurring</p>
              </div>
              <div>
                <p className="text-lg font-bold text-blue-400">{diffData.resolved}</p>
                <p className="text-[10px] text-gray-500">Resolved</p>
              </div>
            </div>
            {diffData.summary && (
              <p className="text-[10px] text-gray-400 mt-2">{diffData.summary}</p>
            )}
            <button
              onClick={() => setDiffData(null)}
              className="mt-2 text-[10px] text-blue-400 hover:text-blue-300"
            >
              Clear Diff
            </button>
          </div>
        )}

        {/* Audit Timeline */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {audits.map((audit, index) => (
            <div
              key={audit.id}
              className={`p-3 rounded-lg border transition-colors ${
                compareMode && selectedAudits.includes(String(audit.id))
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-700/50 bg-gray-900/30 hover:border-gray-600'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {compareMode && (
                      <input
                        type="checkbox"
                        checked={selectedAudits.includes(String(audit.id))}
                        onChange={() => toggleAuditSelection(String(audit.id))}
                        className="h-3.5 w-3.5 shrink-0"
                      />
                    )}
                    <span className="text-xs font-semibold text-white">
                      Audit #{audits.length - index}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {new Date(audit.created_at).toLocaleDateString()}{' '}
                      {new Date(audit.created_at).toLocaleTimeString()}
                    </span>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    <div>
                      <p className="text-[10px] text-gray-500">Total</p>
                      <p className="text-sm font-semibold text-white">{audit.total_findings}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">New</p>
                      <p className="text-sm font-semibold text-green-400">{audit.new_findings}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Recurring</p>
                      <p className="text-sm font-semibold text-orange-400">{audit.recurring_findings}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Pending</p>
                      <p className="text-sm font-semibold text-gray-400">{audit.pending_count}</p>
                    </div>
                  </div>

                  {/* Severity Breakdown */}
                  <div className="flex gap-1.5 flex-wrap mb-1.5">
                    {audit.critical_count > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 rounded">
                        {audit.critical_count} CRIT
                      </span>
                    )}
                    {audit.high_count > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded">
                        {audit.high_count} HIGH
                      </span>
                    )}
                    {audit.medium_count > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded">
                        {audit.medium_count} MED
                      </span>
                    )}
                    {audit.low_count > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded">
                        {audit.low_count} LOW
                      </span>
                    )}
                    {audit.info_count > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded">
                        {audit.info_count} INFO
                      </span>
                    )}
                  </div>

                  {/* Disposition Breakdown */}
                  <div className="flex gap-3 text-[10px] text-gray-500">
                    <span>{audit.fix_count} Fix</span>
                    <span>{audit.accept_count} Accept</span>
                    <span>{audit.defer_count} Defer</span>
                    <span>{audit.invalid_count} Invalid</span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectAudit?.(String(audit.id))}
                  className="px-2.5 py-1 text-[10px] font-medium bg-gray-700/50 text-gray-400 rounded hover:text-white hover:bg-gray-700 transition-colors shrink-0 ml-2"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}

          {audits.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-xs">No audits found for this project</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuditHistory;

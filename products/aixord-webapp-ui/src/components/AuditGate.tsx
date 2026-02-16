/**
 * AuditGate — Inter-Operative Audit Triage Interface
 * AIXORD v4.6 — HANDOFF-AUDIT-FRONTEND-01 Phase 2B.1
 *
 * Presents audit findings to the Director for one-click triage
 * (Fix/Accept/Defer/Invalid). Groups by severity, supports
 * bulk actions, and shows NEW/RECURRING badges from audit diff.
 */

import { useState, useEffect } from 'react';
import { API_BASE } from '../lib/api/config';

interface Finding {
  id: string;
  finding_type: 'CODE_BUG' | 'DOC_STALE' | 'DOC_INACCURATE' | 'SECURITY_VULN' |
                'PERFORMANCE' | 'BEST_PRACTICE' | 'TECH_DEBT' | 'STYLE_VIOLATION';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  title: string;
  description: string;
  file_path?: string;
  line_number?: number;
  code_snippet?: string;
  recommendation?: string;
  disposition: 'PENDING' | 'FIX' | 'ACCEPT' | 'DEFER' | 'INVALID';
  disposition_reason?: string;
  prior_audit_match?: string; // For diff badge
}

interface TriageStats {
  total: number;
  pending: number;
  fix: number;
  accept: number;
  defer: number;
  invalid: number;
}

interface AuditGateProps {
  projectId: string;
  auditId: string;
  onClose?: () => void;
  onTriageComplete?: (stats: TriageStats) => void;
}

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/30',
  HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  LOW: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  INFO: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const DISPOSITION_COLORS: Record<string, string> = {
  PENDING: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  FIX: 'bg-green-500/20 text-green-400 border-green-500/30',
  ACCEPT: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  DEFER: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  INVALID: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export function AuditGate({ projectId, auditId, onClose, onTriageComplete }: AuditGateProps) {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{
    severity?: string;
    type?: string;
    disposition?: string;
  }>({});
  const [expandedFinding, setExpandedFinding] = useState<string | null>(null);
  const [triageRationale, setTriageRationale] = useState<Record<string, string>>({});

  // Load findings
  useEffect(() => {
    loadFindings();
  }, [projectId, auditId]);

  async function loadFindings() {
    setLoading(true);
    try {
      const token = localStorage.getItem('session_token');
      const response = await fetch(
        `${API_BASE}/projects/${projectId}/audit-findings?audit_id=${auditId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to load findings');

      const data = await response.json();
      setFindings(data.findings || []);
    } catch (error) {
      console.error('Load findings error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function triageFinding(findingId: string, disposition: string) {
    const rationale = triageRationale[findingId];

    // Validation: ACCEPT/DEFER/INVALID require rationale
    if (['ACCEPT', 'DEFER', 'INVALID'].includes(disposition) && !rationale?.trim()) {
      alert(`Rationale required for ${disposition} disposition`);
      return;
    }

    try {
      const token = localStorage.getItem('session_token');
      const response = await fetch(
        `${API_BASE}/projects/${projectId}/audit-findings/${findingId}/triage`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            disposition,
            disposition_reason: rationale || null
          })
        }
      );

      if (!response.ok) throw new Error('Triage failed');

      // Optimistic update
      setFindings(prev => prev.map(f =>
        f.id === findingId
          ? { ...f, disposition: disposition as Finding['disposition'], disposition_reason: rationale }
          : f
      ));

      // Clear rationale
      setTriageRationale(prev => {
        const next = { ...prev };
        delete next[findingId];
        return next;
      });

      // Close expanded view
      if (expandedFinding === findingId) {
        setExpandedFinding(null);
      }

      // Notify parent
      updateTriageStats();
    } catch (error) {
      console.error('Triage error:', error);
      alert('Failed to triage finding');
    }
  }

  async function bulkTriage(targetSeverity: string, disposition: string) {
    const targetFindings = findings.filter(f =>
      f.severity === targetSeverity && f.disposition === 'PENDING'
    );

    if (targetFindings.length === 0) {
      alert(`No pending ${targetSeverity} findings to triage`);
      return;
    }

    const rationale = prompt(
      `Bulk ${disposition} for ${targetFindings.length} ${targetSeverity} findings. Enter rationale:`
    );

    if (!rationale) return; // Cancelled

    for (const finding of targetFindings) {
      // Set rationale first so triageFinding can pick it up
      setTriageRationale(prev => ({ ...prev, [finding.id]: rationale }));
      await triageFinding(finding.id, disposition);
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  function updateTriageStats() {
    const stats = findings.reduce((acc, f) => {
      acc.total++;
      if (f.disposition === 'PENDING') acc.pending++;
      else if (f.disposition === 'FIX') acc.fix++;
      else if (f.disposition === 'ACCEPT') acc.accept++;
      else if (f.disposition === 'DEFER') acc.defer++;
      else if (f.disposition === 'INVALID') acc.invalid++;
      return acc;
    }, { total: 0, pending: 0, fix: 0, accept: 0, defer: 0, invalid: 0 });

    onTriageComplete?.(stats);
  }

  // Apply filters
  const filteredFindings = findings.filter(f => {
    if (filter.severity && f.severity !== filter.severity) return false;
    if (filter.type && f.finding_type !== filter.type) return false;
    if (filter.disposition && f.disposition !== filter.disposition) return false;
    return true;
  });

  // Group by severity
  const groupedFindings = {
    CRITICAL: filteredFindings.filter(f => f.severity === 'CRITICAL'),
    HIGH: filteredFindings.filter(f => f.severity === 'HIGH'),
    MEDIUM: filteredFindings.filter(f => f.severity === 'MEDIUM'),
    LOW: filteredFindings.filter(f => f.severity === 'LOW'),
    INFO: filteredFindings.filter(f => f.severity === 'INFO')
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400 text-sm">Loading audit findings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <span className="text-orange-400 text-sm font-bold">AU</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Audit Gate — Triage Findings</h2>
              <p className="text-xs text-gray-500">
                {findings.length} total findings |{' '}
                {findings.filter(f => f.disposition === 'PENDING').length} pending triage
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-gray-700/50 flex gap-4 items-center flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-500">Severity:</label>
            <select
              value={filter.severity || ''}
              onChange={(e) => setFilter({ ...filter, severity: e.target.value || undefined })}
              className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-300 focus:outline-none focus:border-violet-500"
            >
              <option value="">All</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
              <option value="INFO">Info</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-500">Disposition:</label>
            <select
              value={filter.disposition || ''}
              onChange={(e) => setFilter({ ...filter, disposition: e.target.value || undefined })}
              className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-300 focus:outline-none focus:border-violet-500"
            >
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="FIX">Fix</option>
              <option value="ACCEPT">Accept</option>
              <option value="DEFER">Defer</option>
              <option value="INVALID">Invalid</option>
            </select>
          </div>

          {/* Bulk Actions */}
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => bulkTriage('LOW', 'ACCEPT')}
              className="px-2.5 py-1 text-[10px] font-medium bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
            >
              Accept All LOW
            </button>
            <button
              onClick={() => bulkTriage('INFO', 'DEFER')}
              className="px-2.5 py-1 text-[10px] font-medium bg-yellow-600 hover:bg-yellow-500 text-white rounded transition-colors"
            >
              Defer All INFO
            </button>
          </div>
        </div>

        {/* Findings List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {Object.entries(groupedFindings).map(([severity, severityFindings]) => {
            if (severityFindings.length === 0) return null;

            return (
              <div key={severity}>
                <div className={`inline-block px-2.5 py-1 rounded text-xs font-semibold border mb-3 ${SEVERITY_COLORS[severity]}`}>
                  {severity} ({severityFindings.length})
                </div>

                <div className="space-y-2">
                  {severityFindings.map(finding => (
                    <div
                      key={finding.id}
                      className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 hover:border-gray-600 transition-colors"
                    >
                      {/* Finding Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-sm font-semibold text-white">{finding.title}</h3>
                            <span className="px-1.5 py-0.5 text-[10px] font-mono bg-gray-700/50 text-gray-400 rounded">
                              {finding.finding_type}
                            </span>
                            {finding.prior_audit_match ? (
                              <span className="px-1.5 py-0.5 text-[10px] bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded">
                                RECURRING
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 text-[10px] bg-green-500/20 text-green-400 border border-green-500/30 rounded">
                                NEW
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mb-1">{finding.description}</p>
                          {finding.file_path && (
                            <p className="text-[10px] text-gray-500 font-mono">
                              {finding.file_path}
                              {finding.line_number && ` :${finding.line_number}`}
                            </p>
                          )}
                        </div>

                        <span className={`px-1.5 py-0.5 rounded text-[10px] border shrink-0 ml-2 ${DISPOSITION_COLORS[finding.disposition]}`}>
                          {finding.disposition}
                        </span>
                      </div>

                      {/* Expanded View */}
                      {expandedFinding === finding.id && (
                        <div className="mt-4 pt-4 border-t border-gray-700/50">
                          {finding.code_snippet && (
                            <div className="mb-4">
                              <p className="text-xs font-medium text-gray-400 mb-2">Code Snippet:</p>
                              <pre className="bg-gray-950 border border-gray-800 rounded-lg p-3 text-[10px] overflow-x-auto font-mono text-gray-300">
                                <code>{finding.code_snippet}</code>
                              </pre>
                            </div>
                          )}

                          {finding.recommendation && (
                            <div className="mb-4">
                              <p className="text-xs font-medium text-gray-400 mb-2">Recommendation:</p>
                              <p className="text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg">
                                {finding.recommendation}
                              </p>
                            </div>
                          )}

                          {finding.disposition === 'PENDING' && (
                            <div className="space-y-3">
                              <div>
                                <label className="text-xs font-medium text-gray-400 block mb-2">
                                  Triage Rationale (required for ACCEPT/DEFER/INVALID):
                                </label>
                                <textarea
                                  value={triageRationale[finding.id] || ''}
                                  onChange={(e) => setTriageRationale({ ...triageRationale, [finding.id]: e.target.value })}
                                  placeholder="Why are you accepting, deferring, or marking invalid?"
                                  className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 resize-none"
                                  rows={3}
                                />
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => triageFinding(finding.id, 'FIX')}
                                  className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded text-xs font-medium transition-colors"
                                >
                                  Fix
                                </button>
                                <button
                                  onClick={() => triageFinding(finding.id, 'ACCEPT')}
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors disabled:opacity-40"
                                  disabled={!triageRationale[finding.id]?.trim()}
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => triageFinding(finding.id, 'DEFER')}
                                  className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-white rounded text-xs font-medium transition-colors disabled:opacity-40"
                                  disabled={!triageRationale[finding.id]?.trim()}
                                >
                                  Defer
                                </button>
                                <button
                                  onClick={() => triageFinding(finding.id, 'INVALID')}
                                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-medium transition-colors disabled:opacity-40"
                                  disabled={!triageRationale[finding.id]?.trim()}
                                >
                                  Invalid
                                </button>
                              </div>
                            </div>
                          )}

                          {finding.disposition !== 'PENDING' && finding.disposition_reason && (
                            <div className="mt-3">
                              <p className="text-xs font-medium text-gray-400">Rationale:</p>
                              <p className="text-xs text-gray-300 bg-gray-800 p-2 rounded mt-1">
                                {finding.disposition_reason}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Expand/Collapse Button */}
                      <button
                        onClick={() => setExpandedFinding(expandedFinding === finding.id ? null : finding.id)}
                        className="mt-2 text-xs text-violet-400 hover:text-violet-300 font-medium"
                      >
                        {expandedFinding === finding.id ? '▲ Collapse' : '▼ Expand & Triage'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {filteredFindings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm">No findings match the current filters</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-700 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            Triage Progress:{' '}
            <span className="font-semibold text-gray-300">
              {findings.length - findings.filter(f => f.disposition === 'PENDING').length}/{findings.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuditGate;

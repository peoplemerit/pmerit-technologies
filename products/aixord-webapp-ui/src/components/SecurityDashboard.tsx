/**
 * Security Dashboard — Resource-Level GS:* Gate Status
 * AIXORD v4.5.1 — HANDOFF-CGC-01 GAP-2
 *
 * Displays resource-level data classifications (GS:DC) and
 * secret access audit log (GS:SA) for a project.
 */

import { useEffect, useState, useCallback } from 'react';
import { securityApi } from '../lib/api';

interface SecurityDashboardProps {
  projectId: string;
  token: string;
}

interface ResourceClassification {
  id: string;
  resourceType: string;
  resourceId: string;
  classification: string;
  classificationReason: string | null;
  aiExposureAllowed: boolean;
  dataResidency: string | null;
  jurisdictionReviewed: boolean;
  retentionPolicy: string | null;
  retentionExpiresAt: string | null;
  classifiedBy: string;
  classifiedAt: string;
}

interface SecretAuditEntry {
  id: number;
  secretKey: string;
  accessedBy: string;
  accessedAt: string;
  accessType: string;
  ipAddress: string | null;
  userAgent: string | null;
}

const CLASSIFICATION_COLORS: Record<string, string> = {
  PUBLIC: 'bg-green-500/20 text-green-400 border-green-500/30',
  INTERNAL: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  CONFIDENTIAL: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  RESTRICTED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const ACCESS_TYPE_COLORS: Record<string, string> = {
  READ: 'text-blue-400',
  WRITE: 'text-amber-400',
  ROTATE: 'text-green-400',
  DELETE: 'text-red-400',
};

export function SecurityDashboard({ projectId, token }: SecurityDashboardProps) {
  const [classifications, setClassifications] = useState<ResourceClassification[]>([]);
  const [secretAudits, setSecretAudits] = useState<SecretAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadTimedOut, setLoadTimedOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('');
  const [projectClassification, setProjectClassification] = useState<Record<string, unknown> | null>(null);
  const [suggestions, setSuggestions] = useState<Record<string, unknown> | null>(null);
  const [suggestLoading, setSuggestLoading] = useState(false);

  const loadClassifications = useCallback(async () => {
    try {
      const data = await securityApi.getResourceClassifications(
        projectId,
        token,
        filterType ? { resourceType: filterType } : undefined
      );
      setClassifications(data);
    } catch {
      // Non-critical: resource classifications may not exist yet
      setClassifications([]);
    }
  }, [projectId, token, filterType]);

  const loadSecretAudits = useCallback(async () => {
    try {
      const data = await securityApi.getSecretAuditLog(projectId, token, { limit: 20 });
      setSecretAudits(data);
    } catch {
      // Non-critical: audit log may be empty
      setSecretAudits([]);
    }
  }, [projectId, token]);

  // HIGH-02 Fix: Load project-level classification
  const loadProjectClassification = useCallback(async () => {
    try {
      const resp = await fetch(
        `${import.meta.env.VITE_API_URL || ''}/api/v1/projects/${projectId}/security/classification`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (resp.ok) {
        const data = await resp.json();
        setProjectClassification(data);
      }
    } catch {
      // Will show as unclassified
    }
  }, [projectId, token]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setLoadTimedOut(false);

    // HIGH-02 Fix: 5-second timeout for loading state
    const timeoutId = setTimeout(() => setLoadTimedOut(true), 5000);

    Promise.all([loadClassifications(), loadSecretAudits(), loadProjectClassification()])
      .catch(() => setError('Failed to load security data'))
      .finally(() => {
        clearTimeout(timeoutId);
        setLoading(false);
      });

    return () => clearTimeout(timeoutId);
  }, [loadClassifications, loadSecretAudits, loadProjectClassification]);

  // HIGH-02 Fix: Auto-suggest handler
  const handleAutoSuggest = async () => {
    setSuggestLoading(true);
    try {
      const resp = await fetch(
        `${import.meta.env.VITE_API_URL || ''}/api/v1/projects/${projectId}/security/suggest`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (resp.ok) {
        const data = await resp.json();
        setSuggestions(data);
      }
    } catch {
      // Suggestion failed — user can still classify manually
    } finally {
      setSuggestLoading(false);
    }
  };

  if (loading && !loadTimedOut) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        Loading security dashboard...
      </div>
    );
  }

  if (loading && loadTimedOut) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        <p className="text-amber-400 mb-2">Security data is taking longer than expected.</p>
        <button
          onClick={() => {
            setLoadTimedOut(false);
            setLoading(true);
            Promise.all([loadClassifications(), loadSecretAudits(), loadProjectClassification()])
              .catch(() => setError('Failed to load security data'))
              .finally(() => setLoading(false));
          }}
          className="px-3 py-1.5 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-400 text-sm">
        {error}
        <button
          onClick={() => {
            setError(null);
            setLoading(true);
            Promise.all([loadClassifications(), loadSecretAudits(), loadProjectClassification()])
              .catch(() => setError('Failed to load security data'))
              .finally(() => setLoading(false));
          }}
          className="ml-2 px-3 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const classifiedCount = classifications.length;
  const restrictedCount = classifications.filter(c => c.classification === 'RESTRICTED').length;
  const aiBlockedCount = classifications.filter(c => !c.aiExposureAllowed).length;

  // Check if project classification is unset
  const isUnclassified = !projectClassification ||
    (projectClassification.declared === false) ||
    (projectClassification.pii === 'UNKNOWN' && projectClassification.phi === 'UNKNOWN');
  const exposureUnknown = !projectClassification || projectClassification.ai_exposure === 'RESTRICTED' && !projectClassification.declared;

  return (
    <div className="space-y-4">
      {/* HIGH-02 Fix: Classification Required Banner */}
      {isUnclassified && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-500/20 shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-amber-300 mb-1">Data Classification Required</h4>
              <p className="text-xs text-amber-400/80 mb-3">
                Your project is operating under maximum restriction (L-SPG4). Classify your project data to unlock AI features and set appropriate security levels.
              </p>
              {exposureUnknown && (
                <p className="text-xs text-red-400/80 mb-3">
                  Unknown exposure level restricts AI access. Classify to enable AI-assisted features.
                </p>
              )}
              {suggestions ? (
                <div className="bg-gray-900/40 rounded-lg p-3 mb-3">
                  <p className="text-xs text-gray-400 mb-2">Suggested classification based on project analysis:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(suggestions.suggestions as Record<string, unknown> || {}).map(([key, val]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-500 capitalize">{key.replace('_', ' ')}:</span>
                        <span className={val === true ? 'text-amber-400' : val === false ? 'text-green-400' : 'text-gray-300'}>
                          {typeof val === 'boolean' ? (val ? 'YES' : 'NO') : String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-600 mt-2">
                    Confidence: {String(suggestions.confidence || 'unknown')} — {(suggestions.reasons as string[] || []).join('; ')}
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleAutoSuggest}
                  disabled={suggestLoading}
                  className="px-3 py-1.5 text-xs bg-amber-600/20 text-amber-400 border border-amber-500/30 rounded hover:bg-amber-600/30 transition-colors disabled:opacity-50"
                >
                  {suggestLoading ? 'Analyzing...' : 'Auto-suggest Classifications'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50 text-center">
          <div className="text-lg font-bold text-white">{classifiedCount}</div>
          <div className="text-xs text-gray-500">Resources Classified</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50 text-center">
          <div className={`text-lg font-bold ${restrictedCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
            {restrictedCount}
          </div>
          <div className="text-xs text-gray-500">Restricted</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50 text-center">
          <div className={`text-lg font-bold ${aiBlockedCount > 0 ? 'text-amber-400' : 'text-green-400'}`}>
            {aiBlockedCount}
          </div>
          <div className="text-xs text-gray-500">AI Blocked</div>
        </div>
      </div>

      {/* Data Classifications (GS:DC) */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold bg-violet-500/20 text-violet-400">
              DC
            </div>
            <h3 className="text-sm font-semibold text-white">Resource Classifications</h3>
            <span className="text-xs text-gray-500">GS:DC</span>
          </div>
          {/* Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2 py-1 text-xs bg-gray-900/50 border border-gray-700 rounded text-gray-300 focus:outline-none focus:border-violet-500"
          >
            <option value="">All Types</option>
            <option value="SCOPE">Scope</option>
            <option value="DELIVERABLE">Deliverable</option>
            <option value="MESSAGE">Message</option>
            <option value="FILE">File</option>
          </select>
        </div>

        {classifications.length === 0 ? (
          <div className="text-center py-6 text-gray-500 text-xs">
            No resource-level classifications yet.
            <br />
            Classify resources to enforce granular security gates.
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {classifications.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 bg-gray-900/30 border border-gray-700/50 rounded-lg"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="px-1.5 py-0.5 text-[10px] font-mono bg-gray-700/50 text-gray-400 rounded shrink-0">
                    {item.resourceType}
                  </span>
                  <span className="text-xs text-gray-300 truncate" title={item.resourceId}>
                    {item.resourceId.length > 12 ? `${item.resourceId.slice(0, 12)}...` : item.resourceId}
                  </span>
                  {!item.aiExposureAllowed && (
                    <span className="px-1 py-px text-[9px] bg-red-500/20 text-red-400 rounded shrink-0" title="AI exposure blocked">
                      AI OFF
                    </span>
                  )}
                  {item.jurisdictionReviewed && (
                    <span className="px-1 py-px text-[9px] bg-green-500/20 text-green-400 rounded shrink-0" title="Jurisdiction reviewed">
                      JR
                    </span>
                  )}
                  {item.retentionPolicy && (
                    <span className="px-1 py-px text-[9px] bg-blue-500/20 text-blue-400 rounded shrink-0" title={`Retention: ${item.retentionPolicy}`}>
                      {item.retentionPolicy}
                    </span>
                  )}
                </div>
                <span className={`px-2 py-0.5 text-xs rounded border shrink-0 ${
                  CLASSIFICATION_COLORS[item.classification] || 'bg-gray-700 text-gray-400 border-gray-600'
                }`}>
                  {item.classification}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Secret Access Audit (GS:SA) */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold bg-orange-500/20 text-orange-400">
            SA
          </div>
          <h3 className="text-sm font-semibold text-white">Secret Access Audit</h3>
          <span className="text-xs text-gray-500">GS:SA</span>
          {secretAudits.length > 0 && (
            <span className="text-xs text-gray-500 ml-auto">{secretAudits.length} entries</span>
          )}
        </div>

        {secretAudits.length === 0 ? (
          <div className="text-center py-6 text-gray-500 text-xs">
            No secret access events recorded.
            <br />
            API key operations will appear here.
          </div>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {secretAudits.map(audit => (
              <div
                key={audit.id}
                className="flex items-center gap-2 p-2 bg-gray-900/30 border border-gray-700/50 rounded text-xs font-mono"
              >
                <span className="text-gray-500 shrink-0">
                  {new Date(audit.accessedAt).toLocaleString(undefined, {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
                <span className={`font-semibold shrink-0 ${ACCESS_TYPE_COLORS[audit.accessType] || 'text-gray-400'}`}>
                  {audit.accessType}
                </span>
                <span className="text-gray-300 truncate" title={audit.secretKey}>
                  {audit.secretKey}
                </span>
                <span className="text-gray-500 ml-auto shrink-0">
                  {audit.accessedBy?.slice(0, 8) || 'system'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SecurityDashboard;

/**
 * SecurityRibbon Component (SPG-01 Bridge)
 *
 * Displays Data Classification form and Security Gates status
 * in the ribbon layout. Bridges securityApi to UI.
 */

import { useState, useEffect, useCallback } from 'react';
import { api, type DataClassification, type SecurityGatesStatus } from '../../lib/api';

interface SecurityRibbonProps {
  projectId: string;
  token: string;
  isLoading?: boolean;
}

const GATE_LABELS: Record<string, { label: string; description: string }> = {
  'GS:DC': { label: 'DC', description: 'Data Classification' },
  'GS:DP': { label: 'DP', description: 'Data Protection' },
  'GS:AC': { label: 'AC', description: 'Access Control' },
  'GS:AI': { label: 'AI', description: 'AI Exposure' },
  'GS:JR': { label: 'JR', description: 'Jurisdiction' },
  'GS:RT': { label: 'RT', description: 'Retention' },
};

type ClassificationValue = 'YES' | 'NO' | 'UNKNOWN';

const FIELDS: Array<{ key: 'pii' | 'phi' | 'financial' | 'legal' | 'minorData'; label: string }> = [
  { key: 'pii', label: 'PII' },
  { key: 'phi', label: 'PHI' },
  { key: 'financial', label: 'Financial' },
  { key: 'legal', label: 'Legal' },
  { key: 'minorData', label: 'Minor Data' },
];

export function SecurityRibbon({ projectId, token, isLoading = false }: SecurityRibbonProps) {
  const [classification, setClassification] = useState<DataClassification | null>(null);
  const [securityGates, setSecurityGates] = useState<SecurityGatesStatus | null>(null);
  const [saving, setSaving] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);

  const fetchClassification = useCallback(async () => {
    try {
      const data = await api.security.getClassification(projectId, token);
      setClassification(data);
    } catch {
      // Classification may not exist yet
    }
  }, [projectId, token]);

  const fetchGates = useCallback(async () => {
    try {
      const data = await api.security.getGates(projectId, token);
      setSecurityGates(data);
    } catch {
      // Non-critical
    }
  }, [projectId, token]);

  useEffect(() => {
    fetchClassification();
    fetchGates();
  }, [fetchClassification, fetchGates]);

  const handleFieldChange = async (field: string, value: ClassificationValue) => {
    if (saving) return;
    setSaving(true);
    try {
      const result = await api.security.setClassification(
        projectId,
        { [field]: value },
        token
      );
      setWarnings(result.warnings || []);
      // Refresh both classification and gates after update
      await Promise.all([fetchClassification(), fetchGates()]);
    } catch (err) {
      console.error('Failed to update classification:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-start gap-8">
      {/* Data Classification */}
      <div className="min-w-[320px]">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Data Classification
        </h4>
        <div className="space-y-1.5">
          {FIELDS.map((field) => {
            const value = classification?.[field.key] || 'UNKNOWN';
            return (
              <div key={field.key} className="flex items-center justify-between">
                <span className="text-sm text-gray-300">{field.label}</span>
                <div className="flex gap-1">
                  {(['YES', 'NO', 'UNKNOWN'] as ClassificationValue[]).map((v) => (
                    <button
                      key={v}
                      onClick={() => handleFieldChange(field.key, v)}
                      disabled={isLoading || saving}
                      className={`px-2 py-0.5 text-xs rounded border transition-colors ${
                        value === v
                          ? v === 'YES'
                            ? 'bg-red-500/20 text-red-400 border-red-500/50'
                            : v === 'NO'
                            ? 'bg-green-500/20 text-green-400 border-green-500/50'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                          : 'bg-gray-900/50 text-gray-500 border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {warnings.length > 0 && (
          <div className="mt-2 text-xs text-amber-400">
            {warnings.map((w, i) => <p key={i}>{w}</p>)}
          </div>
        )}
      </div>

      {/* Security Gates */}
      <div className="flex-1">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Security Gates
        </h4>
        {securityGates ? (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              {Object.entries(securityGates.gates).map(([gateId, gate]) => {
                const meta = GATE_LABELS[gateId] || { label: gateId, description: gateId };
                return (
                  <div
                    key={gateId}
                    title={`${meta.description}: ${gate.description}`}
                    className={`px-2 py-1 text-xs font-medium rounded border ${
                      gate.passed
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : gate.required
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : 'bg-gray-700/50 text-gray-400 border-gray-600/50'
                    }`}
                  >
                    {gate.passed ? '✓' : '○'} {meta.label}
                  </div>
                );
              })}
            </div>
            <div className="text-xs mt-2">
              {securityGates.executionAllowed ? (
                <span className="text-green-400">AI Execution Allowed</span>
              ) : (
                <span className="text-red-400">Blocked: {securityGates.reason || 'Security gates incomplete'}</span>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-xs">Loading security gates...</p>
        )}
      </div>

      {/* AI Exposure Level */}
      <div className="min-w-[140px]">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          AI Exposure
        </h4>
        <div className="text-sm">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            classification?.aiExposure === 'PUBLIC'
              ? 'bg-green-500/20 text-green-400'
              : classification?.aiExposure === 'INTERNAL'
              ? 'bg-blue-500/20 text-blue-400'
              : classification?.aiExposure === 'CONFIDENTIAL'
              ? 'bg-amber-500/20 text-amber-400'
              : classification?.aiExposure === 'RESTRICTED'
              ? 'bg-orange-500/20 text-orange-400'
              : classification?.aiExposure === 'PROHIBITED'
              ? 'bg-red-500/20 text-red-400'
              : 'bg-gray-700 text-gray-400'
          }`}>
            {classification?.aiExposure || 'UNKNOWN'}
          </span>
        </div>
        {classification?.jurisdiction && (
          <div className="mt-2">
            <span className="text-gray-500 text-xs">Jurisdiction: </span>
            <span className="text-gray-300 text-xs">{classification.jurisdiction}</span>
          </div>
        )}
        {classification?.regulations && classification.regulations.length > 0 && (
          <div className="mt-1">
            <span className="text-gray-500 text-xs">Regulations: </span>
            <span className="text-gray-300 text-xs">{classification.regulations.join(', ')}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default SecurityRibbon;

/**
 * SecurityRibbon Component (SPG-01 Bridge — Compact)
 *
 * Displays Data Classification form and Security Gates status
 * in the detail panel layout. Compacted for 140px max height.
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
    <div className="space-y-2">
      {/* Row 1: Data Classification — inline */}
      <div className="flex items-center gap-3">
        <span className="text-gray-500 text-xs w-20 shrink-0">Classify:</span>
        <div className="flex items-center gap-3 flex-wrap">
          {FIELDS.map((field) => {
            const value = classification?.[field.key] || 'UNKNOWN';
            return (
              <div key={field.key} className="flex items-center gap-1">
                <span className="text-xs text-gray-400">{field.label}</span>
                <div className="flex gap-px">
                  {(['YES', 'NO', 'UNKNOWN'] as ClassificationValue[]).map((v) => (
                    <button
                      key={v}
                      onClick={() => handleFieldChange(field.key, v)}
                      disabled={isLoading || saving}
                      className={`px-1 py-px text-[10px] rounded transition-colors ${
                        value === v
                          ? v === 'YES'
                            ? 'bg-red-500/20 text-red-400'
                            : v === 'NO'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-amber-500/20 text-amber-400'
                          : 'text-gray-600 hover:text-gray-400'
                      }`}
                    >
                      {v === 'UNKNOWN' ? '?' : v}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {warnings.length > 0 && (
          <span className="text-amber-400 text-[10px] truncate max-w-[120px]" title={warnings.join('; ')}>
            {warnings[0]}
          </span>
        )}
      </div>

      {/* Row 2: Security Gates + AI Exposure inline */}
      <div className="flex items-center gap-3">
        <span className="text-gray-500 text-xs w-20 shrink-0">Sec Gates:</span>
        {securityGates ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            {Object.entries(securityGates.gates).map(([gateId, gate]) => {
              const meta = GATE_LABELS[gateId] || { label: gateId, description: gateId };
              return (
                <span
                  key={gateId}
                  title={`${meta.description}: ${gate.description}`}
                  className={`px-1.5 py-0.5 text-xs rounded ${
                    gate.passed
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : gate.required
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-gray-700/50 text-gray-400 border border-gray-600/50'
                  }`}
                >
                  {gate.passed ? '✓' : '○'} {meta.label}
                </span>
              );
            })}
            <span className={`text-xs ml-1 ${securityGates.executionAllowed ? 'text-green-400' : 'text-red-400'}`}>
              {securityGates.executionAllowed ? 'AI OK' : 'Blocked'}
            </span>
          </div>
        ) : (
          <span className="text-gray-500 text-xs">Loading...</span>
        )}
      </div>

      {/* Row 3: AI Exposure + Jurisdiction */}
      <div className="flex items-center gap-3">
        <span className="text-gray-500 text-xs w-20 shrink-0">Exposure:</span>
        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
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
        {classification?.jurisdiction && (
          <span className="text-gray-400 text-xs">
            <span className="text-gray-500">Juris:</span> {classification.jurisdiction}
          </span>
        )}
        {classification?.regulations && classification.regulations.length > 0 && (
          <span className="text-gray-400 text-xs">
            <span className="text-gray-500">Regs:</span> {classification.regulations.join(', ')}
          </span>
        )}
      </div>
    </div>
  );
}

export default SecurityRibbon;

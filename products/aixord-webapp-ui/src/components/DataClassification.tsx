/**
 * Data Classification Component (SPG-01)
 *
 * AIXORD v4.3 Security & Privacy Governance
 * Allows users to declare data sensitivity classifications for their project.
 */

import { useState } from 'react';
import type { DataClassification as DataClassificationType } from '../lib/api';

interface DataClassificationProps {
  classification: DataClassificationType | undefined;
  onUpdate: (classification: DataClassificationType) => void;
  isLoading?: boolean;
  readOnly?: boolean;
}

type ClassificationValue = 'YES' | 'NO' | 'UNKNOWN';

const CLASSIFICATION_FIELDS: Array<{
  key: 'pii' | 'phi' | 'financial' | 'legal' | 'minorData';
  label: string;
  description: string;
  icon: string;
}> = [
  { key: 'pii', label: 'PII', description: 'Personally Identifiable Information (names, emails, addresses)', icon: 'U' },
  { key: 'phi', label: 'PHI', description: 'Protected Health Information (medical records, diagnoses)', icon: 'H' },
  { key: 'financial', label: 'Financial', description: 'Financial data (bank accounts, credit cards, transactions)', icon: '$' },
  { key: 'legal', label: 'Legal', description: 'Legal/privileged information (contracts, attorney-client)', icon: 'L' },
  { key: 'minorData', label: 'Minor', description: 'Data about individuals under 18 (COPPA considerations)', icon: 'M' },
];

const VALUE_COLORS: Record<ClassificationValue, string> = {
  YES: 'bg-red-500/20 text-red-400 border-red-500/50',
  NO: 'bg-green-500/20 text-green-400 border-green-500/50',
  UNKNOWN: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
};

export function DataClassification({
  classification,
  onUpdate,
  isLoading = false,
  readOnly = false,
}: DataClassificationProps) {
  const [expanded, setExpanded] = useState(false);
  const [jurisdictionInput, setJurisdictionInput] = useState(classification?.jurisdiction || '');
  const [regulationInput, setRegulationInput] = useState('');

  // Default classification if not provided
  const currentClassification: DataClassificationType = classification || {
    projectId: '',
    pii: 'UNKNOWN',
    phi: 'UNKNOWN',
    financial: 'UNKNOWN',
    legal: 'UNKNOWN',
    minorData: 'UNKNOWN',
    jurisdiction: '',
    regulations: [],
    aiExposure: 'RESTRICTED',
    declared: false,
  };

  const handleFieldChange = (field: keyof DataClassificationType, value: ClassificationValue) => {
    if (readOnly) return;
    onUpdate({
      ...currentClassification,
      [field]: value,
    });
  };

  const handleJurisdictionSave = () => {
    if (readOnly) return;
    onUpdate({
      ...currentClassification,
      jurisdiction: jurisdictionInput,
    });
  };

  const handleAddRegulation = () => {
    if (readOnly || !regulationInput.trim()) return;
    const newRegs = [...(currentClassification.regulations || []), regulationInput.trim()];
    onUpdate({
      ...currentClassification,
      regulations: newRegs,
    });
    setRegulationInput('');
  };

  const handleRemoveRegulation = (index: number) => {
    if (readOnly) return;
    const newRegs = currentClassification.regulations.filter((_, i) => i !== index);
    onUpdate({
      ...currentClassification,
      regulations: newRegs,
    });
  };

  // Count non-UNKNOWN classifications
  const declaredCount = CLASSIFICATION_FIELDS.filter(
    (f) => currentClassification[f.key] !== 'UNKNOWN'
  ).length;

  // Check if any sensitive data is declared
  const hasSensitiveData = CLASSIFICATION_FIELDS.some(
    (f) => currentClassification[f.key] === 'YES'
  );

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-700/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
            hasSensitiveData ? 'bg-red-500/20 text-red-400' :
            declaredCount === CLASSIFICATION_FIELDS.length ? 'bg-green-500/20 text-green-400' :
            'bg-amber-500/20 text-amber-400'
          }`}>
            DC
          </div>
          <div className="text-left">
            <h3 className="text-white font-medium">Data Classification</h3>
            <p className="text-xs text-gray-500">
              {declaredCount}/{CLASSIFICATION_FIELDS.length} declared
              {hasSensitiveData && ' - Contains sensitive data'}
            </p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-700/50">
          {/* Classification Fields */}
          <div className="pt-4 space-y-3">
            {CLASSIFICATION_FIELDS.map((field) => (
              <div key={field.key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-gray-700 flex items-center justify-center text-xs text-gray-400">
                    {field.icon}
                  </span>
                  <div>
                    <span className="text-sm text-white">{field.label}</span>
                    <p className="text-xs text-gray-500">{field.description}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {(['YES', 'NO', 'UNKNOWN'] as ClassificationValue[]).map((value) => (
                    <button
                      key={value}
                      onClick={() => handleFieldChange(field.key, value)}
                      disabled={isLoading || readOnly}
                      className={`px-2 py-1 text-xs rounded border transition-colors ${
                        currentClassification[field.key] === value
                          ? VALUE_COLORS[value]
                          : 'bg-gray-900/50 text-gray-500 border-gray-700 hover:border-gray-600'
                      } ${readOnly ? 'cursor-not-allowed opacity-60' : ''}`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Jurisdiction */}
          <div className="pt-2 border-t border-gray-700/50">
            <label className="block text-sm text-gray-400 mb-2">Jurisdiction</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={jurisdictionInput}
                onChange={(e) => setJurisdictionInput(e.target.value)}
                onBlur={handleJurisdictionSave}
                placeholder="e.g., US, EU, California"
                disabled={readOnly}
                className="flex-1 px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 disabled:opacity-60"
              />
            </div>
          </div>

          {/* Applicable Regulations */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Applicable Regulations</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {currentClassification.regulations.map((reg, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-violet-500/20 text-violet-300 rounded text-xs"
                >
                  {reg}
                  {!readOnly && (
                    <button
                      onClick={() => handleRemoveRegulation(i)}
                      className="hover:text-white"
                    >
                      x
                    </button>
                  )}
                </span>
              ))}
              {currentClassification.regulations.length === 0 && (
                <span className="text-xs text-gray-500">No regulations specified</span>
              )}
            </div>
            {!readOnly && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={regulationInput}
                  onChange={(e) => setRegulationInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddRegulation()}
                  placeholder="e.g., GDPR, HIPAA, CCPA"
                  className="flex-1 px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                />
                <button
                  onClick={handleAddRegulation}
                  disabled={!regulationInput.trim()}
                  className="px-3 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-700 text-white rounded-lg text-sm transition-colors"
                >
                  Add
                </button>
              </div>
            )}
          </div>

          {/* Warning for incomplete classification */}
          {declaredCount < CLASSIFICATION_FIELDS.length && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <p className="text-xs text-amber-300">
                <strong>GCP-01 Requirement:</strong> All data classifications must be declared before the project can pass the DC (Data Classification) gate.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DataClassification;

/**
 * CCS Create Incident Modal (Bridge: ccsApi.createIncident)
 *
 * Allows creating a new credential compromise incident.
 */

import { useState } from 'react';
import type { CredentialType, ExposureSource } from '../lib/api';

interface CCSCreateIncidentModalProps {
  onConfirm: (data: {
    credentialType: CredentialType;
    credentialName: string;
    exposureSource: ExposureSource;
    exposureDescription: string;
    impactAssessment: string;
    affectedSystems?: string[];
  }) => Promise<void>;
  onCancel: () => void;
}

const CREDENTIAL_TYPES: Array<{ value: CredentialType; label: string }> = [
  { value: 'API_KEY', label: 'API Key' },
  { value: 'ACCESS_TOKEN', label: 'Access Token' },
  { value: 'SECRET_KEY', label: 'Secret Key' },
  { value: 'PASSWORD', label: 'Password' },
  { value: 'OAUTH_TOKEN', label: 'OAuth Token' },
  { value: 'DATABASE_CREDENTIAL', label: 'Database Credential' },
  { value: 'ENCRYPTION_KEY', label: 'Encryption Key' },
  { value: 'OTHER', label: 'Other' },
];

const EXPOSURE_SOURCES: Array<{ value: ExposureSource; label: string }> = [
  { value: 'VERSION_CONTROL', label: 'Version Control (Git)' },
  { value: 'LOG_FILE', label: 'Log File' },
  { value: 'SCREENSHOT', label: 'Screenshot' },
  { value: 'PUBLIC_CHANNEL', label: 'Public Channel (Slack, etc.)' },
  { value: 'THIRD_PARTY_BREACH', label: 'Third-Party Breach' },
  { value: 'SECURITY_AUDIT', label: 'Security Audit' },
  { value: 'OTHER', label: 'Other' },
];

export function CCSCreateIncidentModal({ onConfirm, onCancel }: CCSCreateIncidentModalProps) {
  const [credentialType, setCredentialType] = useState<CredentialType>('API_KEY');
  const [credentialName, setCredentialName] = useState('');
  const [exposureSource, setExposureSource] = useState<ExposureSource>('VERSION_CONTROL');
  const [exposureDescription, setExposureDescription] = useState('');
  const [impactAssessment, setImpactAssessment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!credentialName.trim() || !exposureDescription.trim() || !impactAssessment.trim()) return;
    setSubmitting(true);
    try {
      await onConfirm({
        credentialType,
        credentialName: credentialName.trim(),
        exposureSource,
        exposureDescription: exposureDescription.trim(),
        impactAssessment: impactAssessment.trim(),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-red-500/30 max-w-lg w-full">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <span className="text-red-400 text-lg">!</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Report Credential Compromise</h3>
              <p className="text-xs text-gray-400">This will activate GA:CCS and halt all execution</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Credential Type</label>
              <select
                value={credentialType}
                onChange={(e) => setCredentialType(e.target.value as CredentialType)}
                className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
              >
                {CREDENTIAL_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Credential Name</label>
              <input
                type="text"
                value={credentialName}
                onChange={(e) => setCredentialName(e.target.value)}
                placeholder="e.g., OPENAI_API_KEY, production_db_password"
                className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Exposure Source</label>
              <select
                value={exposureSource}
                onChange={(e) => setExposureSource(e.target.value as ExposureSource)}
                className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
              >
                {EXPOSURE_SOURCES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Exposure Description</label>
              <textarea
                value={exposureDescription}
                onChange={(e) => setExposureDescription(e.target.value)}
                rows={2}
                placeholder="How was the credential exposed?"
                className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Impact Assessment</label>
              <textarea
                value={impactAssessment}
                onChange={(e) => setImpactAssessment(e.target.value)}
                rows={2}
                placeholder="What systems or data could be affected?"
                className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none"
              />
            </div>
          </div>

          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-xs text-red-300">
              Creating an incident will activate the CCS gate and block all AI execution
              until the full sanitization lifecycle is completed (Detect, Contain, Rotate, Invalidate, Verify, Attest).
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-700">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!credentialName.trim() || !exposureDescription.trim() || !impactAssessment.trim() || submitting}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
          >
            {submitting ? 'Creating...' : 'Report Incident'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CCSCreateIncidentModal;

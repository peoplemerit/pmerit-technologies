/**
 * Security Gates Component (SPG-01)
 *
 * AIXORD v4.3 Security & Privacy Governance
 * Displays and manages the 6 security gates required before sensitive data processing.
 */

import type { SecurityGates as SecurityGatesType } from '../lib/api';

interface SecurityGatesProps {
  gates: SecurityGatesType | undefined;
  onToggle: (gateId: keyof SecurityGatesType) => void;
  isLoading?: boolean;
  readOnly?: boolean;
}

const SECURITY_GATES: Array<{
  key: keyof SecurityGatesType;
  label: string;
  description: string;
  requirement: string;
}> = [
  {
    key: 'GS_DC',
    label: 'Data Classification',
    description: 'All data types have been classified',
    requirement: 'Complete Data Classification section with no UNKNOWN values',
  },
  {
    key: 'GS_DP',
    label: 'Data Protection',
    description: 'Protection requirements can be satisfied',
    requirement: 'Confirm encryption, access controls, and storage security are adequate',
  },
  {
    key: 'GS_AC',
    label: 'Access Controls',
    description: 'Access controls are appropriate for data sensitivity',
    requirement: 'Verify role-based access, authentication, and audit logging',
  },
  {
    key: 'GS_AI',
    label: 'AI Compliance',
    description: 'AI usage complies with data classification',
    requirement: 'Confirm AI processing is permitted for declared data types',
  },
  {
    key: 'GS_JR',
    label: 'Jurisdiction',
    description: 'Jurisdiction compliance confirmed',
    requirement: 'Verify data handling meets jurisdictional requirements (GDPR, CCPA, etc.)',
  },
  {
    key: 'GS_RT',
    label: 'Retention Policy',
    description: 'Retention and deletion policy is compliant',
    requirement: 'Confirm data retention periods and deletion procedures',
  },
];

export function SecurityGates({
  gates,
  onToggle,
  isLoading = false,
  readOnly = false,
}: SecurityGatesProps) {
  // Default gates if not provided
  const currentGates: SecurityGatesType = gates || {
    GS_DC: false,
    GS_DP: false,
    GS_AC: false,
    GS_AI: false,
    GS_JR: false,
    GS_RT: false,
  };

  const passedCount = Object.values(currentGates).filter(Boolean).length;
  const allPassed = passedCount === SECURITY_GATES.length;

  return (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
            allPassed ? 'bg-green-500/20 text-green-400' :
            passedCount > 0 ? 'bg-amber-500/20 text-amber-400' :
            'bg-gray-700 text-gray-400'
          }`}>
            SG
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Security Gates</h3>
            <p className="text-xs text-gray-500">SPG-01 Compliance</p>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-lg font-bold ${
            allPassed ? 'text-green-400' : 'text-amber-400'
          }`}>
            {passedCount}/{SECURITY_GATES.length}
          </span>
          <p className="text-xs text-gray-500">gates passed</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-gray-700 rounded-full mb-4 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            allPassed ? 'bg-green-500' : 'bg-amber-500'
          }`}
          style={{ width: `${(passedCount / SECURITY_GATES.length) * 100}%` }}
        />
      </div>

      {/* Gates List */}
      <div className="space-y-2">
        {SECURITY_GATES.map((gate) => {
          const isPassed = currentGates[gate.key];
          return (
            <div
              key={gate.key}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                isPassed
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-gray-900/30 border-gray-700/50 hover:border-gray-600/50'
              }`}
            >
              <button
                onClick={() => onToggle(gate.key)}
                disabled={isLoading || readOnly}
                className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  isPassed
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-600 hover:border-gray-500'
                } ${readOnly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
              >
                {isPassed && (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-500">{gate.key}</span>
                  <span className={`text-sm font-medium ${isPassed ? 'text-green-300' : 'text-white'}`}>
                    {gate.label}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{gate.description}</p>
                {!isPassed && (
                  <p className="text-xs text-amber-400/80 mt-1 italic">
                    Requirement: {gate.requirement}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* All Passed Message */}
      {allPassed && (
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <p className="text-sm text-green-300 font-medium">
            All security gates passed. Project is cleared for sensitive data processing.
          </p>
        </div>
      )}

      {/* Warning if not all passed */}
      {!allPassed && passedCount > 0 && (
        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <p className="text-xs text-amber-300">
            <strong>SPG-01 Requirement:</strong> All security gates must pass before processing sensitive data. {SECURITY_GATES.length - passedCount} gate(s) remaining.
          </p>
        </div>
      )}
    </div>
  );
}

export default SecurityGates;

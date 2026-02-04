/**
 * CCS Incident Banner (PATCH-CCS-01)
 *
 * Displays active credential compromise warning when GA:CCS is blocking.
 * Per L-CCS2: All execution HALTS until sanitization complete.
 */
import { AlertTriangle, Shield, ArrowRight } from 'lucide-react';
import type { CCSPhase, CredentialType } from '../lib/api';

interface CCSIncidentBannerProps {
  incidentNumber: string;
  phase: CCSPhase;
  credentialName: string;
  credentialType: CredentialType;
  onViewDetails: () => void;
}

const PHASE_LABELS: Record<CCSPhase, string> = {
  INACTIVE: 'Inactive',
  DETECT: 'Detection',
  CONTAIN: 'Containment',
  ROTATE: 'Rotation',
  INVALIDATE: 'Invalidation',
  VERIFY: 'Verification',
  ATTEST: 'Attestation',
  UNLOCK: 'Unlocked',
};

const PHASE_DESCRIPTIONS: Record<CCSPhase, string> = {
  INACTIVE: 'No active incident',
  DETECT: 'Identifying what was exposed and assessing impact',
  CONTAIN: 'Limiting ongoing exposure damage',
  ROTATE: 'Generating replacement credentials',
  INVALIDATE: 'Revoking old credentials at source',
  VERIFY: 'Testing old credentials are rejected, new ones work',
  ATTEST: 'Awaiting Director attestation of forward safety',
  UNLOCK: 'Sanitization complete, gate released',
};

export function CCSIncidentBanner({
  incidentNumber,
  phase,
  credentialName,
  credentialType,
  onViewDetails,
}: CCSIncidentBannerProps) {
  if (phase === 'INACTIVE' || phase === 'UNLOCK') {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-red-900 to-red-800 border-l-4 border-red-500 rounded-r-lg shadow-lg">
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-8 w-8 text-red-400 animate-pulse" />
          </div>
          <div className="ml-4 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-red-100">
                ⚠️ GA:CCS ACTIVE — CREDENTIAL SANITIZATION REQUIRED
              </h3>
              <span className="px-2 py-1 bg-red-700 text-red-100 text-xs font-mono rounded">
                {incidentNumber}
              </span>
            </div>

            <div className="mt-2 flex items-center space-x-4 text-sm">
              <div className="flex items-center text-red-200">
                <span className="font-semibold">Phase:</span>
                <span className="ml-1 px-2 py-0.5 bg-red-700/50 rounded">
                  {PHASE_LABELS[phase]}
                </span>
              </div>
              <div className="flex items-center text-red-200">
                <span className="font-semibold">Credential:</span>
                <span className="ml-1 font-mono">{credentialName}</span>
              </div>
              <div className="flex items-center text-red-300 text-xs">
                <span>({credentialType.replace('_', ' ')})</span>
              </div>
            </div>

            <p className="mt-2 text-sm text-red-300">
              {PHASE_DESCRIPTIONS[phase]}
            </p>

            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-red-400 font-medium">
                ❌ ALL EXECUTION BLOCKED until Director signs CCS-04 attestation.
              </p>
              <button
                onClick={onViewDetails}
                className="flex items-center px-4 py-2 bg-red-700 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Shield className="h-4 w-4 mr-2" />
                Manage Incident
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="px-4 pb-3">
        <CCSPhaseProgress currentPhase={phase} />
      </div>
    </div>
  );
}

/**
 * Mini phase progress indicator for the banner
 */
function CCSPhaseProgress({ currentPhase }: { currentPhase: CCSPhase }) {
  const phases: CCSPhase[] = ['DETECT', 'CONTAIN', 'ROTATE', 'INVALIDATE', 'VERIFY', 'ATTEST', 'UNLOCK'];
  const currentIndex = phases.indexOf(currentPhase);

  return (
    <div className="flex items-center space-x-1">
      {phases.map((phase, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={phase} className="flex items-center">
            <div
              className={`h-2 w-8 rounded-full transition-colors ${
                isComplete
                  ? 'bg-green-500'
                  : isCurrent
                  ? 'bg-yellow-500 animate-pulse'
                  : 'bg-red-700/50'
              }`}
              title={PHASE_LABELS[phase]}
            />
            {index < phases.length - 1 && (
              <div className={`h-0.5 w-1 ${isComplete ? 'bg-green-500' : 'bg-red-700/50'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default CCSIncidentBanner;

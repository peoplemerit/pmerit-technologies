/**
 * CCS Lifecycle Phase Tracker (PATCH-CCS-01)
 *
 * Displays the full CCS lifecycle progress with artifact status.
 * Per L-CCS3: CCS Lifecycle is mandatory - DETECT → CONTAIN → ROTATE → INVALIDATE → VERIFY → ATTEST → UNLOCK
 */
import { useState } from 'react';
import {
  CheckCircle,
  Circle,
  AlertCircle,
  FileText,
  ArrowRight,
  Clock,
  Shield,
  Key,
  XCircle,
  ClipboardCheck,
  Unlock,
} from 'lucide-react';
import type { CCSPhase, CCSArtifactType } from '../lib/api';

interface PhaseConfig {
  key: CCSPhase;
  label: string;
  artifact: CCSArtifactType | null;
  artifactName: string;
  icon: React.ReactNode;
  description: string;
}

const PHASES: PhaseConfig[] = [
  {
    key: 'DETECT',
    label: 'Detect',
    artifact: 'CCS-01',
    artifactName: 'Exposure Report',
    icon: <AlertCircle className="h-5 w-5" />,
    description: 'Identify what was exposed, when, and potential impact',
  },
  {
    key: 'CONTAIN',
    label: 'Contain',
    artifact: 'CCS-02',
    artifactName: 'Containment Record',
    icon: <Shield className="h-5 w-5" />,
    description: 'Immediate actions to limit ongoing exposure',
  },
  {
    key: 'ROTATE',
    label: 'Rotate',
    artifact: null,
    artifactName: '',
    icon: <Key className="h-5 w-5" />,
    description: 'Generate replacement credentials',
  },
  {
    key: 'INVALIDATE',
    label: 'Invalidate',
    artifact: null,
    artifactName: '',
    icon: <XCircle className="h-5 w-5" />,
    description: 'Revoke/disable old credentials at source',
  },
  {
    key: 'VERIFY',
    label: 'Verify',
    artifact: 'CCS-03',
    artifactName: 'Rotation Proof',
    icon: <ClipboardCheck className="h-5 w-5" />,
    description: 'Confirm old credentials rejected, new ones work',
  },
  {
    key: 'ATTEST',
    label: 'Attest',
    artifact: 'CCS-04',
    artifactName: 'Forward-Safety Attestation',
    icon: <FileText className="h-5 w-5" />,
    description: 'Director signs off that exposure can no longer cause harm',
  },
  {
    key: 'UNLOCK',
    label: 'Unlock',
    artifact: 'CCS-05',
    artifactName: 'Audit Trail',
    icon: <Unlock className="h-5 w-5" />,
    description: 'Gate opens, execution may resume',
  },
];

interface CCSLifecycleTrackerProps {
  currentPhase: CCSPhase;
  completedArtifacts: CCSArtifactType[];
  phaseCompletionTimes?: Partial<Record<CCSPhase, string>>;
  onPhaseClick?: (phase: CCSPhase) => void;
}

export function CCSLifecycleTracker({
  currentPhase,
  completedArtifacts,
  phaseCompletionTimes = {},
  onPhaseClick,
}: CCSLifecycleTrackerProps) {
  const [expandedPhase, setExpandedPhase] = useState<CCSPhase | null>(currentPhase);
  const currentIndex = PHASES.findIndex((p) => p.key === currentPhase);

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white flex items-center">
          <Shield className="h-5 w-5 mr-2 text-red-400" />
          CCS Lifecycle Progress
        </h3>
        <span className="text-sm text-gray-400">
          Phase {currentIndex + 1} of {PHASES.length}
        </span>
      </div>

      {/* Horizontal progress bar */}
      <div className="mb-6">
        <div className="flex items-center">
          {PHASES.map((phase, index) => {
            const isComplete = index < currentIndex || currentPhase === 'UNLOCK';
            const isCurrent = index === currentIndex && currentPhase !== 'UNLOCK';
            const hasArtifact = phase.artifact && completedArtifacts.includes(phase.artifact);

            return (
              <div key={phase.key} className="flex items-center flex-1 last:flex-none">
                <button
                  onClick={() => {
                    setExpandedPhase(expandedPhase === phase.key ? null : phase.key);
                    onPhaseClick?.(phase.key);
                  }}
                  className={`
                    relative flex flex-col items-center p-2 rounded-lg transition-all
                    ${isCurrent ? 'bg-yellow-900/30' : ''}
                    ${isComplete ? 'text-green-400' : isCurrent ? 'text-yellow-400' : 'text-gray-500'}
                    hover:bg-gray-700/50
                  `}
                >
                  <div
                    className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-2
                    ${isComplete ? 'border-green-500 bg-green-500/20' : ''}
                    ${isCurrent ? 'border-yellow-500 bg-yellow-500/20 animate-pulse' : ''}
                    ${!isComplete && !isCurrent ? 'border-gray-600 bg-gray-700/30' : ''}
                  `}
                  >
                    {isComplete ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : isCurrent ? (
                      phase.icon
                    ) : (
                      <Circle className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <span className="mt-1 text-xs font-medium">{phase.label}</span>
                  {phase.artifact && (
                    <span
                      className={`text-xs ${
                        hasArtifact ? 'text-green-400' : 'text-gray-500'
                      }`}
                    >
                      {phase.artifact}
                    </span>
                  )}
                </button>
                {index < PHASES.length - 1 && (
                  <div className="flex-1 h-0.5 mx-1">
                    <div
                      className={`h-full rounded ${
                        isComplete ? 'bg-green-500' : 'bg-gray-600'
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Expanded phase details */}
      {expandedPhase && (
        <PhaseDetails
          phase={PHASES.find((p) => p.key === expandedPhase)!}
          isComplete={PHASES.findIndex((p) => p.key === expandedPhase) < currentIndex}
          isCurrent={expandedPhase === currentPhase}
          hasArtifact={PHASES.find((p) => p.key === expandedPhase)?.artifact
            ? completedArtifacts.includes(PHASES.find((p) => p.key === expandedPhase)!.artifact!)
            : true}
          completionTime={phaseCompletionTimes[expandedPhase]}
        />
      )}
    </div>
  );
}

interface PhaseDetailsProps {
  phase: PhaseConfig;
  isComplete: boolean;
  isCurrent: boolean;
  hasArtifact: boolean;
  completionTime?: string;
}

function PhaseDetails({
  phase,
  isComplete,
  isCurrent,
  hasArtifact,
  completionTime,
}: PhaseDetailsProps) {
  return (
    <div
      className={`
      mt-4 p-4 rounded-lg border
      ${isComplete ? 'border-green-700 bg-green-900/20' : ''}
      ${isCurrent ? 'border-yellow-700 bg-yellow-900/20' : ''}
      ${!isComplete && !isCurrent ? 'border-gray-700 bg-gray-900/20' : ''}
    `}
    >
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-white flex items-center">
            {phase.icon}
            <span className="ml-2">{phase.label} Phase</span>
          </h4>
          <p className="mt-1 text-sm text-gray-400">{phase.description}</p>
        </div>
        {isComplete && completionTime && (
          <div className="flex items-center text-xs text-green-400">
            <Clock className="h-3 w-3 mr-1" />
            {new Date(completionTime).toLocaleString()}
          </div>
        )}
      </div>

      {phase.artifact && (
        <div className="mt-3 flex items-center">
          <FileText
            className={`h-4 w-4 mr-2 ${hasArtifact ? 'text-green-400' : 'text-gray-500'}`}
          />
          <span className={`text-sm ${hasArtifact ? 'text-green-400' : 'text-gray-500'}`}>
            {phase.artifact}: {phase.artifactName}
          </span>
          {hasArtifact ? (
            <CheckCircle className="h-4 w-4 ml-2 text-green-400" />
          ) : (
            <span className="ml-2 text-xs text-gray-500">(required)</span>
          )}
        </div>
      )}

      {isCurrent && (
        <div className="mt-3 flex items-center text-yellow-400 text-sm">
          <ArrowRight className="h-4 w-4 mr-1 animate-pulse" />
          <span>Current phase - action required</span>
        </div>
      )}
    </div>
  );
}

export default CCSLifecycleTracker;

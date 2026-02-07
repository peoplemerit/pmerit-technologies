/**
 * GovernanceRibbon Component (Ribbon-Style Layout)
 *
 * Contains Phase stepper and Gates in a compact horizontal layout.
 * Work Gates only shown during Execute/Review phases.
 */

interface GovernanceRibbonProps {
  currentPhase: string;
  onSetPhase?: (phase: string) => void;
  gates: Record<string, boolean>;
  onToggleGate?: (gateId: string) => void;
  isLoading?: boolean;
}

const phases = [
  { id: 'BRAINSTORM', label: 'Brainstorm', short: 'B' },
  { id: 'PLAN', label: 'Plan', short: 'P' },
  { id: 'EXECUTE', label: 'Execute', short: 'E' },
  { id: 'REVIEW', label: 'Review', short: 'R' },
];

// Setup Gates (from GateTracker)
const setupGates = [
  { id: 'GA:LIC', label: 'LIC', title: 'License' },
  { id: 'GA:DIS', label: 'DIS', title: 'Disclaimer' },
  { id: 'GA:TIR', label: 'TIR', title: 'Tier' },
  { id: 'GA:ENV', label: 'ENV', title: 'Environment' },
  { id: 'GA:FLD', label: 'FLD', title: 'Folder' },
  { id: 'GA:CIT', label: 'CIT', title: 'Citations' },
  { id: 'GA:CON', label: 'CON', title: 'Constraints' },
  { id: 'GA:BP', label: 'BP', title: 'Blueprint' },
  { id: 'GA:PS', label: 'PS', title: 'Phase Start' },
  { id: 'GP', label: 'GP', title: 'General Purpose' },
];

// Work Gates
const workGates = [
  { id: 'GW:PRE', label: 'PRE', title: 'Prerequisites' },
  { id: 'GW:VAL', label: 'VAL', title: 'Validation' },
  { id: 'GW:DOC', label: 'DOC', title: 'Documentation' },
  { id: 'GW:QA', label: 'QA', title: 'Quality Assurance' },
  { id: 'GW:DEP', label: 'DEP', title: 'Deployment' },
  { id: 'GW:VER', label: 'VER', title: 'Verification' },
  { id: 'GW:ARC', label: 'ARC', title: 'Archive' },
];

export function GovernanceRibbon({
  currentPhase,
  onSetPhase,
  gates,
  onToggleGate,
  isLoading = false,
}: GovernanceRibbonProps) {
  const currentPhaseIndex = phases.findIndex(
    (p) => p.id === currentPhase || p.short === currentPhase
  );

  const showWorkGates = currentPhase === 'EXECUTE' || currentPhase === 'E' ||
                        currentPhase === 'REVIEW' || currentPhase === 'R';

  // Count completed gates
  const setupComplete = setupGates.filter((g) => gates[g.id]).length;
  const workComplete = workGates.filter((g) => gates[g.id]).length;
  const totalComplete = setupComplete + workComplete;
  const totalGates = setupGates.length + (showWorkGates ? workGates.length : 0);

  return (
    <div className="space-y-4">
      {/* Phase + Progress Row */}
      <div className="flex items-center justify-between">
        {/* Phase Stepper */}
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm mr-2">Phase:</span>
          <div className="flex items-center">
            {phases.map((phase, index) => {
              const isActive = index === currentPhaseIndex;
              const isCompleted = index < currentPhaseIndex;
              const isClickable = onSetPhase && !isLoading;

              return (
                <div key={phase.id} className="flex items-center">
                  <button
                    onClick={() => isClickable && onSetPhase(phase.id)}
                    disabled={!isClickable}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-violet-600 text-white'
                        : isCompleted
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-700/50 text-gray-400 hover:text-white'
                    } ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${
                      isActive ? 'bg-white' : isCompleted ? 'bg-green-400' : 'bg-gray-500'
                    }`} />
                    {phase.label}
                  </button>
                  {index < phases.length - 1 && (
                    <div className={`w-6 h-0.5 mx-1 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-700'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Completion */}
        <div className="text-sm text-gray-400">
          <span className="text-white font-medium">{Math.round((totalComplete / totalGates) * 100)}%</span> Complete
        </div>
      </div>

      {/* Gates Row */}
      <div className="space-y-2">
        {/* Setup Gates */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-gray-500 text-xs w-20 shrink-0">Setup Gates:</span>
          {setupGates.map((gate) => {
            const isPassed = gates[gate.id];
            return (
              <button
                key={gate.id}
                onClick={() => onToggleGate && onToggleGate(gate.id)}
                disabled={isLoading || !onToggleGate}
                title={gate.title}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                  isPassed
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-gray-700/50 text-gray-400 border border-gray-600/50 hover:border-gray-500'
                }`}
              >
                {isPassed ? '✓' : '○'} {gate.label}
              </button>
            );
          })}
        </div>

        {/* Work Gates (only in Execute/Review) */}
        {showWorkGates && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-gray-500 text-xs w-20 shrink-0">Work Gates:</span>
            {workGates.map((gate) => {
              const isPassed = gates[gate.id];
              return (
                <button
                  key={gate.id}
                  onClick={() => onToggleGate && onToggleGate(gate.id)}
                  disabled={isLoading || !onToggleGate}
                  title={gate.title}
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                    isPassed
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-gray-700/50 text-gray-400 border border-gray-600/50 hover:border-gray-500'
                  }`}
                >
                  {isPassed ? '✓' : '○'} {gate.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default GovernanceRibbon;

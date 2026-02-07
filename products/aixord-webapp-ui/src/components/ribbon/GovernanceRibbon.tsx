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
  phaseError?: string | null;
  onOpenWorkspaceSetup?: () => void;
}

const phases = [
  { id: 'BRAINSTORM', label: 'Brainstorm', short: 'B' },
  { id: 'PLAN', label: 'Plan', short: 'P' },
  { id: 'EXECUTE', label: 'Execute', short: 'E' },
  { id: 'REVIEW', label: 'Review', short: 'R' },
];

// Phase exit gate requirements (mirrors backend logic)
const PHASE_EXIT_REQUIREMENTS: Record<string, string[]> = {
  'BRAINSTORM': ['GA:LIC', 'GA:DIS', 'GA:TIR'],
  'PLAN': ['GA:ENV', 'GA:FLD', 'GA:BP', 'GA:IVL'],
  'EXECUTE': ['GW:PRE', 'GW:VAL', 'GW:VER'],
};

function getMissingExitGates(currentPhase: string, targetPhase: string, gates: Record<string, boolean>): string[] {
  const phaseOrder: Record<string, number> = { 'BRAINSTORM': 0, 'PLAN': 1, 'EXECUTE': 2, 'REVIEW': 3 };
  const currentIdx = phaseOrder[currentPhase] ?? -1;
  const targetIdx = phaseOrder[targetPhase] ?? -1;

  // Backward transitions always allowed
  if (targetIdx <= currentIdx) return [];

  const required = PHASE_EXIT_REQUIREMENTS[currentPhase];
  if (!required) return [];

  return required.filter(g => !gates[g]);
}

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
  { id: 'GA:IVL', label: 'IVL', title: 'Integrity Validation' },
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

// Gates that open workspace wizard instead of toggling directly
const WORKSPACE_GATES = new Set(['GA:ENV', 'GA:FLD']);

export function GovernanceRibbon({
  currentPhase,
  onSetPhase,
  gates,
  onToggleGate,
  isLoading = false,
  phaseError,
  onOpenWorkspaceSetup,
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
              const missingGates = getMissingExitGates(currentPhase, phase.id, gates);
              const isBlocked = missingGates.length > 0 && index > currentPhaseIndex;
              const isClickable = onSetPhase && !isLoading && !isBlocked;

              return (
                <div key={phase.id} className="flex items-center">
                  <button
                    onClick={() => isClickable && onSetPhase(phase.id)}
                    disabled={!isClickable}
                    title={isBlocked ? `Blocked: missing ${missingGates.join(', ')}` : phase.label}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-violet-600 text-white'
                        : isCompleted
                        ? 'bg-green-500/20 text-green-400'
                        : isBlocked
                        ? 'bg-gray-700/30 text-gray-600 cursor-not-allowed'
                        : 'bg-gray-700/50 text-gray-400 hover:text-white'
                    } ${isClickable ? 'cursor-pointer' : isBlocked ? 'cursor-not-allowed' : 'cursor-default'}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${
                      isActive ? 'bg-white' : isCompleted ? 'bg-green-400' : isBlocked ? 'bg-red-400/50' : 'bg-gray-500'
                    }`} />
                    {phase.label}
                    {isBlocked && <span className="text-red-400/60 text-xs ml-0.5">!</span>}
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

      {/* Phase transition error */}
      {phaseError && (
        <div className="px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-300">
          {phaseError}
        </div>
      )}

      {/* Gates Row */}
      <div className="space-y-2">
        {/* Setup Gates */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-gray-500 text-xs w-20 shrink-0">Setup Gates:</span>
          {setupGates.map((gate) => {
            const isPassed = gates[gate.id];
            const isWorkspaceGate = WORKSPACE_GATES.has(gate.id);
            const handleClick = () => {
              // If it's a workspace gate and not yet passed, open the wizard
              if (isWorkspaceGate && !isPassed && onOpenWorkspaceSetup) {
                onOpenWorkspaceSetup();
              } else if (onToggleGate) {
                onToggleGate(gate.id);
              }
            };
            return (
              <button
                key={gate.id}
                onClick={handleClick}
                disabled={isLoading || (!onToggleGate && !onOpenWorkspaceSetup)}
                title={isWorkspaceGate && !isPassed ? `${gate.title} — Click to configure workspace` : gate.title}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                  isPassed
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : isWorkspaceGate
                    ? 'bg-violet-500/10 text-violet-400 border border-violet-500/30 hover:bg-violet-500/20'
                    : 'bg-gray-700/50 text-gray-400 border border-gray-600/50 hover:border-gray-500'
                }`}
              >
                {isPassed ? '✓' : isWorkspaceGate ? '⚙' : '○'} {gate.label}
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

/**
 * GovernanceRibbon Component (Detail Panel — Compact)
 *
 * UI-GOV-001: Authority Clarity Doctrine
 *   Phases = breadcrumb progress (informational, non-blocking)
 *   Gates  = blocking authority checkpoints (red=required, green=passed)
 *
 * Phase stepper is condensed (MiniBar shows the primary view).
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
  onFinalizePhase?: (phase: string) => void;
  isFinalizing?: boolean;
  /** HANDOFF-PTX-01: Pulse the finalize button when artifact is ready */
  finalizeReady?: boolean;
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
  if (targetIdx <= currentIdx) return [];
  const required = PHASE_EXIT_REQUIREMENTS[currentPhase];
  if (!required) return [];
  return required.filter(g => !gates[g]);
}

// Setup Gates
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
  { id: 'GA:GP', label: 'GP', title: 'General Purpose' },
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

const WORKSPACE_GATES = new Set(['GA:ENV', 'GA:FLD']);

// HIGH-01: Gate failure reason + action map for user-facing tooltips
const GATE_FAILURE_INFO: Record<string, { reason: string; action: string }> = {
  'GA:LIC': { reason: 'No active subscription', action: 'Subscribe to a plan' },
  'GA:DIS': { reason: 'Insufficient discussion', action: 'Have at least one conversation' },
  'GA:TIR': { reason: 'Subscription tier not set', action: 'Activate subscription' },
  'GA:ENV': { reason: 'Workspace not confirmed', action: 'Set up project workspace' },
  'GA:FLD': { reason: 'No project folder linked', action: 'Link a project folder' },
  'GA:CIT': { reason: 'Citations not provided', action: 'Add citations to project' },
  'GA:CON': { reason: 'Constraints not defined', action: 'Define project constraints' },
  'GA:BP':  { reason: 'Blueprint incomplete', action: 'Add scopes with deliverables and DoD' },
  'GA:IVL': { reason: 'Integrity check not passed', action: 'Run integrity validation' },
  'GA:PS':  { reason: 'Phase start gate pending', action: 'Complete phase prerequisites' },
  'GA:GP':  { reason: 'General purpose gate pending', action: 'Complete required checks' },
  'GW:PRE': { reason: 'Prerequisites incomplete', action: 'Complete upstream deliverables' },
  'GW:VAL': { reason: 'Validation not done', action: 'Validate deliverables' },
  'GW:DOC': { reason: 'Documentation missing', action: 'Add required documentation' },
  'GW:QA':  { reason: 'QA not performed', action: 'Run quality assurance checks' },
  'GW:DEP': { reason: 'Deployment not ready', action: 'Prepare deployment artifacts' },
  'GW:VER': { reason: 'Verification pending', action: 'Verify completed work' },
  'GW:ARC': { reason: 'Archive not complete', action: 'Archive project artifacts' },
};

function getGateTooltip(gateId: string, label: string, isPassed: boolean, isRequired: boolean): string {
  if (isPassed) return `${label} — Passed ✓`;
  const info = GATE_FAILURE_INFO[gateId];
  if (!info) return label;
  const lines = [`${label} — ${isPassed ? 'Passed' : isRequired ? 'BLOCKING' : 'Pending'}`];
  lines.push(`Reason: ${info.reason}`);
  lines.push(`Action: ${info.action}`);
  return lines.join('\n');
}

export function GovernanceRibbon({
  currentPhase,
  onSetPhase,
  gates,
  onToggleGate,
  isLoading = false,
  phaseError,
  onOpenWorkspaceSetup,
  onFinalizePhase,
  isFinalizing = false,
  finalizeReady = false,
}: GovernanceRibbonProps) {
  const currentPhaseIndex = phases.findIndex(
    (p) => p.id === currentPhase || p.short === currentPhase
  );

  const showWorkGates = currentPhase === 'EXECUTE' || currentPhase === 'E' ||
                        currentPhase === 'REVIEW' || currentPhase === 'R';

  return (
    <div className="space-y-2">
      {/* Phase Row — breadcrumb progress indicator (UI-GOV-001: informational, non-blocking) */}
      <div className="flex items-center gap-2">
        <span className="text-gray-500 text-xs shrink-0">Phase:</span>
        <div className="flex items-center gap-0">
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
                  className={`flex items-center gap-1 px-2 py-0.5 text-xs transition-colors ${
                    isActive
                      ? 'text-white font-semibold'
                      : isCompleted
                      ? 'text-gray-400'
                      : isBlocked
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                    isActive ? 'bg-violet-400' : isCompleted ? 'bg-green-500' : 'bg-gray-600'
                  }`} />
                  {phase.label}
                </button>
                {index < phases.length - 1 && (
                  <span className={`text-xs ${isCompleted ? 'text-green-600' : 'text-gray-700'}`}>›</span>
                )}
              </div>
            );
          })}
        </div>
        {phaseError && (
          <span className="text-red-400 text-xs ml-2 truncate max-w-[200px]" title={phaseError}>
            {phaseError}
          </span>
        )}
      </div>

      {/* Setup Gates (UI-GOV-001: gates are blocking authority checkpoints) */}
      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-gray-500 text-xs w-14 shrink-0 font-medium">Setup</span>
        {setupGates.map((gate) => {
          const isPassed = gates[gate.id];
          const isWorkspaceGate = WORKSPACE_GATES.has(gate.id);
          const isRequired = (PHASE_EXIT_REQUIREMENTS[currentPhase] || []).includes(gate.id);
          const handleClick = () => {
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
              title={isWorkspaceGate && !isPassed
                ? `${gate.title} — Click to configure workspace\nAction: ${GATE_FAILURE_INFO[gate.id]?.action || 'Set up workspace'}`
                : getGateTooltip(gate.id, gate.title, isPassed, isRequired)}
              className={`px-1.5 py-0.5 text-xs rounded font-medium transition-colors ${
                isPassed
                  ? 'bg-green-900/40 text-green-400 border border-green-500/40'
                  : isRequired
                  ? 'bg-red-900/30 text-red-400 border border-red-500/40 hover:bg-red-900/40'
                  : isWorkspaceGate
                  ? 'bg-violet-900/20 text-violet-400 border border-violet-500/30 hover:bg-violet-900/30'
                  : 'bg-gray-800/50 text-gray-500 border border-gray-700/50 hover:border-gray-600'
              }`}
            >
              {isPassed ? '✓' : isRequired ? '✗' : isWorkspaceGate ? '⚙' : '○'} {gate.label}
            </button>
          );
        })}
      </div>

      {/* Work Gates (UI-GOV-001: blocking checkpoints, only in Execute/Review) */}
      {showWorkGates && (
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-gray-500 text-xs w-14 shrink-0 font-medium">Work</span>
          {workGates.map((gate) => {
            const isPassed = gates[gate.id];
            const isRequired = (PHASE_EXIT_REQUIREMENTS[currentPhase] || []).includes(gate.id);
            return (
              <button
                key={gate.id}
                onClick={() => onToggleGate && onToggleGate(gate.id)}
                disabled={isLoading || !onToggleGate}
                title={getGateTooltip(gate.id, gate.title, isPassed, isRequired)}
                className={`px-1.5 py-0.5 text-xs rounded font-medium transition-colors ${
                  isPassed
                    ? 'bg-green-900/40 text-green-400 border border-green-500/40'
                    : isRequired
                    ? 'bg-red-900/30 text-red-400 border border-red-500/40 hover:bg-red-900/40'
                    : 'bg-gray-800/50 text-gray-500 border border-gray-700/50 hover:border-gray-600'
                }`}
              >
                {isPassed ? '✓' : isRequired ? '✗' : '○'} {gate.label}
              </button>
            );
          })}
        </div>
      )}

      {/* HIGH-01: Gate Legend */}
      <div className="flex items-center gap-3 text-[10px] text-gray-500 pt-1">
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-green-500/40 border border-green-500/40" /> Passed</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-red-500/30 border border-red-500/40" /> Blocking</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-gray-800/50 border border-gray-700/50" /> Not required</span>
      </div>

      {/* Finalize Phase Button — Phase 4 governance transaction */}
      {onFinalizePhase && currentPhase !== 'REVIEW' && (
        (() => {
          const exitGates = PHASE_EXIT_REQUIREMENTS[currentPhase];
          const missing = exitGates ? exitGates.filter(g => !gates[g]) : [];
          const canFinalize = missing.length === 0;
          const PHASE_NEXT: Record<string, string> = {
            'BRAINSTORM': 'Plan', 'PLAN': 'Execute', 'EXECUTE': 'Review',
          };
          const nextLabel = PHASE_NEXT[currentPhase] || 'Next';
          return (
            <div className="pt-2 border-t border-gray-700/30">
              <button
                onClick={() => onFinalizePhase(currentPhase)}
                disabled={!canFinalize || isLoading || isFinalizing}
                title={canFinalize
                  ? `Finalize ${currentPhase} phase and advance to ${nextLabel}`
                  : `Cannot finalize — ${missing.length} blocking gate(s):\n${missing.map(g => {
                      const info = GATE_FAILURE_INFO[g];
                      return info ? `• ${g}: ${info.reason} → ${info.action}` : `• ${g}`;
                    }).join('\n')}`}
                className={`w-full px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  canFinalize && finalizeReady
                    ? 'bg-violet-600 hover:bg-violet-500 text-white ring-2 ring-violet-400/50 animate-pulse'
                    : canFinalize
                    ? 'bg-violet-600 hover:bg-violet-500 text-white'
                    : 'bg-gray-700/30 text-gray-600 cursor-not-allowed'
                }`}
              >
                {isFinalizing ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <span className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent" />
                    Finalizing…
                  </span>
                ) : (
                  <>Finalize {currentPhase.charAt(0) + currentPhase.slice(1).toLowerCase()} → {nextLabel}</>
                )}
              </button>
            </div>
          );
        })()
      )}
    </div>
  );
}

export default GovernanceRibbon;

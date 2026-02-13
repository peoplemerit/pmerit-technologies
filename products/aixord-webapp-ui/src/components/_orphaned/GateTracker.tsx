/**
 * Gate Tracker Component (D4)
 *
 * Displays and manages AIXORD gates.
 * All gate keys use canonical prefixed format: GA: (setup), GW: (work).
 *
 * Features:
 * - Visual gate chips with pass/pending states
 * - Setup vs Work gate categories
 * - Progress bar
 * - Router integration ready
 */

// UI-specific gate type — canonical prefixed keys
type GateID =
  | 'GA:LIC' | 'GA:DIS' | 'GA:TIR' | 'GA:ENV' | 'GA:FLD'
  | 'GA:CIT' | 'GA:CON' | 'GA:BP' | 'GA:IVL' | 'GA:PS' | 'GA:GP'
  | 'GW:PRE' | 'GW:VAL' | 'GW:DOC' | 'GW:QA' | 'GW:DEP' | 'GW:VER' | 'GW:ARC';

interface GateDefinition {
  name: string;
  description: string;
  phase: 'SETUP' | 'WORK';
  /** Short label for display (no prefix) */
  label: string;
}

// AIXORD Gate Definitions — canonical GA:/GW: prefixed keys
const GATES: Record<GateID, GateDefinition> = {
  // SETUP GATES (GA: prefix)
  'GA:LIC': { name: 'License', label: 'LIC', description: 'Director has accepted governance terms', phase: 'SETUP' },
  'GA:DIS': { name: 'Disclaimer', label: 'DIS', description: 'AI limitations and risks acknowledged', phase: 'SETUP' },
  'GA:TIR': { name: 'Tier', label: 'TIR', description: 'Subscription tier selected and validated', phase: 'SETUP' },
  'GA:ENV': { name: 'Environment', label: 'ENV', description: 'Working environment configured', phase: 'SETUP' },
  'GA:FLD': { name: 'Folder', label: 'FLD', description: 'Project folder/workspace established', phase: 'SETUP' },
  'GA:CIT': { name: 'Citations', label: 'CIT', description: 'Citation and source requirements defined', phase: 'SETUP' },
  'GA:CON': { name: 'Constraints', label: 'CON', description: 'Project constraints and boundaries documented', phase: 'SETUP' },
  'GA:BP':  { name: 'Blueprint', label: 'BP', description: 'Technical blueprint artifact with scopes and deliverables', phase: 'SETUP' },
  'GA:IVL': { name: 'Integrity Validation', label: 'IVL', description: 'Blueprint integrity validation passed', phase: 'SETUP' },
  'GA:PS':  { name: 'Phase Start', label: 'PS', description: 'Phase start conditions satisfied', phase: 'SETUP' },
  'GA:GP':  { name: 'General Purpose', label: 'GP', description: 'General purpose gate', phase: 'SETUP' },

  // WORK GATES (GW: prefix)
  'GW:PRE': { name: 'Prerequisites', label: 'PRE', description: 'Execution prerequisites verified', phase: 'WORK' },
  'GW:VAL': { name: 'Validation', label: 'VAL', description: 'Output validated against requirements', phase: 'WORK' },
  'GW:DOC': { name: 'Documentation', label: 'DOC', description: 'Documentation artifacts produced', phase: 'WORK' },
  'GW:QA':  { name: 'Quality Assurance', label: 'QA', description: 'Quality checks completed', phase: 'WORK' },
  'GW:DEP': { name: 'Dependencies', label: 'DEP', description: 'Dependencies resolved', phase: 'WORK' },
  'GW:VER': { name: 'Verification', label: 'VER', description: 'Deliverables verified against DoD', phase: 'WORK' },
  'GW:ARC': { name: 'Archive', label: 'ARC', description: 'Session archived for audit trail', phase: 'WORK' },
};

const SETUP_GATES: GateID[] = [
  'GA:LIC', 'GA:DIS', 'GA:TIR', 'GA:ENV', 'GA:FLD',
  'GA:CIT', 'GA:CON', 'GA:BP', 'GA:IVL', 'GA:PS', 'GA:GP',
];
const WORK_GATES: GateID[] = [
  'GW:PRE', 'GW:VAL', 'GW:DOC', 'GW:QA', 'GW:DEP', 'GW:VER', 'GW:ARC',
];

interface GateTrackerProps {
  gates: Record<string, boolean>;
  onPassGate?: (gateId: GateID) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

function GateChip({
  gateId,
  passed,
  definition,
  onClick,
  disabled,
}: {
  gateId: GateID;
  passed: boolean;
  definition: GateDefinition;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const baseClasses = 'px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer border';
  const passedClasses = 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20';
  const pendingClasses = 'bg-gray-800/50 text-gray-400 border-gray-700 hover:border-gray-600';
  const disabledClasses = 'opacity-50 cursor-not-allowed';

  return (
    <button
      onClick={onClick}
      disabled={disabled || passed}
      className={`${baseClasses} ${passed ? passedClasses : pendingClasses} ${disabled ? disabledClasses : ''}`}
      title={`${definition.name}: ${definition.description}${passed ? ' (Passed)' : ''}`}
    >
      <span className="flex items-center gap-1.5">
        {passed ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth={2} />
          </svg>
        )}
        {definition.label}
      </span>
    </button>
  );
}

export function GateTracker({ gates, onPassGate, disabled = false, isLoading = false }: GateTrackerProps) {
  const setupPassed = SETUP_GATES.filter((g) => gates[g]).length;
  const workPassed = WORK_GATES.filter((g) => gates[g]).length;

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Gates</h3>
        {isLoading && (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-violet-500 border-t-transparent" />
        )}
      </div>

      {/* Setup Gates */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-400">Setup Gates</span>
          <span className="text-xs text-gray-500">{setupPassed}/{SETUP_GATES.length}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SETUP_GATES.map((gateId) => (
            <GateChip
              key={gateId}
              gateId={gateId}
              passed={gates[gateId] || false}
              definition={GATES[gateId]}
              onClick={() => onPassGate?.(gateId)}
              disabled={disabled || isLoading}
            />
          ))}
        </div>
      </div>

      {/* Work Gates */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-400">Work Gates</span>
          <span className="text-xs text-gray-500">{workPassed}/{WORK_GATES.length}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {WORK_GATES.map((gateId) => (
            <GateChip
              key={gateId}
              gateId={gateId}
              passed={gates[gateId] || false}
              definition={GATES[gateId]}
              onClick={() => onPassGate?.(gateId)}
              disabled={disabled || isLoading}
            />
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-6 pt-4 border-t border-gray-700/50">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Overall Progress</span>
          <span className="text-sm text-gray-400">
            {setupPassed + workPassed}/{SETUP_GATES.length + WORK_GATES.length}
          </span>
        </div>
        <div className="h-2 bg-gray-900/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-300"
            style={{
              width: `${((setupPassed + workPassed) / (SETUP_GATES.length + WORK_GATES.length)) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default GateTracker;

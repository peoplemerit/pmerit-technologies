/**
 * Gate Tracker Component (D4)
 *
 * Displays and manages AIXORD gates (17 gates per v4.3).
 *
 * Features:
 * - Visual gate chips with pass/pending states
 * - Setup vs Work gate categories
 * - Progress bar
 * - Router integration ready
 *
 * v4.3 Update: Added FLD, CIT, CON, DC gates per AIXORD governance spec
 */

// UI-specific gate type (v4.3 complete set)
type GateID =
  | 'LIC' | 'DIS' | 'TIR' | 'ENV' | 'FLD' | 'CIT' | 'CON' | 'OBJ' | 'RA' | 'DC'
  | 'FX' | 'PD' | 'PR' | 'BP' | 'MS' | 'VA' | 'HO';

interface GateDefinition {
  name: string;
  description: string;
  phase: 'SETUP' | 'WORK';
}

// AIXORD Gate Definitions (v4.3)
// Inlined to avoid dependency on @aixord/core until package is built
const GATES: Record<GateID, GateDefinition> = {
  // SETUP GATES (10-step per v4.3)
  LIC: { name: 'License', description: 'Director has accepted governance terms', phase: 'SETUP' },
  DIS: { name: 'Disclosure', description: 'AI limitations and risks acknowledged', phase: 'SETUP' },
  TIR: { name: 'Tier', description: 'Subscription tier selected and validated', phase: 'SETUP' },
  ENV: { name: 'Environment', description: 'Working environment configured', phase: 'SETUP' },
  FLD: { name: 'Folder', description: 'Project folder/workspace established', phase: 'SETUP' },
  CIT: { name: 'Citation', description: 'Citation and source requirements defined', phase: 'SETUP' },
  CON: { name: 'Constraints', description: 'Project constraints and boundaries documented', phase: 'SETUP' },
  OBJ: { name: 'Objective', description: 'Project objective clearly defined', phase: 'SETUP' },
  RA: { name: 'Reality Assessment', description: 'Reality classification completed', phase: 'SETUP' },
  DC: { name: 'Data Classification', description: 'Data sensitivity classification completed', phase: 'SETUP' },

  // WORK GATES (7)
  FX: { name: 'Fix', description: 'Issue or requirement identified for resolution', phase: 'WORK' },
  PD: { name: 'Project Document', description: 'Project document artifact created', phase: 'WORK' },
  PR: { name: 'Progress', description: 'Meaningful progress checkpoint reached', phase: 'WORK' },
  BP: { name: 'Blueprint', description: 'Technical blueprint artifact locked', phase: 'WORK' },
  MS: { name: 'Master Scope', description: 'Master scope artifact approved', phase: 'WORK' },
  VA: { name: 'Validation', description: 'Output validated against requirements', phase: 'WORK' },
  HO: { name: 'Handoff', description: 'Handoff artifact created for transition', phase: 'WORK' },
};

// v4.3: 10 Setup Gates + 7 Work Gates = 17 total
const SETUP_GATES: GateID[] = ['LIC', 'DIS', 'TIR', 'ENV', 'FLD', 'CIT', 'CON', 'OBJ', 'RA', 'DC'];
const WORK_GATES: GateID[] = ['FX', 'PD', 'PR', 'BP', 'MS', 'VA', 'HO'];

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
        {gateId}
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

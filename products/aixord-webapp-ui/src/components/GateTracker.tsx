/**
 * Gate Tracker Component
 *
 * Displays and manages AIXORD gates (13 gates per v4.2).
 * Uses canonical gate definitions from @aixord/core.
 */

import { GATE_DEFINITIONS } from '@aixord/core';

// UI-specific gate type (simplified subset for display)
type GateID =
  | 'LIC' | 'DIS' | 'TIR' | 'ENV' | 'OBJ' | 'RA'
  | 'FX' | 'PD' | 'PR' | 'BP' | 'MS' | 'VA' | 'HO';

interface GateDefinition {
  name: string;
  description: string;
  phase: 'SETUP' | 'WORK';
}

// Map canonical definitions to UI display format
const GATES: Record<GateID, GateDefinition> = {
  // SETUP GATES
  LIC: { name: GATE_DEFINITIONS.LIC.name, description: GATE_DEFINITIONS.LIC.description, phase: 'SETUP' },
  DIS: { name: GATE_DEFINITIONS.DIS.name, description: GATE_DEFINITIONS.DIS.description, phase: 'SETUP' },
  TIR: { name: GATE_DEFINITIONS.TIR.name, description: GATE_DEFINITIONS.TIR.description, phase: 'SETUP' },
  ENV: { name: GATE_DEFINITIONS.ENV.name, description: GATE_DEFINITIONS.ENV.description, phase: 'SETUP' },
  OBJ: { name: GATE_DEFINITIONS.OBJ.name, description: GATE_DEFINITIONS.OBJ.description, phase: 'SETUP' },
  RA: { name: GATE_DEFINITIONS.RA.name, description: GATE_DEFINITIONS.RA.description, phase: 'SETUP' },

  // WORK GATES
  FX: { name: GATE_DEFINITIONS.FX.name, description: GATE_DEFINITIONS.FX.description, phase: 'WORK' },
  PD: { name: GATE_DEFINITIONS.PD.name, description: GATE_DEFINITIONS.PD.description, phase: 'WORK' },
  PR: { name: GATE_DEFINITIONS.PR.name, description: GATE_DEFINITIONS.PR.description, phase: 'WORK' },
  BP: { name: GATE_DEFINITIONS.BP.name, description: GATE_DEFINITIONS.BP.description, phase: 'WORK' },
  MS: { name: GATE_DEFINITIONS.MS.name, description: GATE_DEFINITIONS.MS.description, phase: 'WORK' },
  VA: { name: GATE_DEFINITIONS.VA.name, description: GATE_DEFINITIONS.VA.description, phase: 'WORK' },
  HO: { name: GATE_DEFINITIONS.HO.name, description: GATE_DEFINITIONS.HO.description, phase: 'WORK' },
};

const SETUP_GATES: GateID[] = ['LIC', 'DIS', 'TIR', 'ENV', 'OBJ', 'RA'];
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

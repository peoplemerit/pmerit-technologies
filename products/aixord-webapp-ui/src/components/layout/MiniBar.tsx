/**
 * MiniBar Component (Hybrid Ribbon — Always-Visible Strip)
 *
 * 36px permanent governance strip between TabBar and Detail Panel.
 * Shows: phase stepper · gate summary (✓5 ○6) · completion %.
 * Inspired by Microsoft Word ribbon mini-bar pattern.
 */

interface MiniBarProps {
  currentPhase: string;
  gates: Record<string, boolean>;
  onTabClick: (tabId: string) => void;
  activeTab: string | null;
  /** Tabs to hide (e.g., for non-software project types) */
  hiddenTabs?: string[];
}

const phases = [
  { id: 'BRAINSTORM', label: 'B', full: 'Brainstorm' },
  { id: 'PLAN', label: 'P', full: 'Plan' },
  { id: 'EXECUTE', label: 'E', full: 'Execute' },
  { id: 'REVIEW', label: 'R', full: 'Review' },
];

// All known gates
const ALL_SETUP_GATES = [
  'GA:LIC', 'GA:DIS', 'GA:TIR', 'GA:ENV', 'GA:FLD',
  'GA:CIT', 'GA:CON', 'GA:BP', 'GA:IVL', 'GA:PS', 'GA:GP',
];
const ALL_WORK_GATES = [
  'GW:PRE', 'GW:VAL', 'GW:DOC', 'GW:QA', 'GW:DEP', 'GW:VER', 'GW:ARC',
];

export function MiniBar({ currentPhase, gates, onTabClick, activeTab, hiddenTabs = [] }: MiniBarProps) {
  const currentPhaseIndex = phases.findIndex(
    (p) => p.id === currentPhase || p.label === currentPhase
  );

  const showWorkGates = currentPhase === 'EXECUTE' || currentPhase === 'E' ||
                        currentPhase === 'REVIEW' || currentPhase === 'R';

  // Gate counts
  const setupPassed = ALL_SETUP_GATES.filter((g) => gates[g]).length;
  const workPassed = ALL_WORK_GATES.filter((g) => gates[g]).length;
  const totalPassed = setupPassed + workPassed;
  const totalGates = ALL_SETUP_GATES.length + (showWorkGates ? ALL_WORK_GATES.length : 0);
  const totalPending = totalGates - totalPassed;
  const pct = totalGates > 0 ? Math.round((totalPassed / totalGates) * 100) : 0;

  return (
    <div className="h-9 flex items-center justify-between px-4 bg-gray-900/80 border-b border-gray-700/30 select-none">
      {/* Left: Phase stepper (compact) */}
      <div className="flex items-center gap-1">
        <span className="text-gray-500 text-xs mr-1">Phase</span>
        <div className="flex items-center">
          {phases.map((phase, index) => {
            const isActive = index === currentPhaseIndex;
            const isCompleted = index < currentPhaseIndex;
            return (
              <div key={phase.id} className="flex items-center">
                <div
                  title={phase.full}
                  className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    isActive
                      ? 'bg-violet-600 text-white'
                      : isCompleted
                      ? 'bg-green-500/25 text-green-400'
                      : 'bg-gray-800 text-gray-500'
                  }`}
                >
                  {phase.label}
                </div>
                {index < phases.length - 1 && (
                  <div className={`w-3 h-px ${isCompleted ? 'bg-green-500/50' : 'bg-gray-700'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Center: Gate summary */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onTabClick('governance')}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-xs transition-colors ${
            activeTab === 'governance'
              ? 'bg-violet-600/20 text-violet-300'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
          }`}
          title="Open Governance detail panel"
        >
          <span className="text-green-400">✓{totalPassed}</span>
          <span className="text-gray-500">○{totalPending}</span>
        </button>

        {/* Quick tab shortcuts */}
        {(['blueprint', 'security', 'evidence'] as const).filter(t => !hiddenTabs.includes(t)).map((tab) => (
          <button
            key={tab}
            onClick={() => onTabClick(tab)}
            className={`px-1.5 py-0.5 rounded text-xs transition-colors ${
              activeTab === tab
                ? 'bg-violet-600/20 text-violet-300'
                : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
            }`}
            title={`${tab.charAt(0).toUpperCase() + tab.slice(1)} details`}
          >
            {tab === 'blueprint' ? 'BP' : tab === 'security' ? 'SEC' : 'EV'}
          </button>
        ))}
      </div>

      {/* Right: Completion % */}
      <div className="flex items-center gap-2">
        <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              pct === 100 ? 'bg-green-500' : pct >= 50 ? 'bg-violet-500' : 'bg-amber-500'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
      </div>
    </div>
  );
}

export default MiniBar;

/**
 * Phase Selector Component
 *
 * Displays and manages AIXORD phases.
 * Ported from D5 Companion with web app adaptations.
 */

type Phase = 'BRAINSTORM' | 'PLAN' | 'BLUEPRINT' | 'EXECUTE' | 'VERIFY';

const PHASES: { id: Phase; name: string; icon: string; description: string }[] = [
  { id: 'BRAINSTORM', name: 'Brainstorm', icon: '💡', description: 'Explore ideas and possibilities' },
  { id: 'PLAN', name: 'Plan', icon: '📋', description: 'Define approach and milestones' },
  { id: 'BLUEPRINT', name: 'Blueprint', icon: '🏗️', description: 'Create detailed specifications' },
  { id: 'EXECUTE', name: 'Execute', icon: '⚙️', description: 'Implement approved work' },
  { id: 'VERIFY', name: 'Verify', icon: '✅', description: 'Validate and document outcomes' },
];

interface PhaseSelectorProps {
  currentPhase: string;
  onSetPhase?: (phase: Phase) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function PhaseSelector({
  currentPhase,
  onSetPhase,
  disabled = false,
  isLoading = false,
}: PhaseSelectorProps) {
  const currentIndex = PHASES.findIndex((p) => p.id === currentPhase);

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Phase</h3>
        {isLoading && (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-violet-500 border-t-transparent" />
        )}
      </div>

      {/* Phase Timeline */}
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-700">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${(currentIndex / (PHASES.length - 1)) * 100}%` }}
          />
        </div>

        {/* Phase Steps */}
        <div className="relative flex justify-between">
          {PHASES.map((phase, index) => {
            const isActive = phase.id === currentPhase;
            const isPast = index < currentIndex;
            const isFuture = index > currentIndex;

            return (
              <button
                key={phase.id}
                onClick={() => onSetPhase?.(phase.id)}
                disabled={disabled || isLoading}
                className={`flex flex-col items-center group ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                title={phase.description}
              >
                {/* Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all border-2 ${
                    isActive
                      ? 'bg-violet-500 border-violet-400 ring-4 ring-violet-500/30'
                      : isPast
                      ? 'bg-green-500/20 border-green-500/50 text-green-400'
                      : 'bg-gray-800 border-gray-700 text-gray-500 group-hover:border-gray-600'
                  }`}
                >
                  {isPast ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    phase.icon
                  )}
                </div>

                {/* Label */}
                <span
                  className={`mt-2 text-xs font-medium transition-colors ${
                    isActive
                      ? 'text-violet-400'
                      : isPast
                      ? 'text-green-400'
                      : isFuture
                      ? 'text-gray-500'
                      : 'text-gray-400'
                  }`}
                >
                  {phase.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Phase Description */}
      <div className="mt-6 p-4 bg-gray-900/50 rounded-lg">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{PHASES[currentIndex]?.icon || '❓'}</span>
          <div>
            <h4 className="text-white font-medium">{PHASES[currentIndex]?.name || 'Unknown'}</h4>
            <p className="text-gray-400 text-sm">{PHASES[currentIndex]?.description || ''}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PhaseSelector;

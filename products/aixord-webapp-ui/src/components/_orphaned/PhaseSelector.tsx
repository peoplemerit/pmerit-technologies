/**
 * Phase Tracker Component (D5)
 *
 * Displays and manages AIXORD phases.
 * Ported from D5 Companion with web app adaptations.
 *
 * Features:
 * - Visual phase timeline with progress line
 * - Active/past/future state indicators
 * - Phase descriptions
 * - Completion targets and metadata
 * - Compact horizontal view option
 * - Router integration ready (maps to B/P/E/R capsule phases)
 *
 * Reference: Walkflow.png mockup
 */

import { useMemo } from 'react';

type Phase = 'BRAINSTORM' | 'PLAN' | 'EXECUTE' | 'REVIEW';

// Map UI phases to capsule phases (B/P/E/R)
export const PHASE_TO_CAPSULE: Record<Phase, 'B' | 'P' | 'E' | 'R'> = {
  BRAINSTORM: 'B',
  PLAN: 'P',
  EXECUTE: 'E',
  REVIEW: 'R'
};

export const CAPSULE_TO_PHASE: Record<'B' | 'P' | 'E' | 'R', Phase> = {
  B: 'BRAINSTORM',
  P: 'PLAN',
  E: 'EXECUTE',
  R: 'REVIEW'
};

const PHASES: {
  id: Phase;
  name: string;
  shortName: string;
  icon: string;
  description: string;
  capsule: 'B' | 'P' | 'E' | 'R';
}[] = [
  {
    id: 'BRAINSTORM',
    name: 'Brainstorm',
    shortName: 'ASSESSMENT',
    icon: '💡',
    description: 'Explore ideas and possibilities',
    capsule: 'B'
  },
  {
    id: 'PLAN',
    name: 'Plan',
    shortName: 'APPROVAL',
    icon: '📋',
    description: 'Define approach and specifications',
    capsule: 'P'
  },
  {
    id: 'EXECUTE',
    name: 'Execute',
    shortName: 'BUILD',
    icon: '⚙️',
    description: 'Implement approved work',
    capsule: 'E'
  },
  {
    id: 'REVIEW',
    name: 'Review',
    shortName: 'CLOSURE',
    icon: '✅',
    description: 'Validate and document outcomes',
    capsule: 'R'
  },
];

interface PhaseMetadata {
  completionTarget?: string;
  manager?: string;
  impact?: 'Low' | 'Medium' | 'High' | 'Top';
  category?: string;
}

interface PhaseSelectorProps {
  currentPhase: string;
  onSetPhase?: (phase: Phase) => void;
  disabled?: boolean;
  isLoading?: boolean;
  metadata?: PhaseMetadata;
  compact?: boolean;
}

export function PhaseSelector({
  currentPhase,
  onSetPhase,
  disabled = false,
  isLoading = false,
  metadata,
  compact = false,
}: PhaseSelectorProps) {
  // D-018 FIX: Normalize phase and ensure valid index (default to BRAINSTORM if invalid)
  const normalizedPhase = currentPhase?.toUpperCase() || 'BRAINSTORM';
  let currentIndex = PHASES.findIndex((p) => p.id === normalizedPhase);
  // If not found, default to BRAINSTORM (index 0)
  if (currentIndex === -1) {
    currentIndex = 0;
  }

  // Calculate progress percentage
  const progressPercent = useMemo(() => {
    if (currentIndex < 0) return 0;
    return ((currentIndex + 1) / PHASES.length) * 100;
  }, [currentIndex]);

  // Impact badge color
  const impactColors: Record<string, string> = {
    Low: 'bg-gray-500/20 text-gray-400',
    Medium: 'bg-blue-500/20 text-blue-400',
    High: 'bg-amber-500/20 text-amber-400',
    Top: 'bg-red-500/20 text-red-400'
  };

  if (compact) {
    // Compact horizontal progress bar view (like Walkflow.png)
    return (
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
        {/* Header with metadata */}
        {metadata && (
          <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
            {metadata.category && (
              <span className="text-gray-500">Category: <span className="text-gray-300">{metadata.category}</span></span>
            )}
            {metadata.impact && (
              <span className={`px-2 py-0.5 rounded ${impactColors[metadata.impact] || impactColors.Medium}`}>
                {metadata.impact}
              </span>
            )}
            {metadata.completionTarget && (
              <span>Target: <span className="text-white">{metadata.completionTarget}</span></span>
            )}
          </div>
        )}

        {/* Progress Timeline */}
        <div className="relative pt-2">
          {/* Background Line */}
          <div className="absolute top-[18px] left-0 right-0 h-1 bg-gray-700 rounded-full" />

          {/* Progress Line */}
          <div
            className="absolute top-[18px] left-0 h-1 bg-gradient-to-r from-green-500 via-green-400 to-green-300 rounded-full transition-all duration-500"
            style={{ width: `${(currentIndex / (PHASES.length - 1)) * 100}%` }}
          />

          {/* Phase Steps */}
          <div className="relative flex justify-between">
            {PHASES.map((phase, index) => {
              const isActive = phase.id === currentPhase;
              const isPast = index < currentIndex;

              return (
                <button
                  key={phase.id}
                  onClick={() => onSetPhase?.(phase.id)}
                  disabled={disabled || isLoading}
                  className={`flex flex-col items-center group ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {/* Label above */}
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider mb-2 transition-colors ${
                      isActive ? 'text-white' : isPast ? 'text-green-400' : 'text-gray-500'
                    }`}
                  >
                    {phase.shortName}
                  </span>

                  {/* Circle */}
                  <div
                    className={`w-4 h-4 rounded-full transition-all ${
                      isActive
                        ? 'bg-green-500 ring-4 ring-green-500/30'
                        : isPast
                        ? 'bg-green-500'
                        : 'bg-gray-700 border-2 border-gray-600'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Phase Tooltip */}
        {currentIndex >= 0 && (
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-2xl">{PHASES[currentIndex].icon}</span>
            <div>
              <span className="text-white font-medium">{PHASES[currentIndex].name}</span>
              {metadata?.completionTarget && (
                <span className="text-gray-400 text-xs ml-2">(Target: {metadata.completionTarget})</span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full view (original with enhancements)
  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Phase</h3>
        <div className="flex items-center gap-2">
          {/* Progress percentage badge */}
          <span className="px-2 py-1 text-xs bg-violet-500/20 text-violet-300 rounded">
            {Math.round(progressPercent)}% Complete
          </span>
          {isLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-violet-500 border-t-transparent" />
          )}
        </div>
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
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-white font-medium">{PHASES[currentIndex]?.name || 'Unknown'}</h4>
              {metadata?.manager && (
                <span className="text-xs text-gray-500">• Manager: {metadata.manager}</span>
              )}
            </div>
            <p className="text-gray-400 text-sm">{PHASES[currentIndex]?.description || ''}</p>
          </div>
          {metadata?.impact && (
            <span className={`px-2 py-1 text-xs rounded ${impactColors[metadata.impact]}`}>
              {metadata.impact} Impact
            </span>
          )}
        </div>

        {/* Completion target if available */}
        {metadata?.completionTarget && (
          <div className="mt-3 pt-3 border-t border-gray-700/50 flex items-center gap-2 text-xs">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-400">Target completion: <span className="text-white">{metadata.completionTarget}</span></span>
          </div>
        )}
      </div>
    </div>
  );
}

export default PhaseSelector;

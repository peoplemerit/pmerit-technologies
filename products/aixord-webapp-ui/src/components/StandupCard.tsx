/**
 * Standup Card Component (HANDOFF-TDL-01 Task 6)
 *
 * Displays a structured standup report from the AI.
 * Shows working_on, completed, blocked, next_actions, and estimate.
 */

import type { StandupData } from '../lib/api';

interface StandupCardProps {
  standup: StandupData;
  compact?: boolean;
}

export function StandupCard({ standup, compact = false }: StandupCardProps) {
  const timestamp = new Date(standup.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (compact) {
    return (
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-indigo-400 text-xs font-medium">Standup #{standup.report_number}</span>
          <span className="text-gray-500 text-xs">{timestamp}</span>
        </div>
        <p className="text-sm text-gray-300 mt-1">{standup.working_on}</p>
      </div>
    );
  }

  return (
    <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl px-4 py-3">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-indigo-600/30 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <span className="text-indigo-300 text-sm font-semibold">
          Standup Report #{standup.report_number}
        </span>
        <span className="text-gray-500 text-xs ml-auto">{timestamp}</span>
      </div>

      {/* Working on */}
      <div className="mb-2">
        <span className="text-xs text-gray-500 font-medium">Working on:</span>
        <p className="text-sm text-gray-200 mt-0.5">{standup.working_on}</p>
      </div>

      {/* Completed */}
      {standup.completed_since_last && standup.completed_since_last.length > 0 && (
        <div className="mb-2">
          <span className="text-xs text-gray-500 font-medium">Completed:</span>
          <ul className="mt-0.5 space-y-0.5">
            {standup.completed_since_last.map((item, i) => (
              <li key={i} className="flex items-start gap-1.5 text-sm">
                <span className="text-green-400 mt-0.5">+</span>
                <span className="text-gray-300">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* In Progress */}
      {standup.in_progress && standup.in_progress.length > 0 && (
        <div className="mb-2">
          <span className="text-xs text-gray-500 font-medium">In Progress:</span>
          <ul className="mt-0.5 space-y-0.5">
            {standup.in_progress.map((item, i) => (
              <li key={i} className="flex items-start gap-1.5 text-sm">
                <span className="text-blue-400 mt-0.5">~</span>
                <span className="text-gray-300">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Blocked */}
      {standup.blocked && standup.blocked.length > 0 && (
        <div className="mb-2">
          <span className="text-xs text-gray-500 font-medium">Blocked:</span>
          <ul className="mt-0.5 space-y-0.5">
            {standup.blocked.map((item, i) => (
              <li key={i} className="flex items-start gap-1.5 text-sm">
                <span className="text-red-400 mt-0.5">!</span>
                <span className="text-gray-300">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Next actions */}
      {standup.next_actions && standup.next_actions.length > 0 && (
        <div className="mb-2">
          <span className="text-xs text-gray-500 font-medium">Next:</span>
          <ul className="mt-0.5 space-y-0.5">
            {standup.next_actions.map((item, i) => (
              <li key={i} className="flex items-start gap-1.5 text-sm">
                <span className="text-gray-400 mt-0.5">-</span>
                <span className="text-gray-300">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Estimate */}
      {standup.estimate_to_completion && (
        <div className="mt-2 pt-2 border-t border-indigo-500/20">
          <span className="text-xs text-gray-500">Estimate to completion:</span>
          <span className="text-xs text-indigo-300 ml-1">{standup.estimate_to_completion}</span>
        </div>
      )}
    </div>
  );
}

export default StandupCard;

/**
 * Escalation Banner Component (HANDOFF-TDL-01 Task 6)
 *
 * Displays open escalations that need Director decision.
 * Shows decision needed, options, AI recommendation, and resolve action.
 */

import { useState } from 'react';
import type { EscalationData } from '../lib/api';

interface EscalationBannerProps {
  escalations: EscalationData[];
  onResolve?: (escalationId: string, resolution: string) => void;
}

export function EscalationBanner({ escalations, onResolve }: EscalationBannerProps) {
  const [resolveId, setResolveId] = useState<string | null>(null);
  const [resolution, setResolution] = useState('');

  const open = escalations.filter(e => e.status === 'OPEN');

  if (open.length === 0) return null;

  const handleResolve = (id: string) => {
    if (!resolution.trim()) return;
    onResolve?.(id, resolution.trim());
    setResolveId(null);
    setResolution('');
  };

  return (
    <div className="space-y-2 mb-4">
      {open.map(esc => (
        <div
          key={esc.id}
          className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3"
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-amber-300 text-sm font-semibold">Escalation — Decision Needed</span>
            <span className="text-gray-500 text-xs ml-auto">
              {new Date(esc.created_at).toLocaleDateString()}
            </span>
          </div>

          {/* Decision needed */}
          <p className="text-gray-200 text-sm mb-2">{esc.decision_needed}</p>

          {/* Options */}
          {esc.options && esc.options.length > 0 && (
            <div className="mb-2">
              <span className="text-xs text-gray-500">Options:</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {esc.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setResolveId(esc.id);
                      setResolution(opt);
                    }}
                    className="px-2 py-1 text-xs bg-gray-700/50 text-gray-300 rounded hover:bg-gray-700 transition-colors"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* AI Recommendation */}
          {esc.recommendation && (
            <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg px-3 py-2 mb-2">
              <span className="text-xs text-violet-400 font-medium">AI Recommendation:</span>
              <p className="text-sm text-gray-300 mt-0.5">{esc.recommendation}</p>
              {esc.recommendation_rationale && (
                <p className="text-xs text-gray-500 mt-1">{esc.recommendation_rationale}</p>
              )}
            </div>
          )}

          {/* Resolve input */}
          {resolveId === esc.id ? (
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Enter your decision..."
                className="flex-1 px-3 py-1.5 text-sm bg-gray-800 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amber-500"
                onKeyDown={(e) => e.key === 'Enter' && handleResolve(esc.id)}
                autoFocus
              />
              <button
                onClick={() => handleResolve(esc.id)}
                disabled={!resolution.trim()}
                className="px-3 py-1.5 text-xs bg-amber-600 text-white rounded-lg hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Resolve
              </button>
              <button
                onClick={() => { setResolveId(null); setResolution(''); }}
                className="px-2 py-1.5 text-xs text-gray-400 hover:text-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setResolveId(esc.id)}
              className="mt-1 px-3 py-1.5 text-xs bg-amber-600/20 text-amber-400 rounded-lg hover:bg-amber-600/30 transition-colors"
            >
              Resolve this escalation
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default EscalationBanner;

/**
 * Project Memory Panel (HANDOFF-PCC-01 Task 8)
 *
 * Displays project continuity in a side panel:
 * - Session timeline
 * - Key decisions (with pin/unpin)
 * - Pinned items
 * - Blueprint progress
 * - Active work + escalations
 */

import type { ContinuityCapsule } from '../lib/api';

interface ProjectMemoryPanelProps {
  capsule: ContinuityCapsule | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onPin: (pinType: string, targetId: string, label?: string) => void;
  onUnpin: (pinId: string) => void;
}

export function ProjectMemoryPanel({
  capsule,
  loading,
  error,
  onRefresh,
  onPin,
  onUnpin,
}: ProjectMemoryPanelProps) {
  if (loading && !capsule) {
    return (
      <div className="p-4 text-gray-500 text-sm">
        Loading project memory...
      </div>
    );
  }

  if (error && !capsule) {
    return (
      <div className="p-4">
        <p className="text-red-400 text-sm">{error}</p>
        <button
          onClick={onRefresh}
          className="mt-2 text-xs text-blue-400 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!capsule) {
    return (
      <div className="p-4 text-gray-500 text-sm">
        No continuity data available.
      </div>
    );
  }

  const pinnedIds = new Set(capsule.pinned_items.map(p => p.target_id));

  return (
    <div className="overflow-y-auto max-h-[calc(100vh-220px)]" style={{ fontSize: '12px' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700/50">
        <span className="font-semibold text-gray-300">Project Memory</span>
        <button
          onClick={onRefresh}
          className="text-[10px] text-gray-500 hover:text-gray-300"
          title="Refresh"
        >
          ↻
        </button>
      </div>

      {/* Progress Summary */}
      <div className="px-3 py-2 border-b border-gray-700/30">
        <div className="text-gray-400 mb-1">
          Phase: <span className="text-white font-medium">{capsule.current_phase}</span>
        </div>
        {capsule.total_deliverables > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${Math.round((capsule.completed_deliverables / capsule.total_deliverables) * 100)}%` }}
              />
            </div>
            <span className="text-gray-500 text-[10px]">
              {capsule.completed_deliverables}/{capsule.total_deliverables}
            </span>
          </div>
        )}
        <div className="text-gray-500 text-[10px] mt-1">
          {capsule.total_sessions} session(s) · {capsule.total_decisions} decision(s)
        </div>
      </div>

      {/* Selected Approach */}
      {capsule.selected_approach && (
        <div className="px-3 py-2 border-b border-gray-700/30">
          <div className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Selected Approach</div>
          <div className="text-green-400 text-[11px] font-medium">{capsule.selected_approach.option_name}</div>
        </div>
      )}

      {/* Pinned Items */}
      {capsule.pinned_items.length > 0 && (
        <div className="px-3 py-2 border-b border-gray-700/30">
          <div className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">📌 Pinned</div>
          {capsule.pinned_items.map(pin => (
            <div key={pin.id} className="flex items-center justify-between py-0.5 group">
              <span className="text-gray-300 text-[11px]">
                <span className="text-gray-500">[{pin.pin_type}]</span> {pin.label || pin.target_id.slice(0, 12)}
              </span>
              <button
                onClick={() => onUnpin(pin.id)}
                className="text-[10px] text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100"
                title="Unpin"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Session Timeline */}
      {capsule.session_timeline.length > 0 && (
        <div className="px-3 py-2 border-b border-gray-700/30">
          <div className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Session Timeline</div>
          {capsule.session_timeline.map(s => (
            <div key={s.number} className="flex items-start gap-1.5 py-0.5">
              <span className={`text-[10px] font-mono mt-0.5 ${
                s.status === 'ACTIVE' ? 'text-green-400' : 'text-gray-500'
              }`}>S{s.number}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-gray-400 text-[10px]">{s.type}</span>
                  <span className={`text-[9px] px-1 rounded ${
                    s.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                    s.status === 'CLOSED' ? 'bg-gray-500/20 text-gray-400' :
                    'bg-gray-500/20 text-gray-500'
                  }`}>{s.status}</span>
                </div>
                {s.summary && (
                  <div className="text-gray-500 text-[10px] truncate">{s.summary}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Key Decisions */}
      {capsule.key_decisions.length > 0 && (
        <div className="px-3 py-2 border-b border-gray-700/30">
          <div className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Key Decisions</div>
          {capsule.key_decisions.map(d => {
            const isPinned = pinnedIds.has(d.id);
            return (
              <div key={d.id} className="flex items-start gap-1 py-0.5 group">
                <button
                  onClick={() => isPinned
                    ? onUnpin(capsule.pinned_items.find(p => p.target_id === d.id)?.id || '')
                    : onPin('decision', d.id, d.summary || d.reason.slice(0, 50))
                  }
                  className={`text-[10px] mt-0.5 ${isPinned ? 'text-amber-400' : 'text-gray-600 opacity-0 group-hover:opacity-100'}`}
                  title={isPinned ? 'Unpin' : 'Pin to continuity'}
                >
                  {isPinned ? '📌' : '📌'}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className={`text-[10px] ${
                      d.result === 'APPROVED' ? 'text-green-400' :
                      d.result === 'REJECTED' ? 'text-red-400' :
                      'text-gray-400'
                    }`}>{d.action}</span>
                    <span className={`text-[9px] ${
                      d.result === 'APPROVED' ? 'text-green-500' : 'text-red-500'
                    }`}>({d.result})</span>
                  </div>
                  <div className="text-gray-500 text-[10px] truncate">
                    {d.summary || d.reason.slice(0, 60)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Active Work */}
      {capsule.active_work.length > 0 && (
        <div className="px-3 py-2 border-b border-gray-700/30">
          <div className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Active Work</div>
          {capsule.active_work.map((w, i) => (
            <div key={i} className="flex items-center gap-1.5 py-0.5">
              <span className={`text-[9px] px-1 rounded font-mono ${
                w.priority === 'P0' ? 'bg-red-500/20 text-red-400' :
                w.priority === 'P1' ? 'bg-amber-500/20 text-amber-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>{w.priority}</span>
              <span className="text-gray-300 text-[11px] flex-1 truncate">{w.deliverable_name}</span>
              <span className="text-gray-500 text-[10px]">{w.progress_percent}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Open Escalations */}
      {capsule.open_escalations.length > 0 && (
        <div className="px-3 py-2 border-b border-gray-700/30">
          <div className="text-red-400 text-[10px] uppercase tracking-wider mb-1">⚠ Escalations</div>
          {capsule.open_escalations.map((e, i) => (
            <div key={i} className="py-0.5">
              <div className="text-gray-300 text-[11px]">{e.deliverable_name}</div>
              <div className="text-gray-500 text-[10px]">{e.decision_needed}</div>
            </div>
          ))}
        </div>
      )}

      {/* Rejected Approaches (Negative Knowledge) */}
      {capsule.rejected_approaches.length > 0 && (
        <div className="px-3 py-2">
          <div className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Rejected Approaches</div>
          {capsule.rejected_approaches.map((r, i) => (
            <div key={i} className="text-[10px] py-0.5">
              <span className="text-gray-500 line-through">{r.option_name}</span>
              <span className="text-gray-600 ml-1">— {r.kill_reason}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

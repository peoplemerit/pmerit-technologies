/**
 * Task Board Component (HANDOFF-TDL-01 Task 5)
 *
 * Kanban-style board showing task assignments grouped by status.
 * Supports lifecycle actions: start, submit, accept, reject, block.
 */

import { useState } from 'react';
import type { TaskAssignmentData, TaskBoardData } from '../lib/api';

interface TaskBoardProps {
  taskBoard: TaskBoardData | null;
  assignments: TaskAssignmentData[];
  isLoading?: boolean;
  projectId?: string;
  phase?: string;
  deliverableCount?: number;
  onStart?: (assignmentId: string) => void;
  onSubmit?: (assignmentId: string) => void;
  onAccept?: (assignmentId: string) => void;
  onReject?: (assignmentId: string) => void;
  onBlock?: (assignmentId: string) => void;
  onViewDetails?: (assignment: TaskAssignmentData) => void;
  onAutoGenerate?: () => Promise<void>;
}

const STATUS_COLUMNS = [
  { key: 'ASSIGNED', label: 'Assigned', color: 'border-gray-500', bg: 'bg-gray-500/10' },
  { key: 'IN_PROGRESS', label: 'In Progress', color: 'border-blue-500', bg: 'bg-blue-500/10' },
  { key: 'BLOCKED', label: 'Blocked', color: 'border-red-500', bg: 'bg-red-500/10' },
  { key: 'SUBMITTED', label: 'Submitted', color: 'border-amber-500', bg: 'bg-amber-500/10' },
  { key: 'ACCEPTED', label: 'Accepted', color: 'border-green-500', bg: 'bg-green-500/10' },
  { key: 'REJECTED', label: 'Rejected', color: 'border-red-400', bg: 'bg-red-400/10' },
];

const PRIORITY_COLORS: Record<string, string> = {
  P0: 'bg-red-500/20 text-red-400 border-red-500/30',
  P1: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  P2: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

function TaskCard({
  assignment,
  onStart,
  onSubmit,
  onAccept,
  onReject,
  onBlock,
  onViewDetails,
}: {
  assignment: TaskAssignmentData;
  onStart?: (id: string) => void;
  onSubmit?: (id: string) => void;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onBlock?: (id: string) => void;
  onViewDetails?: (a: TaskAssignmentData) => void;
}) {
  const priorityClass = PRIORITY_COLORS[assignment.priority] || PRIORITY_COLORS.P1;

  return (
    <div
      className="bg-gray-800/60 border border-gray-700/50 rounded-lg p-3 cursor-pointer hover:border-gray-600 transition-colors"
      onClick={() => onViewDetails?.(assignment)}
    >
      {/* Header: priority + deliverable */}
      <div className="flex items-start gap-2 mb-2">
        <span className={`px-1.5 py-0.5 text-xs font-mono rounded border ${priorityClass}`}>
          {assignment.priority}
        </span>
        <span className="text-sm text-gray-200 font-medium leading-tight line-clamp-2">
          {assignment.deliverable_id.slice(0, 8)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span>{assignment.progress_percent}%</span>
        </div>
        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-500 rounded-full transition-all duration-300"
            style={{ width: `${assignment.progress_percent}%` }}
          />
        </div>
      </div>

      {/* Blocked reason */}
      {assignment.status === 'BLOCKED' && assignment.blocked_reason && (
        <p className="text-xs text-red-400 mb-2 line-clamp-2">
          {assignment.blocked_reason}
        </p>
      )}

      {/* Submission summary */}
      {assignment.status === 'SUBMITTED' && assignment.submission_summary && (
        <p className="text-xs text-amber-400 mb-2 line-clamp-2">
          {assignment.submission_summary}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex gap-1.5 mt-2" onClick={(e) => e.stopPropagation()}>
        {assignment.status === 'ASSIGNED' && onStart && (
          <button
            onClick={() => onStart(assignment.id)}
            className="px-2 py-1 text-xs bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30 transition-colors"
          >
            Start
          </button>
        )}
        {assignment.status === 'IN_PROGRESS' && (
          <>
            {onSubmit && (
              <button
                onClick={() => onSubmit(assignment.id)}
                className="px-2 py-1 text-xs bg-amber-600/20 text-amber-400 rounded hover:bg-amber-600/30 transition-colors"
              >
                Submit
              </button>
            )}
            {onBlock && (
              <button
                onClick={() => onBlock(assignment.id)}
                className="px-2 py-1 text-xs bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 transition-colors"
              >
                Block
              </button>
            )}
          </>
        )}
        {assignment.status === 'SUBMITTED' && (
          <>
            {onAccept && (
              <button
                onClick={() => onAccept(assignment.id)}
                className="px-2 py-1 text-xs bg-green-600/20 text-green-400 rounded hover:bg-green-600/30 transition-colors"
              >
                Accept
              </button>
            )}
            {onReject && (
              <button
                onClick={() => onReject(assignment.id)}
                className="px-2 py-1 text-xs bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 transition-colors"
              >
                Reject
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function TaskBoard({
  taskBoard,
  assignments,
  isLoading,
  projectId: _projectId,
  phase,
  deliverableCount,
  onStart,
  onSubmit,
  onAccept,
  onReject,
  onBlock,
  onViewDetails,
  onAutoGenerate,
}: TaskBoardProps) {
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-500">
        <svg className="w-5 h-5 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading task board...
      </div>
    );
  }

  if (!taskBoard && assignments.length === 0) {
    // CRIT-03 Fix: Show actionable empty state with auto-generate CTA
    const isExecutePhase = phase === 'EXECUTE' || phase === 'REVIEW';
    const hasDeliverables = (deliverableCount || 0) > 0;

    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-800/60 mb-3">
          <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        {isExecutePhase && hasDeliverables ? (
          <>
            <p className="text-sm text-gray-300 mb-1">Your blueprint has {deliverableCount} deliverables ready for assignment.</p>
            <p className="text-xs text-gray-500 mb-4">Auto-generate task assignments to populate this board.</p>
            {onAutoGenerate && (
              <button
                onClick={onAutoGenerate}
                className="px-4 py-2 text-sm bg-violet-600/20 text-violet-400 border border-violet-500/30 rounded-lg hover:bg-violet-600/30 transition-colors"
              >
                Generate Task Assignments
              </button>
            )}
          </>
        ) : (
          <>
            <p className="text-sm text-gray-500">No task assignments yet.</p>
            <p className="text-xs text-gray-600 mt-1">
              {!isExecutePhase
                ? 'Tasks are created when you finalize your plan and enter the Execute phase.'
                : 'Assign deliverables to sessions to start tracking work.'}
            </p>
          </>
        )}
      </div>
    );
  }

  // Group assignments by status
  const grouped: Record<string, TaskAssignmentData[]> = {};
  for (const col of STATUS_COLUMNS) {
    grouped[col.key] = [];
  }
  for (const a of assignments) {
    if (grouped[a.status]) {
      grouped[a.status].push(a);
    }
  }

  // Stats
  const stats = taskBoard?.stats || {
    total: assignments.length,
    by_status: Object.fromEntries(STATUS_COLUMNS.map(c => [c.key, grouped[c.key].length])),
    by_priority: {},
    overall_progress: assignments.length > 0
      ? Math.round(assignments.reduce((s, a) => s + a.progress_percent, 0) / assignments.length)
      : 0,
  };

  return (
    <div>
      {/* Header with stats */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-semibold text-gray-200">Task Board</h3>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>{stats.total} tasks</span>
            <span>{stats.overall_progress}% overall</span>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode('board')}
            className={`px-2 py-1 text-xs rounded ${viewMode === 'board' ? 'bg-violet-600/20 text-violet-400' : 'text-gray-500 hover:text-gray-400'}`}
          >
            Board
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-2 py-1 text-xs rounded ${viewMode === 'list' ? 'bg-violet-600/20 text-violet-400' : 'text-gray-500 hover:text-gray-400'}`}
          >
            List
          </button>
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="mb-4">
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-600 to-violet-400 rounded-full transition-all duration-500"
            style={{ width: `${stats.overall_progress}%` }}
          />
        </div>
      </div>

      {viewMode === 'board' ? (
        /* Kanban board view */
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {STATUS_COLUMNS.map(col => {
            const items = grouped[col.key] || [];
            if (items.length === 0 && !['ASSIGNED', 'IN_PROGRESS', 'SUBMITTED'].includes(col.key)) {
              return null;
            }
            return (
              <div key={col.key} className={`rounded-lg border ${col.color}/30 ${col.bg} p-2`}>
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-xs font-medium text-gray-300">{col.label}</span>
                  <span className="text-xs text-gray-500">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map(a => (
                    <TaskCard
                      key={a.id}
                      assignment={a}
                      onStart={onStart}
                      onSubmit={onSubmit}
                      onAccept={onAccept}
                      onReject={onReject}
                      onBlock={onBlock}
                      onViewDetails={onViewDetails}
                    />
                  ))}
                  {items.length === 0 && (
                    <div className="text-xs text-gray-600 text-center py-3">No tasks</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List view */
        <div className="space-y-1">
          {assignments.map(a => (
            <div
              key={a.id}
              className="flex items-center gap-3 px-3 py-2 bg-gray-800/40 rounded-lg hover:bg-gray-800/60 cursor-pointer transition-colors"
              onClick={() => onViewDetails?.(a)}
            >
              <span className={`px-1.5 py-0.5 text-xs font-mono rounded border ${PRIORITY_COLORS[a.priority] || PRIORITY_COLORS.P1}`}>
                {a.priority}
              </span>
              <span className="text-sm text-gray-300 flex-1 truncate">{a.deliverable_id.slice(0, 8)}</span>
              <span className="text-xs text-gray-500">{a.progress_percent}%</span>
              <span className={`text-xs px-2 py-0.5 rounded ${
                a.status === 'ACCEPTED' ? 'bg-green-500/20 text-green-400' :
                a.status === 'BLOCKED' ? 'bg-red-500/20 text-red-400' :
                a.status === 'SUBMITTED' ? 'bg-amber-500/20 text-amber-400' :
                a.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {a.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TaskBoard;

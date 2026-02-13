/**
 * Activity Log Component
 *
 * Displays timestamped activity history including:
 * - User actions (created, edited, deleted)
 * - System events (phase changes, gate toggles)
 * - Approval history
 * - Comments/notes
 *
 * Reference: Audit Log.webp, Additional details.png mockups
 */

import { useState, useMemo, type ReactNode } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface ActivityItem {
  id: string;
  type: 'create' | 'edit' | 'delete' | 'phase_change' | 'gate_toggle' | 'approval' | 'comment' | 'message' | 'login' | 'settings';
  action: string;
  description: string;
  actor: string;
  actorEmail?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

interface ActivityLogProps {
  activities: ActivityItem[];
  isLoading?: boolean;
  maxItems?: number;
  showFilters?: boolean;
  onAddComment?: (comment: string) => Promise<void>;
  compact?: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Unknown';
  }
}

function formatFullTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch {
    return 'Unknown';
  }
}

// ============================================================================
// Sub-Components
// ============================================================================

// Activity Icon
function ActivityIcon({ type }: { type: ActivityItem['type'] }) {
  const iconConfig: Record<ActivityItem['type'], { icon: ReactNode; color: string }> = {
    create: {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      color: 'bg-green-500/20 text-green-400'
    },
    edit: {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      color: 'bg-blue-500/20 text-blue-400'
    },
    delete: {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      color: 'bg-red-500/20 text-red-400'
    },
    phase_change: {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
      ),
      color: 'bg-violet-500/20 text-violet-400'
    },
    gate_toggle: {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-amber-500/20 text-amber-400'
    },
    approval: {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      color: 'bg-green-500/20 text-green-400'
    },
    comment: {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      ),
      color: 'bg-gray-500/20 text-gray-400'
    },
    message: {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      color: 'bg-cyan-500/20 text-cyan-400'
    },
    login: {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
      ),
      color: 'bg-indigo-500/20 text-indigo-400'
    },
    settings: {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'bg-gray-500/20 text-gray-400'
    }
  };

  const config = iconConfig[type] || iconConfig.comment;

  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${config.color}`}>
      {config.icon}
    </div>
  );
}

// Activity Row
function ActivityRow({ activity, showDetails }: { activity: ActivityItem; showDetails?: boolean }) {
  return (
    <div className="flex gap-3 py-3 hover:bg-gray-800/20 px-3 -mx-3 rounded-lg transition-colors">
      <ActivityIcon type={activity.type} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-white">
            <span className="font-medium">{activity.actor}</span>
            <span className="text-gray-400"> {activity.action}</span>
          </p>
          <span className="text-xs text-gray-500 whitespace-nowrap" title={formatFullTimestamp(activity.timestamp)}>
            {formatTimestamp(activity.timestamp)}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5 truncate">{activity.description}</p>
        {showDetails && activity.actorEmail && (
          <p className="text-xs text-gray-500 mt-1">{activity.actorEmail}</p>
        )}
      </div>
    </div>
  );
}

// Comment Form
function CommentForm({ onSubmit }: { onSubmit: (comment: string) => void }) {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      onSubmit(comment);
      setComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-gray-700/50">
      <label className="block text-xs text-gray-500 mb-2">Add a comment</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Type your comment..."
          className="flex-1 bg-gray-900/50 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:border-violet-500"
        />
        <button
          type="submit"
          disabled={!comment.trim() || isSubmitting}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
        >
          Post
        </button>
      </div>
    </form>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ActivityLog({
  activities,
  isLoading = false,
  maxItems = 50,
  showFilters = true,
  onAddComment,
  compact = false
}: ActivityLogProps) {
  const [filterType, setFilterType] = useState<ActivityItem['type'] | 'ALL'>('ALL');
  const [expandHistory, setExpandHistory] = useState(false);

  // Filter activities
  const filteredActivities = useMemo(() => {
    const filtered = filterType === 'ALL'
      ? activities
      : activities.filter(a => a.type === filterType);
    return expandHistory ? filtered : filtered.slice(0, maxItems);
  }, [activities, filterType, maxItems, expandHistory]);

  // Group by date
  const groupedActivities = useMemo(() => {
    const groups: Record<string, ActivityItem[]> = {};

    filteredActivities.forEach(activity => {
      const date = new Date(activity.timestamp).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(activity);
    });

    return groups;
  }, [filteredActivities]);

  if (compact) {
    // Compact list view
    return (
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          {activities.length > 5 && (
            <button
              onClick={() => setExpandHistory(!expandHistory)}
              className="text-xs text-violet-400 hover:text-violet-300"
            >
              {expandHistory ? 'Show less' : 'View all'}
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-violet-500 border-t-transparent" />
          </div>
        ) : activities.length === 0 ? (
          <p className="text-center text-gray-500 text-sm py-4">No activity yet</p>
        ) : (
          <div className="space-y-1">
            {filteredActivities.slice(0, expandHistory ? undefined : 5).map(activity => (
              <ActivityRow key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Full view with sections
  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700/50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-white">Activity Log</h3>
          <span className="text-xs text-gray-500">{activities.length} events</span>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex gap-2 flex-wrap">
            {(['ALL', 'create', 'edit', 'phase_change', 'gate_toggle', 'approval', 'message'] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  filterType === type
                    ? 'bg-violet-500/20 text-violet-300'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {type === 'ALL' ? 'All' : type.replace('_', ' ')}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-violet-500 border-t-transparent" />
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-3xl mb-2">📋</div>
            <p className="text-gray-500 text-sm">No activity recorded</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedActivities).map(([date, items]) => (
              <div key={date}>
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">{date}</h4>
                <div className="space-y-1">
                  {items.map(activity => (
                    <ActivityRow key={activity.id} activity={activity} showDetails />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Show more button */}
        {!expandHistory && activities.length > maxItems && (
          <div className="text-center pt-4">
            <button
              onClick={() => setExpandHistory(true)}
              className="text-sm text-violet-400 hover:text-violet-300"
            >
              Show {activities.length - maxItems} more
            </button>
          </div>
        )}
      </div>

      {/* Comment Form */}
      {onAddComment && (
        <div className="px-4 pb-4">
          <CommentForm onSubmit={onAddComment} />
        </div>
      )}
    </div>
  );
}

export default ActivityLog;

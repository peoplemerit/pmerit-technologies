/**
 * Activity Page
 *
 * Displays user activity history across all projects.
 * Shows recent decisions, gate changes, and AI chat interactions.
 *
 * Backend APIs used:
 * - GET /projects — list all projects
 * - GET /projects/:id/decisions — decision log per project
 */

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

interface ActivityItem {
  id: string;
  type: 'decision' | 'gate_change' | 'phase_change' | 'project_created';
  projectId: string;
  projectName: string;
  description: string;
  actor: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export function Activity() {
  const { isAuthenticated, token } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'decision' | 'gate_change' | 'phase_change'>('all');

  const fetchActivities = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all projects
      const projectsRes = await api.projects.list(token);
      const projects = Array.isArray(projectsRes) ? projectsRes : (projectsRes as any).projects || [];

      // Fetch decisions for each project (recent 20 per project)
      const allActivities: ActivityItem[] = [];

      for (const project of projects.slice(0, 10)) { // Cap at 10 projects for performance
        try {
          const decisions = await api.decisions.list(project.id, token);
          const decisionList = Array.isArray(decisions) ? decisions : (decisions as any).decisions || [];

          for (const d of decisionList.slice(0, 20)) {
            allActivities.push({
              id: d.id,
              type: d.decision_type?.includes('GATE') ? 'gate_change'
                : d.decision_type?.includes('PHASE') ? 'phase_change'
                : 'decision',
              projectId: project.id,
              projectName: project.name,
              description: d.description || d.decision_type || 'Decision recorded',
              actor: d.actor || 'System',
              timestamp: d.created_at || d.createdAt || new Date().toISOString(),
              metadata: d.metadata,
            });
          }
        } catch {
          // Skip projects with no decisions
        }

        // Add project creation as activity
        allActivities.push({
          id: `proj-${project.id}`,
          type: 'project_created',
          projectId: project.id,
          projectName: project.name,
          description: `Project "${project.name}" created`,
          actor: 'User',
          timestamp: project.created_at || project.createdAt || new Date().toISOString(),
        });
      }

      // Sort by timestamp descending
      allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setActivities(allActivities);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activity');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchActivities();
    }
  }, [isAuthenticated, token, fetchActivities]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Activity</h1>
        <p className="text-gray-400 mb-6">Please log in to view your activity.</p>
        <Link
          to="/login"
          className="inline-block px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-medium transition-colors"
        >
          Log In
        </Link>
      </div>
    );
  }

  const filteredActivities = filter === 'all'
    ? activities
    : activities.filter(a => a.type === filter);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'decision':
        return (
          <div className="w-8 h-8 bg-violet-500/20 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'gate_change':
        return (
          <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        );
      case 'phase_change':
        return (
          <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        );
    }
  };

  const formatTime = (ts: string) => {
    try {
      const date = new Date(ts);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <Link to="/dashboard" className="hover:text-white transition-colors">
            Dashboard
          </Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-white">Activity</span>
        </div>
        <h1 className="text-3xl font-bold text-white">Activity</h1>
        <p className="text-gray-400 mt-2">
          Track your actions and changes across all projects.
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(['all', 'decision', 'gate_change', 'phase_change'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              filter === f
                ? 'bg-violet-600 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            {f === 'all' ? 'All' : f === 'decision' ? 'Decisions' : f === 'gate_change' ? 'Gates' : 'Phases'}
          </button>
        ))}
        <span className="ml-auto text-sm text-gray-500">
          {filteredActivities.length} {filteredActivities.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Activity List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading activity...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
          <p className="text-red-400">{error}</p>
          <button onClick={fetchActivities} className="mt-2 text-sm text-violet-400 hover:text-violet-300">
            Retry
          </button>
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-8 text-center">
          <p className="text-gray-400">No activity found. Create a project to get started.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-800/30 transition-colors"
            >
              {getTypeIcon(activity.type)}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm">{activity.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Link
                    to={`/project/${activity.projectId}`}
                    className="text-xs text-violet-400 hover:text-violet-300"
                  >
                    {activity.projectName}
                  </Link>
                  <span className="text-gray-600 text-xs">by {activity.actor}</span>
                </div>
              </div>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {formatTime(activity.timestamp)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Activity;

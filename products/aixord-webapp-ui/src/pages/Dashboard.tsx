/**
 * Enhanced Dashboard Page
 *
 * Features:
 * - Project overview with statistics
 * - Projects Overview donut chart
 * - My Tasks panel with Today/Tomorrow filters
 * - Recent Activities feed
 * - Project grid with search
 * - Create/Delete project functionality
 *
 * Reference: Dashboard.webp, 1_Project_DashBoard.webp mockups
 */

import { useState, useEffect, useRef, useMemo, useCallback, type ReactNode } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProjects } from '../hooks/useApi';
import { ProjectCard } from '../components/ProjectCard';
import { messagesApi, api, type Project, type ChatMessage, type UsageData } from '../lib/api';
import { TrialBanner } from '../components/TrialBanner';
import { UsageMeter } from '../components/UsageMeter';
import { OnboardingChecklist } from '../components/onboarding/OnboardingChecklist';

type RealityClassification = 'GREENFIELD' | 'BROWNFIELD' | 'LEGACY';
type ViewMode = 'grid' | 'dashboard';
type TimeFilter = 'today' | 'week' | 'month';

// Usage statistics aggregated from message metadata
interface UsageStats {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCostUsd: number;
  requestCount: number;
  avgLatencyMs: number;
}

// ============================================================================
// Sub-Components
// ============================================================================

// Stat Card
function StatCard({ label, value, icon, color }: {
  label: string;
  value: number;
  icon: ReactNode;
  color: string;
}) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

// Projects Overview Donut Chart
function ProjectsOverviewChart({ inProgress, completed, notStarted }: {
  inProgress: number;
  completed: number;
  notStarted: number;
}) {
  const total = inProgress + completed + notStarted || 1; // Avoid division by zero
  const inProgressPct = (inProgress / total) * 100;
  const completedPct = (completed / total) * 100;

  // SVG donut chart
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const inProgressOffset = circumference - (inProgressPct / 100) * circumference;
  const completedOffset = circumference - (completedPct / 100) * circumference;

  return (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Projects Overview</h3>
        <button className="text-gray-500 hover:text-white">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </button>
      </div>

      <div className="flex items-center justify-center gap-6">
        {/* Chart */}
        <div className="relative w-28 h-28">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background */}
            <circle
              cx="50" cy="50" r={radius}
              fill="none" stroke="#374151"
              strokeWidth="10"
            />
            {/* Completed (Blue) */}
            <circle
              cx="50" cy="50" r={radius}
              fill="none" stroke="#3B82F6"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={completedOffset}
              strokeLinecap="round"
            />
            {/* In Progress (Orange) */}
            <circle
              cx="50" cy="50" r={radius}
              fill="none" stroke="#F97316"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={inProgressOffset}
              strokeLinecap="round"
              style={{ transform: `rotate(${completedPct * 3.6}deg)`, transformOrigin: '50% 50%' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{total}</span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-orange-500 rounded-full" />
            <span className="text-gray-400">In Progress: {inProgress}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full" />
            <span className="text-gray-400">Completed: {completed}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-gray-600 rounded-full" />
            <span className="text-gray-400">Not Started: {notStarted}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// My Tasks Panel
function MyTasksPanel({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<'today' | 'tomorrow'>('today');

  // Generate mock tasks from projects
  const tasks = useMemo(() => {
    return projects.slice(0, 5).map((p, i) => ({
      id: p.id,
      name: p.name,
      description: p.objective.slice(0, 50) + '...',
      status: i % 3 === 0 ? 'done' : 'pending',
      projectId: p.id
    }));
  }, [projects]);

  return (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">My Tasks</h3>
        <button className="text-violet-400 hover:text-violet-300 text-xs">+ Add</button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter('today')}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            filter === 'today'
              ? 'bg-gray-700 text-white'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setFilter('tomorrow')}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            filter === 'tomorrow'
              ? 'bg-gray-700 text-white'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Tomorrow
        </button>
      </div>

      {/* Task count */}
      <div className="flex items-center gap-2 mb-3">
        <span className="bg-gray-700 text-white text-xs px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
        <span className="text-xs text-gray-500">On Going Tasks</span>
      </div>

      {/* Tasks list */}
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No tasks for {filter}</p>
        ) : (
          tasks.slice(0, 3).map((task) => (
            <Link
              key={task.id}
              to={`/project/${task.projectId}`}
              className="flex items-center gap-3 p-2 hover:bg-gray-700/30 rounded-lg transition-colors"
            >
              <button
                className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                  task.status === 'done'
                    ? 'bg-green-500/20 border-green-500 text-green-400'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                {task.status === 'done' && (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <div className="min-w-0">
                <p className="text-sm text-white font-medium truncate">{task.name}</p>
                <p className="text-xs text-gray-500 truncate">{task.description}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

// Usage Stats Panel
function UsageStatsPanel({ stats, isLoading }: { stats: UsageStats; isLoading: boolean }) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCost = (cost: number) => {
    if (cost < 0.01) return '<$0.01';
    return `$${cost.toFixed(2)}`;
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Usage This Period</h3>
        <Link to="/settings" className="text-violet-400 hover:text-violet-300 text-xs">
          View Plan
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-24">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-violet-500 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-3">
          {/* Tokens */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center">
                <svg className="w-3 h-3 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </span>
              <span className="text-sm text-gray-400">Tokens</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-white">
                {formatNumber(stats.totalInputTokens + stats.totalOutputTokens)}
              </span>
              <span className="text-xs text-gray-500 ml-1">
                ({formatNumber(stats.totalInputTokens)} in / {formatNumber(stats.totalOutputTokens)} out)
              </span>
            </div>
          </div>

          {/* Cost */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <span className="text-sm text-gray-400">Est. Cost</span>
            </div>
            <span className="text-sm font-medium text-white">{formatCost(stats.totalCostUsd)}</span>
          </div>

          {/* Requests */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </span>
              <span className="text-sm text-gray-400">Requests</span>
            </div>
            <span className="text-sm font-medium text-white">{stats.requestCount}</span>
          </div>

          {/* Avg Latency */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                <svg className="w-3 h-3 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <span className="text-sm text-gray-400">Avg Latency</span>
            </div>
            <span className="text-sm font-medium text-white">
              {stats.avgLatencyMs > 0 ? `${Math.round(stats.avgLatencyMs)}ms` : '—'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Recent Activities Panel
function RecentActivitiesPanel({ projects }: { projects: Project[] }) {
  // Generate mock activities from projects
  const activities = useMemo(() => {
    return projects.slice(0, 4).map((p, i) => ({
      id: `${p.id}-activity`,
      type: i % 2 === 0 ? 'Reviewed' : 'Created',
      description: `${i % 2 === 0 ? 'Reviewed' : 'Created'} project "${p.name}"`,
      timestamp: p.updatedAt || p.createdAt,
      icon: i % 2 === 0 ? '✅' : '🆕'
    }));
  }, [projects]);

  return (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
      <h3 className="text-sm font-semibold text-white mb-4">Recent Activities</h3>
      <div className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No recent activity</p>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <span className="text-lg">{activity.icon}</span>
              <div className="min-w-0">
                <p className="text-sm text-white">{activity.description}</p>
                <p className="text-xs text-gray-500">
                  {new Date(activity.timestamp).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Search Bar
function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search projects..."
        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
      />
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function Dashboard() {
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();
  const hasRedirected = useRef(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');

  // Create project modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    objective: '',
    realityClassification: 'GREENFIELD' as RealityClassification,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Delete project modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Usage stats state
  const [usageStats, setUsageStats] = useState<UsageStats>({
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalCostUsd: 0,
    requestCount: 0,
    avgLatencyMs: 0,
  });
  const [isLoadingUsage, setIsLoadingUsage] = useState(false);

  // Usage data for trial/metering (H1/H2)
  const [usageData, setUsageData] = useState<UsageData | null>(null);

  // Redirect if not authenticated (one-time check after auth loading)
  useEffect(() => {
    if (!authLoading && !isAuthenticated && !hasRedirected.current) {
      hasRedirected.current = true;
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // D-006 FIX: Open create modal when navigating with ?create=true (from Sidebar)
  useEffect(() => {
    if (searchParams.get('create') === 'true' && isAuthenticated) {
      setShowCreateModal(true);
      // Clear the query param so refreshing doesn't re-open modal
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, isAuthenticated]);

  // Fetch usage data for trial/metering (H1/H2)
  useEffect(() => {
    if (isAuthenticated && token) {
      api.usage.current(token)
        .then(setUsageData)
        .catch(console.error);
    }
  }, [isAuthenticated, token]);

  // Only fetch projects when we have a valid token and are authenticated
  const { projects, isLoading, error, createProject, deleteProject } = useProjects(
    isAuthenticated ? token : null
  );

  // Aggregate usage stats from all project messages
  const fetchUsageStats = useCallback(async () => {
    if (!token || !projects || projects.length === 0) {
      setUsageStats({
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalCostUsd: 0,
        requestCount: 0,
        avgLatencyMs: 0,
      });
      return;
    }

    setIsLoadingUsage(true);
    try {
      // Fetch messages from all projects and aggregate usage
      const allMessages: ChatMessage[] = [];
      for (const project of projects.slice(0, 10)) { // Limit to 10 projects for performance
        try {
          const messages = await messagesApi.list(project.id, token, 100, 0);
          allMessages.push(...messages);
        } catch {
          // Skip projects with fetch errors
        }
      }

      // Aggregate usage from message metadata
      let totalInputTokens = 0;
      let totalOutputTokens = 0;
      let totalCostUsd = 0;
      let totalLatencyMs = 0;
      let requestCount = 0;

      for (const msg of allMessages) {
        if (msg.role === 'assistant' && msg.metadata?.usage) {
          const usage = msg.metadata.usage as {
            inputTokens?: number;
            outputTokens?: number;
            costUsd?: number;
            latencyMs?: number;
            input_tokens?: number;
            output_tokens?: number;
            cost_usd?: number;
            latency_ms?: number;
          };
          // Handle both camelCase and snake_case (from backend)
          totalInputTokens += usage.inputTokens || usage.input_tokens || 0;
          totalOutputTokens += usage.outputTokens || usage.output_tokens || 0;
          totalCostUsd += usage.costUsd || usage.cost_usd || 0;
          totalLatencyMs += usage.latencyMs || usage.latency_ms || 0;
          requestCount++;
        }
      }

      setUsageStats({
        totalInputTokens,
        totalOutputTokens,
        totalCostUsd,
        requestCount,
        avgLatencyMs: requestCount > 0 ? totalLatencyMs / requestCount : 0,
      });
    } catch (err) {
      console.error('Failed to fetch usage stats:', err);
    } finally {
      setIsLoadingUsage(false);
    }
  }, [token, projects]);

  // Fetch usage stats when projects change
  useEffect(() => {
    if (isAuthenticated && token && projects && !isLoading) {
      fetchUsageStats();
    }
  }, [isAuthenticated, token, projects, isLoading, fetchUsageStats]);

  // Filter projects by search
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    if (!searchQuery.trim()) return projects;
    const query = searchQuery.toLowerCase();
    return projects.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.objective.toLowerCase().includes(query)
    );
  }, [projects, searchQuery]);

  // Project statistics
  const stats = useMemo(() => {
    if (!projects) return { total: 0, greenfield: 0, brownfield: 0, legacy: 0 };
    return {
      total: projects.length,
      greenfield: projects.filter(p => p.realityClassification === 'GREENFIELD').length,
      brownfield: projects.filter(p => p.realityClassification === 'BROWNFIELD').length,
      legacy: projects.filter(p => p.realityClassification === 'LEGACY').length,
    };
  }, [projects]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  // Don't render if not authenticated (redirect in progress)
  if (!isAuthenticated) {
    return null;
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateError(null);
    try {
      const project = await createProject(newProject);
      if (!project?.id) {
        throw new Error('Project created but no ID returned');
      }
      setShowCreateModal(false);
      setNewProject({ name: '', objective: '', realityClassification: 'GREENFIELD' });
      navigate(`/project/${project.id}`);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, project: Project) => {
    e.preventDefault();
    e.stopPropagation();
    setProjectToDelete(project);
    setShowDeleteModal(true);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteProject(projectToDelete.id);
      setShowDeleteModal(false);
      setProjectToDelete(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete project');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setProjectToDelete(null);
    setDeleteError(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Trial Banner (H1) */}
      {usageData?.trial && (
        <TrialBanner
          daysLeft={usageData.trial.daysLeft}
          requestsRemaining={usageData.requests.remaining}
          requestsLimit={usageData.requests.limit}
        />
      )}

      {/* Usage Meter (H2) - Show in compact form */}
      {usageData && (
        <div className="mb-6">
          <UsageMeter
            used={usageData.requests.used}
            limit={usageData.requests.limit}
            label={`${usageData.tier} Plan - AI Requests`}
          />
        </div>
      )}

      {/* Onboarding Checklist (H3) */}
      <OnboardingChecklist
        hasProjects={projects && projects.length > 0}
        hasApiKeys={usageData?.tier !== 'TRIAL'}
        hasSentMessage={usageStats.requestCount > 0}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <p className="text-gray-400 text-sm">Welcome back, {user?.email?.split('@')[0] || 'User'}</p>
          <h1 className="text-2xl font-bold text-white">Project Dashboard</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Filter */}
          <div className="flex bg-gray-800/50 rounded-lg p-1">
            {(['today', 'week', 'month'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeFilter(t)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  timeFilter === t
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {t === 'today' ? 'Today' : t === 'week' ? 'This Week' : 'This Month'}
              </button>
            ))}
          </div>

          {/* Create Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-medium transition-colors text-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Projects"
          value={stats.total}
          color="bg-violet-500/20 text-violet-400"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>}
        />
        <StatCard
          label="Greenfield"
          value={stats.greenfield}
          color="bg-green-500/20 text-green-400"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>}
        />
        <StatCard
          label="Brownfield"
          value={stats.brownfield}
          color="bg-amber-500/20 text-amber-400"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>}
        />
        <StatCard
          label="Legacy"
          value={stats.legacy}
          color="bg-blue-500/20 text-blue-400"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-4 gap-6 mb-6">
        {/* Column 1: Tasks */}
        <div className="lg:col-span-1">
          <MyTasksPanel projects={projects || []} />
        </div>

        {/* Column 2: Projects Overview */}
        <div className="lg:col-span-1">
          <ProjectsOverviewChart
            inProgress={stats.greenfield}
            completed={stats.legacy}
            notStarted={stats.brownfield}
          />
        </div>

        {/* Column 3: Usage Stats */}
        <div className="lg:col-span-1">
          <UsageStatsPanel stats={usageStats} isLoading={isLoadingUsage} />
        </div>

        {/* Column 4: Recent Activities */}
        <div className="lg:col-span-1">
          <RecentActivitiesPanel projects={projects || []} />
        </div>
      </div>

      {/* Projects Section */}
      <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="text-lg font-semibold text-white">All Projects</h2>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex-1 sm:w-64">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>
            {/* View toggle */}
            <div className="flex bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-gray-700 text-white' : 'text-gray-500'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('dashboard')}
                className={`p-1.5 rounded ${viewMode === 'dashboard' ? 'bg-gray-700 text-white' : 'text-gray-500'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent" />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && filteredProjects.length === 0 && (
          <div className="text-center py-12">
            {searchQuery ? (
              <>
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-lg font-semibold text-white mb-2">No matches found</h3>
                <p className="text-gray-400">Try adjusting your search query</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
                <p className="text-gray-400 mb-6">Create your first AIXORD-governed project to get started.</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-medium transition-colors"
                >
                  Create your first project
                </button>
              </>
            )}
          </div>
        )}

        {/* Projects grid */}
        {!isLoading && filteredProjects.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects
              .filter((project) => project?.id)
              .map((project) => (
                <div key={project.id} className="relative group">
                  <Link to={`/project/${project.id}`}>
                    <ProjectCard project={project} />
                  </Link>
                  {/* Delete button overlay */}
                  <button
                    onClick={(e) => handleDeleteClick(e, project)}
                    className="absolute top-3 right-3 p-2 bg-gray-900/80 hover:bg-red-500/80 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 text-gray-400 hover:text-white"
                    title="Delete project"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Create New Project</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              {createError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{createError}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  required
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
                  placeholder="My Awesome Project"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Objective
                </label>
                <textarea
                  value={newProject.objective}
                  onChange={(e) => setNewProject({ ...newProject, objective: e.target.value })}
                  required
                  rows={3}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                  placeholder="Build a..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reality Classification
                </label>
                <select
                  value={newProject.realityClassification}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      realityClassification: e.target.value as RealityClassification,
                    })
                  }
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors"
                >
                  <option value="GREENFIELD">Greenfield - New project from scratch</option>
                  <option value="BROWNFIELD">Brownfield - Existing codebase</option>
                  <option value="LEGACY">Legacy - Maintaining older system</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-700 text-gray-300 rounded-lg hover:border-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 px-4 py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 text-white rounded-lg font-medium transition-colors"
                >
                  {isCreating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && projectToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Delete Project?</h2>
                <p className="text-gray-400 text-sm">This action cannot be undone.</p>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
              <p className="text-white font-medium">{projectToDelete.name}</p>
              <p className="text-gray-400 text-sm mt-1 line-clamp-2">{projectToDelete.objective}</p>
            </div>

            <p className="text-gray-400 text-sm mb-6">
              All project data including governance state, decisions, and chat history will be permanently deleted.
            </p>

            {deleteError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
                <p className="text-red-400 text-sm">{deleteError}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 border border-gray-700 text-gray-300 rounded-lg hover:border-gray-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 disabled:bg-red-600/50 text-white rounded-lg font-medium transition-colors"
              >
                {isDeleting ? 'Deleting...' : 'Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

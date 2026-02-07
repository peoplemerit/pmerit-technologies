/**
 * Analytics Page
 *
 * Displays analytics and metrics for user projects.
 * Shows AI usage, project counts, governance compliance.
 *
 * Backend APIs used:
 * - GET /usage — current period usage
 * - GET /usage/history — past 6 months usage
 * - GET /projects — project count
 */

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

interface UsagePeriod {
  period: string;
  requestCount: number;
  tokenCount: number;
  costCents: number;
}

export function Analytics() {
  const { isAuthenticated, token } = useAuth();
  const [currentUsage, setCurrentUsage] = useState<UsagePeriod | null>(null);
  const [history, setHistory] = useState<UsagePeriod[]>([]);
  const [projectCount, setProjectCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);

    try {
      // Fetch in parallel
      const [usageRes, historyRes, projectsRes] = await Promise.allSettled([
        api.usage.current(token),
        api.usage.history(token),
        api.projects.list(token),
      ]);

      if (usageRes.status === 'fulfilled') {
        const u = usageRes.value as any;
        setCurrentUsage({
          period: u.period || new Date().toISOString().slice(0, 7),
          requestCount: u.request_count || u.requestCount || 0,
          tokenCount: u.token_count || u.tokenCount || 0,
          costCents: u.cost_cents || u.costCents || 0,
        });
      }

      if (historyRes.status === 'fulfilled') {
        const h = historyRes.value as any;
        const periods = Array.isArray(h) ? h : h.history || h.periods || [];
        setHistory(periods.map((p: any) => ({
          period: p.period,
          requestCount: p.request_count || p.requestCount || 0,
          tokenCount: p.token_count || p.tokenCount || 0,
          costCents: p.cost_cents || p.costCents || 0,
        })));
      }

      if (projectsRes.status === 'fulfilled') {
        const p = projectsRes.value as any;
        const list = Array.isArray(p) ? p : p.projects || [];
        setProjectCount(list.length);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchAnalytics();
    }
  }, [isAuthenticated, token, fetchAnalytics]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Analytics</h1>
        <p className="text-gray-400 mb-6">Please log in to view your analytics.</p>
        <Link
          to="/login"
          className="inline-block px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-medium transition-colors"
        >
          Log In
        </Link>
      </div>
    );
  }

  const formatTokens = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
  };

  const formatCost = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  // Simple bar chart as colored divs (max height normalized)
  const maxTokens = Math.max(...history.map(h => h.tokenCount), 1);

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
          <span className="text-white">Analytics</span>
        </div>
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="text-gray-400 mt-2">
          View insights and metrics across your projects.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
          <p className="text-red-400">{error}</p>
          <button onClick={fetchAnalytics} className="mt-2 text-sm text-violet-400 hover:text-violet-300">
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Projects</p>
              <p className="text-2xl font-bold text-white">{projectCount}</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Requests This Period</p>
              <p className="text-2xl font-bold text-white">{currentUsage?.requestCount ?? 0}</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Tokens Used</p>
              <p className="text-2xl font-bold text-white">{formatTokens(currentUsage?.tokenCount ?? 0)}</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Estimated Cost</p>
              <p className="text-2xl font-bold text-white">{formatCost(currentUsage?.costCents ?? 0)}</p>
            </div>
          </div>

          {/* Usage History Chart */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6 mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Token Usage History</h2>
            {history.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No usage history yet.</p>
            ) : (
              <div className="flex items-end gap-2 h-40">
                {history.map((period) => {
                  const heightPct = (period.tokenCount / maxTokens) * 100;
                  return (
                    <div key={period.period} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs text-gray-400">{formatTokens(period.tokenCount)}</span>
                      <div
                        className="w-full bg-violet-500/60 rounded-t-sm min-h-[2px] transition-all"
                        style={{ height: `${Math.max(heightPct, 2)}%` }}
                      />
                      <span className="text-xs text-gray-500">{period.period.slice(5)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Usage History Table */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Period Breakdown</h2>
            {history.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No history data.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-700/50">
                    <th className="text-left py-2 font-medium">Period</th>
                    <th className="text-right py-2 font-medium">Requests</th>
                    <th className="text-right py-2 font-medium">Tokens</th>
                    <th className="text-right py-2 font-medium">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((period) => (
                    <tr key={period.period} className="border-b border-gray-800/50 hover:bg-gray-700/20">
                      <td className="py-2 text-white">{period.period}</td>
                      <td className="py-2 text-right text-gray-300">{period.requestCount}</td>
                      <td className="py-2 text-right text-gray-300">{formatTokens(period.tokenCount)}</td>
                      <td className="py-2 text-right text-gray-300">{formatCost(period.costCents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Analytics;

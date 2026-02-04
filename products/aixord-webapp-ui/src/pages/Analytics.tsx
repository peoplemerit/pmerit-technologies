/**
 * Analytics Page
 *
 * Displays analytics and metrics for user projects.
 * D-015 FIX: Added missing /analytics route
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Analytics() {
  const { isAuthenticated } = useAuth();

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

      {/* Coming Soon Card */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-8 text-center">
        <div className="w-16 h-16 bg-violet-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Coming Soon</h2>
        <p className="text-gray-400 max-w-md mx-auto mb-6">
          The Analytics dashboard will provide insights into your project progress,
          AI interaction patterns, and governance compliance metrics.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      {/* Feature Preview */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30">
          <h3 className="text-white font-medium mb-1">Project Metrics</h3>
          <p className="text-gray-500 text-sm">Track completion rates and phase progression.</p>
        </div>
        <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30">
          <h3 className="text-white font-medium mb-1">AI Usage</h3>
          <p className="text-gray-500 text-sm">Monitor AI interactions and token consumption.</p>
        </div>
        <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30">
          <h3 className="text-white font-medium mb-1">Governance Stats</h3>
          <p className="text-gray-500 text-sm">Review gate compliance and approval history.</p>
        </div>
      </div>
    </div>
  );
}

export default Analytics;

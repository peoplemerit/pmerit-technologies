/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs the error, and displays a fallback UI instead of crashing the app.
 */

import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Structured error report for remote tracking
    try {
      const apiBase = import.meta.env.VITE_API_BASE || '';
      if (apiBase) {
        const report = {
          level: 'error',
          message: error.message,
          error: error.name,
          stack: error.stack?.split('\n').slice(0, 5).join('\n'),
          componentStack: errorInfo.componentStack?.slice(0, 500),
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        };
        // Fire-and-forget error report to backend
        fetch(`${apiBase}/v1/errors`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ errorReport: report }),
        }).catch(() => { /* silent — error tracking should never throw */ });
      }
    } catch {
      // Error tracking itself must never crash the app
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700/50">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
              <p className="text-gray-400 mb-6">
                An unexpected error occurred. Please try reloading the page.
              </p>

              {this.state.error && (
                <div className="bg-gray-900/50 rounded-lg p-4 mb-6 text-left">
                  <p className="text-sm text-gray-500 mb-1">Error details:</p>
                  <code className="text-xs text-red-400 break-all">
                    {this.state.error.message}
                  </code>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={this.handleGoHome}
                  className="flex-1 px-4 py-3 border border-gray-700 text-gray-300 rounded-lg hover:border-gray-600 transition-colors"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={this.handleReload}
                  className="flex-1 px-4 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-medium transition-colors"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

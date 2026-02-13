/**
 * EnvironmentAwarenessReport — Post-confirmation environment probe display
 *
 * Shows results of 5 backend probes (D1 read/write, R2, router, env config)
 * after workspace binding confirmation. Non-blocking — binding is already saved.
 *
 * Matches WorkspaceSetupWizard.tsx visual patterns (dark theme, SummaryRow, badges).
 */

import { useState, useEffect, useCallback } from 'react';
import { api, type EnvTestResult, type EnvConfirmTestResult } from '../lib/api';

// ============================================================================
// Icons for each test type
// ============================================================================

const TEST_ICONS: Record<string, string> = {
  D1_READ: '📖',
  D1_WRITE: '✏️',
  R2_LIST: '🗄️',
  ROUTER: '🔀',
  ENV_CONFIG: '⚙️',
};

// ============================================================================
// TestRow — Individual probe result
// ============================================================================

function TestRow({ test }: { test: EnvTestResult }) {
  const [expanded, setExpanded] = useState(false);
  const icon = TEST_ICONS[test.test_id] || '🔍';

  const statusColor = test.passed
    ? 'border-green-500/20'
    : 'border-amber-500/20';

  const badgeBg = test.passed
    ? 'bg-green-500/20 text-green-400'
    : 'bg-amber-500/20 text-amber-400';

  return (
    <div className={`border ${statusColor} rounded-lg overflow-hidden`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 bg-gray-800/30 hover:bg-gray-800/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{icon}</span>
          <div>
            <p className="text-sm text-gray-300 font-medium">{test.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {test.passed ? 'Operational' : test.error || 'Failed'}
              <span className="ml-2 text-gray-600">{test.latency_ms}ms</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-xs font-mono ${badgeBg}`}>
            {test.passed ? 'PASS' : 'FAIL'}
          </span>
          <span className="text-gray-600 text-xs">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {expanded && (
        <div className="px-4 py-3 bg-gray-900/50 border-t border-gray-800/50">
          <p className="text-xs text-gray-500 font-mono mb-1">Evidence:</p>
          <pre className="text-xs text-gray-400 font-mono whitespace-pre-wrap break-all">
            {JSON.stringify(test.evidence, null, 2)}
          </pre>
          {test.error && (
            <p className="text-xs text-amber-400 mt-2">Error: {test.error}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EnvironmentAwarenessReport — Main modal
// ============================================================================

interface EnvironmentAwarenessReportProps {
  projectId: string;
  token: string;
  onClose: (allPassed: boolean) => void;
}

export default function EnvironmentAwarenessReport({
  projectId,
  token,
  onClose,
}: EnvironmentAwarenessReportProps) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<EnvConfirmTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function runTests() {
      try {
        const data = await api.workspace.confirmTest(projectId, token);
        if (!cancelled) {
          setResult(data);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to run environment probes');
          setLoading(false);
        }
      }
    }

    runTests();
    return () => { cancelled = true; };
  }, [projectId, token]);

  const handleClose = useCallback(() => {
    onClose(result?.all_passed ?? false);
  }, [result, onClose]);

  const passedCount = result?.tests.filter(t => t.passed).length ?? 0;
  const totalCount = result?.tests.length ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Environment Awareness Report</h2>
          <p className="text-sm text-gray-400 mt-1">
            {loading
              ? 'Verifying backend capabilities...'
              : result?.all_passed
                ? 'All systems operational'
                : `${passedCount}/${totalCount} probes passed`
            }
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-3">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-white/20 border-t-violet-400 rounded-full animate-spin mb-4" />
              <p className="text-sm text-gray-400">Running environment probes...</p>
              <p className="text-xs text-gray-600 mt-1">Testing D1, R2, Router, Config</p>
            </div>
          )}

          {error && !result && (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-amber-400 text-sm mb-2">Failed to run probes</p>
              <p className="text-xs text-gray-500">{error}</p>
              <p className="text-xs text-gray-600 mt-2">
                Your workspace binding was saved successfully. This is a verification step only.
              </p>
            </div>
          )}

          {result && result.tests.map(test => (
            <TestRow key={test.test_id} test={test} />
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {result && (
              <>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  result.all_passed
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {result.all_passed ? 'All Systems Operational' : 'Partial Failure'}
                </span>
                <span className="text-xs text-gray-600">{result.duration_ms}ms total</span>
              </>
            )}
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              loading
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : result?.all_passed
                  ? 'bg-green-600 hover:bg-green-500 text-white'
                  : 'bg-amber-600 hover:bg-amber-500 text-white'
            }`}
          >
            {loading ? 'Running...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}

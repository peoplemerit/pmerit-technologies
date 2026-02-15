/**
 * Approval Gate Modal — HITL Interface
 * AIXORD v4.5.1 — HANDOFF-CGC-01 GAP-1
 *
 * Displays worker output and audit report for human review.
 * Director can approve or reject the task with feedback.
 */

import { useState } from 'react';

interface ApprovalGateProps {
  isOpen: boolean;
  onClose: () => void;
  task: {
    id: string;
    task_description: string;
    worker_output: string;
    audit_report: {
      audit_status: string;
      confidence_score: number;
      findings: Array<{
        type: string;
        severity: string;
        description: string;
        remediation?: string;
      }>;
      owner_summary: string;
    };
    readiness_score: number;
    acceptance_criteria: string[];
    attempt_count: number;
    max_attempts: number;
  };
  onApprove: (taskId: string, feedback: string) => Promise<void>;
  onReject: (taskId: string, feedback: string) => Promise<void>;
}

export function ApprovalGate({ isOpen, onClose, task, onApprove, onReject }: ApprovalGateProps) {
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleApprove = async () => {
    setLoading(true);
    try {
      await onApprove(task.id, feedback);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await onReject(task.id, feedback);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const readinessColor =
    task.readiness_score >= 0.8 ? 'bg-green-500/20 text-green-400' :
    task.readiness_score >= 0.6 ? 'bg-amber-500/20 text-amber-400' :
    'bg-red-500/20 text-red-400';

  const auditStatusColor =
    task.audit_report.audit_status === 'PASS' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
    task.audit_report.audit_status === 'NEEDS_REVISION' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
    'bg-red-500/20 text-red-400 border-red-500/30';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <span className="text-amber-400 text-sm font-bold">H</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Approval Required</h2>
              <p className="text-xs text-gray-500">
                Task {task.id.slice(0, 8)}... | Attempt {task.attempt_count}/{task.max_attempts}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-xs font-mono ${readinessColor}`}>
              R = {task.readiness_score.toFixed(2)}
            </span>
            <button onClick={onClose} className="text-gray-500 hover:text-white p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-5">
          {/* Task Description */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-1">Task</h3>
            <p className="text-sm text-white">{task.task_description}</p>
          </div>

          {/* Acceptance Criteria */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-1">Acceptance Criteria</h3>
            <ul className="space-y-1">
              {task.acceptance_criteria.map((criterion, idx) => (
                <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-gray-500 shrink-0">{idx + 1}.</span>
                  <span>{criterion}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Worker Output */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-1">Worker Output</h3>
            <pre className="bg-gray-950 border border-gray-800 rounded-lg p-4 text-xs text-gray-300 overflow-x-auto max-h-64 overflow-y-auto font-mono">
              {task.worker_output}
            </pre>
          </div>

          {/* Audit Report */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Audit Report</h3>
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Status</span>
                <span className={`px-2 py-0.5 rounded text-xs border ${auditStatusColor}`}>
                  {task.audit_report.audit_status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Confidence</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        task.audit_report.confidence_score >= 80 ? 'bg-green-500' :
                        task.audit_report.confidence_score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${task.audit_report.confidence_score}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-300 font-mono">{task.audit_report.confidence_score}%</span>
                </div>
              </div>

              {task.audit_report.findings.length > 0 && (
                <div>
                  <span className="text-sm text-gray-400 block mb-1">Findings</span>
                  <div className="space-y-1.5">
                    {task.audit_report.findings.map((finding, idx) => (
                      <div key={idx} className="text-xs p-2 bg-gray-900/50 rounded border border-gray-700/50">
                        <span className={`font-semibold ${
                          finding.severity === 'High' ? 'text-red-400' :
                          finding.severity === 'Medium' ? 'text-amber-400' : 'text-gray-400'
                        }`}>
                          [{finding.severity}]
                        </span>
                        <span className="text-gray-300 ml-1">{finding.description}</span>
                        {finding.remediation && (
                          <div className="text-gray-500 mt-0.5 italic">Fix: {finding.remediation}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {task.audit_report.owner_summary && (
                <div>
                  <span className="text-sm text-gray-400 block mb-1">Summary</span>
                  <p className="text-xs text-gray-300">{task.audit_report.owner_summary}</p>
                </div>
              )}
            </div>
          </div>

          {/* Feedback Input */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Your Decision</h3>
            <textarea
              placeholder="Optional: Provide feedback or instructions..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-gray-950 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-2 pb-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-gray-600 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={loading}
              className="px-4 py-2 text-sm bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              Reject
            </button>
            <button
              onClick={handleApprove}
              disabled={loading}
              className="px-4 py-2 text-sm bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApprovalGate;

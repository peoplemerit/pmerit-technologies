/**
 * Disclaimer Modal Component (GA:DIS)
 *
 * AIXORD v4.3 Setup Gate - Terms acceptance flow
 * Must be accepted before using AI features.
 */

import { useState } from 'react';

interface DisclaimerModalProps {
  onAccept: () => void;
  onDecline: () => void;
  isLoading?: boolean;
}

export function DisclaimerModal({ onAccept, onDecline, isLoading = false }: DisclaimerModalProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [checkboxes, setCheckboxes] = useState({
    understand: false,
    aiLimitations: false,
    dataHandling: false,
  });

  const allChecked = checkboxes.understand && checkboxes.aiLimitations && checkboxes.dataHandling;
  const canAccept = hasScrolledToBottom && allChecked;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">AIXORD Terms & Disclaimer</h2>
              <p className="text-sm text-gray-400">Gate GA:DIS - Please review before continuing</p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div
          className="flex-1 overflow-y-auto p-6 space-y-6"
          onScroll={handleScroll}
        >
          {/* Introduction */}
          <section>
            <h3 className="text-lg font-medium text-white mb-2">Welcome to AIXORD</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              AIXORD is an AI governance platform by PMERIT Technologies LLC. Before using our AI-powered features,
              please carefully read and acknowledge the following terms and disclaimers.
            </p>
          </section>

          {/* AI Limitations */}
          <section className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
            <h4 className="text-amber-300 font-medium mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              AI Limitations & Disclaimers
            </h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>• AI responses may contain errors, inaccuracies, or outdated information</li>
              <li>• AI is not a substitute for professional advice (legal, medical, financial, etc.)</li>
              <li>• AI outputs should be verified before use in critical decisions</li>
              <li>• The AI does not have access to real-time information</li>
              <li>• PMERIT Technologies LLC is not liable for decisions made based on AI outputs</li>
            </ul>
          </section>

          {/* Data Handling */}
          <section className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-blue-300 font-medium mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Data Handling & Privacy
            </h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>• Your conversations may be processed by third-party AI providers (OpenAI, Anthropic, Google)</li>
              <li>• Do not share sensitive personal information (SSN, passwords, financial account numbers)</li>
              <li>• Project data is stored securely and associated with your account</li>
              <li>• You are responsible for classifying sensitive data using the Data Classification feature</li>
              <li>• See our Privacy Policy for full details on data handling</li>
            </ul>
          </section>

          {/* AIXORD Governance */}
          <section className="bg-violet-500/10 border border-violet-500/30 rounded-lg p-4">
            <h4 className="text-violet-300 font-medium mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              AIXORD Governance System
            </h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>• AIXORD enforces governance through phases (Brainstorm → Plan → Execute → Review)</li>
              <li>• Gates must be passed before certain actions are allowed</li>
              <li>• All AI interactions are logged for audit purposes</li>
              <li>• You maintain authority as the Director - AI acts as an advisor</li>
              <li>• Decisions are recorded and can be reviewed in the Decision Log</li>
            </ul>
          </section>

          {/* Acceptable Use */}
          <section>
            <h4 className="text-white font-medium mb-2">Acceptable Use Policy</h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              You agree not to use AIXORD for any illegal, harmful, or unethical purposes. This includes but is not limited to:
              generating harmful content, attempting to bypass safety measures, or using the platform to harm others.
              Violation of these terms may result in account termination.
            </p>
          </section>

          {/* Scroll Indicator */}
          {!hasScrolledToBottom && (
            <div className="text-center py-2">
              <p className="text-sm text-gray-500 animate-pulse">
                ↓ Scroll to read all terms ↓
              </p>
            </div>
          )}
        </div>

        {/* Checkboxes & Actions */}
        <div className="px-6 py-4 border-t border-gray-700/50 space-y-4">
          {/* Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={checkboxes.understand}
                onChange={(e) => setCheckboxes({ ...checkboxes, understand: e.target.checked })}
                className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-800 text-violet-500 focus:ring-violet-500"
              />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                I understand that AI responses may contain errors and should be verified
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={checkboxes.aiLimitations}
                onChange={(e) => setCheckboxes({ ...checkboxes, aiLimitations: e.target.checked })}
                className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-800 text-violet-500 focus:ring-violet-500"
              />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                I acknowledge the AI limitations and will not rely on AI for professional advice
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={checkboxes.dataHandling}
                onChange={(e) => setCheckboxes({ ...checkboxes, dataHandling: e.target.checked })}
                className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-800 text-violet-500 focus:ring-violet-500"
              />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                I understand how my data is handled and agree to the Privacy Policy
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onDecline}
              disabled={isLoading}
              className="flex-1 px-4 py-3 border border-gray-700 text-gray-300 rounded-lg hover:border-gray-600 hover:text-white transition-colors disabled:opacity-50"
            >
              Decline & Logout
            </button>
            <button
              onClick={onAccept}
              disabled={!canAccept || isLoading}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                canAccept
                  ? 'bg-violet-600 hover:bg-violet-500 text-white'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Accepting...
                </span>
              ) : (
                'Accept & Continue'
              )}
            </button>
          </div>

          {/* Helper text */}
          {!canAccept && (
            <p className="text-xs text-gray-500 text-center">
              {!hasScrolledToBottom
                ? 'Please scroll to read all terms'
                : 'Please check all boxes to continue'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DisclaimerModal;

/**
 * Message Action Buttons
 *
 * Floating action buttons that appear on message hover.
 * - Copy: All messages — copies text to clipboard
 * - Regenerate: Assistant messages only — re-sends prior user message
 * - Edit: User messages only — inline edit with Save/Cancel
 */

import { useState } from 'react';

interface MessageActionsProps {
  role: 'user' | 'assistant' | 'system';
  onCopy: () => void;
  onRegenerate?: () => void;
  onEdit?: () => void;
}

export function MessageActions({ role, onCopy, onRegenerate, onEdit }: MessageActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="absolute -bottom-3 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
      <div className="flex items-center gap-0.5 bg-gray-800 border border-gray-700/60 rounded-lg shadow-lg px-1 py-0.5">
        {/* Copy button — all messages */}
        <button
          onClick={handleCopy}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded transition-colors"
          title={copied ? 'Copied!' : 'Copy message'}
        >
          {copied ? (
            <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>

        {/* Edit button — user messages only */}
        {role === 'user' && onEdit && (
          <button
            onClick={onEdit}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded transition-colors"
            title="Edit message"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}

        {/* Regenerate button — assistant messages only */}
        {role === 'assistant' && onRegenerate && (
          <button
            onClick={onRegenerate}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded transition-colors"
            title="Regenerate response"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default MessageActions;

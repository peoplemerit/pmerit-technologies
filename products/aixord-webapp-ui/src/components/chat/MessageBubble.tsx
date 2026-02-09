/**
 * Message Bubble Component
 *
 * Renders a single chat message with metadata display.
 * Detects error messages and displays user-friendly guidance.
 */

import type { Message } from './types';
import { ChatErrorMessage } from '../ChatErrorMessage';
import { ImageDisplay } from './ImageDisplay';

interface MessageBubbleProps {
  message: Message;
  onSelectOption?: (optionId: string) => void;
  onRetry?: () => void;
  token?: string; // Auth token for image loading
  /** AI-Governance Integration — Phase 3: Phase advance callback */
  onPhaseAdvance?: (phase: string) => void;
}

// Check if message content looks like an error
function isErrorMessage(content: string): boolean {
  const errorPatterns = [
    /^Error:/i,
    /^Failed to/i,
    /BYOK_KEY_MISSING/,
    /RATE_LIMIT/,
    /AUTH_EXPIRED/,
    /MODEL_UNAVAILABLE/,
    /INVALID_API_KEY/,
    /QUOTA_EXCEEDED/,
    /NETWORK_ERROR/,
    /Internal Server Error/i,
    /Something went wrong/i,
  ];
  return errorPatterns.some(pattern => pattern.test(content));
}

export function MessageBubble({ message, onSelectOption, onRetry, token, onPhaseAdvance }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const isError = (isSystem || message.role === 'assistant') && isErrorMessage(message.content);

  // AI-Governance Integration — Phase 3: Detect phase advance tag
  const phaseAdvanceMatch = !isUser ? message.content.match(/\[PHASE_ADVANCE:(\w+)\]/) : null;
  const suggestedPhase = phaseAdvanceMatch ? phaseAdvanceMatch[1] : null;
  const displayContent = !isUser
    ? message.content.replace(/\[PHASE_ADVANCE:\w+\]/g, '').trim()
    : message.content;

  // Phase 4: Governance Block Card — distinct from AI messages
  const isGovernanceBlock = !!(message.metadata as Record<string, unknown>)?.governance_block;
  if (isGovernanceBlock) {
    const meta = message.metadata as Record<string, unknown>;
    const failedGates = (meta.failed_gates as Array<{ key: string; label: string; action: string }>) || [];
    const phase = (meta.phase as string) || 'UNKNOWN';
    return (
      <div className="flex justify-start mb-4">
        <div className="max-w-[85%] bg-violet-900/20 border border-violet-500/40 rounded-xl px-5 py-4">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-violet-600/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <span className="text-violet-300 text-sm font-semibold">AIXORD Governance Block</span>
              <span className="text-gray-500 text-xs ml-2">Phase: {phase}</span>
            </div>
          </div>
          {/* Explanation */}
          <p className="text-gray-300 text-sm mb-3">
            The AI model was <strong className="text-violet-300">not called</strong> — {failedGates.length} required gate{failedGates.length !== 1 ? 's' : ''} must be satisfied.
          </p>
          {/* Gate list */}
          <div className="space-y-1.5 mb-3">
            {failedGates.map((gate) => (
              <div key={gate.key} className="flex items-start gap-2 text-sm">
                <span className="text-red-400 mt-0.5">○</span>
                <div>
                  <span className="text-gray-200 font-medium">{gate.label}</span>
                  <span className="text-gray-500 ml-2">— {gate.action}</span>
                </div>
              </div>
            ))}
          </div>
          {/* Hint */}
          <p className="text-gray-500 text-xs">
            Open the <strong className="text-gray-400">Governance</strong> tab or click the gate pills to resolve.
          </p>
          {/* Timestamp */}
          <div className="text-xs mt-2 text-gray-600">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    );
  }

  // Render error messages with ChatErrorMessage component
  if (isError) {
    return (
      <div className="flex justify-start mb-4">
        <div className="max-w-[80%]">
          <ChatErrorMessage message={message.content} onRetry={onRetry} />
          {/* Timestamp */}
          <div className="text-xs mt-1 text-gray-500">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] ${
          isUser
            ? 'bg-violet-600 text-white rounded-2xl rounded-br-md'
            : isSystem
            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-xl'
            : 'bg-gray-800 text-gray-100 rounded-2xl rounded-bl-md'
        } px-4 py-3`}
      >
        {/* Message content */}
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {displayContent}
        </div>

        {/* AI-Governance Integration — Phase 3: Phase advance suggestion */}
        {suggestedPhase && onPhaseAdvance && (
          <div className="mt-3 p-3 bg-violet-500/10 border border-violet-500/30 rounded-lg">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-violet-400 text-sm font-medium">
                  Ready to advance to {suggestedPhase}
                </span>
                <p className="text-gray-400 text-xs mt-0.5">
                  All exit gates for the current phase are satisfied.
                </p>
              </div>
              <button
                onClick={() => onPhaseAdvance(suggestedPhase)}
                className="flex-shrink-0 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-lg transition-colors"
              >
                Advance to {suggestedPhase}
              </button>
            </div>
          </div>
        )}

        {/* Image attachments (ENH-4) */}
        {message.metadata?.images && message.metadata.images.length > 0 && (
          <ImageDisplay images={message.metadata.images} token={token} />
        )}

        {/* Option buttons (for assistant messages with options) */}
        {message.metadata?.options && message.metadata.options.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-700/50">
            <p className="text-xs text-gray-400 mb-2">Select an option:</p>
            <div className="flex flex-wrap gap-2">
              {message.metadata.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => onSelectOption?.(option.id)}
                  disabled={!!message.metadata?.selectedOption}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                    message.metadata?.selectedOption === option.id
                      ? 'bg-violet-500 text-white'
                      : message.metadata?.selectedOption
                      ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  title={option.description}
                >
                  {option.id}: {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Metadata footer */}
        {message.metadata && !isUser && (
          <div className="mt-3 pt-2 border-t border-gray-700/30">
            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
              {/* Model info */}
              {message.metadata.model && (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {message.metadata.model.provider}/{message.metadata.model.model}
                </span>
              )}

              {/* Usage info */}
              {message.metadata.usage && (
                <>
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    ${message.metadata.usage.costUsd.toFixed(4)}
                  </span>
                  <span>{message.metadata.usage.latencyMs}ms</span>
                  <span>{message.metadata.usage.inputTokens + message.metadata.usage.outputTokens} tokens</span>
                </>
              )}

              {/* Verification badge */}
              {message.metadata.verification && (
                <span
                  className={`px-2 py-0.5 rounded text-xs ${
                    message.metadata.verification.verdict === 'PASS'
                      ? 'bg-green-500/20 text-green-400'
                      : message.metadata.verification.verdict === 'WARN'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {message.metadata.verification.verdict}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Timestamp */}
        <div className={`text-xs mt-1 ${isUser ? 'text-violet-200/60' : 'text-gray-500'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;

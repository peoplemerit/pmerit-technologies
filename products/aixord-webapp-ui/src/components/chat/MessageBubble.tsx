/**
 * Message Bubble Component
 *
 * Renders a single chat message with metadata display.
 * Detects error messages and displays user-friendly guidance.
 */

import type { Message } from './types';
import { ChatErrorMessage } from '../ChatErrorMessage';

interface MessageBubbleProps {
  message: Message;
  onSelectOption?: (optionId: string) => void;
  onRetry?: () => void;
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

export function MessageBubble({ message, onSelectOption, onRetry }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const isError = (isSystem || message.role === 'assistant') && isErrorMessage(message.content);

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
          {message.content}
        </div>

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

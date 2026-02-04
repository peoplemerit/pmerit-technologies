/**
 * Chat Window Component (D3)
 *
 * Main governed chat interface that integrates:
 * - Message display with bubbles
 * - Input with mode selector
 * - Router integration for AI calls
 * - Gate and phase state display
 */

import { useState, useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import type { Conversation } from './types';

interface ChatWindowProps {
  conversation: Conversation | null;
  onSendMessage: (message: string, mode: 'ECONOMY' | 'BALANCED' | 'PREMIUM') => Promise<void>;
  onSelectOption?: (messageId: string, optionId: string) => void;
  isLoading?: boolean;
  className?: string;
}

export function ChatWindow({
  conversation,
  onSendMessage,
  onSelectOption,
  isLoading = false,
  className = ''
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [localLoading, setLocalLoading] = useState(false);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  const handleSend = async (message: string, mode: 'ECONOMY' | 'BALANCED' | 'PREMIUM') => {
    setLocalLoading(true);
    try {
      await onSendMessage(message, mode);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleSelectOption = (optionId: string, messageId: string) => {
    onSelectOption?.(messageId, optionId);
  };

  const loading = isLoading || localLoading;

  if (!conversation) {
    return (
      <div className={`flex flex-col items-center justify-center h-full bg-gray-900/30 rounded-xl ${className}`}>
        <div className="text-center p-8">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-semibold text-white mb-2">No conversation selected</h3>
          <p className="text-gray-400">Select or create a conversation to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-gray-900/30 rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50 bg-gray-800/30">
        <div>
          <h3 className="text-white font-medium">{conversation.title}</h3>
          <p className="text-xs text-gray-500">
            {conversation.messages.length} messages
            {conversation.capsule && ` • Phase: ${conversation.capsule.phase}`}
          </p>
        </div>

        {/* Capsule summary */}
        {conversation.capsule && (
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs rounded bg-violet-500/20 text-violet-300">
              {conversation.capsule.phase === 'B' && 'Brainstorm'}
              {conversation.capsule.phase === 'P' && 'Plan'}
              {conversation.capsule.phase === 'E' && 'Execute'}
              {conversation.capsule.phase === 'R' && 'Review'}
            </span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {conversation.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-4xl mb-3">🚀</div>
            <h4 className="text-lg font-medium text-white mb-1">Start the conversation</h4>
            <p className="text-gray-400 text-sm max-w-md">
              Type your message below. The AI will respond following AIXORD governance rules.
            </p>
          </div>
        ) : (
          <>
            {conversation.messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onSelectOption={(optionId) => handleSelectOption(optionId, message.id)}
              />
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-800 text-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm text-gray-400">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700/50">
        <ChatInput
          onSend={handleSend}
          disabled={loading}
          placeholder="Type your message... (Shift+Enter for new line)"
        />
      </div>
    </div>
  );
}

export default ChatWindow;

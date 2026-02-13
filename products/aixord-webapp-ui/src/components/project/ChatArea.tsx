/**
 * ChatArea Component
 * 
 * Renders the chat message list with message bubbles and quick actions.
 * Handles scrolling to bottom on new messages.
 */

import { useEffect, useRef } from 'react';
import { MessageBubble } from '../chat/MessageBubble';
import { QuickActions } from '../chat/QuickActions';
import type { Message } from '../chat/types';

interface ChatAreaProps {
  messages: Message[];
  activePhase: string;
  chatLoading: boolean;
  token?: string;
  onSendMessage: (content: string, mode: 'ECONOMY' | 'BALANCED' | 'PREMIUM') => void;
  onCopy: (content: string) => void;
  onRegenerate: (messageIndex: number) => void;
  onEdit: (messageIndex: number, newContent: string) => void;
  onPhaseAdvance?: (targetPhase: string) => void;
}

export function ChatArea({
  messages,
  activePhase,
  chatLoading,
  token,
  onSendMessage,
  onCopy,
  onRegenerate,
  onEdit,
  onPhaseAdvance,
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            token={token}
            onPhaseAdvance={message.role === 'assistant' ? onPhaseAdvance : undefined}
            onCopy={onCopy}
            onRegenerate={message.role === 'assistant' ? () => onRegenerate(index) : undefined}
            onEdit={message.role === 'user' ? (newContent: string) => onEdit(index, newContent) : undefined}
          />
        ))}

        {/* Loading indicator */}
        {chatLoading && (
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
      </div>

      {/* Quick Action Suggestion Buttons */}
      <QuickActions
        phase={activePhase}
        onSend={onSendMessage}
        isLoading={chatLoading}
        lastMessageRole={messages.length ? messages[messages.length - 1].role : undefined}
      />
    </>
  );
}

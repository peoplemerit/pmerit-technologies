/**
 * StatusBar Component (Ribbon-Style Layout)
 *
 * Bottom bar showing key status indicators and chat input.
 * Always visible, consolidates essential info + input area.
 */

import { useState, useRef, useEffect } from 'react';

interface StatusBarProps {
  phase: string;
  gatesComplete: number;
  gatesTotal: number;
  sessionCost: number;
  messageCount: number;
  isLoading?: boolean;
  onSendMessage: (message: string, mode: 'ECONOMY' | 'BALANCED' | 'PREMIUM') => void;
  onImageClick?: () => void;
  pendingImageCount?: number;
}

const phaseColors: Record<string, string> = {
  BRAINSTORM: 'bg-blue-500',
  PLAN: 'bg-amber-500',
  EXECUTE: 'bg-green-500',
  REVIEW: 'bg-purple-500',
  B: 'bg-blue-500',
  P: 'bg-amber-500',
  E: 'bg-green-500',
  R: 'bg-purple-500',
};

const phaseLabels: Record<string, string> = {
  BRAINSTORM: 'Brainstorm',
  PLAN: 'Plan',
  EXECUTE: 'Execute',
  REVIEW: 'Review',
  B: 'Brainstorm',
  P: 'Plan',
  E: 'Execute',
  R: 'Review',
};

export function StatusBar({
  phase,
  gatesComplete,
  gatesTotal,
  sessionCost,
  messageCount,
  isLoading = false,
  onSendMessage,
  onImageClick,
  pendingImageCount = 0,
}: StatusBarProps) {
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState<'ECONOMY' | 'BALANCED' | 'PREMIUM'>('BALANCED');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (!message.trim() || isLoading) return;
    onSendMessage(message.trim(), mode);
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 80)}px`;
    }
  }, [message]);

  const phaseColor = phaseColors[phase] || 'bg-gray-500';
  const phaseLabel = phaseLabels[phase] || phase;

  return (
    <div className="flex flex-col bg-gray-900 border-t border-gray-700/50">
      {/* Input Row — compact single line */}
      <div className="h-auto min-h-[48px] flex items-center gap-3 px-4 py-1.5">
        {/* Status Indicators — inline with input */}
        <div className="hidden md:flex items-center gap-3 text-xs shrink-0">
          {/* Phase */}
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${phaseColor}`} />
            <span className="text-white font-medium">{phaseLabel}</span>
          </div>

          {/* Gates */}
          <div className="text-gray-500">
            <span className="text-gray-300">{gatesComplete}/{gatesTotal}</span>
          </div>

          {/* Cost */}
          <div>
            <span className="text-green-400">${sessionCost.toFixed(4)}</span>
          </div>

          {/* Messages */}
          <div className="text-gray-500">
            <span className="text-gray-300">{messageCount}</span> msgs
          </div>

          {/* Separator */}
          <div className="w-px h-4 bg-gray-700" />
        </div>

        {/* Image Upload Button */}
        {onImageClick && (
          <button
            onClick={onImageClick}
            className="relative p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors shrink-0"
            title="Attach image"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            {pendingImageCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-violet-500 text-white text-xs rounded-full flex items-center justify-center">
                {pendingImageCount}
              </span>
            )}
          </button>
        )}

        {/* Message Input */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Shift+Enter for new line)"
            rows={1}
            disabled={isLoading}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors resize-none disabled:opacity-50"
            style={{ minHeight: '36px', maxHeight: '72px' }}
          />
        </div>

        {/* Mode Selector */}
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as typeof mode)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-violet-500 transition-colors shrink-0"
        >
          <option value="ECONOMY">Fast</option>
          <option value="BALANCED">Balanced</option>
          <option value="PREMIUM">Quality</option>
        </select>

        {/* Send Button */}
        <button
          onClick={handleSubmit}
          disabled={!message.trim() || isLoading}
          className="p-1.5 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors shrink-0"
          title="Send message"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          )}
        </button>
      </div>

      {/* Compact footer — replaces the separate Layout footer on project pages */}
      <div className="flex items-center justify-between px-4 py-1 border-t border-gray-800/50 text-[10px] text-gray-600">
        <span>&copy; {new Date().getFullYear()} PMERIT Technologies LLC</span>
        <div className="flex gap-3">
          <a href="/privacy-policy.html" className="hover:text-gray-400 transition-colors">Privacy</a>
          <a href="/docs" className="hover:text-gray-400 transition-colors">Docs</a>
          <a href="/pricing" className="hover:text-gray-400 transition-colors">Pricing</a>
        </div>
      </div>
    </div>
  );
}

export default StatusBar;

/**
 * Chat Input Component
 *
 * Text input with send button, mode selector, and file attachment support.
 */

import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';

type Mode = 'ECONOMY' | 'BALANCED' | 'PREMIUM';

interface ChatInputProps {
  onSend: (message: string, mode: Mode) => void;
  disabled?: boolean;
  placeholder?: string;
  defaultMode?: Mode;
  attachmentSlot?: ReactNode; // Slot for file attachment UI
}

const MODE_INFO: Record<Mode, { label: string; icon: string; description: string }> = {
  ECONOMY: {
    label: 'Economy',
    icon: '💰',
    description: 'Fastest & cheapest. Good for simple tasks.'
  },
  BALANCED: {
    label: 'Balanced',
    icon: '⚖️',
    description: 'Best quality/cost ratio. Recommended.'
  },
  PREMIUM: {
    label: 'Premium',
    icon: '✨',
    description: 'Highest quality. For complex tasks.'
  }
};

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Type your message...',
  defaultMode = 'BALANCED',
  attachmentSlot
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [showModeMenu, setShowModeMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modeMenuRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  // Close mode menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modeMenuRef.current && !modeMenuRef.current.contains(event.target as Node)) {
        setShowModeMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim(), mode);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-3">
      {/* File attachments slot */}
      {attachmentSlot}

      <div className="flex items-end gap-3">
        {/* Mode selector */}
        <div className="relative" ref={modeMenuRef}>
          <button
            onClick={() => setShowModeMenu(!showModeMenu)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors text-sm"
            title={MODE_INFO[mode].description}
          >
            <span>{MODE_INFO[mode].icon}</span>
            <span className="text-gray-300">{MODE_INFO[mode].label}</span>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Mode dropdown - D-004 FIX: Added min-w, max-w for responsive, removed overflow-hidden */}
          {showModeMenu && (
            <div className="absolute bottom-full left-0 mb-2 min-w-48 max-w-[calc(100vw-2rem)] bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
              {(Object.keys(MODE_INFO) as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMode(m);
                    setShowModeMenu(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-700/50 transition-colors ${
                    mode === m ? 'bg-violet-500/20 text-violet-300' : 'text-gray-300'
                  }`}
                >
                  <span className="text-lg">{MODE_INFO[m].icon}</span>
                  <div>
                    <div className="text-sm font-medium">{MODE_INFO[m].label}</div>
                    <div className="text-xs text-gray-500">{MODE_INFO[m].description}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Text input */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none text-sm py-2"
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className={`p-2 rounded-lg transition-all ${
            disabled || !message.trim()
              ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
              : 'bg-violet-600 text-white hover:bg-violet-500'
          }`}
        >
          {disabled ? (
            <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>

      {/* Character count */}
      <div className="flex justify-end mt-1">
        <span className={`text-xs ${message.length > 4000 ? 'text-amber-400' : 'text-gray-500'}`}>
          {message.length}/4096
        </span>
      </div>
    </div>
  );
}

export default ChatInput;

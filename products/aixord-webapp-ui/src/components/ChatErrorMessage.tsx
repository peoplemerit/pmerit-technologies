/**
 * ChatErrorMessage Component
 *
 * Displays user-friendly error messages with actionable guidance.
 * Maps technical error codes to helpful explanations and next steps.
 */

import { Link } from 'react-router-dom';
import { AlertCircle, Key, Clock, RefreshCw, Settings } from 'lucide-react';

interface ErrorGuidance {
  code: string;
  title: string;
  message: string;
  icon: React.ReactNode;
  action: {
    label: string;
    path?: string;
    onClick?: () => void;
  };
}

const ERROR_GUIDANCE: Record<string, ErrorGuidance> = {
  'BYOK_KEY_MISSING': {
    code: 'BYOK_KEY_MISSING',
    title: 'API Key Required',
    message: 'To use AI chat, add your API key for the selected model provider.',
    icon: <Key size={20} />,
    action: {
      label: 'Add API Key in Settings',
      path: '/settings'
    }
  },
  'RATE_LIMIT': {
    code: 'RATE_LIMIT',
    title: 'Rate Limited',
    message: 'Too many requests. Please wait a moment before trying again.',
    icon: <Clock size={20} />,
    action: {
      label: 'Retry',
      onClick: () => window.location.reload()
    }
  },
  'AUTH_EXPIRED': {
    code: 'AUTH_EXPIRED',
    title: 'Session Expired',
    message: 'Your session has expired. Please log in again.',
    icon: <RefreshCw size={20} />,
    action: {
      label: 'Log In',
      path: '/login'
    }
  },
  'MODEL_UNAVAILABLE': {
    code: 'MODEL_UNAVAILABLE',
    title: 'Model Unavailable',
    message: 'The selected model is temporarily unavailable. Try a different model.',
    icon: <Settings size={20} />,
    action: {
      label: 'Change Model',
      onClick: () => {}
    }
  },
  'INVALID_API_KEY': {
    code: 'INVALID_API_KEY',
    title: 'Invalid API Key',
    message: 'The API key for this provider is invalid or expired. Update it in Settings.',
    icon: <Key size={20} />,
    action: {
      label: 'Update API Key',
      path: '/settings'
    }
  },
  'QUOTA_EXCEEDED': {
    code: 'QUOTA_EXCEEDED',
    title: 'Quota Exceeded',
    message: 'You have exceeded your API quota. Check your provider dashboard or upgrade your plan.',
    icon: <AlertCircle size={20} />,
    action: {
      label: 'View Pricing',
      path: '/pricing'
    }
  },
  'NETWORK_ERROR': {
    code: 'NETWORK_ERROR',
    title: 'Connection Error',
    message: 'Unable to connect to the server. Check your internet connection and try again.',
    icon: <RefreshCw size={20} />,
    action: {
      label: 'Retry',
      onClick: () => window.location.reload()
    }
  }
};

function extractErrorCode(message: string): string | null {
  // Match patterns like "BYOK_KEY_MISSING:" or "Error: BYOK_KEY_MISSING"
  const patterns = [
    /([A-Z_]+):/,                    // BYOK_KEY_MISSING:
    /Error:\s*([A-Z_]+)/,            // Error: BYOK_KEY_MISSING
    /code[:\s]+["']?([A-Z_]+)/i,     // code: "BYOK_KEY_MISSING"
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && ERROR_GUIDANCE[match[1]]) {
      return match[1];
    }
  }

  // Check if message contains any known error code
  for (const code of Object.keys(ERROR_GUIDANCE)) {
    if (message.toUpperCase().includes(code)) {
      return code;
    }
  }

  return null;
}

interface ChatErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ChatErrorMessage({ message, onRetry }: ChatErrorMessageProps) {
  const errorCode = extractErrorCode(message);
  const guidance = errorCode ? ERROR_GUIDANCE[errorCode] : null;

  // If we have an onRetry handler, use it for retry actions
  const getActionHandler = (g: ErrorGuidance) => {
    if (g.action.onClick && onRetry && g.code === 'RATE_LIMIT') {
      return onRetry;
    }
    return g.action.onClick;
  };

  if (!guidance) {
    // Fallback for unknown errors
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-red-400 mt-0.5 flex-shrink-0" size={20} />
          <div className="flex-1 min-w-0">
            <h4 className="text-red-400 font-semibold">Something went wrong</h4>
            <p className="text-gray-300 mt-1 break-words">{message}</p>
            <p className="text-gray-400 text-sm mt-3">
              Need help?{' '}
              <Link to="/docs/troubleshooting" className="text-purple-400 hover:underline">
                View troubleshooting guide
              </Link>
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm transition-colors"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const actionHandler = getActionHandler(guidance);

  return (
    <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <span className="text-red-400 mt-0.5 flex-shrink-0">{guidance.icon}</span>
        <div className="flex-1 min-w-0">
          <h4 className="text-red-400 font-semibold">{guidance.title}</h4>
          <p className="text-gray-300 mt-1">{guidance.message}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {guidance.action.path ? (
              <Link
                to={guidance.action.path}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white text-sm transition-colors"
              >
                {guidance.action.label}
              </Link>
            ) : (
              <button
                onClick={actionHandler}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white text-sm transition-colors"
              >
                {guidance.action.label}
              </button>
            )}
            {onRetry && guidance.code !== 'RATE_LIMIT' && (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm transition-colors"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ErrorDisplay Component
 *
 * Displays error messages with provider-specific details and actionable guidance.
 * Handles different error codes with custom layouts.
 */

import { Link } from 'react-router-dom';
import './ErrorDisplay.css';

interface ProviderError {
  provider: string;
  error: string;
}

interface ErrorDetails {
  provider_errors?: ProviderError[];
  suggestion?: string;
  action?: string;
  settings_url?: string;
  login_url?: string;
  provider?: string;
}

interface ErrorDisplayProps {
  error: {
    code: string;
    message: string;
    details?: ErrorDetails;
  };
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  // ALL_PROVIDERS_FAILED - Show per-provider breakdown
  if (error.code === 'ALL_PROVIDERS_FAILED' && error.details?.provider_errors) {
    return (
      <div className="error-box error-all-failed">
        <div className="error-header">
          <span className="error-icon">❌</span>
          <h3>All Providers Failed</h3>
        </div>

        {error.details.suggestion && (
          <p className="error-suggestion">{error.details.suggestion}</p>
        )}

        <div className="provider-errors">
          <h4>Provider Details:</h4>
          <ul>
            {error.details.provider_errors.map((pe) => (
              <li key={pe.provider} className="provider-error-item">
                <strong className="provider-name">{pe.provider}:</strong>{' '}
                <span className="provider-error-message">{pe.error}</span>
              </li>
            ))}
          </ul>
        </div>

        {error.details.settings_url && (
          <div className="error-actions">
            <Link to={error.details.settings_url} className="btn-error-action">
              Configure API Keys in Settings →
            </Link>
          </div>
        )}
      </div>
    );
  }

  // NO_API_KEY - Missing API key for specific provider
  if (error.code === 'NO_API_KEY' || error.code === 'BYOK_KEY_MISSING') {
    return (
      <div className="error-box error-no-key">
        <div className="error-header">
          <span className="error-icon">🔑</span>
          <h3>API Key Required</h3>
        </div>

        <p className="error-message">{error.message}</p>

        {error.details?.provider && (
          <div className="error-hint">
            <p>
              To use <strong>{error.details.provider}</strong>, you need to add your API key:
            </p>
            <ol>
              <li>Get an API key from {error.details.provider}'s website</li>
              <li>Go to Settings → API Keys</li>
              <li>Paste your key and save</li>
            </ol>
          </div>
        )}

        {error.details?.settings_url && (
          <div className="error-actions">
            <Link to={error.details.settings_url} className="btn-error-action">
              Add API Key in Settings →
            </Link>
          </div>
        )}
      </div>
    );
  }

  // USER_ID_REQUIRED - Authentication issue
  if (error.code === 'USER_ID_REQUIRED') {
    return (
      <div className="error-box error-auth">
        <div className="error-header">
          <span className="error-icon">🔐</span>
          <h3>Authentication Required</h3>
        </div>

        <p className="error-message">{error.message}</p>

        {error.details?.login_url && (
          <div className="error-actions">
            <Link to={error.details.login_url} className="btn-error-action">
              Log In Again →
            </Link>
          </div>
        )}
      </div>
    );
  }

  // PLATFORM_KEY_MISSING - System error (critical)
  if (error.code === 'PLATFORM_KEY_MISSING') {
    return (
      <div className="error-box error-critical">
        <div className="error-header">
          <span className="error-icon">⚠️</span>
          <h3>System Error</h3>
        </div>

        <p className="error-message">{error.message}</p>

        <div className="error-hint">
          <p>
            This is a system configuration issue. Please contact support immediately.
          </p>
          <p className="error-code">Error Code: {error.code}</p>
        </div>

        <div className="error-actions">
          <a
            href="mailto:support@peoplemerit.com?subject=Platform Key Missing Error"
            className="btn-error-action"
          >
            Contact Support →
          </a>
        </div>
      </div>
    );
  }

  // BYOK_REQUIRED - Tier mismatch
  if (error.code === 'BYOK_REQUIRED') {
    return (
      <div className="error-box error-tier">
        <div className="error-header">
          <span className="error-icon">💡</span>
          <h3>BYOK Required</h3>
        </div>

        <p className="error-message">{error.message}</p>

        <div className="error-hint">
          <p>
            Your subscription tier requires you to provide your own API keys.
          </p>
        </div>

        <div className="error-actions">
          <Link to="/settings?tab=api-keys" className="btn-error-action">
            Configure API Keys →
          </Link>
        </div>
      </div>
    );
  }

  // Default error display for unknown error codes
  return (
    <div className="error-box error-generic">
      <div className="error-header">
        <span className="error-icon">⚠️</span>
        <h3>{error.code || 'Error'}</h3>
      </div>

      <p className="error-message">{error.message}</p>

      {error.details && (
        <details className="error-details">
          <summary>Technical Details</summary>
          <pre>{JSON.stringify(error.details, null, 2)}</pre>
        </details>
      )}
    </div>
  );
}

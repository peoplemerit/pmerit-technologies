/**
 * ProviderStatus Component
 *
 * Displays real-time status of AI providers (✅/❌ indicators).
 * Shows which providers are configured and when they were last updated.
 */

import { useEffect, useState } from 'react';
import { API_BASE } from '../lib/api';
import './ProviderStatus.css';

interface ProviderState {
  provider: string;
  status: 'configured' | 'missing';
  lastUpdated?: string;
}

interface ProviderStatusProps {
  /** Hide for Platform users (they don't need to configure keys) */
  show?: boolean;
}

export function ProviderStatus({ show = true }: ProviderStatusProps) {
  const [providers, setProviders] = useState<ProviderState[]>([
    { provider: 'anthropic', status: 'missing' },
    { provider: 'openai', status: 'missing' },
    { provider: 'google', status: 'missing' },
    { provider: 'deepseek', status: 'missing' },
  ]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!show) {
      setIsLoading(false);
      return;
    }

    async function checkProviders() {
      const token = localStorage.getItem('aixord_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api-keys`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          const configured = new Set(data.keys.map((k: any) => k.provider));

          setProviders(prev => prev.map(p => ({
            ...p,
            status: configured.has(p.provider) ? 'configured' : 'missing',
            lastUpdated: data.keys.find((k: any) => k.provider === p.provider)?.updated_at,
          })));
        }
      } catch (error) {
        console.error('[PROVIDER STATUS] Failed to fetch:', error);
      } finally {
        setIsLoading(false);
      }
    }

    checkProviders();

    // Refresh on key updates
    const handleUpdate = () => {
      setIsLoading(true);
      checkProviders();
    };

    window.addEventListener('api-keys-updated', handleUpdate);
    return () => window.removeEventListener('api-keys-updated', handleUpdate);
  }, [show]);

  if (!show) {
    return null;
  }

  return (
    <div className="provider-status">
      <h3>AI Provider Status</h3>

      {isLoading ? (
        <div className="status-loading">
          <span className="spinner">⏳</span> Loading provider status...
        </div>
      ) : (
        <div className="status-grid">
          {providers.map(p => (
            <div key={p.provider} className={`status-item status-${p.status}`}>
              <span className="status-icon">
                {p.status === 'configured' ? '✅' : '❌'}
              </span>
              <div className="status-details">
                <span className="status-name">{formatProviderName(p.provider)}</span>
                {p.lastUpdated && (
                  <span className="status-timestamp">
                    Updated {formatTimestamp(p.lastUpdated)}
                  </span>
                )}
                {p.status === 'missing' && (
                  <span className="status-hint">Not configured</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="status-help">
        <p>
          ℹ️ Add your API keys below to enable each provider.
        </p>
      </div>
    </div>
  );
}

function formatProviderName(provider: string): string {
  const names: Record<string, string> = {
    anthropic: 'Anthropic (Claude)',
    openai: 'OpenAI (GPT)',
    google: 'Google (Gemini)',
    deepseek: 'DeepSeek',
  };
  return names[provider] || provider;
}

function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

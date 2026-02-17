/**
 * User Settings Context
 *
 * Manages user subscription and API key settings across the app.
 * Settings are persisted to localStorage and synced with backend on load.
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { authApi } from '../lib/api';
import { API_BASE } from '../lib/api/config'; // Session 6: Unified config

// ============================================================================
// Types
// ============================================================================

export type SubscriptionTier = 'NONE' | 'TRIAL' | 'MANUSCRIPT_BYOK' | 'BYOK_STANDARD' | 'PLATFORM_STANDARD' | 'PLATFORM_PRO' | 'ENTERPRISE';
export type KeyMode = 'PLATFORM' | 'BYOK';
export type DefaultMode = 'ECONOMY' | 'BALANCED' | 'PREMIUM';

/**
 * Assistance Mode (PATCH-GITHUB-01)
 *
 * Controls the level of GitHub evidence visibility.
 * Governance is unchanged - only disclosure level changes.
 *
 * - GUIDED: Minimal visibility, evidence hidden by default
 * - ASSISTED: Moderate visibility, evidence shown when relevant
 * - EXPERT: Full visibility, all evidence always displayed
 */
export type AssistanceMode = 'GUIDED' | 'ASSISTED' | 'EXPERT';

export interface ApiKeys {
  anthropic?: string;
  openai?: string;
  google?: string;
  deepseek?: string;
}

/** Masked key previews and IDs from backend (HANDOFF-SECURITY-CRITICAL-01) */
export interface ApiKeyMeta {
  id: string;
  provider: string;
  key_preview: string;
}

export interface BillingInfo {
  periodEnd: string | null;
  stripeCustomerId: string | null;
}

export interface UserSettings {
  subscription: {
    tier: SubscriptionTier;
    keyMode: KeyMode;
    status: 'active' | 'cancelled' | 'expired' | 'past_due';
  };
  apiKeys: ApiKeys;
  preferences: {
    defaultMode: DefaultMode;
    showCosts: boolean;
    showMetadata: boolean;
    assistanceMode: AssistanceMode;  // PATCH-GITHUB-01
  };
}

interface UserSettingsContextType {
  settings: UserSettings;
  billingInfo: BillingInfo;
  apiKeyMetas: ApiKeyMeta[];  // HANDOFF-SECURITY-CRITICAL-01: masked previews
  updateSubscription: (tier: SubscriptionTier, keyMode: KeyMode) => void;
  updateApiKey: (provider: keyof ApiKeys, key: string) => void;
  removeApiKey: (provider: keyof ApiKeys) => void;
  updatePreferences: (prefs: Partial<UserSettings['preferences']>) => void;
  hasApiKey: (provider: keyof ApiKeys) => boolean;
  getActiveApiKey: () => { provider: string; key: string } | null;
  refreshSubscription: () => Promise<void>;
  refreshApiKeys: () => Promise<void>;  // HANDOFF-SECURITY-CRITICAL-01
  isLoading: boolean;
}

// ============================================================================
// Default Settings
// ============================================================================

const defaultSettings: UserSettings = {
  subscription: {
    tier: 'TRIAL',
    keyMode: 'PLATFORM',
    status: 'active',
  },
  apiKeys: {},
  preferences: {
    defaultMode: 'BALANCED',
    showCosts: true,
    showMetadata: true,
    assistanceMode: 'GUIDED',  // PATCH-GITHUB-01: Default to minimal visibility
  },
};

// ============================================================================
// Context
// ============================================================================

const UserSettingsContext = createContext<UserSettingsContextType | null>(null);

// ============================================================================
// Storage Helpers
// ============================================================================

const STORAGE_KEY = 'aixord_user_settings';

function loadSettings(userId: string): UserSettings {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load user settings:', error);
  }
  return defaultSettings;
}

function saveSettings(userId: string, settings: UserSettings): void {
  try {
    localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save user settings:', error);
  }
}

// ============================================================================
// Provider
// ============================================================================

const defaultBillingInfo: BillingInfo = {
  periodEnd: null,
  stripeCustomerId: null,
};

export function UserSettingsProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, token } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [billingInfo, setBillingInfo] = useState<BillingInfo>(defaultBillingInfo);
  const [apiKeyMetas, setApiKeyMetas] = useState<ApiKeyMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Fetch API keys from backend.
   * SECURITY (HANDOFF-SECURITY-CRITICAL-01):
   * Backend now returns masked key_preview instead of plaintext api_key.
   * We store both the preview metadata and a flag per provider indicating a key exists.
   */
  const fetchApiKeysFromBackend = async (): Promise<{ keys: ApiKeys; metas: ApiKeyMeta[] }> => {
    if (!token) return { keys: {}, metas: [] };

    try {
      // Session 6: Use unified API_BASE from config
      const response = await fetch(`${API_BASE}/api-keys`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.warn('[SETTINGS] Failed to fetch API keys from backend');
        return { keys: {}, metas: [] };
      }

      const data = await response.json();
      const keys: ApiKeys = {};
      const metas: ApiKeyMeta[] = [];

      for (const record of data.keys || []) {
        // Store the masked preview as a placeholder (indicates key exists)
        keys[record.provider as keyof ApiKeys] = record.key_preview || '***';
        metas.push({
          id: record.id,
          provider: record.provider,
          key_preview: record.key_preview || '***',
        });
      }

      console.log('[SETTINGS] Fetched API keys from backend:', Object.keys(keys));
      return { keys, metas };
    } catch (error) {
      console.error('[SETTINGS] Error fetching API keys:', error);
      return { keys: {}, metas: [] };
    }
  };

  // Fetch subscription from backend
  const refreshSubscription = async () => {
    if (!token) return;

    try {
      const sub = await authApi.getSubscription(token);

      // Update local settings with backend subscription data
      setSettings((prev) => ({
        ...prev,
        subscription: {
          tier: sub.tier as SubscriptionTier,
          keyMode: sub.keyMode,
          status: sub.status as UserSettings['subscription']['status'],
        },
      }));

      // Update billing info
      setBillingInfo({
        periodEnd: sub.periodEnd,
        stripeCustomerId: sub.stripeCustomerId,
      });
    } catch (error) {
      console.error('Failed to fetch subscription from backend:', error);
      // Fall back to localStorage on error
    }
  };

  // Load settings when user authenticates and sync with backend
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const loaded = loadSettings(user.id);
      setSettings(loaded);
      setIsLoading(false);

      // Sync subscription and API keys from backend (async, non-blocking)
      if (token) {
        refreshSubscription();

        // Sync API keys from backend (HANDOFF-SECURITY-CRITICAL-01: masked previews)
        fetchApiKeysFromBackend().then(({ keys: backendKeys, metas }) => {
          if (Object.keys(backendKeys).length > 0) {
            setSettings(prev => ({
              ...prev,
              apiKeys: { ...prev.apiKeys, ...backendKeys }
            }));
            setApiKeyMetas(metas);
            console.log('[SETTINGS] Synced API keys with backend');
          }
        });
      }
    } else if (!isAuthenticated) {
      setSettings(defaultSettings);
      setBillingInfo(defaultBillingInfo);
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id, token]);

  // Phase 1.2: Poll subscription status every 60 seconds
  // Ensures frontend reflects Stripe webhook tier changes (checkout, upgrade, cancel)
  // without requiring manual page refresh.
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const POLL_INTERVAL_MS = 60_000; // 60 seconds
    const intervalId = setInterval(() => {
      refreshSubscription().catch((err) => {
        console.warn('[SETTINGS] Subscription poll failed (will retry):', err);
      });
    }, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [isAuthenticated, token]);

  // Listen for API key updates (from Settings page save)
  useEffect(() => {
    const handleKeysUpdated = async () => {
      console.log('[SETTINGS] Keys updated event received, resyncing...');
      const { keys: backendKeys, metas } = await fetchApiKeysFromBackend();
      setSettings(prev => ({
        ...prev,
        apiKeys: backendKeys
      }));
      setApiKeyMetas(metas);
    };

    window.addEventListener('api-keys-updated', handleKeysUpdated);
    return () => window.removeEventListener('api-keys-updated', handleKeysUpdated);
  }, [token]);

  // Save settings when they change
  useEffect(() => {
    if (isAuthenticated && user?.id && !isLoading) {
      saveSettings(user.id, settings);
    }
  }, [settings, isAuthenticated, user?.id, isLoading]);

  const updateSubscription = (tier: SubscriptionTier, keyMode: KeyMode) => {
    setSettings((prev) => ({
      ...prev,
      subscription: {
        ...prev.subscription,
        tier,
        keyMode,
      },
    }));
  };

  const updateApiKey = (provider: keyof ApiKeys, key: string) => {
    setSettings((prev) => ({
      ...prev,
      apiKeys: {
        ...prev.apiKeys,
        [provider]: key,
      },
    }));
  };

  const removeApiKey = (provider: keyof ApiKeys) => {
    setSettings((prev) => {
      const newApiKeys = { ...prev.apiKeys };
      delete newApiKeys[provider];
      return {
        ...prev,
        apiKeys: newApiKeys,
      };
    });
  };

  const updatePreferences = (prefs: Partial<UserSettings['preferences']>) => {
    setSettings((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        ...prefs,
      },
    }));
  };

  const hasApiKey = (provider: keyof ApiKeys): boolean => {
    return !!settings.apiKeys[provider];
  };

  // Get the first available API key for BYOK mode
  const getActiveApiKey = (): { provider: string; key: string } | null => {
    const providers: (keyof ApiKeys)[] = ['anthropic', 'openai', 'google', 'deepseek'];
    for (const provider of providers) {
      const key = settings.apiKeys[provider];
      if (key) {
        return { provider, key };
      }
    }
    return null;
  };

  // HANDOFF-SECURITY-CRITICAL-01: Refresh API key metadata from backend
  const refreshApiKeys = async () => {
    const { keys: backendKeys, metas } = await fetchApiKeysFromBackend();
    setSettings(prev => ({
      ...prev,
      apiKeys: backendKeys
    }));
    setApiKeyMetas(metas);
  };

  return (
    <UserSettingsContext.Provider
      value={{
        settings,
        billingInfo,
        apiKeyMetas,
        updateSubscription,
        updateApiKey,
        removeApiKey,
        updatePreferences,
        hasApiKey,
        getActiveApiKey,
        refreshSubscription,
        refreshApiKeys,
        isLoading,
      }}
    >
      {children}
    </UserSettingsContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useUserSettings(): UserSettingsContextType {
  const context = useContext(UserSettingsContext);
  if (!context) {
    throw new Error('useUserSettings must be used within a UserSettingsProvider');
  }
  return context;
}

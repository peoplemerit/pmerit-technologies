/**
 * User Settings Context
 *
 * Manages user subscription and API key settings across the app.
 * Settings are persisted to localStorage and synced with backend on load.
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { authApi } from '../lib/api';

// ============================================================================
// Types
// ============================================================================

export type SubscriptionTier = 'TRIAL' | 'MANUSCRIPT_BYOK' | 'BYOK_STANDARD' | 'PLATFORM_STANDARD' | 'PLATFORM_PRO' | 'ENTERPRISE';
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
  updateSubscription: (tier: SubscriptionTier, keyMode: KeyMode) => void;
  updateApiKey: (provider: keyof ApiKeys, key: string) => void;
  removeApiKey: (provider: keyof ApiKeys) => void;
  updatePreferences: (prefs: Partial<UserSettings['preferences']>) => void;
  hasApiKey: (provider: keyof ApiKeys) => boolean;
  getActiveApiKey: () => { provider: string; key: string } | null;
  refreshSubscription: () => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(true);

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

  // Load settings when user authenticates
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const loaded = loadSettings(user.id);
      setSettings(loaded);
      setIsLoading(false);

      // Sync subscription from backend (async, non-blocking)
      if (token) {
        refreshSubscription();
      }
    } else if (!isAuthenticated) {
      setSettings(defaultSettings);
      setBillingInfo(defaultBillingInfo);
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id, token]);

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

  return (
    <UserSettingsContext.Provider
      value={{
        settings,
        billingInfo,
        updateSubscription,
        updateApiKey,
        removeApiKey,
        updatePreferences,
        hasApiKey,
        getActiveApiKey,
        refreshSubscription,
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

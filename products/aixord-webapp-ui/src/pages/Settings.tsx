/**
 * Settings Page (D6)
 *
 * User settings and configuration including:
 * - Subscription management
 * - API key configuration (BYOK)
 * - Chat preferences
 * - Account settings
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUserSettings, type SubscriptionTier, type ApiKeys, type AssistanceMode, type ApiKeyMeta } from '../contexts/UserSettingsContext';
import { billingApi, api, type UsageData, API_BASE } from '../lib/api';
import { UsageMeter } from '../components/UsageMeter';
import { TrialBanner } from '../components/TrialBanner';
import { ProviderStatus } from '../components/ProviderStatus';

// Price IDs for Stripe checkout — loaded from environment variables
const STRIPE_PRICES: Record<SubscriptionTier, string | null> = {
  NONE: null,
  TRIAL: null,
  MANUSCRIPT_BYOK: null,
  BYOK_STANDARD: import.meta.env.VITE_STRIPE_PRICE_BYOK_STANDARD || null,
  PLATFORM_STANDARD: import.meta.env.VITE_STRIPE_PRICE_PLATFORM_STANDARD || null,
  PLATFORM_PRO: import.meta.env.VITE_STRIPE_PRICE_PLATFORM_PRO || null,
  ENTERPRISE: null,
};

const TIER_INFO: Record<SubscriptionTier, { name: string; price: string; features: string[] }> = {
  NONE: {
    name: 'No Plan',
    price: 'Free',
    features: ['No AI access', 'Select a plan to get started']
  },
  TRIAL: {
    name: 'Trial',
    price: 'Free (14 days)',
    features: ['50 requests (14-day trial)', '1 project', 'Platform keys included', 'Expires after 14 days']
  },
  MANUSCRIPT_BYOK: {
    name: 'Manuscript (BYOK)',
    price: '$14.99 one-time',
    features: ['500 requests/month', '5 projects', 'BYOK only', '30-day audit retention', 'PDF guide included']
  },
  BYOK_STANDARD: {
    name: 'Standard (BYOK)',
    price: '$9.99/month',
    features: ['1000 requests/month', '10 projects', 'BYOK only', '90-day audit retention']
  },
  PLATFORM_STANDARD: {
    name: 'Standard',
    price: '$19.99/month',
    features: ['500 requests/month', '10 projects', 'Platform keys included', '90-day audit retention']
  },
  PLATFORM_PRO: {
    name: 'Pro',
    price: '$49.99/month',
    features: ['2000 requests/month', 'Unlimited projects', 'Platform keys included', '1-year audit retention', 'Priority support']
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 'Contact us',
    features: ['Unlimited requests', 'Unlimited projects', 'Custom integrations', 'Unlimited retention', 'Dedicated support']
  }
};

export function Settings() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { settings, billingInfo, apiKeyMetas, updateSubscription, updateApiKey, removeApiKey, updatePreferences, refreshSubscription, refreshApiKeys: _refreshApiKeys } = useUserSettings();
  const hasRedirected = useRef(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Redirect if not authenticated (one-time check after auth loading)
  useEffect(() => {
    if (!authLoading && !isAuthenticated && !hasRedirected.current) {
      hasRedirected.current = true;
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Check for successful checkout redirect
  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      setSaveMessage({ type: 'success', text: 'Subscription activated successfully! Your plan will be updated shortly.' });
      // Refresh subscription from backend to get updated tier
      refreshSubscription();
      // Clear the URL param
      navigate('/settings', { replace: true });
    } else if (searchParams.get('checkout') === 'cancelled') {
      setSaveMessage({ type: 'error', text: 'Checkout cancelled. No changes were made to your subscription.' });
      navigate('/settings', { replace: true });
    }
  }, [searchParams, navigate, refreshSubscription]);

  const [activeTab, setActiveTab] = useState<'subscription' | 'api-keys' | 'preferences' | 'account'>('subscription');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Billing modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemType, setRedeemType] = useState<'gumroad' | 'kdp'>('gumroad');
  const [isProcessing, setIsProcessing] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);

  // Usage data (H1/H2)
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [usageLoading, setUsageLoading] = useState(false);

  // Test API key state (P1.3)
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { valid: boolean; message: string }>>({});

  // Reveal key state (HANDOFF-SECURITY-CRITICAL-01)
  const [revealedKey, setRevealedKey] = useState<{
    id: string;
    key: string;
    provider: string;
  } | null>(null);
  // Track which providers are in "edit mode" (user wants to enter new key)
  const [editingProviders, setEditingProviders] = useState<Set<string>>(new Set());

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [passwordChangeMessage, setPasswordChangeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChangePassword = async () => {
    setPasswordChangeMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordChangeMessage({ type: 'error', text: 'All fields are required.' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordChangeMessage({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordChangeMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordChangeMessage({ type: 'error', text: 'New password must be different from current password.' });
      return;
    }

    setPasswordChangeLoading(true);
    try {
      const token = localStorage.getItem('aixord_token');
      const response = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await response.json() as { success?: boolean; message?: string; error?: string };

      if (response.ok && data.success) {
        setPasswordChangeMessage({ type: 'success', text: 'Password changed successfully. Redirecting to login...' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        // All sessions invalidated server-side — redirect to login after brief delay
        setTimeout(() => {
          localStorage.removeItem('aixord_token');
          localStorage.removeItem('aixord_user');
          window.location.href = '/login';
        }, 2000);
      } else {
        setPasswordChangeMessage({ type: 'error', text: data.error || 'Failed to change password.' });
      }
    } catch {
      setPasswordChangeMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  // Fetch usage data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setUsageLoading(true);
      const token = localStorage.getItem('token');
      if (token) {
        api.usage.current(token)
          .then(setUsageData)
          .catch(console.error)
          .finally(() => setUsageLoading(false));
      }
    }
  }, [isAuthenticated, user]);

  // API Key validation patterns — aligned to backend (HANDOFF-COPILOT-AUDIT-01)
  const API_KEY_PATTERNS: Record<string, RegExp> = {
    anthropic: /^sk-ant-api03-[a-zA-Z0-9_-]{32,}$/,
    openai: /^sk-[a-zA-Z0-9._-]{20,}$/,
    google: /^AIzaSy[a-zA-Z0-9_-]{30,}$/,
    deepseek: /^sk-[a-zA-Z0-9_-]{32,}$/,
  };

  const API_KEY_EXAMPLES: Record<string, string> = {
    anthropic: 'sk-ant-api03-...',
    openai: 'sk-proj-... or sk-...',
    google: 'AIzaSy...',
    deepseek: 'sk-...',
  };

  function validateApiKey(provider: string, key: string): { valid: boolean; error?: string } {
    if (!key || key.trim() === '') {
      return { valid: false, error: 'API key cannot be empty' };
    }

    const pattern = API_KEY_PATTERNS[provider as keyof typeof API_KEY_PATTERNS];
    if (!pattern) {
      return { valid: true }; // Unknown provider, skip validation
    }

    if (!pattern.test(key)) {
      const example = API_KEY_EXAMPLES[provider as keyof typeof API_KEY_EXAMPLES];
      return {
        valid: false,
        error: `Invalid ${provider} API key format. Should look like: ${example}`
      };
    }

    return { valid: true };
  }

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const token = localStorage.getItem('aixord_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Validate all keys before saving
      // HANDOFF-SECURITY-CRITICAL-01: Skip validation for saved-but-unchanged keys
      const validationErrors: string[] = [];
      const providers: (keyof ApiKeys)[] = ['anthropic', 'openai', 'google', 'deepseek'];

      for (const provider of providers) {
        const key = settings.apiKeys[provider];
        const meta = getKeyMeta(provider);
        const isSavedPreview = meta && key === meta.key_preview;

        // Only validate new/changed keys, not masked previews
        if (key && key.trim() !== '' && !isSavedPreview) {
          const validation = validateApiKey(provider, key);
          if (!validation.valid) {
            validationErrors.push(`${provider}: ${validation.error}`);
          }
        }
      }

      if (validationErrors.length > 0) {
        setSaveMessage({
          type: 'error',
          text: `Validation failed:\n${validationErrors.join('\n')}`
        });
        setIsSaving(false);
        return;
      }

      // Save API keys to backend for BYOK users
      // HANDOFF-SECURITY-CRITICAL-01: Skip providers with unchanged saved keys
      const savePromises = providers.map(async (provider) => {
        const key = settings.apiKeys[provider];
        const meta = getKeyMeta(provider);
        const isEditing = editingProviders.has(provider);
        const isSavedPreview = meta && key === meta.key_preview;

        // Skip if provider has saved key and user hasn't changed it
        if (meta && !isEditing && isSavedPreview) {
          return; // No change needed
        }

        // CASE 1: Empty key or editing with empty → DELETE
        if (!key || key.trim() === '') {
          const response = await fetch(`${API_BASE}/api-keys/${provider}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `Failed to delete ${provider} key`);
          }
        }
        // CASE 2: Non-empty new key → CREATE/UPDATE
        else if (!isSavedPreview) {
          const response = await fetch(`${API_BASE}/api-keys`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              provider,
              apiKey: key,
              label: `My ${provider.charAt(0).toUpperCase() + provider.slice(1)} Key`
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `Failed to save ${provider} key`);
          }
        }
      });

      await Promise.all(savePromises);

      // Clear editing state and refresh key metadata
      setEditingProviders(new Set());

      // Dispatch event to trigger cache invalidation and state refresh
      window.dispatchEvent(new Event('api-keys-updated'));

      setSaveMessage({ type: 'success', text: 'Settings saved successfully. Keys are now active!' });
    } catch (error) {
      console.error('Save error:', error);
      setSaveMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save settings'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleApiKeyChange = (provider: keyof ApiKeys, value: string) => {
    if (value) {
      updateApiKey(provider, value);
    } else {
      removeApiKey(provider);
    }
    // Clear test results when key changes
    setTestResults(prev => {
      const updated = { ...prev };
      delete updated[provider];
      return updated;
    });
  };

  /**
   * Test an API key against the provider's API
   * P1.3: Test API Key Endpoint (Frontend)
   */
  const handleTestKey = async (provider: string) => {
    const key = settings.apiKeys[provider as keyof ApiKeys];
    if (!key || key.trim() === '') {
      setTestResults(prev => ({
        ...prev,
        [provider]: { valid: false, message: `No ${provider} key entered` }
      }));
      return;
    }

    setTestingProvider(provider);
    setTestResults(prev => {
      const updated = { ...prev };
      delete updated[provider];
      return updated;
    });

    try {
      const token = localStorage.getItem('aixord_token');
      const response = await fetch(`${API_BASE}/api-keys/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider, apiKey: key }),
      });

      const result = await response.json();
      setTestResults(prev => ({
        ...prev,
        [provider]: {
          valid: result.valid,
          message: result.message || result.error || 'Test completed'
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [provider]: {
          valid: false,
          message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      }));
    } finally {
      setTestingProvider(null);
    }
  };

  /**
   * Reveal a saved API key with password re-authentication
   * HANDOFF-SECURITY-CRITICAL-01
   */
  const handleRevealKey = async (keyId: string) => {
    const password = prompt('Enter your password to view this API key:');
    if (!password) return;

    try {
      const token = localStorage.getItem('aixord_token');
      const response = await fetch(`${API_BASE}/api-keys/${keyId}/reveal`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to reveal API key');
        return;
      }

      const data = await response.json();
      setRevealedKey({
        id: keyId,
        key: data.api_key,
        provider: data.provider,
      });

      // Auto-hide after 30 seconds
      setTimeout(() => {
        setRevealedKey(null);
      }, 30000);
    } catch (error) {
      console.error('Reveal key error:', error);
      alert('Failed to reveal API key');
    }
  };

  /** Helper: get the key meta for a provider */
  const getKeyMeta = (provider: string): ApiKeyMeta | undefined => {
    return apiKeyMetas.find(m => m.provider === provider);
  };

  /** Check if a provider has a saved key on the backend */
  const hasSavedKey = (provider: string): boolean => {
    return apiKeyMetas.some(m => m.provider === provider);
  };

  const handlePreferenceChange = <K extends keyof typeof settings.preferences>(
    key: K,
    value: typeof settings.preferences[K]
  ) => {
    updatePreferences({ [key]: value });
  };

  const BYOK_TIERS = ['MANUSCRIPT_BYOK', 'BYOK_STANDARD'];
  const PLATFORM_TIERS = ['NONE', 'TRIAL', 'PLATFORM_STANDARD', 'PLATFORM_PRO', 'ENTERPRISE'];
  
  const isByokTier = BYOK_TIERS.includes(settings.subscription.tier);
  const isPlatformTier = PLATFORM_TIERS.includes(settings.subscription.tier);

  /**
   * Handle upgrade button click - opens modal to select plan
   */
  const handleUpgradeClick = (tier?: SubscriptionTier) => {
    if (tier) {
      setSelectedTier(tier);
    }
    setBillingError(null);
    setShowUpgradeModal(true);
  };

  /**
   * Handle subscription upgrade via Stripe checkout
   */
  const handleUpgrade = async () => {
    if (!selectedTier || !user?.id) return;

    const priceId = STRIPE_PRICES[selectedTier];
    if (!priceId) {
      if (selectedTier === 'MANUSCRIPT_BYOK') {
        // Redirect to Gumroad or show redeem modal
        setShowUpgradeModal(false);
        setShowRedeemModal(true);
        return;
      }
      if (selectedTier === 'ENTERPRISE') {
        // Open contact form or email
        window.open('mailto:enterprise@peoplemerit.com?subject=AIXORD Enterprise Inquiry', '_blank');
        return;
      }
      setBillingError('This plan cannot be purchased directly');
      return;
    }

    setIsProcessing(true);
    setBillingError(null);

    try {
      const { url } = await billingApi.createCheckout(
        user.id,
        priceId,
        `${window.location.origin}/settings?checkout=success`,
        `${window.location.origin}/settings?checkout=cancelled`
      );
      // Redirect to Stripe checkout
      window.location.href = url;
    } catch (err) {
      setBillingError(err instanceof Error ? err.message : 'Failed to start checkout');
      setIsProcessing(false);
    }
  };

  /**
   * Handle manage subscription - opens Stripe customer portal
   */
  const handleManageSubscription = async () => {
    if (!billingInfo.stripeCustomerId) {
      setSaveMessage({ type: 'error', text: 'No active subscription to manage' });
      return;
    }

    setIsProcessing(true);

    try {
      const { url } = await billingApi.createPortal(
        billingInfo.stripeCustomerId,
        `${window.location.origin}/settings`
      );
      // Redirect to Stripe customer portal
      window.location.href = url;
    } catch (err) {
      setSaveMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to open billing portal' });
      setIsProcessing(false);
    }
  };

  /**
   * Handle code redemption (Gumroad license or KDP book code)
   */
  const handleRedeemCode = async () => {
    if (!redeemCode.trim() || !user?.id) return;

    setIsProcessing(true);
    setBillingError(null);

    try {
      if (redeemType === 'gumroad') {
        const result = await billingApi.activateGumroad(user.id, redeemCode.trim());
        if (result.success) {
          updateSubscription(result.tier as SubscriptionTier, settings.subscription.keyMode);
          setShowRedeemModal(false);
          setRedeemCode('');
          setSaveMessage({ type: 'success', text: 'License activated successfully! You now have Manuscript (BYOK) access.' });
        }
      } else {
        const result = await billingApi.activateKdp(user.id, redeemCode.trim());
        if (result.success) {
          updateSubscription(result.tier as SubscriptionTier, settings.subscription.keyMode);
          setShowRedeemModal(false);
          setRedeemCode('');
          setSaveMessage({ type: 'success', text: 'Book code redeemed successfully! You now have Manuscript (BYOK) access.' });
        }
      }
    } catch (err) {
      setBillingError(err instanceof Error ? err.message : 'Failed to redeem code');
    } finally {
      setIsProcessing(false);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  // Don't render if not authenticated (redirect in progress)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* D-005 FIX: Header with back button */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
            <span className="text-gray-600">|</span>
            <span className="text-white">Settings</span>
          </div>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-gray-800/50 p-1 rounded-lg w-fit">
          {(['subscription', 'api-keys', 'preferences', 'account'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              {tab === 'api-keys' ? 'API Keys' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Subscription Tab */}
        {activeTab === 'subscription' && (
          <div className="space-y-6">
            {/* Trial Banner (H1) */}
            {usageData?.trial && (
              <TrialBanner
                daysLeft={usageData.trial.daysLeft}
                requestsRemaining={usageData.requests.remaining}
                requestsLimit={usageData.requests.limit}
              />
            )}

            {/* Current Plan */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <h2 className="text-lg font-semibold mb-4">Current Plan</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-violet-400">
                    {TIER_INFO[settings.subscription.tier].name}
                  </p>
                  <p className="text-gray-400">{TIER_INFO[settings.subscription.tier].price}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Status: <span className={
                      settings.subscription.status === 'active' ? 'text-green-400' :
                      settings.subscription.status === 'past_due' ? 'text-amber-400' : 'text-red-400'
                    }>{settings.subscription.status}</span>
                  </p>
                  {billingInfo.periodEnd && (
                    <p className="text-sm text-gray-500 mt-1">
                      {settings.subscription.status === 'active' ? 'Renews' : 'Expires'}: {new Date(billingInfo.periodEnd).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {billingInfo.stripeCustomerId && (
                    <button
                      onClick={handleManageSubscription}
                      disabled={isProcessing}
                      className="px-4 py-2 border border-gray-600 hover:border-gray-500 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      Manage
                    </button>
                  )}
                  <button
                    onClick={() => handleUpgradeClick()}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    Upgrade Plan
                  </button>
                </div>
              </div>
            </div>

            {/* Usage This Period (H2) */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <h2 className="text-lg font-semibold mb-4">Usage This Period</h2>
              {usageLoading ? (
                <div className="animate-pulse">
                  <div className="h-2 bg-gray-700 rounded w-full mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                </div>
              ) : usageData ? (
                <>
                  <UsageMeter
                    used={usageData.requests.used}
                    limit={usageData.requests.limit}
                    label="AI Requests"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Period: {usageData.period} • Resets on the 1st of next month
                  </p>
                  {usageData.estimatedCostCents > 0 && (
                    <p className="text-sm text-gray-500">
                      Estimated cost: ${(usageData.estimatedCostCents / 100).toFixed(2)}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-gray-500 text-sm">Unable to load usage data</p>
              )}
            </div>

            {/* Redeem Code Section */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <h2 className="text-lg font-semibold mb-4">Redeem Code</h2>
              <p className="text-sm text-gray-400 mb-4">
                Have a Gumroad license key or KDP book code? Redeem it here.
              </p>
              <button
                onClick={() => {
                  setBillingError(null);
                  setShowRedeemModal(true);
                }}
                className="px-4 py-2 border border-violet-500 text-violet-400 hover:bg-violet-500/10 rounded-lg text-sm font-medium transition-colors"
              >
                Redeem a Code
              </button>
            </div>

            {/* Plan Features */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <h2 className="text-lg font-semibold mb-4">Plan Features</h2>
              <ul className="space-y-2">
                {TIER_INFO[settings.subscription.tier].features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-300">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Available Plans */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <h2 className="text-lg font-semibold mb-4">Available Plans</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Object.entries(TIER_INFO) as [SubscriptionTier, typeof TIER_INFO[SubscriptionTier]][]).map(([tier, info]) => {
                  const isCurrent = tier === settings.subscription.tier;
                  const canUpgrade = !isCurrent && tier !== 'TRIAL';

                  return (
                    <div
                      key={tier}
                      onClick={() => canUpgrade && handleUpgradeClick(tier)}
                      className={`p-4 rounded-lg border transition-all ${
                        isCurrent
                          ? 'border-violet-500 bg-violet-500/10'
                          : canUpgrade
                            ? 'border-gray-700 hover:border-violet-500 hover:bg-violet-500/5 cursor-pointer'
                            : 'border-gray-700 opacity-60'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{info.name}</h3>
                          <p className="text-sm text-gray-400">{info.price}</p>
                        </div>
                        {isCurrent ? (
                          <span className="px-2 py-1 text-xs bg-violet-500 rounded">Current</span>
                        ) : canUpgrade ? (
                          <span className="px-2 py-1 text-xs border border-violet-500 text-violet-400 rounded">Select</span>
                        ) : null}
                      </div>
                      <ul className="text-xs text-gray-500 space-y-1">
                        {info.features.slice(0, 3).map((f, i) => (
                          <li key={i}>• {f}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* API Keys Tab */}
        {activeTab === 'api-keys' && (
          <div className="space-y-6">
            {/* Tier-Aware Messaging */}
            {isPlatformTier && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">✅</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-300 mb-1">Platform Keys Included</h3>
                    <p className="text-sm text-green-200/80">
                      Your <strong>{TIER_INFO[settings.subscription.tier].name}</strong> plan includes fully-managed API keys from PMERIT.
                      You don't need to configure anything – all AI providers are ready to use immediately.
                    </p>
                    <p className="text-xs text-green-200/60 mt-2">
                      Want to use your own keys instead? You can optionally add them below.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isByokTier && (
              <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🔑</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-violet-300 mb-1">BYOK Required</h3>
                    <p className="text-sm text-violet-200/80">
                      Your <strong>{TIER_INFO[settings.subscription.tier].name}</strong> plan requires you to bring your own API keys.
                      Add at least one provider key below to start using AIXORD.
                    </p>
                    <p className="text-xs text-violet-200/60 mt-2">
                      Get API keys from: <a href="https://console.anthropic.com" target="_blank" rel="noopener" className="underline">Anthropic</a> • <a href="https://platform.openai.com" target="_blank" rel="noopener" className="underline">OpenAI</a> • <a href="https://makersuite.google.com" target="_blank" rel="noopener" className="underline">Google</a> • <a href="https://platform.deepseek.com" target="_blank" rel="noopener" className="underline">DeepSeek</a>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Provider Status Dashboard (only for BYOK) */}
            <ProviderStatus show={isByokTier} />

            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <h2 className="text-lg font-semibold mb-4">API Keys</h2>
              <p className="text-sm text-gray-400 mb-6">
                Your API keys are encrypted and stored securely. We never share your keys with third parties.
              </p>

              <div className="space-y-4">
                {/* HANDOFF-SECURITY-CRITICAL-01: Data-driven provider key sections */}
                {([
                  { provider: 'anthropic' as keyof ApiKeys, label: 'Anthropic API Key', placeholder: 'sk-ant-...', description: 'For Claude models (Opus, Sonnet, Haiku)' },
                  { provider: 'openai' as keyof ApiKeys, label: 'OpenAI API Key', placeholder: 'sk-...', description: 'For GPT-4o, GPT-4.5 models' },
                  { provider: 'google' as keyof ApiKeys, label: 'Google AI API Key', placeholder: 'AIza...', description: 'For Gemini models' },
                  { provider: 'deepseek' as keyof ApiKeys, label: 'DeepSeek API Key', placeholder: 'sk-...', description: 'For DeepSeek models (ultra-cheap option)' },
                ]).map(({ provider, label, placeholder, description }) => {
                  const meta = getKeyMeta(provider);
                  const saved = hasSavedKey(provider);
                  const isEditing = editingProviders.has(provider);

                  return (
                    <div key={provider}>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        {label}
                      </label>

                      {/* Saved key: show masked preview (SECURITY) */}
                      {saved && !isEditing ? (
                        <div className="flex gap-2 items-center">
                          <div className="flex-1 px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg">
                            <code className="text-sm text-gray-400 font-mono">
                              {meta?.key_preview || '***'}
                            </code>
                          </div>
                          <button
                            onClick={() => meta && handleRevealKey(meta.id)}
                            className="px-3 py-2 text-xs text-violet-400 hover:text-violet-300 border border-violet-500/30 rounded-lg hover:bg-violet-500/10 transition-colors"
                          >
                            View
                          </button>
                          <button
                            onClick={() => {
                              setEditingProviders(prev => new Set([...prev, provider]));
                              updateApiKey(provider, '');
                            }}
                            className="px-3 py-2 text-xs text-gray-400 hover:text-white border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-colors"
                          >
                            Change
                          </button>
                        </div>
                      ) : (
                        /* No saved key or editing: show input */
                        <div className="flex gap-2">
                          <input
                            type="password"
                            value={isEditing ? (settings.apiKeys[provider] || '') : (settings.apiKeys[provider] || '')}
                            onChange={(e) => handleApiKeyChange(provider, e.target.value)}
                            placeholder={placeholder}
                            className="flex-1 px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                          />
                          <button
                            onClick={() => handleTestKey(provider)}
                            disabled={testingProvider === provider || !settings.apiKeys[provider]}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            {testingProvider === provider ? 'Testing...' : 'Test'}
                          </button>
                          {isEditing && (
                            <button
                              onClick={() => {
                                setEditingProviders(prev => {
                                  const next = new Set(prev);
                                  next.delete(provider);
                                  return next;
                                });
                                // Restore preview value
                                if (meta) {
                                  updateApiKey(provider, meta.key_preview);
                                }
                              }}
                              className="px-3 py-2 text-xs text-gray-400 hover:text-white border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      )}

                      {testResults[provider] && (
                        <div className={`mt-2 p-2 rounded-lg text-sm ${testResults[provider].valid ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                          {testResults[provider].valid ? '✅' : '❌'} {testResults[provider].message}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1">{description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <h2 className="text-lg font-semibold mb-4">Chat Preferences</h2>

              <div className="space-y-6">
                {/* Default Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Default Chat Mode
                  </label>
                  <div className="flex gap-2">
                    {(['ECONOMY', 'BALANCED', 'PREMIUM'] as const).map(mode => (
                      <button
                        key={mode}
                        onClick={() => handlePreferenceChange('defaultMode', mode)}
                        className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${
                          settings.preferences.defaultMode === mode
                            ? 'border-violet-500 bg-violet-500/20 text-violet-300'
                            : 'border-gray-700 hover:border-gray-600 text-gray-400'
                        }`}
                      >
                        <div className="text-lg mb-1">
                          {mode === 'ECONOMY' && '$'}
                          {mode === 'BALANCED' && '='}
                          {mode === 'PREMIUM' && '*'}
                        </div>
                        <div className="text-sm font-medium">{mode}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggle Options */}
                <div className="space-y-4">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="font-medium">Show Costs</p>
                      <p className="text-sm text-gray-500">Display cost per message</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.preferences.showCosts}
                      onChange={(e) => handlePreferenceChange('showCosts', e.target.checked)}
                      className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-violet-500 focus:ring-violet-500"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="font-medium">Show Metadata</p>
                      <p className="text-sm text-gray-500">Display model info and latency</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.preferences.showMetadata}
                      onChange={(e) => handlePreferenceChange('showMetadata', e.target.checked)}
                      className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-violet-500 focus:ring-violet-500"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Assistance Mode (PATCH-GITHUB-01) */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <h2 className="text-lg font-semibold mb-2">GitHub Evidence Visibility</h2>
              <p className="text-sm text-gray-400 mb-4">
                Controls how much GitHub evidence is shown in your projects. Governance rules remain unchanged regardless of this setting.
              </p>

              <div className="space-y-3">
                {([
                  {
                    mode: 'GUIDED' as AssistanceMode,
                    title: 'Guided',
                    description: 'Minimal visibility. Evidence hidden by default, shown only when you explicitly request it.',
                    icon: '🎯'
                  },
                  {
                    mode: 'ASSISTED' as AssistanceMode,
                    title: 'Assisted',
                    description: 'Moderate visibility. Evidence displayed when relevant to your current task.',
                    icon: '🔍'
                  },
                  {
                    mode: 'EXPERT' as AssistanceMode,
                    title: 'Expert',
                    description: 'Full visibility. All GitHub evidence always visible in the Evidence panel.',
                    icon: '📊'
                  }
                ]).map(({ mode, title, description, icon }) => (
                  <button
                    key={mode}
                    onClick={() => handlePreferenceChange('assistanceMode', mode)}
                    className={`w-full p-4 rounded-lg border text-left transition-all ${
                      settings.preferences.assistanceMode === mode
                        ? 'border-violet-500 bg-violet-500/20'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-white">{title}</h3>
                          {settings.preferences.assistanceMode === mode && (
                            <span className="text-xs px-2 py-0.5 bg-violet-500 rounded text-white">Active</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mt-1">{description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <p className="text-xs text-gray-500 mt-4">
                Note: Evidence is read-only and informs the Reconciliation Triad. It cannot override your project decisions.
              </p>
            </div>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <h2 className="text-lg font-semibold mb-4">Account Information</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Email</label>
                  <p className="text-white">{user?.email || 'Not logged in'}</p>
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-1">Email Status</label>
                  <div className="flex items-center gap-2">
                    {user?.emailVerified ? (
                      <span className="text-green-400">✓ Verified</span>
                    ) : (
                      <span className="text-amber-400">⚠️ Not verified</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-1">User ID</label>
                  <p className="text-white font-mono text-sm">{user?.id || '—'}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <h2 className="text-lg font-semibold mb-4">Change Password</h2>

              {passwordChangeMessage && (
                <div className={`mb-4 p-3 rounded-lg border ${
                  passwordChangeMessage.type === 'success'
                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                  <p className="text-sm">{passwordChangeMessage.text}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none"
                    placeholder="Enter your current password"
                    autoComplete="current-password"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none"
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none"
                    placeholder="Re-enter your new password"
                    autoComplete="new-password"
                  />
                </div>

                <button
                  onClick={handleChangePassword}
                  disabled={passwordChangeLoading || !currentPassword || !newPassword || !confirmPassword}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-white transition-colors flex items-center gap-2"
                >
                  {passwordChangeLoading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Changing...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </button>

                <p className="text-xs text-gray-500">
                  You will be logged out after changing your password.
                </p>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <h2 className="text-lg font-semibold mb-4">Danger Zone</h2>

              <div className="space-y-4">
                <button className="px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-sm font-medium transition-colors">
                  Export All Data
                </button>

                <button className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-medium transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-8 flex items-center justify-between">
          {saveMessage && (
            <p className={`text-sm ${saveMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {saveMessage.text}
            </p>
          )}
          {/* D-008 FIX: Enhanced visual feedback with spinner and success state */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`ml-auto px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              saveMessage?.type === 'success'
                ? 'bg-green-600 hover:bg-green-500'
                : 'bg-violet-600 hover:bg-violet-500'
            } disabled:opacity-50`}
          >
            {isSaving ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : saveMessage?.type === 'success' ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved!
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>

      {/* Upgrade Plan Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-md w-full p-6 my-auto flex flex-col max-h-[calc(100vh-2rem)]">
            {/* Header — sticky */}
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h2 className="text-xl font-semibold text-white">Upgrade Your Plan</h2>
              <button
                onClick={() => {
                  setShowUpgradeModal(false);
                  setSelectedTier(null);
                  setBillingError(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {billingError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 shrink-0">
                <p className="text-red-400 text-sm">{billingError}</p>
              </div>
            )}

            {/* Plan selector — scrollable */}
            <div className="space-y-3 mb-6 overflow-y-auto min-h-0 flex-1">
              {(Object.entries(TIER_INFO) as [SubscriptionTier, typeof TIER_INFO[SubscriptionTier]][])
                .filter(([tier]) => tier !== 'TRIAL' && tier !== settings.subscription.tier)
                .map(([tier, info]) => (
                  <button
                    key={tier}
                    onClick={() => setSelectedTier(tier)}
                    className={`w-full p-4 rounded-lg border text-left transition-all ${
                      selectedTier === tier
                        ? 'border-violet-500 bg-violet-500/20'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-white">{info.name}</h3>
                        <p className="text-sm text-gray-400">{info.price}</p>
                      </div>
                      {selectedTier === tier && (
                        <svg className="w-5 h-5 text-violet-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <ul className="text-xs text-gray-500 mt-2 space-y-1">
                      {info.features.slice(0, 2).map((f, i) => (
                        <li key={i}>• {f}</li>
                      ))}
                    </ul>
                  </button>
                ))}
            </div>

            {/* Buttons — always visible at bottom */}
            <div className="flex gap-3 shrink-0 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowUpgradeModal(false);
                  setSelectedTier(null);
                }}
                className="flex-1 px-4 py-3 border border-gray-700 text-gray-300 rounded-lg hover:border-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpgrade}
                disabled={!selectedTier || isProcessing}
                className="flex-1 px-4 py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 text-white rounded-lg font-medium transition-colors"
              >
                {isProcessing ? 'Processing...' : 'Continue to Checkout'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reveal Key Modal (HANDOFF-SECURITY-CRITICAL-01) */}
      {revealedKey && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-lg w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-white">
                API Key Revealed
              </h3>
              <button
                onClick={() => setRevealedKey(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-2">
                Provider: <span className="text-white capitalize">{revealedKey.provider}</span>
              </div>
              <div className="bg-gray-900 rounded-lg p-3 break-all border border-gray-700">
                <code className="text-sm text-green-400 font-mono">
                  {revealedKey.key}
                </code>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(revealedKey.key);
                  alert('API key copied to clipboard');
                }}
                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-500 text-sm font-medium transition-colors"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={() => setRevealedKey(null)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              This key will auto-hide in 30 seconds. Copy it now if needed.
            </div>
          </div>
        </div>
      )}

      {/* Redeem Code Modal */}
      {showRedeemModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Redeem a Code</h2>
              <button
                onClick={() => {
                  setShowRedeemModal(false);
                  setRedeemCode('');
                  setBillingError(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {billingError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
                <p className="text-red-400 text-sm">{billingError}</p>
              </div>
            )}

            {/* Code type selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Code Type
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setRedeemType('gumroad')}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                    redeemType === 'gumroad'
                      ? 'border-violet-500 bg-violet-500/20 text-violet-300'
                      : 'border-gray-700 hover:border-gray-600 text-gray-400'
                  }`}
                >
                  Gumroad License
                </button>
                <button
                  onClick={() => setRedeemType('kdp')}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                    redeemType === 'kdp'
                      ? 'border-violet-500 bg-violet-500/20 text-violet-300'
                      : 'border-gray-700 hover:border-gray-600 text-gray-400'
                  }`}
                >
                  KDP Book Code
                </button>
              </div>
            </div>

            {/* Code input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {redeemType === 'gumroad' ? 'License Key' : 'Book Code'}
              </label>
              <input
                type="text"
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value)}
                placeholder={redeemType === 'gumroad' ? 'XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX' : 'AIXORD-XXXX-XXXX-XXXX'}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors font-mono"
              />
              <p className="text-xs text-gray-500 mt-2">
                {redeemType === 'gumroad'
                  ? 'Enter your Gumroad license key from your purchase confirmation email.'
                  : 'Enter the code from the back of your AIXORD book.'}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowRedeemModal(false);
                  setRedeemCode('');
                }}
                className="flex-1 px-4 py-3 border border-gray-700 text-gray-300 rounded-lg hover:border-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRedeemCode}
                disabled={!redeemCode.trim() || isProcessing}
                className="flex-1 px-4 py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 text-white rounded-lg font-medium transition-colors"
              >
                {isProcessing ? 'Redeeming...' : 'Redeem Code'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;

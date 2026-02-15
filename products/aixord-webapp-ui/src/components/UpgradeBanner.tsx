/**
 * Upgrade Banner Component
 *
 * Shows contextual upgrade prompts based on usage limits.
 * Displays when users are approaching or have exceeded their limits.
 */

import { Link } from 'react-router-dom';
import { useUserSettings, type SubscriptionTier } from '../contexts/UserSettingsContext';

interface UpgradeBannerProps {
  /** Usage percentage (0-100) */
  usagePercent?: number;
  /** Whether the user has hit their limit */
  limitReached?: boolean;
  /** Specific feature to highlight */
  feature?: 'requests' | 'projects' | 'retention';
  /** Compact mode for smaller spaces */
  compact?: boolean;
  /** Custom class name */
  className?: string;
}

const UPGRADE_PATH: Record<SubscriptionTier, SubscriptionTier | null> = {
  NONE: 'TRIAL',
  TRIAL: 'BYOK_STANDARD',
  MANUSCRIPT_BYOK: 'BYOK_STANDARD',
  BYOK_STANDARD: 'PLATFORM_STANDARD',
  PLATFORM_STANDARD: 'PLATFORM_PRO',
  PLATFORM_PRO: 'ENTERPRISE',
  ENTERPRISE: null,
};

const TIER_NAMES: Record<SubscriptionTier, string> = {
  NONE: 'No Plan',
  TRIAL: 'Free Trial',
  MANUSCRIPT_BYOK: 'Manuscript',
  BYOK_STANDARD: 'Standard (BYOK)',
  PLATFORM_STANDARD: 'Standard',
  PLATFORM_PRO: 'Pro',
  ENTERPRISE: 'Enterprise',
};

export function UpgradeBanner({
  usagePercent,
  limitReached = false,
  feature = 'requests',
  compact = false,
  className = '',
}: UpgradeBannerProps) {
  const { settings } = useUserSettings();
  const currentTier = settings.subscription.tier;
  const nextTier = UPGRADE_PATH[currentTier];

  // Don't show for Enterprise users
  if (!nextTier) return null;

  // Don't show if usage is low
  if (!limitReached && usagePercent !== undefined && usagePercent < 80) return null;

  const isWarning = !limitReached && usagePercent !== undefined && usagePercent >= 80;
  const isError = limitReached;

  const getMessage = () => {
    if (limitReached) {
      switch (feature) {
        case 'requests':
          return "You've reached your monthly request limit.";
        case 'projects':
          return "You've reached your project limit.";
        case 'retention':
          return 'Audit logs older than your retention period will be deleted.';
        default:
          return "You've reached your plan limit.";
      }
    }

    if (usagePercent !== undefined && usagePercent >= 80) {
      return `You've used ${usagePercent}% of your monthly ${feature}.`;
    }

    return `Upgrade to ${TIER_NAMES[nextTier]} for more features.`;
  };

  if (compact) {
    return (
      <div
        className={`flex items-center gap-2 text-sm ${
          isError
            ? 'text-red-400'
            : isWarning
            ? 'text-amber-400'
            : 'text-violet-400'
        } ${className}`}
      >
        {isError && (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        )}
        {isWarning && (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
        <span>{getMessage()}</span>
        <Link to="/pricing" className="underline hover:no-underline">
          Upgrade
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg p-4 ${
        isError
          ? 'bg-red-500/10 border border-red-500/20'
          : isWarning
          ? 'bg-amber-500/10 border border-amber-500/20'
          : 'bg-violet-500/10 border border-violet-500/20'
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {isError && (
            <svg
              className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          )}
          {isWarning && (
            <svg
              className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
          {!isError && !isWarning && (
            <svg
              className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          )}
          <div>
            <p
              className={`font-medium ${
                isError ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-violet-400'
              }`}
            >
              {getMessage()}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Upgrade to {TIER_NAMES[nextTier]} to continue using AIXORD without interruption.
            </p>
          </div>
        </div>
        <Link
          to="/pricing"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0 ${
            isError
              ? 'bg-red-600 hover:bg-red-500 text-white'
              : isWarning
              ? 'bg-amber-600 hover:bg-amber-500 text-white'
              : 'bg-violet-600 hover:bg-violet-500 text-white'
          }`}
        >
          Upgrade Now
        </Link>
      </div>
    </div>
  );
}

/**
 * Usage Progress Bar
 *
 * Shows visual progress of usage limits.
 */
export function UsageProgressBar({
  used,
  limit,
  label,
  className = '',
}: {
  used: number;
  limit: number;
  label: string;
  className?: string;
}) {
  const percent = Math.min((used / limit) * 100, 100);
  const isWarning = percent >= 80;
  const isError = percent >= 100;

  return (
    <div className={className}>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-400">{label}</span>
        <span
          className={`font-medium ${
            isError ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-gray-300'
          }`}
        >
          {used.toLocaleString()} / {limit.toLocaleString()}
        </span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isError ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-violet-500'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

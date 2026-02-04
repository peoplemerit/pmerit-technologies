/**
 * Trial Banner Component (H1)
 *
 * Shows trial expiration warning when < 7 days remain
 * Per HANDOFF-D4-COMPREHENSIVE-V12
 */

import { Link } from 'react-router-dom';

interface TrialBannerProps {
  daysLeft: number;
  requestsRemaining: number;
  requestsLimit: number;
}

export function TrialBanner({ daysLeft, requestsRemaining, requestsLimit }: TrialBannerProps) {
  // Only show when < 7 days left
  if (daysLeft > 7) return null;

  const urgent = daysLeft <= 3;

  return (
    <div className={`px-4 py-3 rounded-lg mb-4 ${urgent ? 'bg-red-900/40 border border-red-500/50' : 'bg-yellow-900/40 border border-yellow-500/50'}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`font-medium ${urgent ? 'text-red-300' : 'text-yellow-300'}`}>
            {daysLeft === 0 ? 'Trial expires today' : `Trial expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {requestsRemaining} of {requestsLimit} requests remaining
          </p>
        </div>
        <Link
          to="/pricing"
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Upgrade Now
        </Link>
      </div>
    </div>
  );
}

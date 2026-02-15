/**
 * Pricing Page
 *
 * Public pricing page showing all subscription tiers.
 * Allows users to compare plans and start checkout.
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUserSettings, type SubscriptionTier } from '../contexts/UserSettingsContext';
import { billingApi } from '../lib/api';

// Price IDs from Stripe Dashboard (Production)
// AIXORD Standard (BYOK): $9.99/month
// AIXORD Standard: $19.99/month
// AIXORD Pro: $49.99/month
const STRIPE_PRICES: Record<SubscriptionTier, string | null> = {
  NONE: null,
  TRIAL: null,
  MANUSCRIPT_BYOK: null, // One-time purchase via Gumroad
  BYOK_STANDARD: import.meta.env.VITE_STRIPE_PRICE_BYOK_STANDARD || 'price_1SwVtL1Uy2Gsjci2w3a8b5hX',
  PLATFORM_STANDARD: import.meta.env.VITE_STRIPE_PRICE_PLATFORM_STANDARD || 'price_1SwVsN1Uy2Gsjci2CHVecrv9',
  PLATFORM_PRO: import.meta.env.VITE_STRIPE_PRICE_PLATFORM_PRO || 'price_1SwVq61Uy2Gsjci2Wd6gxdAe',
  ENTERPRISE: null,
};

interface PlanInfo {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
  tier: SubscriptionTier;
}

const PLANS: PlanInfo[] = [
  {
    tier: 'TRIAL',
    name: 'Free Trial',
    price: '$0',
    period: 'forever',
    description: 'Get started with AIXORD governance',
    cta: 'Start Free',
    features: [
      '50 AI requests/month',
      '1 project',
      'Platform API keys included',
      '14-day trial period',
      'Community support',
    ],
  },
  {
    tier: 'MANUSCRIPT_BYOK',
    name: 'Manuscript',
    price: '$14.99',
    period: 'one-time',
    description: 'Perfect for readers of the AIXORD book',
    cta: 'Redeem Code',
    features: [
      '500 AI requests/month',
      '5 projects',
      'Bring Your Own Keys (BYOK)',
      '30-day audit retention',
      'PDF governance guide included',
      'Email support',
    ],
  },
  {
    tier: 'BYOK_STANDARD',
    name: 'Standard (BYOK)',
    price: '$9.99',
    period: '/month',
    description: 'For individuals who have their own API keys',
    cta: 'Subscribe',
    features: [
      '1,000 AI requests/month',
      '10 projects',
      'Bring Your Own Keys (BYOK)',
      '90-day audit retention',
      'Email support',
    ],
  },
  {
    tier: 'PLATFORM_STANDARD',
    name: 'Standard',
    price: '$19.99',
    period: '/month',
    description: 'All-inclusive with platform-provided keys',
    cta: 'Subscribe',
    highlighted: true,
    features: [
      '500 AI requests/month',
      '10 projects',
      'Platform API keys included',
      '90-day audit retention',
      'No API key setup needed',
      'Priority email support',
    ],
  },
  {
    tier: 'PLATFORM_PRO',
    name: 'Pro',
    price: '$49.99',
    period: '/month',
    description: 'For power users and teams',
    cta: 'Subscribe',
    features: [
      '2,000 AI requests/month',
      'Unlimited projects',
      'Platform API keys included',
      '1-year audit retention',
      'Advanced analytics',
      'Priority support',
    ],
  },
  {
    tier: 'ENTERPRISE',
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact us',
    description: 'For organizations with custom needs',
    cta: 'Contact Sales',
    features: [
      'Unlimited AI requests',
      'Unlimited projects',
      'Custom integrations',
      'Unlimited audit retention',
      'SSO & SAML',
      'Dedicated support',
      'Custom SLA',
    ],
  },
];

export function Pricing() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { settings } = useUserSettings();
  const [isProcessing, setIsProcessing] = useState<SubscriptionTier | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelectPlan = async (plan: PlanInfo) => {
    setError(null);

    // Handle different plan types
    if (plan.tier === 'TRIAL') {
      if (!isAuthenticated) {
        navigate('/signup');
        return;
      }
      // Authenticated user: activate Free Trial via explicit endpoint
      setIsProcessing('TRIAL');
      try {
        await billingApi.activateTrial();
        // Refresh settings to pick up new tier
        window.location.href = '/dashboard';
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to activate trial');
        setIsProcessing(null);
      }
      return;
    }

    if (plan.tier === 'MANUSCRIPT_BYOK') {
      if (isAuthenticated) {
        navigate('/settings?tab=subscription&redeem=true');
      } else {
        // Open Gumroad purchase page
        window.open('https://peoplemerit.gumroad.com/l/aixord', '_blank');
      }
      return;
    }

    if (plan.tier === 'ENTERPRISE') {
      window.open('mailto:enterprise@peoplemerit.com?subject=AIXORD Enterprise Inquiry', '_blank');
      return;
    }

    // Stripe checkout for other plans
    if (!isAuthenticated) {
      navigate('/signup?redirect=/pricing');
      return;
    }

    const priceId = STRIPE_PRICES[plan.tier];
    if (!priceId) {
      setError('This plan is not available for direct purchase');
      return;
    }

    setIsProcessing(plan.tier);

    try {
      const { url } = await billingApi.createCheckout(
        user!.id,
        priceId,
        `${window.location.origin}/settings?checkout=success`,
        `${window.location.origin}/pricing?checkout=cancelled`
      );
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
      setIsProcessing(null);
    }
  };

  const currentTier = isAuthenticated ? settings.subscription.tier : null;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center font-bold">
              A
            </div>
            <span className="text-xl font-bold">AIXORD</span>
          </Link>
          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                  Dashboard
                </Link>
                <Link to="/settings" className="text-gray-400 hover:text-white transition-colors">
                  Settings
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-400 hover:text-white transition-colors">
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg font-medium transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Choose the plan that fits your needs. All plans include full AIXORD governance.
          </p>
          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
              {error}
            </div>
          )}
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.tier}
                className={`relative rounded-2xl p-6 ${
                  plan.highlighted
                    ? 'bg-gradient-to-b from-violet-600/20 to-purple-600/10 border-2 border-violet-500'
                    : 'bg-gray-800/50 border border-gray-700/50'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-violet-600 text-white text-xs font-semibold rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                {currentTier === plan.tier && (
                  <div className="absolute -top-3 right-4">
                    <span className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-400 ml-1">{plan.period}</span>
                </div>

                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isProcessing !== null || currentTier === plan.tier}
                  className={`w-full py-3 rounded-lg font-medium transition-colors mb-6 ${
                    currentTier === plan.tier
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : plan.highlighted
                      ? 'bg-violet-600 hover:bg-violet-500 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  } disabled:opacity-50`}
                >
                  {isProcessing === plan.tier ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Processing...
                    </span>
                  ) : currentTier === plan.tier ? (
                    'Current Plan'
                  ) : (
                    plan.cta
                  )}
                </button>

                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <svg
                        className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 border-t border-gray-800">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-xl p-6">
              <h3 className="font-semibold mb-2">What is BYOK (Bring Your Own Keys)?</h3>
              <p className="text-gray-400">
                BYOK means you provide your own API keys from providers like OpenAI, Anthropic, or Google.
                You pay them directly for usage, and we just handle the governance and routing.
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6">
              <h3 className="font-semibold mb-2">What's included with Platform keys?</h3>
              <p className="text-gray-400">
                Platform plans include pre-configured API keys so you don't need to set up accounts with
                AI providers. We handle all the API costs within your plan limits.
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6">
              <h3 className="font-semibold mb-2">Can I upgrade or downgrade anytime?</h3>
              <p className="text-gray-400">
                Yes! You can change your plan at any time. Upgrades take effect immediately,
                and downgrades take effect at the end of your billing cycle.
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6">
              <h3 className="font-semibold mb-2">What happens if I exceed my request limit?</h3>
              <p className="text-gray-400">
                You'll receive a notification when approaching your limit. Once reached, you can
                upgrade your plan or wait for the next billing cycle to continue using AIXORD.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 px-4 bg-gradient-to-b from-gray-900 to-gray-950">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-gray-400 mb-8">
            Start with our free trial and upgrade when you're ready.
          </p>
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="inline-flex px-8 py-3 bg-violet-600 hover:bg-violet-500 rounded-lg font-medium transition-colors"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              to="/signup"
              className="inline-flex px-8 py-3 bg-violet-600 hover:bg-violet-500 rounded-lg font-medium transition-colors"
            >
              Start Free Trial
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}

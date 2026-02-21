import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,

  // Only enable in production
  enabled: import.meta.env.PROD,

  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],

  // Performance: sample 20% of transactions (adjust later)
  tracesSampleRate: 0.2,

  // Trace API calls to our backend
  tracePropagationTargets: [
    /^https:\/\/api\.pmerit\.com/,
    /^https:\/\/aixord\.pmerit\.com/,
  ],

  // Session Replay: 10% of sessions, 100% of sessions with errors
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Tag with environment
  environment: import.meta.env.MODE,
});

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,          // capture 10% of transactions (enough to see patterns)
  replaysOnErrorSampleRate: 1.0,  // always record a replay when an error occurs
  replaysSessionSampleRate: 0.05, // record 5% of normal sessions
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,          // keep text visible in replays — remove if privacy is a concern
      blockAllMedia: false,
    }),
  ],
})

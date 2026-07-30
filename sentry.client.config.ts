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
  ignoreErrors: [
    // Browser-extension noise, not an app bug: password-manager extensions
    // (LastPass and similar) inject content scripts on every page, including
    // signup/forgot-password, and communicate with them via an internal
    // message-port protocol. When React re-renders the form faster than the
    // extension expects, the extension's own stale callback throws this —
    // entirely inside the extension's code, never reaching this app's code.
    // This exact message is a widely-documented false positive across nearly
    // every production Sentry setup, not something specific to this app.
    /Object Not Found Matching Id/i,
  ],
})

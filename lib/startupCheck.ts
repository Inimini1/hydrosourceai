const REQUIRED: string[] = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GEMINI_API_KEY',
]

const RECOMMENDED: string[] = [
  'NEXT_PUBLIC_APP_URL',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'RESEND_API_KEY',
  'EMAIL_FROM',
  'NEXT_PUBLIC_POSTHOG_KEY',
  'NEXT_PUBLIC_SENTRY_DSN',
]

export function checkEnvVars(): void {
  const missing = REQUIRED.filter(k => !process.env[k])
  if (missing.length > 0) {
    console.error(`[HydroSource] STARTUP ERROR — Missing required env vars: ${missing.join(', ')}`)
  }

  const missingRec = RECOMMENDED.filter(k => !process.env[k])
  if (missingRec.length > 0) {
    console.warn(`[HydroSource] WARNING — Missing recommended env vars: ${missingRec.join(', ')}`)
  }
}

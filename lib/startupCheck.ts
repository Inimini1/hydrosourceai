const REQUIRED: string[] = ['DATABASE_URL', 'JWT_SECRET', 'GEMINI_API_KEY']

const RECOMMENDED: string[] = [
  'NEXT_PUBLIC_APP_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'MICROSOFT_CLIENT_ID',
  'MICROSOFT_CLIENT_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'EMAIL_FROM',
  'SMTP_HOST',
]

export function checkEnvVars(): void {
  const missing = REQUIRED.filter(k => !process.env[k])
  if (missing.length > 0) {
    console.error(`[HydroSource] STARTUP ERROR — Missing required env vars: ${missing.join(', ')}`)
    console.error('[HydroSource] Copy .env.example → .env and fill in the values.')
  }

  const missingRec = RECOMMENDED.filter(k => !process.env[k])
  if (missingRec.length > 0) {
    console.warn(`[HydroSource] WARNING — Missing recommended env vars: ${missingRec.join(', ')}`)
  }

  if (
    process.env.JWT_SECRET === 'dev-secret-change-in-production-32chars!!' ||
    (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32)
  ) {
    console.warn('[HydroSource] WARNING — JWT_SECRET is weak or uses default. Change before deploying.')
  }
}

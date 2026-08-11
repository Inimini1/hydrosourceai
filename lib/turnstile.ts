/**
 * Cloudflare Turnstile server-side verification.
 *
 * If TURNSTILE_SECRET_KEY is unset, verification is skipped (returns true)
 * so signup/beta-apply keep working before Turnstile is configured — same
 * graceful-degradation pattern as RESEND_API_KEY and BETA_MODE elsewhere.
 */
export async function verifyTurnstileToken(token: string | undefined, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true

  if (!token) return false

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    })
    const data = (await res.json()) as { success: boolean }
    return data.success === true
  } catch {
    // Fall open on a Cloudflare-side outage — same philosophy as checkRateLimit:
    // never let third-party infra trouble block real signups.
    return true
  }
}

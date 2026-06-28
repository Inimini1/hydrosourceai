import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendPasswordResetEmail } from '@/lib/email'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const { allowed } = await checkRateLimit(`auth:forgot:${ip}`, 5, 60 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many password reset requests. Please wait an hour before trying again.' },
      { status: 429 }
    )
  }

  // Always return the same response to prevent email enumeration
  const ok = NextResponse.json({ message: 'If an account exists for this email, a reset link has been sent.' })

  try {
    const { email } = await req.json()
    if (!email?.trim()) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://hydrosource.appscloud365.com'
    const redirectTo = `${appUrl}/api/auth/callback?next=/reset-password`

    // Generate the reset link via admin client (bypasses redirect-URL allowlist)
    const admin = createAdminClient()
    const { data, error } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email: email.trim().toLowerCase(),
      options: { redirectTo },
    })

    if (error || !data?.properties?.action_link) {
      // Silent fail — don't reveal whether the email exists
      return ok
    }

    // Send via Resend (bypasses Supabase email rate limits)
    await sendPasswordResetEmail(email.trim().toLowerCase(), data.properties.action_link)
  } catch {
    // Silent fail to prevent timing-based enumeration
  }

  return ok
}

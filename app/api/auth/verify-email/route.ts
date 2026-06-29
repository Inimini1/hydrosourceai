import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendVerificationEmail } from '@/lib/email'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

export async function GET(req: NextRequest) {
  return NextResponse.redirect(new URL('/login', req.url))
}

// POST: resend verification email for the given address
export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const { allowed } = await checkRateLimit(`auth:verify:resend:${ip}`, 5, 60 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait before trying again.' }, { status: 429 })
  }

  // Always return the same response to prevent email enumeration
  const ok = NextResponse.json({ message: 'If an account exists for this email, a new verification link has been sent.' })

  try {
    const body = await req.json().catch(() => ({}))
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''

    if (!email) return ok

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://hydrosource.appscloud365.com'
    const redirectTo = `${appUrl}/api/auth/callback`

    const admin = createAdminClient()

    // generateLink type:'signup' for an existing unconfirmed user generates a fresh token
    // without modifying the user's password
    const { data, error } = await admin.auth.admin.generateLink({
      type: 'signup',
      email,
      password: '',
      options: { redirectTo },
    })

    if (error || !data?.properties?.action_link) return ok

    await sendVerificationEmail(email, data.properties.action_link)
  } catch {
    // Silent fail — always return ok
  }

  return ok
}

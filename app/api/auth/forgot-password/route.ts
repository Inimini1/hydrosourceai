import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  // Rate limit by IP: 5 resets per hour to prevent email bombing
  const ip = getClientIp(req)
  const { allowed } = await checkRateLimit(`auth:forgot:${ip}`, 5, 60 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many password reset requests. Please wait an hour before trying again.' },
      { status: 429 }
    )
  }

  try {
    const { email } = await req.json()
    if (!email?.trim()) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
    }

    const supabase = createClient()
    // Supabase handles the reset email — always returns 200 to prevent enumeration
    await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    })

    return NextResponse.json({ message: 'If an account exists for this email, a reset link has been sent.' })
  } catch {
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}

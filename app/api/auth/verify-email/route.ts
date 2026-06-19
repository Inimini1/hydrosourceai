import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

// GET is no longer used — Supabase sends its own confirmation email with a link to /api/auth/callback
export async function GET(req: NextRequest) {
  return NextResponse.redirect(new URL('/login', req.url))
}

// POST: resend verification email for the given address (or the logged-in user's email)
export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const { allowed } = await checkRateLimit(`auth:verify:resend:${ip}`, 5, 60 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait before trying again.' }, { status: 429 })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const supabase = createClient()

    // Prefer the logged-in user's email; fall back to body.email for logged-out resend
    const { data: { user } } = await supabase.auth.getUser()
    const email = user?.email ?? (typeof body.email === 'string' ? body.email.trim().toLowerCase() : '')

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
    }

    await supabase.auth.resend({ type: 'signup', email })

    // Always return success to prevent email enumeration
    return NextResponse.json({ message: 'If an account exists for this email, a new verification link has been sent.' })
  } catch {
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}

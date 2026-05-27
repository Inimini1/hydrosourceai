import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  // Rate limit signups by IP: 5 per hour to slow account-creation abuse
  const ip = getClientIp(req)
  const { allowed } = await checkRateLimit(`auth:signup:${ip}`, 5, 60 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many signup attempts from this network. Please try again in an hour.' },
      { status: 429 }
    )
  }

  try {
    const body = await req.json()
    const email     = typeof body.email     === 'string' ? body.email.trim().toLowerCase() : ''
    const password  = typeof body.password  === 'string' ? body.password : ''
    const role      = typeof body.role      === 'string' ? body.role : 'OWNER'
    const betaToken = typeof body.betaToken === 'string' ? body.betaToken.trim() : null

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format.' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
    }
    if (!['OWNER', 'PROFESSIONAL'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role.' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Validate beta token if provided
    let betaExpiresAt: string | null = null
    if (betaToken) {
      const { data: invite } = await admin
        .from('beta_invites')
        .select('expires_at, used_at, email')
        .eq('token', betaToken)
        .single()

      if (invite && !invite.used_at && invite.email === email && new Date(invite.expires_at) > new Date()) {
        betaExpiresAt = invite.expires_at
      }
    }

    // Create auth user — Supabase sends verification email automatically
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
        data: { role },
      },
    })

    if (error) {
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })
      }
      // Never leak raw Supabase error messages — map to a safe generic response
      return NextResponse.json({ error: 'Signup failed. Please check your details and try again.' }, { status: 400 })
    }

    if (!data.user) {
      return NextResponse.json({ error: 'Signup failed.' }, { status: 500 })
    }

    // Update profile with role + beta expiry (trigger already created the row)
    await admin.from('profiles').update({
      role,
      ...(betaExpiresAt ? { beta_expires_at: betaExpiresAt } : {}),
    }).eq('id', data.user.id)

    // Mark beta invite used
    if (betaToken && betaExpiresAt) {
      try { await admin.from('beta_invites').update({ used_at: new Date().toISOString() }).eq('token', betaToken) } catch { /* non-critical */ }
    }

    return NextResponse.json({
      user: { id: data.user.id, email: data.user.email },
      // session is null when Supabase requires email confirmation
      needsEmailConfirmation: data.session === null,
    }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}

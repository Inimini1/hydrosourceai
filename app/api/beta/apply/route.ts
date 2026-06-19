import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'
import { sendBetaWelcomeEmail, sendBetaNotificationToOwner } from '@/lib/email'

const BETA_DURATION_DAYS = 7

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const { allowed } = await checkRateLimit(`beta:apply:${ip}`, 3, 60 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests from this network. Please try again in an hour.' },
      { status: 429 }
    )
  }

  try {
    const body = await req.json().catch(() => ({}))
    const name    = typeof body.name    === 'string' ? body.name.trim()    : ''
    const email   = typeof body.email   === 'string' ? body.email.trim().toLowerCase() : ''
    const company = typeof body.company === 'string' ? body.company.trim() : undefined

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    const admin = createAdminClient()

    const { data: existing } = await admin
      .from('beta_invites')
      .select('expires_at, used_at')
      .eq('email', email)
      .maybeSingle()

    if (existing && !existing.used_at && new Date(existing.expires_at) > new Date()) {
      return NextResponse.json(
        { error: 'A beta invite for this email is already active. Check your inbox (and spam folder).' },
        { status: 409 }
      )
    }

    const token     = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + BETA_DURATION_DAYS * 24 * 60 * 60 * 1000)

    const { error: upsertError } = await admin.from('beta_invites').upsert(
      {
        email,
        name,
        company: company ?? null,
        token,
        expires_at: expiresAt.toISOString(),
        used_at: null,
      },
      { onConflict: 'email' }
    )

    if (upsertError) {
      console.error('[beta/apply] upsert error:', upsertError.message)
      return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
    }

    const baseUrl   = process.env.NEXT_PUBLIC_APP_URL ?? 'https://hydrosource.appscloud365.com'
    const signupUrl = `${baseUrl}/signup?beta=${token}`

    await Promise.allSettled([
      sendBetaWelcomeEmail(email, name, signupUrl, expiresAt),
      sendBetaNotificationToOwner(name, company, email, expiresAt),
    ])

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Beta apply error:', err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}

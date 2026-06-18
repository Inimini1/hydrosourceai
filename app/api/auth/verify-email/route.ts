import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.redirect(new URL('/verify-email?error=missing_token', req.url))
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

  const record = await prisma.emailVerificationToken.findUnique({ where: { tokenHash } })

  if (!record) {
    return NextResponse.redirect(new URL('/verify-email?error=invalid_token', req.url))
  }
  if (record.used) {
    return NextResponse.redirect(new URL('/verify-email?error=already_used', req.url))
  }
  if (record.expiresAt < new Date()) {
    return NextResponse.redirect(new URL('/verify-email?error=expired', req.url))
  }

  await prisma.$transaction([
    prisma.emailVerificationToken.update({ where: { tokenHash }, data: { used: true } }),
    prisma.user.update({ where: { id: record.userId }, data: { emailVerified: true } }),
  ])

  return NextResponse.redirect(new URL('/verify-email?success=1', req.url))
}

// Resend verification email
export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const rl = await checkRateLimit(`verify-email:${ip}`, 5, 15 * 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait before trying again.' }, {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) },
    })
  }

  const { email } = await req.json().catch(() => ({}))
  if (!email) return NextResponse.json({ error: 'Email required.' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } })
  // Always return 200 to avoid enumeration
  if (!user || user.emailVerified) {
    return NextResponse.json({ message: 'If applicable, a new verification email has been sent.' })
  }

  try {
    const { sendVerificationEmail } = await import('@/lib/email')
    const { default: crypto } = await import('crypto')
    const rawToken = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    // Invalidate old tokens
    await prisma.emailVerificationToken.updateMany({ where: { userId: user.id, used: false }, data: { used: true } })
    await prisma.emailVerificationToken.create({ data: { userId: user.id, tokenHash, expiresAt } })
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://HydroSource.appscloud365.com'
    const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${rawToken}`
    if (process.env.NODE_ENV === 'development' && !process.env.RESEND_API_KEY) {
      console.log(`\n[HydroSource] Resent verification link for ${user.email}:\n${verifyUrl}\n`)
    } else {
      await sendVerificationEmail(user.email, verifyUrl)
    }
  } catch (err) {
    console.error('Failed to resend verification email:', err)
  }

  return NextResponse.json({ message: 'If applicable, a new verification email has been sent.' })
}

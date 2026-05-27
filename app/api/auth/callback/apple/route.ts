import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createToken, setAuthCookie } from '@/lib/auth'
import { importPKCS8, SignJWT } from 'jose'

async function generateAppleClientSecret(): Promise<string> {
  const privateKey = await importPKCS8(
    (process.env.APPLE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),
    'ES256'
  )
  return new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: process.env.APPLE_KEY_ID ?? '' })
    .setIssuedAt()
    .setExpirationTime('5m')
    .setIssuer(process.env.APPLE_TEAM_ID ?? '')
    .setAudience('https://appleid.apple.com')
    .setSubject(process.env.APPLE_CLIENT_ID ?? '')
    .sign(privateKey)
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const code = formData.get('code') as string | null
    const state = formData.get('state') as string | null
    const stateCookie = req.cookies.get('oauth_state')?.value

    if (!code) return NextResponse.redirect(new URL('/login?error=auth_cancelled', req.url))
    if (!state || state !== stateCookie) return NextResponse.redirect(new URL('/login?error=invalid_state', req.url))

    if (!process.env.APPLE_CLIENT_ID) {
      return NextResponse.redirect(new URL('/login?error=apple_not_configured', req.url))
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://HydroSource.appscloud365.com'
    const redirectUri = `${baseUrl}/api/auth/callback/apple`
    const clientSecret = await generateAppleClientSecret()

    const tokenRes = await fetch('https://appleid.apple.com/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.APPLE_CLIENT_ID,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })
    const tokens = await tokenRes.json()
    if (!tokens.id_token) throw new Error('Apple token exchange failed')

    const payload = JSON.parse(Buffer.from(tokens.id_token.split('.')[1], 'base64url').toString())
    const providerAccountId: string = payload.sub
    const email: string = payload.email

    if (!email) return NextResponse.redirect(new URL('/login?error=no_email', req.url))

    const existing = await prisma.oAuthAccount.findUnique({
      where: { provider_providerAccountId: { provider: 'apple', providerAccountId } },
    })

    let userId: string
    if (existing) {
      userId = existing.userId
    } else {
      let user = await prisma.user.findUnique({ where: { email } })
      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            passwordHash: '',
            role: 'OWNER',
            emailVerified: true,
            subscription: { create: { planType: 'FREE', status: 'active' } },
          },
        })
      } else if (!user.emailVerified) {
        await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true } })
      }
      await prisma.oAuthAccount.create({ data: { userId: user.id, provider: 'apple', providerAccountId } })
      userId = user.id
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.redirect(new URL('/login?error=user_not_found', req.url))

    const token = await createToken({ userId, role: user.role })
    const dest = user.onboardingComplete ? '/dashboard' : '/onboarding'
    const res = NextResponse.redirect(new URL(dest, req.url))
    setAuthCookie(res, token)
    return res
  } catch (err) {
    console.error('Apple auth error:', err)
    return NextResponse.redirect(new URL('/login?error=oauth_failed', req.url))
  }
}

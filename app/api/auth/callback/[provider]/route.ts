import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createToken, setAuthCookie } from '@/lib/auth'

type UserInfo = { id: string; email: string }

async function getGoogleUser(code: string, redirectUri: string): Promise<UserInfo> {
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })
  const tokens = await tokenRes.json()
  if (!tokens.access_token) throw new Error('Google token exchange failed')

  const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })
  const u = await userRes.json()
  return { id: u.id, email: u.email }
}

async function getMicrosoftUser(code: string, redirectUri: string): Promise<UserInfo> {
  const tokenRes = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.MICROSOFT_CLIENT_ID ?? '',
      client_secret: process.env.MICROSOFT_CLIENT_SECRET ?? '',
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      scope: 'openid email profile User.Read',
    }),
  })
  const tokens = await tokenRes.json()
  if (!tokens.access_token) throw new Error('Microsoft token exchange failed')

  const userRes = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })
  const u = await userRes.json()
  return { id: u.id, email: u.mail ?? u.userPrincipalName }
}

async function upsertOAuthUser(provider: string, providerAccountId: string, email: string, req: NextRequest): Promise<NextResponse> {
  if (!email) return NextResponse.redirect(new URL('/login?error=no_email', req.url))

  const existing = await prisma.oAuthAccount.findUnique({
    where: { provider_providerAccountId: { provider, providerAccountId } },
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
          emailVerified: true, // OAuth providers verify email ownership
          subscription: { create: { planType: 'FREE', status: 'active' } },
        },
      })
    } else if (!user.emailVerified) {
      // Existing user logging in via OAuth — mark email verified
      await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true } })
    }
    await prisma.oAuthAccount.create({ data: { userId: user.id, provider, providerAccountId } })
    userId = user.id
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return NextResponse.redirect(new URL('/login?error=user_not_found', req.url))

  const token = await createToken({ userId, role: user.role })
  const dest = user.onboardingComplete ? '/dashboard' : '/onboarding'
  const res = NextResponse.redirect(new URL(dest, req.url))
  setAuthCookie(res, token)
  return res
}

export async function GET(req: NextRequest, { params }: { params: { provider: string } }) {
  const { provider } = params
  const { searchParams } = req.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const stateCookie = req.cookies.get('oauth_state')?.value

  if (!code) return NextResponse.redirect(new URL('/login?error=auth_cancelled', req.url))
  if (!state || state !== stateCookie) return NextResponse.redirect(new URL('/login?error=invalid_state', req.url))

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://HydroSource.appscloud365.com'
    const redirectUri = `${baseUrl}/api/auth/callback/${provider}`

    let info: UserInfo
    if (provider === 'google') {
      info = await getGoogleUser(code, redirectUri)
    } else if (provider === 'microsoft') {
      info = await getMicrosoftUser(code, redirectUri)
    } else {
      return NextResponse.redirect(new URL('/login?error=invalid_provider', req.url))
    }

    return upsertOAuthUser(provider, info.id, info.email, req)
  } catch (err) {
    console.error(`OAuth [${provider}] error:`, err)
    return NextResponse.redirect(new URL('/login?error=oauth_failed', req.url))
  }
}

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const CONFIGS: Record<string, { authUrl: string; clientId: string; scope: string; extra?: Record<string, string> }> = {
  google: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    clientId: process.env.GOOGLE_CLIENT_ID ?? '',
    scope: 'openid email profile',
    extra: { access_type: 'offline', prompt: 'select_account' },
  },
  microsoft: {
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    clientId: process.env.MICROSOFT_CLIENT_ID ?? '',
    scope: 'openid email profile User.Read',
    extra: { prompt: 'select_account' },
  },
  apple: {
    authUrl: 'https://appleid.apple.com/auth/authorize',
    clientId: process.env.APPLE_CLIENT_ID ?? '',
    scope: 'name email',
    extra: { response_mode: 'form_post' },
  },
}

export async function GET(req: NextRequest, { params }: { params: { provider: string } }) {
  const { provider } = params
  const config = CONFIGS[provider]

  if (!config) {
    return NextResponse.redirect(new URL('/login?error=invalid_provider', req.url))
  }
  if (!config.clientId) {
    return NextResponse.redirect(new URL(`/login?error=${provider}_not_configured`, req.url))
  }

  const state = crypto.randomBytes(16).toString('hex')
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://HydroSource.appscloud365.com'
  const redirectUri = `${baseUrl}/api/auth/callback/${provider}`

  const qs = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: config.scope,
    state,
    ...config.extra,
  })

  const res = NextResponse.redirect(`${config.authUrl}?${qs.toString()}`)
  res.cookies.set('oauth_state', state, { httpOnly: true, maxAge: 600, sameSite: 'lax', path: '/' })
  return res
}

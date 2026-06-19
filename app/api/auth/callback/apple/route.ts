import { NextRequest, NextResponse } from 'next/server'

// Apple Sign-In now routes through Supabase OAuth — this endpoint is retired.
export async function POST(req: NextRequest) {
  return NextResponse.redirect(new URL('/login?error=oauth_failed', req.url))
}

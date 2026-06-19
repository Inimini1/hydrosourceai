import { NextRequest, NextResponse } from 'next/server'

// Google/Microsoft OAuth now routes through Supabase — this endpoint is retired.
export async function GET(req: NextRequest) {
  return NextResponse.redirect(new URL('/login?error=oauth_failed', req.url))
}

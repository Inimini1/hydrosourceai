import { NextRequest, NextResponse } from 'next/server'

// Email verification is now handled by Supabase Auth via /api/auth/callback.
export async function GET(req: NextRequest) {
  return NextResponse.redirect(new URL('/login', req.url))
}

export async function POST() {
  return NextResponse.json(
    { error: 'Email verification is now managed by Supabase Auth.' },
    { status: 410 }
  )
}

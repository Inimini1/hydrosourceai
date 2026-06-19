import { NextResponse } from 'next/server'

// Password reset now handled via Supabase Auth — this endpoint is no longer used.
export async function POST() {
  return NextResponse.json(
    { error: 'This endpoint has been retired. Use the forgot password flow to reset your password.' },
    { status: 410 }
  )
}

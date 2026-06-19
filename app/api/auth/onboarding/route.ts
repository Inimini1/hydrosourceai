import { NextResponse } from 'next/server'

// Onboarding data is saved via /api/onboarding — this route is retired.
export async function POST() {
  return NextResponse.json({ error: 'Use /api/onboarding instead.' }, { status: 410 })
}

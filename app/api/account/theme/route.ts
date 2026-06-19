import { NextResponse } from 'next/server'

// Theme is stored client-side via ThemeProvider/localStorage — no server persistence needed.
export async function PATCH() {
  return NextResponse.json({ ok: true })
}

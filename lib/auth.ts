import { createClient } from '@/lib/supabase/server'
import type { NextRequest } from 'next/server'

export interface JWTPayload {
  userId: string
  role: string
}

export async function getAuthUser(_req?: NextRequest): Promise<JWTPayload | null> {
  try {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null
    return { userId: user.id, role: user.role ?? 'authenticated' }
  } catch {
    return null
  }
}

export async function verifyToken(_token: string): Promise<JWTPayload> {
  const user = await getAuthUser()
  if (!user) throw new Error('Invalid or expired session')
  return user
}

// Legacy stubs — Supabase manages sessions via its own cookies
export async function createToken(_payload: JWTPayload): Promise<string> { return '' }
export function setAuthCookie(..._args: unknown[]): void {}
export function clearAuthCookie(..._args: unknown[]): void {}

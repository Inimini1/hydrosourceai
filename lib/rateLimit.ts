import { createAdminClient } from '@/lib/supabase/admin'
import type { NextRequest } from 'next/server'

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterMs: number
}

/**
 * Returns the real client IP from a Next.js request.
 *
 * On Vercel the platform appends the genuine client IP as the last entry
 * in X-Forwarded-For, making it tamper-resistant regardless of what the
 * client sends. Falls back to x-real-ip, then 'unknown'.
 */
export function getClientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) {
    const parts = xff.split(',').map((s) => s.trim()).filter(Boolean)
    // Last entry is appended by Vercel/infrastructure (cannot be spoofed by client)
    if (parts.length > 0) return parts[parts.length - 1]
  }
  return req.headers.get('x-real-ip') ?? 'unknown'
}

/**
 * DB-backed atomic rate limiter via Supabase RPC.
 *
 * Uses a single SQL upsert (increment_rate_limit function defined in
 * 003_security.sql) so concurrent requests are handled atomically —
 * no read-then-write race condition.
 *
 * Falls open on infrastructure errors so auth is never blocked by a
 * Supabase outage.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase.rpc('increment_rate_limit', {
      p_key: key,
      p_limit: limit,
      p_window_ms: windowMs,
    })

    if (error || !data || data.length === 0) {
      // Fall open — never block legitimate users due to infra issues
      return { allowed: true, remaining: limit, retryAfterMs: 0 }
    }

    const row = data[0] as { allowed: boolean; remaining: number; retry_after_ms: number }
    return {
      allowed: row.allowed,
      remaining: row.remaining,
      retryAfterMs: row.retry_after_ms,
    }
  } catch {
    return { allowed: true, remaining: limit, retryAfterMs: 0 }
  }
}

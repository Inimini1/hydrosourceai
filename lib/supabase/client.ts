import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Keep in sync with middleware.ts and lib/supabase/server.ts.
      cookieOptions: { maxAge: 60 * 60 * 24 * 30 },
    }
  )
}

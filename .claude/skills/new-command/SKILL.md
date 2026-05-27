# /new-command — Scaffold CLI Command / API Route

Scaffold a new API route or command following SmartPool AI's existing patterns exactly.

## When invoked with `/new-command <name> <type>`

Types: `api-route` | `page` | `component` | `hook` | `mobile-screen`

### For `api-route`

Follow the pattern in `app/api/pools/route.ts`:
1. Import `NextRequest`, `NextResponse` from `next/server`
2. Import `createClient` from `@/lib/supabase/server`
3. Auth check first: `supabase.auth.getUser()` → 401 if missing
4. Validate input at boundaries
5. Query Supabase with RLS (never bypass)
6. Return camelCase JSON

### For `page`

Follow pattern in `app/(dashboard)/pools/page.tsx`:
1. Server component by default
2. Use `createClient` from `@/lib/supabase/server`
3. Dark theme classes: `bg-background`, `text-on-surface`, `text-muted`
4. Wrap content in dashboard layout conventions

### For `component`

Follow patterns in `components/`:
1. Named export, typed props
2. Use NativeWind/Tailwind classes only (no inline styles except dynamic values)
3. No `any` types

### For `hook`

Follow `hooks/useAuth.ts` pattern:
1. Returns typed object
2. Handles loading + error states
3. Uses Supabase client from `@/lib/supabase/client`

### For `mobile-screen`

Follow `mobile/app/(tabs)/index.tsx`:
1. Default export
2. `useSafeAreaInsets` for padding
3. `useAuth()` for user
4. Direct Supabase queries with `@/lib/supabase`
5. NativeWind classes matching web token system

## Output
Scaffold the file at the correct path, then say "File scaffolded. Run `/validate` after adding logic."

# SmartPool AI — Claude Code Instructions

## Project Overview
Full-stack SaaS pool chemistry management app. Web (Next.js 14 App Router) + Mobile (Expo SDK 52, Expo Router v4). Backend: Supabase (Auth, Postgres, RLS, Realtime). AI: Claude claude-sonnet-4-6 via Anthropic SDK. Payments: Stripe.

## Tech Stack
| Layer | Tech |
|---|---|
| Web frontend | Next.js 14, TypeScript, Tailwind CSS v3, Framer Motion |
| Mobile | Expo SDK 52, Expo Router v4, NativeWind v4 |
| Backend | Supabase (Postgres + Auth + RLS + Realtime) |
| AI | Google Gemini — `gemini-2.5-flash` (analysis) + `gemini-2.0-flash` (image scan) |
| Payments | Stripe |
| Auth | Supabase Auth (email/password + magic link) |
| Storage | Supabase Storage |

## Key Commands
```bash
npm run dev          # Start Next.js dev server
npm run build        # Production build
npx tsc --noEmit     # Type check web app
cd mobile && npx expo start   # Start Expo dev server
cd mobile && npx tsc --noEmit # Type check mobile
```

## Project Structure
```
/                    Web app (Next.js)
├── app/             App Router pages & API routes
│   ├── (dashboard)/ Dashboard pages (protected)
│   ├── (auth)/      Auth pages
│   └── api/         API routes
├── components/      Shared React components
├── lib/
│   ├── supabase/    client.ts | server.ts | admin.ts | types.ts
│   └── ai.ts        Gemini AI client (analyzeWater + analyzeTestStripImage)
├── supabase/
│   └── migrations/  001_schema.sql (full schema with RLS)
└── mobile/          Expo app
    ├── app/
    │   ├── (auth)/  Login, signup, forgot-password
    │   └── (tabs)/  Dashboard, pools, notifications, profile
    ├── lib/supabase.ts
    └── hooks/useAuth.ts
```

## Database Tables (Supabase, all RLS enabled)
`profiles` | `pools` | `water_tests` | `service_logs` | `subscriptions` | `notifications` | `beta_invites`

## Auth Pattern
- Web: `createClient()` from `@/lib/supabase/server` in server components / API routes
- Mobile: `supabase` from `@/lib/supabase` with ExpoSecureStoreAdapter
- Admin (bypass RLS): `createAdminClient()` from `@/lib/supabase/admin`

## Color Tokens (dark theme)
`bg-background` | `text-on-surface` | `text-on-surface-dim` | `text-muted` | `text-primary` (#00f2ff) | `text-safe` (#3cddc7) | `text-critical` (#ffb4ab)

## Environment Variables
### Web (`.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
GEMINI_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```
### Mobile (`mobile/.env`)
```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_API_URL=
```

---

## Development Protocol

For non-trivial tasks, follow this workflow:

| Command | Purpose |
|---|---|
| `/plan <task>` | Research + propose — no code, just a plan |
| `/implement` | Execute approved plan, step by step |
| `/validate` | Full quality gate: tsc + lint + build |
| `/sync` | Sync docs/memory with actual codebase state |
| `/release` | Gated 5-step release (web deploy → App Store) |
| `/new-command <name> <type>` | Scaffold new API route / page / screen |

**Standard workflow for any feature:**
1. `/plan <what you want to build>`
2. Review + approve the plan
3. `/implement`
4. `/validate`

**Before any release:**
`/release` — never skip gates

---

## Conventions
- No `any` types
- camelCase in frontend, snake_case in DB — map at API boundary
- All Supabase queries go through RLS — never use admin client in user-facing routes
- Dark theme only — no light mode variants
- Mobile: NativeWind v4 classes mirror web token system

# HydroSource AI — Deployment Guide

This app runs on Supabase (Postgres + Auth + RLS), not Prisma/SQLite. There
is no `DATABASE_URL`, `JWT_SECRET`, or `prisma db push` step — those were
from an earlier version of this codebase and no longer apply.

## 1. Provision Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run every file in `supabase/migrations/` **in order**
   (`001_schema.sql` through the highest-numbered file) — this creates all
   tables and RLS policies.
3. From Project Settings → API, copy the project URL, anon key, and
   service role key into `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.

## 2. Set environment variables

Copy `.env.example` to `.env.local` and fill in every value — that file
has an up-to-date comment above each variable explaining exactly where to
get it and what breaks if it's missing. The **required** set (app fails to
start meaningfully without these — see `lib/startupCheck.ts`):

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GEMINI_API_KEY
```

Everything else (Stripe, Resend/email, PostHog, Sentry, Turnstile) is
recommended but degrades gracefully when unset — see `.env.example` for
exactly what each one disables.

## 3. Set up the support email — step by step

The app has three separate, independently-configured email surfaces. Get
all three right or "support" silently half-works:

### a. Outbound transactional email (Resend)

This is what actually *sends* verification, password-reset, water-report,
and beta emails.

1. Create a free account at [resend.com](https://resend.com) (100
   emails/day, 3,000/month free).
2. Add and verify your sending domain: Resend Dashboard → Domains → Add
   Domain. Resend gives you SPF, DKIM, and DMARC DNS records — add all of
   them at your DNS provider and wait for the Domains tab to show
   **Verified** (not "Pending"). Sending will fail with a
   "domain not verified" error until this shows Verified.
3. Create an API key: Dashboard → API Keys → Create API Key. Set it as
   `RESEND_API_KEY`.
4. Set `EMAIL_FROM` to an address **on the verified domain**, e.g.
   `"HydroSource AI <noreply@yourdomain.com>"`. The domain here must
   exactly match what you verified in step 2 — a mismatch also fails with
   "domain not verified."
5. If your Resend account is still in sandbox/testing mode (no domain
   verified yet), it can only send to the email address you signed up to
   Resend with. Verifying the domain (step 2) is what unlocks sending to
   real users.

### b. The inbox that receives feedback + beta notifications (`SUPPORT_EMAIL`)

Every "Submit Feedback" and beta-access application in the app emails a
notification to `SUPPORT_EMAIL`. Set it to a real inbox someone actually
reads — it defaults to `hydrosource.ai@appscloud365.com` in code if unset,
which only works if that inbox exists and is monitored. This does **not**
need to be on the same domain as `EMAIL_FROM`.

Every notification sent to this address now sets `reply_to` to the
original submitter's email, so replying to the notification goes straight
back to the user — no need to copy their address out manually.

### c. Who can access the in-app feedback dashboard (`FOUNDER_EMAIL`)

`/admin/feedback` and the underlying `GET`/`PATCH /api/feedback` routes
are gated by `FOUNDER_EMAIL` — a user is let in only if their **logged-in
account email** exactly matches this value. There is deliberately no
fallback: leave it unset and *nobody* can view feedback, including you.
Set it to the email of the actual Supabase Auth account you'll sign in
with to review feedback (this can be the same address as `SUPPORT_EMAIL`,
but it's the login identity that's checked, not just a mailbox).

### d. Verifying it actually works end to end

1. With `RESEND_API_KEY` unset, emails just log to the server console
   (`[HydroSource Email — dev mode]`) instead of sending — useful for
   local dev, but confirm the key **is** set in production or nothing
   sends silently.
2. Submit the in-app feedback form (bottom-right "Feedback" button on any
   dashboard page) and confirm the notification arrives at `SUPPORT_EMAIL`
   within a minute.
3. Sign up for a new account and confirm the verification email arrives.
4. Sign in with the account matching `FOUNDER_EMAIL` and confirm
   `/admin/feedback` loads instead of showing the "access denied" state.
5. Check Resend's Dashboard → Logs for delivery status/bounces on any
   email that doesn't arrive — it will show the exact rejection reason.

## 4. Stripe

```
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_HOMEOWNER_PLUS_MONTHLY_PRICE_ID / _ANNUAL_
STRIPE_POOL_PRO_MONTHLY_PRICE_ID / _ANNUAL_
STRIPE_POOL_TEAM_MONTHLY_PRICE_ID / _ANNUAL_
```

Create one monthly + one annual Price per paid plan in Stripe Dashboard →
Product catalog — `lib/plans.ts` reads these six IDs by exact name, and
checkout returns a 500 for any plan whose pair is missing. Register the
webhook endpoint at `https://yourdomain.com/api/stripe/webhook` and copy
its signing secret into `STRIPE_WEBHOOK_SECRET`.

If `BETA_MODE=true` (see `.env.example`), every user gets full Pool Pro
access for free and Stripe checkout is skipped entirely — set it to
`false` to turn on real billing.

## 5. Deploy

```bash
# Vercel
vercel --prod

# Any other platform (Railway, Render, etc.)
# Push to your connected git branch — auto-deploys on push
```

## Deployment checklist

- [ ] All migrations in `supabase/migrations/` run against the production project
- [ ] Required env vars set (see §2)
- [ ] Resend domain shows **Verified**, `EMAIL_FROM` matches that domain
- [ ] `SUPPORT_EMAIL` points to a real, monitored inbox
- [ ] `FOUNDER_EMAIL` matches the Supabase Auth account you'll use to review feedback
- [ ] Feedback form → email arrives → reply-to goes to the actual submitter (§3d)
- [ ] Stripe webhook endpoint registered and price IDs set (or `BETA_MODE=true` intentionally)
- [ ] `NEXT_PUBLIC_APP_URL` set to the production URL (no trailing slash)
- [ ] Google OAuth: Client ID/Secret set in Supabase Dashboard → Authentication → Providers → Google (not in `.env`) — see `.env.example` for the exact redirect URI Google needs
- [ ] Test signup → verify email → login → add pool → run a water test end-to-end

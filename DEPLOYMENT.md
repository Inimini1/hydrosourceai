# HydroSource — Deployment Guide

## Switching from SQLite (dev) to PostgreSQL (production)

SQLite (`file:./dev.db`) is used locally. For any cloud deployment (Vercel, Railway, Render, etc.) you must switch to PostgreSQL.

### 1. Provision a PostgreSQL database

| Platform | Free tier | Notes |
|----------|-----------|-------|
| [Supabase](https://supabase.com) | 500 MB | Managed Postgres, recommended |
| [Neon](https://neon.tech) | 0.5 GB | Serverless Postgres, great for Vercel |
| [Railway](https://railway.app) | $5 credit/mo | Easiest self-contained deploy |
| [PlanetScale](https://planetscale.com) | Hobby free | MySQL, NOT Postgres — skip |

Copy the connection string. It looks like:
```
postgresql://user:password@host:5432/dbname?sslmode=require
```

### 2. Update `prisma/schema.prisma`

Change the datasource provider from `sqlite` to `postgresql`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 3. Set the environment variable

In your deployment platform's dashboard, set:
```
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
```

Do **not** commit this value. Keep `DATABASE_URL="file:./dev.db"` in your local `.env` for local development.

### 4. Push the schema

Run this once to create all tables in the new database:
```bash
npx prisma db push
```

Or if using CI/CD, add a build step:
```bash
npx prisma generate && npx prisma db push
```

> No migration files are needed — `db push` handles the schema directly. If you later want version-controlled migrations, switch to `prisma migrate deploy`.

### 5. Deploy

```bash
# Vercel
vercel --prod

# Railway / Render
# Push to your connected git branch — auto-deploys on push
```

---

## Required environment variables for production

See `.env.example` for all variables. The minimum set to go live:

| Variable | Where to get it |
|----------|----------------|
| `DATABASE_URL` | Your Postgres provider dashboard |
| `JWT_SECRET` | `openssl rand -base64 32` — must be 32+ chars |
| `GEMINI_API_KEY` | [ai.google.dev](https://ai.google.dev) |
| `NEXT_PUBLIC_APP_URL` | Your production URL, e.g. `https://HydroSource.app` |
| `RESEND_API_KEY` | [resend.com](https://resend.com) — for password reset emails |
| `EMAIL_FROM` | A verified sender domain in Resend |
| `STRIPE_SECRET_KEY` | [dashboard.stripe.com](https://dashboard.stripe.com/apikeys) |
| `STRIPE_WEBHOOK_SECRET` | Stripe dashboard → Webhooks → your endpoint secret |
| `STRIPE_HOMEOWNER_PLUS_MONTHLY_PRICE_ID` / `_ANNUAL_` | Stripe dashboard → Products (one pair per plan: Homeowner Plus, Pool Pro, Pool Team) |
| `STRIPE_POOL_PRO_MONTHLY_PRICE_ID` / `_ANNUAL_` | Stripe dashboard → Products |
| `STRIPE_POOL_TEAM_MONTHLY_PRICE_ID` / `_ANNUAL_` | Stripe dashboard → Products |

OAuth (Google, Microsoft) are optional — the app works without them.

---

## Vercel deployment checklist

- [ ] PostgreSQL database provisioned and `DATABASE_URL` set
- [ ] All required env vars added in Vercel project settings
- [ ] `npx prisma db push` run against the production DB
- [ ] Stripe webhook endpoint registered: `https://yourdomain.com/api/stripe/webhook`
- [ ] Google OAuth redirect URI updated: `https://yourdomain.com/api/auth/callback/google`
- [ ] Microsoft OAuth redirect URI updated: `https://yourdomain.com/api/auth/callback/microsoft`
- [ ] `NEXT_PUBLIC_APP_URL` set to production URL (no trailing slash)
- [ ] Test signup → login → add pool → run water test end-to-end

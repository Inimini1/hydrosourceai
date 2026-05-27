# Security Policy — HydroSource

## Reporting a Vulnerability

If you discover a security vulnerability, **do not open a public GitHub issue**.

Email: **al.cloud365@gmail.com**  
Subject line: `[SECURITY] HydroSource — <short description>`

We will acknowledge your report within 48 hours and aim to release a fix within 7 days for critical issues.

---

## Security Architecture

### Authentication
| Control | Implementation |
|---|---|
| Password hashing | bcrypt, cost factor 12 |
| Password requirements | 8+ chars, uppercase, lowercase, number, special char |
| JWT signing | HS256 via `jose`, 7-day expiry |
| JWT secret | Env var `JWT_SECRET` (min 32 chars), never defaults in production |
| Session storage | httpOnly cookie (`HydroSource_token`), `secure` in production, `sameSite: lax` |
| Account lockout | 5 failed attempts → 15-minute lockout, stored in DB |
| IP rate limiting | Login: 10 req/15min · Signup: 5 req/hr · AI endpoints: tracked per user |

### OAuth (Google, Microsoft, Apple)
- State parameter validated against httpOnly cookie (`oauth_state`) to prevent CSRF
- Authorization code exchange performed server-side — no tokens exposed to browser
- OAuth accounts linked to existing email addresses when found

### API Security
- All protected endpoints verify JWT via `getAuthUser()` in `lib/auth.ts`
- Middleware rejects unauthenticated requests with 401 before they reach route handlers
- Pool ownership verified on every pool/test/log operation (`userId: auth.userId` in all DB queries)
- Stripe webhook signature validated via `stripe.webhooks.constructEvent()`

### HTTP Security Headers (applied to all responses)
- `Strict-Transport-Security` — enforces HTTPS with 2-year max-age
- `X-Frame-Options: SAMEORIGIN` — prevents clickjacking
- `X-Content-Type-Options: nosniff` — prevents MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` — disables microphone and geolocation, allows camera (test strip scan)
- `X-XSS-Protection: 1; mode=block`

### Input Validation
- Email format validated server-side with regex before any DB query
- Numeric chemical values validated with `isNaN()` check
- Role field validated against allowlist `['OWNER', 'PROFESSIONAL']`
- Avatar color validated against hex color regex `/^#[0-9A-Fa-f]{6}$/`
- All inputs coerced to correct type before use (e.g. `typeof body.email === 'string'`)

### Data
- Passwords never logged or returned in API responses
- DB queries always scope by `userId` to prevent cross-user data access
- AI analysis stored as JSON string; never executed
- Image data (test strip) processed in-memory, never written to disk

---

## Known Limitations (Beta)

- Rate limiting is in-memory and resets on server restart. Use Redis in production.
- JWT is not revocable (no token blacklist). Logout only clears the cookie client-side.
- No refresh token rotation yet — single 7-day token.
- SQLite is for development only. Use PostgreSQL in production.
- No IP allowlisting for admin routes.

---

## Production Hardening Checklist

Before going to production:

- [ ] Set `JWT_SECRET` to a cryptographically random 64-char string
- [ ] Switch `DATABASE_URL` from SQLite to PostgreSQL
- [ ] Enable `secure: true` on cookies (automatic when `NODE_ENV=production`)
- [ ] Replace in-memory rate limiter with Redis (`@upstash/ratelimit`)
- [ ] Add a Content Security Policy (CSP) header
- [ ] Enable Stripe live-mode keys and update webhook endpoints
- [ ] Configure SMTP for production email delivery
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Enable database backups
- [ ] Review and tighten `images.remotePatterns` in `next.config.ts`

---

## Supported Versions

| Version | Supported |
|---|---|
| Latest (main branch) | Yes |
| Older builds | No — always update to latest |

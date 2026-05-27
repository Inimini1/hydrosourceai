# Compliance Checklist — HydroSource

**Last reviewed:** April 25, 2026

Use this checklist before launching publicly or deploying to production.

---

## Security Baseline

### Authentication
- [x] Passwords hashed with bcrypt (cost 12)
- [x] Password strength enforced: 8+ chars, uppercase, lowercase, number, special char
- [x] Email format validated server-side before DB query
- [x] Timing-safe comparison for login (constant-time bcrypt comparison)
- [x] Account lockout after 5 failed attempts (15-minute lockout)
- [x] IP rate limiting on login (10 req/15min) and signup (5 req/hr)
- [x] JWT stored in httpOnly cookie (not localStorage)
- [x] JWT `secure` flag enabled in production
- [x] OAuth state parameter validated against httpOnly cookie
- [x] OAuth token exchange performed server-side
- [ ] Short-lived access tokens (15min) + refresh token rotation
- [ ] Token revocation list (Redis-backed)

### API
- [x] All protected endpoints validate JWT before processing
- [x] All pool/test/log queries scoped by `userId`
- [x] Stripe webhook signature validated (`constructEvent`)
- [x] Input types coerced and validated before DB insertion
- [ ] Zod schema validation on all request bodies
- [ ] CORS origin allowlist (restrict to your domain)
- [ ] API response serializers (strip `passwordHash` from any user response)

### HTTP Security Headers
- [x] `Strict-Transport-Security`
- [x] `X-Frame-Options: SAMEORIGIN`
- [x] `X-Content-Type-Options: nosniff`
- [x] `Referrer-Policy`
- [x] `Permissions-Policy`
- [x] `X-XSS-Protection`
- [ ] `Content-Security-Policy` (requires per-app testing — add before production)

### Infrastructure
- [ ] HTTPS certificate configured (Let's Encrypt or hosting provider)
- [ ] `NODE_ENV=production` in deployment environment
- [ ] Strong `JWT_SECRET` (≥64 random chars) in production `.env`
- [ ] SQLite → PostgreSQL migration for production
- [ ] Rate limiter backed by Redis (not in-memory) for multi-instance deployments
- [ ] Database connection over SSL
- [ ] Database backups configured (daily minimum)
- [ ] Error monitoring configured (Sentry, Datadog, etc.)

---

## Privacy & Legal

### Documents
- [x] Privacy Policy drafted (`legal/privacy-policy.md`)
- [x] Terms of Service drafted (`legal/terms-of-service.md`)
- [x] Consent UI component available (`components/ConsentBanner.tsx`)
- [ ] Privacy Policy published at a public URL (e.g., `/legal/privacy`)
- [ ] Terms of Service published at a public URL (e.g., `/legal/terms`)
- [ ] Privacy Policy linked in signup/login pages
- [ ] Terms of Service linked in signup/login pages
- [ ] Consent recorded in DB when user accepts during signup

### GDPR / CCPA (if serving EU/California users)
- [ ] Cookie consent banner displayed before setting non-essential cookies
- [ ] "Delete my account" feature implemented in Account Settings
- [ ] "Export my data" feature implemented
- [ ] Data Processing Agreement (DPA) with Google (for Gemini API)
- [ ] Data Processing Agreement with Stripe
- [ ] Privacy Policy specifies legal basis for each type of processing
- [ ] Data retention schedule documented and enforced
- [ ] Breach notification procedure documented

### COPPA (if minors could use the app)
- [ ] Age gate on signup (confirm user is 13+)
- [ ] Process for parents to request deletion of minor's data

---

## Stripe / Payment Compliance

- [x] Stripe webhook signature validated
- [x] No credit card data stored in your database
- [x] Subscription status synced from Stripe webhooks
- [ ] Stripe live-mode keys in production (not test keys)
- [ ] Webhook endpoint registered in Stripe Dashboard for production URL
- [ ] Refund policy documented and matching Terms of Service
- [ ] Invoice/receipt emails enabled in Stripe settings
- [ ] PCI-DSS: confirm you never handle raw card data (Stripe Elements handles it) ✓

---

## Operational

### Before Launch
- [ ] Run `npm audit` and fix critical vulnerabilities
- [ ] Review all `console.log` — remove any that log user data or tokens
- [ ] Verify `.env` is in `.gitignore`
- [ ] Verify `dev.db` (SQLite) is in `.gitignore`
- [ ] Test password reset flow end-to-end
- [ ] Test OAuth flows for Google, Microsoft (Apple if enabled)
- [ ] Test Stripe checkout and webhook with test mode
- [ ] Load test the AI analysis endpoint to understand Gemini quota usage

### Ongoing
- [ ] Review `npm audit` monthly
- [ ] Rotate `JWT_SECRET` if it may be compromised
- [ ] Monitor Gemini API quota and billing
- [ ] Review access logs for unusual patterns monthly
- [ ] Keep Prisma, Next.js, and Stripe SDK up to date

---

## Incident Response

If a security incident occurs:
1. Take the affected service offline if necessary
2. Assess scope — what data was accessed?
3. Patch the vulnerability
4. Notify affected users within 72 hours (GDPR requirement)
5. Document the incident and remediation
6. Contact: al.cloud365@gmail.com

---

## Summary Status

| Category | Status |
|---|---|
| Auth hardening | Mostly complete (see above) |
| API security | Core complete, Zod validation pending |
| HTTP headers | Complete |
| Infrastructure | Dev-only (needs production setup) |
| Legal documents | Drafted, not yet published |
| Privacy compliance | Partial (GDPR deletion/export pending) |
| Payment compliance | Complete for test mode |

# Comprehensive Security, Privacy & Feature Validation Checklist — HydroSource

**Last reviewed:** May 27, 2026  
**Version:** 1.0  
**Use this checklist** before launching publicly, deploying to production, or after major changes.

---

## 🔐 SECURITY BASELINE

### Authentication & Authorization
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
- [x] All protected endpoints validate JWT before processing
- [x] All pool/test/log queries scoped by `userId`
- [x] Stripe webhook signature validated (`constructEvent`)
- [ ] Zod schema validation on all request bodies
- [ ] CORS origin allowlist (restrict to your domain)
- [ ] API response serializers (strip `passwordHash` from any user response)
- [x] Role field validated against allowlist `['OWNER', 'PROFESSIONAL']`
- [x] Avatar color validated against hex color regex `/^#[0-9A-Fa-f]{6}$/`
- [x] Numeric chemical values validated with `isNaN()` check

### API Security
- [x] All protected endpoints verify JWT via `getAuthUser()` in `lib/auth.ts`
- [x] Middleware rejects unauthenticated requests with 401 before they reach route handlers
- [x] Pool ownership verified on every pool/test/log operation (`userId: auth.userId` in all DB queries)
- [x] Stripe webhook signature validated via `stripe.webhooks.constructEvent()`
- [x] Input types coerced and validated before DB insertion
- [x] Email format validated server-side with regex before any DB query
- [x] Passwords never logged or returned in API responses
- [x] DB queries always scope by `userId` to prevent cross-user data access
- [x] AI analysis stored as JSON string; never executed
- [x] Image data (test strip) processed in-memory, never written to disk

### HTTP Security Headers (applied to all responses)
- [x] `Strict-Transport-Security` — enforces HTTPS with 2-year max-age
- [x] `X-Frame-Options: SAMEORIGIN` — prevents clickjacking
- [x] `X-Content-Type-Options: nosniff` — prevents MIME sniffing
- [x] `Referrer-Policy: strict-origin-when-cross-origin`
- [x] `Permissions-Policy` — disables microphone and geolocation, allows camera (test strip scan)
- [x] `X-XSS-Protection: 1; mode=block`
- [ ] `Content-Security-Policy` (requires per-app testing — add before production)

### Infrastructure & Deployment
- [ ] HTTPS certificate configured (Let's Encrypt or hosting provider)
- [ ] `NODE_ENV=production` in deployment environment
- [ ] Strong `JWT_SECRET` (≥64 random chars) in production `.env`
- [ ] SQLite → PostgreSQL migration for production
- [ ] Rate limiter backed by Redis (not in-memory) for multi-instance deployments
- [ ] Database connection over SSL
- [ ] Database backups configured (daily minimum)
- [ ] Error monitoring configured (Sentry, Datadog, etc.)
- [ ] Review and tighten `images.remotePatterns` in `next.config.ts`
- [ ] Enable Stripe live-mode keys and update webhook endpoints
- [ ] Configure SMTP for production email delivery
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Enable database backups

### Database Security (Supabase RLS)
- [x] Row Level Security enabled on all tables
- [x] Profiles table: RLS policies restrict access to own data
- [x] Pools table: RLS policies restrict access to own pools
- [x] Water tests table: RLS policies restrict access via pool ownership
- [x] Service logs table: RLS policies restrict access via pool ownership
- [x] Subscriptions table: RLS policies restrict access to own data
- [x] Notifications table: RLS policies restrict access to own data
- [x] Beta invites table: Only service role may access (no anon select policy)
- [x] Rate limits table: Only service role may access
- [x] Stripe processed events table: Only service role may access
- [x] Atomic rate limit function prevents TOCTOU race conditions
- [x] Service role bypasses RLS for admin operations (webhooks, scripts)

## 📋 PRIVACY & LEGAL COMPLIANCE

### Documents & Publishing
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

### Stripe / Payment Compliance
- [x] Stripe webhook signature validated
- [x] No credit card data stored in your database
- [x] Subscription status synced from Stripe webhooks
- [ ] Stripe live-mode keys in production (not test keys)
- [ ] Webhook endpoint registered in Stripe Dashboard for production URL
- [ ] Refund policy documented and matching Terms of Service
- [ ] Invoice/receipt emails enabled in Stripe settings
- [x] PCI-DSS: confirm you never handle raw card data (Stripe Elements handles it) ✓

### Data Retention
- [x] Account data: Until account deletion
- [x] Water test records: Until pool deletion or account deletion
- [x] Service logs: Until pool deletion or account deletion
- [x] Password reset tokens: 1 hour from creation
- [x] Subscription data: 7 years (tax/legal requirement)

## 🧪 FEATURE TESTING (BASIC TO ADVANCED)

### Core User Flows
- [ ] User registration (email/password)
- [ ] User registration (OAuth: Google, Microsoft, Apple)
- [ ] Email verification flow
- [ ] Password reset flow
- [ ] Login/logout functionality
- [ ] Remember me / persistent sessions
- [ ] Account lockout after failed attempts
- [ ] Profile management (display name, avatar color)
- [ ] Onboarding questionnaire completion

### Pool Management
- [ ] Create a pool (name, gallons, chlorine type)
- [ ] View pool list
- [ ] Edit pool details
- [ ] Delete pool
- [ ] Pool validation (gallons between 1000-200000)

### Water Testing
- [ ] Submit water test (pH, chlorine, alkalinity, etc.)
- [ ] View water test history
- [ ] AI analysis of water test results
- [ ] Test strip image upload and processing
- [ ] Water test status classification (safe/caution/critical)
- [ ] Symptoms and observations input
- [ ] Invalid/test manipulation attempts

### Service Logging
- [ ] Create service log (notes, chemicals added)
- [ ] View service log history
- [ ] Service log with image upload
- [ ] Edit/delete service log

### Notifications
- [ ] Notification system (critical water conditions)
- [ ] View notification list
- [ ] Mark notifications as read
- [ ] Clear all notifications

### Subscription & Payments
- [ ] Free tier access and limitations
- [ ] Pro subscription (monthly/annual)
- [ ] Subscription cancellation
- [ ] Subscription renewal
- [ ] Payment processing with Stripe (test mode)
- [ ] Refund request flow
- [ ] Price change notification (30-day notice)

### AI Features
- [ ] AI water analysis accuracy validation
- [ ] Test strip image processing
- [ ] Maintenance recommendations generation
- [ ] AI analysis storage (as JSON, not executable code)
- [ ] Rate limiting on AI endpoints (per user)

### Administrative Features
- [ ] Beta invite system (token-based access)
- [ ] Admin/user role distinctions
- [ ] Service role for webhooks/admin operations
- [ ] Audit trail considerations

### Mobile Responsiveness
- [ ] Mobile layout and navigation
- [ ] Touch-friendly controls
- [ ] Form input usability on mobile
- [ ] Image upload/capture on mobile devices

### Performance & Load Testing
- [ ] Page load times (<3s for core pages)
- [ ] API response times (<500ms for authenticated endpoints)
- [ ] Concurrent user simulation (10+ users)
- [ ] AI analysis endpoint load testing (Gemini quota awareness)
- [ ] Database query performance under load
- [ ] Static asset optimization (images, CSS, JS)

## 🛡️ SECURITY AGENT VALIDATION (SHANNON AI PENTESTER)

### Setup Instructions
1. **Install Shannon AI Pentester** (requires Docker):
   ```bash
   git clone https://github.com/KeygraphHQ/shannon.git
   cd shannon
   ```

2. **Configure API Keys** (choose one):
   ```bash
   # Option A: Anthropic Direct
   export ANTHROPIC_API_KEY="sk-ant-..."
   export CLAUDE_CODE_MAX_OUTPUT_TOKENS=64000
   
   # Option B: AWS Bedrock (Recommended to avoid rate limits)
   export AWS_ACCESS_KEY_ID="..."
   export AWS_SECRET_ACCESS_KEY="..."
   export AWS_DEFAULT_REGION=us-east-1
   export SHANNON_AI_PROVIDER=bedrock
   export SHANNON_BEDROCK_MODEL=anthropic.claude-3-7-sonnet-20250219-v1:0
   
   # Option C: Google Vertex AI
   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
   export SHANNON_AI_PROVIDER=vertex
   export SHANNON_VERTEX_PROJECT=your-gcp-project
   export SHANNON_VERTEX_REGION=us-east5
   ```

3. **Start Local Development Server**:
   ```bash
   # In SmartPool AI directory
   npm run dev
   # Ensure app is running on http://localhost:3000
   ```

4. **Run Security Pentest**:
   ```bash
   # From shannon directory
   ./shannon start \
     URL=http://localhost:3000 \
     REPO=/path/to/SmartPool\ AI \
     WORKSPACE=hydrosource-pentest-$(date +%Y%m%d)
   ```

5. **Monitor Progress**:
   ```bash
   ./shannon logs hydrosource-pentest-$(date +%Y%m%d)  # Live logs
   ./shannon status hydrosource-pentest-$(date +%Y%m%d)  # Status check
   ```

6. **Generate Report**:
   ```bash
   ./shannon report hydrosource-pentest-$(date +%Y%m%d) > pentest-report.md
   ```

### Expected Coverage from Shannon Pentester
Shannon will test for:
- **Injection**: SQL injection, command injection, LDAP injection
- **XSS**: Reflected, stored, DOM-based
- **SSRF**: Internal network access, cloud metadata endpoints
- **Broken Authentication**: Weak tokens, session fixation, auth bypass
- **Broken Authorization**: IDOR, privilege escalation, missing access controls

### Post-Pentest Actions
- [ ] Review pentest report for critical/high findings
- [ ] Reproduce each vulnerability using provided PoC
- [ ] Fix identified security issues
- [ ] Re-run pentest to validate fixes
- [ ] Document all fixes in security changelog
- [ ] Schedule monthly pentests for ongoing security

## 🔍 AUDIT & FIX ITEMS

### Immediate Actions (Based on Existing Checklists)
- [ ] Implement short-lived access tokens (15min) + refresh token rotation
- [ ] Implement token revocation list (Redis-backed)
- [ ] Add Zod schema validation on all request bodies
- [ ] Implement CORS origin allowlist
- [ ] Add API response serializers to strip sensitive data
- [ ] Implement Content-Security-Policy header (after testing)
- [ ] Publish Privacy Policy and Terms of Service at public URLs
- [ ] Link legal documents in signup/login pages
- [ ] Implement consent recording in DB
- [ ] Implement GDPR/CCPA features (data deletion, export)
- [ ] Implement Data Processing Agreements with Google and Stripe
- [ ] Document data retention schedule and breach notification procedure
- [ ] Implement COPPA age gate if applicable
- [ ] Switch to Stripe live-mode keys in production
- [ ] Register webhook endpoint in Stripe Dashboard for production
- [ ] Document refund policy matching Terms of Service
- [ ] Enable invoice/receipt emails in Stripe settings
- [ ] Configure production HTTPS certificate
- [ ] Set strong JWT_SECRET (≥64 chars) in production
- [ ] Migrate from SQLite to PostgreSQL for production
- [ ] Implement Redis-backed rate limiter for multi-instance deployments
- [ ] Configure database SSL connections
- [ ] Set up daily database backups
- [ ] Configure error monitoring (Sentry)
- [ ] Configure SMTP for production email delivery
- [ ] Review and tighten images.remotePatterns in next.config.ts

### Ongoing Maintenance
- [ ] Run `npm audit` monthly and fix critical vulnerabilities
- [ ] Review and remove any `console.log` that log user data or tokens
- [ ] Verify `.env` is in `.gitignore`
- [ ] Verify `dev.db` (SQLite) is in `.gitignore`
- [ ] Test password reset flow end-to-end monthly
- [ ] Test OAuth flows for Google, Microsoft (Apple if enabled) monthly
- [ ] Test Stripe checkout and webhook with test mode monthly
- [ ] Load test AI analysis endpoint to understand Gemini quota usage
- [ ] Rotate `JWT_SECRET` if compromise suspected
- [ ] Monitor Gemini API quota and billing monthly
- [ ] Review access logs for unusual patterns monthly
- [ ] Keep Prisma, Next.js, and Stripe SDK updated monthly

## ⚠️ HACKABILITY TESTING & RISK ASSESSMENT

### Likelihood of Security Risks (Assessment)
Based on code review:
- **Low Risk**: 
  - Authentication bypass (strong JWT validation, httpOnly cookies)
  - Direct IDOR (proper userId scoping on all queries)
  - SQL injection (Prisma ORM with parameterized queries)
  - CSRF protection (OAuth state validation, sameSite cookies)
- **Medium Risk**:
  - Rate limiting bypass (currently in-memory, resets on restart)
  - Token theft (XSS could steal tokens from localStorage, but none used)
  - API abuse (rate limiting could be overwhelmed without Redis backend)
  - Information leakage (error messages might expose internal details)
- **High Risk** (Requires Production Setup):
  - Database exposure (if using default SQLite in production)
  - Webhook spoofing (if Stripe signature validation not properly implemented)
  - OAuth hijacking (if state parameter not validated)
  - JWT secret exposure (if weak secret or committed to repo)

### Manual Hackability Tests to Perform
1. **Authentication Testing**:
   - [ ] Attempt to access protected endpoints without valid JWT
   - [ ] Try to use expired or malformed tokens
   - [ ] Attempt to tamper with JWT payload (should fail verification)
   - [ ] Try to access another user's pools/tests by modifying IDs
   - [ ] Attempt OAuth flow manipulation (state parameter tampering)
   - [ ] Try to brute force passwords (should trigger lockout/rate limiting)

2. **Input Validation Testing**:
   - [ ] Attempt SQL injection in input fields
   - [ ] Try XSS payloads in text inputs (should be escaped)
   - [ ] Send oversized payloads to test buffer limits
   - [ ] Submit invalid chemical values (negative numbers, extremely large)
   - [ ] Try to upload non-image files as test strip photos
   - [ ] Attempt to send malformed JSON to API endpoints

3. **Session & Cookie Testing**:
   - [ ] Check for sensitive data in localStorage/sessionStorage
   - [ ] Verify JWT cookie has httpOnly and secure flags
   - [ ] Attempt to steal or manipulate session cookies
   - [ ] Test cookie expiration and clearing on logout
   - [ ] Verify sameSite attributes prevent CSRF

4. **Business Logic Testing**:
   - [ ] Attempt to create negative or zero-gallon pools
   - [ ] Try to submit water tests with impossible chemical values
   - [ ] Attempt to bypass subscription requirements for Pro features
   - [ ] Try to manipulate AI analysis outputs
   - [ ] Attempt to access beta features without valid invite token
   - [ ] Try to escalate privileges from OWNER to PROFESSIONAL/ADMIN

5. **Infrastructure Testing**:
   - [ ] Check for exposed .env files or secrets in public repositories
   - [ ] Verify debug information is not exposed in production
   - [ ] Test rate limiting effectiveness under burst traffic
   - [ ] Check for open ports or unnecessary services exposed
   - [ ] Verify error handling doesn't reveal stack traces

### Risk Mitigation Status
- [x] Password security (bcrypt, strong requirements)
- [x] Session security (httpOnly cookies, secure flags)
- [x] OAuth security (state validation, server-side exchange)
- [x] API security (JWT validation, userId scoping)
- [x] Input validation (type coercion, format validation)
- [x] Database security (RLS, parameterized queries via Prisma)
- [ ] Infrastructure security (needs production hardening)
- [ ] Monitoring and alerting (needs setup)
- [ ] Incident response plan (documented but needs testing)

## ✅ VALIDATION CRITERIA

### Before Production Launch
All items in the following sections must be completed:
1. ☐ Security Baseline (all critical items)
2. ☐ Privacy & Legal Compliance (all legal documents published and linked)
3. ☐ Feature Testing (all core user flows tested)
4. ☐ Security Agent Validation (pentest completed with critical/high issues fixed)
5. ☐ Audit & Fix Items (all immediate actions completed)
6. ☐ Hackability Testing (manual tests completed with issues addressed)

### Ongoing Validation
- [ ] Monthly security checklist review
- [ ] Quarterly comprehensive pentest
- [ ] Bi-annual privacy/compliance audit
- [ ] Continuous monitoring of security alerts
- [ ] Regular dependency updates and vulnerability scanning

---

## 📝 HOW TO USE THIS CHECKLIST

1. **For New Releases**: Complete all unchecked items before deployment
2. **For Security Updates**: Focus on Security Baseline and Hackability Testing sections
3. **For Privacy Updates**: Focus on Privacy & Legal Compliance section
4. **For Feature Releases**: Test new features in Feature Testing section
5. **For Ongoing Operations**: Use Ongoing Maintenance and Validation Criteria sections

**Note**: Items marked with `[x]` are currently completed based on code review. Items marked with `[ ]` require action.

**Next Steps**: 
1. Begin with Security Agent Validation using Shannon AI Pentester
2. Address all findings from the pentest
3. Complete remaining checklist items
4. Retest and validate all fixes
5. Schedule regular security reviews
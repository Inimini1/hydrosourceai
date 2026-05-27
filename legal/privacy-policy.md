# Privacy Policy — HydroSource

**Effective Date:** April 25, 2026  
**Last Updated:** April 25, 2026  
**Contact:** al.cloud365@gmail.com

---

## 1. Who We Are

HydroSource ("we," "us," "our") is a pool management SaaS application that uses artificial intelligence to analyze pool water chemistry and provide maintenance recommendations. Our service is operated by the HydroSource team.

**Contact us at:** al.cloud365@gmail.com

---

## 2. What Data We Collect

### 2.1 Account Data
When you create an account, we collect:
- Email address
- Password (stored as a bcrypt hash — we cannot see your actual password)
- Display name (optional)
- Avatar color preference
- Account creation date

### 2.2 Pool & Water Chemistry Data
When you use the app, we collect:
- Pool names and sizes (gallons)
- Water chemistry readings: pH, chlorine, alkalinity, calcium hardness, cyanuric acid, temperature
- Water observations: clarity, odor, symptoms you describe
- Test strip photos (processed in-memory by Google Gemini AI; not stored on our servers)
- AI analysis results and maintenance recommendations
- Service logs and maintenance notes

### 2.3 Onboarding Questionnaire Data
- Experience level with pool maintenance
- Primary goal (safety, compliance, etc.)
- Test frequency
- Main challenge

### 2.4 OAuth Sign-In Data
If you sign in with Google, Microsoft, or Apple, we receive:
- Your email address from the provider
- A provider-specific user ID (not your password)

We do not receive or store access tokens after the OAuth exchange.

### 2.5 Payment Data
Payments are processed by **Stripe**. We do not store credit card numbers. We store:
- Stripe customer ID
- Subscription plan and status
- Subscription period end date

### 2.6 Usage & Technical Data
- IP address (used for rate limiting only, not stored long-term)
- Browser/device type (via standard HTTP headers)
- Timestamps of pool tests and service logs

---

## 3. How We Use Your Data

| Purpose | Legal Basis |
|---|---|
| Provide the pool analysis service | Performance of contract |
| Send AI-generated maintenance recommendations | Performance of contract |
| Process payments and manage subscriptions | Performance of contract |
| Send password reset emails | Legitimate interest (account security) |
| Detect and prevent fraud, abuse, and unauthorized access | Legitimate interest (security) |
| Improve the AI model and app features | Legitimate interest (service improvement) |
| Comply with legal obligations | Legal obligation |

We do **not** sell your data to third parties.  
We do **not** use your pool chemistry data for advertising.

---

## 4. Third-Party Services

| Service | Purpose | Their Privacy Policy |
|---|---|---|
| Google Gemini AI | Water chemistry analysis and test strip reading | https://policies.google.com/privacy |
| Stripe | Payment processing and subscription management | https://stripe.com/privacy |
| Google OAuth | Optional sign-in | https://policies.google.com/privacy |
| Microsoft OAuth | Optional sign-in | https://privacy.microsoft.com |
| Apple Sign In | Optional sign-in | https://www.apple.com/legal/privacy |

---

## 5. Data Retention

| Data Type | Retention Period |
|---|---|
| Account data | Until account deletion |
| Water test records | Until pool deletion or account deletion |
| Service logs | Until pool deletion or account deletion |
| Password reset tokens | 1 hour from creation |
| Subscription data | 7 years (tax/legal requirement) |

---

## 6. Your Rights

Depending on your location, you may have the right to:

- **Access** — Request a copy of your personal data
- **Correction** — Update inaccurate or incomplete data (via Account Settings)
- **Deletion** — Request deletion of your account and associated data
- **Portability** — Receive your data in a machine-readable format
- **Withdrawal of consent** — Where processing is based on consent, you may withdraw it at any time

To exercise any of these rights, email: **al.cloud365@gmail.com**

We will respond within 30 days.

---

## 7. Children's Privacy

HydroSource is not directed at children under 13 (or under 16 in the EU/UK). We do not knowingly collect personal data from children. If you believe a child has provided us data, contact us immediately.

---

## 8. Security

We implement industry-standard security measures:
- bcrypt password hashing (cost factor 12)
- HTTPS-only in production (HSTS enabled)
- httpOnly cookies for session tokens
- Account lockout after repeated failed login attempts
- IP-based rate limiting on authentication endpoints
- Stripe webhook signature verification

No system is 100% secure. In the event of a data breach affecting your personal data, we will notify you as required by applicable law.

---

## 9. Cookies

We use one functional cookie:

| Cookie | Purpose | Duration |
|---|---|---|
| `HydroSource_token` | Authentication session | 7 days |
| `oauth_state` | CSRF protection during OAuth sign-in | Session |

We do not use advertising or tracking cookies.

---

## 10. International Transfers

HydroSource is operated from the United States. If you are located outside the US, your data may be transferred to and processed in the US. We take appropriate steps to ensure your data is protected.

---

## 11. Changes to This Policy

We may update this Privacy Policy. When we do, we will update the "Last Updated" date above. Continued use of the service after changes constitutes acceptance of the updated policy. For significant changes, we will notify you by email or in-app notification.

---

## 12. Contact

**Email:** al.cloud365@gmail.com  
**Subject:** Privacy Policy Inquiry — HydroSource

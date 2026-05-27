# User Consent UI — HydroSource

## Overview

The consent banner is implemented in `components/ConsentBanner.tsx`. It appears on first visit and stores the user's choice in `localStorage` under the key `HydroSource_consent_v1`.

---

## Component: ConsentBanner

**File:** `components/ConsentBanner.tsx`  
**Type:** Client component (`'use client'`)

### Behavior
- Renders a fixed bottom banner on first visit (when `HydroSource_consent_v1` is absent from localStorage)
- "Accept & Continue" — stores `'accepted'` in localStorage, banner disappears
- "Decline" — stores `'declined'` in localStorage, banner disappears
- Does NOT block app access (banner is informational, not a hard gate)
- Banner includes links to Terms of Service and Privacy Policy pages

### Adding to the App

Add `<ConsentBanner />` to the root layout so it appears on every page:

```tsx
// app/layout.tsx
import ConsentBanner from '@/components/ConsentBanner'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <ConsentBanner />
      </body>
    </html>
  )
}
```

---

## Legal Pages

To serve the legal documents at public URLs, create two route files:

### app/legal/privacy/page.tsx
```tsx
import fs from 'fs'
import path from 'path'

export default function PrivacyPage() {
  const content = fs.readFileSync(
    path.join(process.cwd(), 'legal/privacy-policy.md'), 'utf-8'
  )
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 prose prose-invert">
      <pre className="whitespace-pre-wrap font-sans text-sm">{content}</pre>
    </main>
  )
}
```

### app/legal/terms/page.tsx
```tsx
import fs from 'fs'
import path from 'path'

export default function TermsPage() {
  const content = fs.readFileSync(
    path.join(process.cwd(), 'legal/terms-of-service.md'), 'utf-8'
  )
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 prose prose-invert">
      <pre className="whitespace-pre-wrap font-sans text-sm">{content}</pre>
    </main>
  )
}
```

> Alternatively, install `react-markdown` for proper Markdown rendering with headings and formatting.

---

## Consent on Signup

For stronger compliance (GDPR), require explicit consent during signup by adding a checkbox:

```tsx
// In signup form
<label className="flex items-start gap-2 text-xs text-white/60">
  <input
    type="checkbox"
    required
    className="mt-0.5"
    onChange={(e) => setConsentGiven(e.target.checked)}
  />
  <span>
    I agree to the{' '}
    <a href="/legal/terms" className="text-pool-400 underline">Terms of Service</a>
    {' '}and{' '}
    <a href="/legal/privacy" className="text-pool-400 underline">Privacy Policy</a>
  </span>
</label>
```

Then pass `consentGiven: true` to the signup API and store it in the `User` model as `consentGivenAt: DateTime?`.

---

## Cookie Notice

HydroSource uses only **functional cookies** (no advertising or tracking):

| Cookie | Type | Purpose | Duration |
|---|---|---|---|
| `HydroSource_token` | Functional | Auth session (httpOnly) | 7 days |
| `oauth_state` | Functional | CSRF protection during OAuth | Session |

Because these are strictly necessary for the service to function, they do not legally require consent in most jurisdictions. The banner is provided for transparency and best-practice compliance.

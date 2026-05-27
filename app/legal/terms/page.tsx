import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ background: '#0B1120' }}>
      <div className="max-w-2xl mx-auto px-5 py-16">

        <div className="mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-pool-400 text-sm font-semibold hover:text-pool-300 transition-colors mb-8">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            HydroSource
          </Link>
          <h1 className="font-display text-4xl font-black text-white mt-6 mb-3">Terms of Service</h1>
          <p className="text-white/40 text-sm">Effective April 25, 2026 · <a href="mailto:hydrosource.ai@appscloud365.com" className="hover:text-white/60 transition-colors">hydrosource.ai@appscloud365.com</a></p>
        </div>

        {/* Safety disclaimer — most prominent */}
        <div className="rounded-3xl p-5 mb-8" style={{ background: 'rgba(255,184,48,0.1)', border: '1px solid rgba(255,184,48,0.3)' }}>
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-caution flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-caution font-bold text-sm mb-1">Important Safety Notice</p>
              <p className="text-white/60 text-sm leading-relaxed">HydroSource provides informational recommendations only. Always verify chemical levels with a certified test kit before making adjustments. Consult a licensed pool professional for persistent issues. Do not allow swimming in water flagged as Critical until manually verified and corrected.</p>
            </div>
          </div>
        </div>

        <div className="space-y-8 text-white/65 text-sm leading-relaxed">

          <section>
            <h2 className="text-white font-bold text-lg mb-3">1. Acceptance</h2>
            <p>By creating an account or using HydroSource, you agree to these Terms. If you do not agree, do not use the service. These Terms form a legally binding agreement between you and HydroSource.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">2. AI Recommendations</h2>
            <p className="mb-3">Our AI recommendations are generated automatically and:</p>
            <ul className="space-y-2">
              {[
                'May contain errors, omissions, or outdated information',
                'Are based only on the data you provide',
                'Do not account for local water regulations or equipment quirks',
                'Are provided "as-is" without warranty',
                'Must be verified before acting on them',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-caution flex-shrink-0 mt-2" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">3. Eligibility</h2>
            <p>You must be at least 13 years old (18 in some jurisdictions), a human (no bots), and legally permitted to enter contracts in your jurisdiction.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">4. Account Responsibilities</h2>
            <ul className="space-y-2">
              {[
                'Provide accurate information when creating your account',
                'Keep your password confidential',
                'Notify us immediately at hydrosource.ai@appscloud365.com if you suspect unauthorized access',
                'You are responsible for all activity under your account',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-pool-400 flex-shrink-0 mt-2" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">5. Acceptable Use</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="space-y-2">
              {[
                'Use the service for any unlawful purpose',
                'Reverse-engineer, scrape, or extract data from the service',
                'Use automated bots to create accounts or submit tests',
                'Resell or redistribute the service without written permission',
                'Upload images containing personal information, nudity, or offensive content',
                'Interfere with or disrupt the service infrastructure',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <svg className="w-3.5 h-3.5 text-critical flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">6. Beta Program</h2>
            <p>During the beta period, features may change without notice, usage limits may change, and the service may be unavailable for maintenance at any time. Data may be reset during major upgrades — we will provide advance notice when possible.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">7. Subscriptions & Billing</h2>
            <div className="space-y-3">
              <p><span className="text-white font-semibold">Free Plan:</span> Core features with usage limits.</p>
              <p><span className="text-white font-semibold">Pro Plan:</span> Billed monthly or annually via Stripe. Renews automatically until cancelled.</p>
              <p><span className="text-white font-semibold">Cancellation:</span> Cancel anytime from Account Settings. Takes effect at end of billing period. No partial refunds.</p>
              <p><span className="text-white font-semibold">Refunds:</span> Within 7 days of initial purchase if unsatisfied. Email <a href="mailto:hydrosource.ai@appscloud365.com" className="text-pool-400 hover:text-pool-300 underline underline-offset-2">hydrosource.ai@appscloud365.com</a>.</p>
            </div>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">8. Limitation of Liability</h2>
            <p className="mb-3 text-white/80 font-medium">To the fullest extent permitted by law, we are not liable for:</p>
            <ul className="space-y-2">
              {[
                'Personal injury or property damage from following AI recommendations',
                'Indirect, incidental, or consequential damages',
                'Loss of data, profits, or business opportunities',
                'Service unavailability or downtime',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20 flex-shrink-0 mt-2" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4 p-3 rounded-xl text-xs" style={{ background: 'rgba(255,255,255,0.04)' }}>Our total liability shall not exceed the amount you paid us in the 12 months prior to the claim, or $100 USD, whichever is greater.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">9. Disclaimer of Warranties</h2>
            <p>THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND. We do not warrant that the service will be uninterrupted, error-free, or that AI recommendations will be accurate.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">10. Changes to Terms</h2>
            <p>We may modify these Terms at any time. We will notify you via email or in-app notification at least 14 days before material changes take effect. Continued use constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">11. Privacy</h2>
            <p>Your use of the service is subject to our <Link href="/legal/privacy" className="text-pool-400 hover:text-pool-300 underline underline-offset-2">Privacy Policy</Link>, incorporated into these Terms by reference.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">12. Contact</h2>
            <p className="mb-2">Questions about these Terms? Reach us:</p>
            <ul className="space-y-1.5">
              <li>Email: <a href="mailto:hydrosource.ai@appscloud365.com" className="text-pool-400 hover:text-pool-300 underline underline-offset-2">hydrosource.ai@appscloud365.com</a></li>
              <li>Phone: <a href="tel:+12144277224" className="text-pool-400 hover:text-pool-300 underline underline-offset-2">+1 (214) 427-7224</a></li>
            </ul>
          </section>

        </div>

        <div className="mt-12 pt-6 border-t border-white/8 flex items-center justify-between text-xs text-white/25">
          <span>HydroSource · Last updated April 25, 2026</span>
          <Link href="/legal/privacy" className="text-pool-400 hover:text-pool-300 transition-colors">Privacy Policy →</Link>
        </div>

      </div>
    </div>
  )
}

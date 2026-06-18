import Link from 'next/link'

export default function PrivacyPage() {
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
          <h1 className="font-display text-4xl font-black text-white mt-6 mb-3">Privacy Policy</h1>
          <p className="text-white/40 text-sm">Effective April 25, 2026 · <a href="mailto:hydrosource.ai@appscloud365.com" className="hover:text-white/60 transition-colors">hydrosource.ai@appscloud365.com</a></p>
        </div>

        <div className="space-y-8 text-white/65 text-sm leading-relaxed">

          <section>
            <h2 className="text-white font-bold text-lg mb-3">1. Who We Are</h2>
            <p>HydroSource is an AI-powered pool management application. We help pool owners and professionals analyze water chemistry and track pool maintenance. Contact us at hydrosource.ai@appscloud365.com.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">2. What We Collect</h2>
            <div className="space-y-3">
              <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-white font-semibold mb-1">Account Data</p>
                <p>Email address, hashed password (we cannot see your actual password), display name, avatar color preference.</p>
              </div>
              <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-white font-semibold mb-1">Pool & Chemistry Data</p>
                <p>Pool names, sizes, water chemistry readings (pH, chlorine, alkalinity, etc.), visual observations, and AI-generated analysis results.</p>
              </div>
              <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-white font-semibold mb-1">Test Strip Photos</p>
                <p>Processed in-memory by Google Gemini AI to extract readings. Photos are NOT stored on our servers.</p>
              </div>
              <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-white font-semibold mb-1">OAuth Sign-In Data</p>
                <p>If you sign in via Google, Microsoft, or Apple, we receive your email and a provider user ID. We never receive your password from these providers.</p>
              </div>
              <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-white font-semibold mb-1">Payment Data</p>
                <p>Payments are processed by Stripe. We store your subscription status and Stripe customer ID — never your credit card number.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">3. How We Use Your Data</h2>
            <ul className="space-y-2">
              {[
                'Provide AI water analysis and maintenance recommendations for service optimization purposes only',
                'Manage your account and subscription',
                'Send password reset emails when requested',
                'Detect and prevent fraud and unauthorized access',
                'Improve our AI model and app features',
                'Comply with legal obligations',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-pool-400 flex-shrink-0 mt-2" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-white/50 font-medium">We do not sell your data. We do not use your pool data for advertising. Chemistry data you submit is used solely to generate your personalized maintenance guidance — not to render regulatory opinions or legal compliance determinations.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">4. Third-Party Services</h2>
            <div className="space-y-2">
              {[
                { name: 'Google Gemini AI', use: 'Water chemistry analysis and test strip image reading' },
                { name: 'Stripe', use: 'Payment processing and subscription management' },
                { name: 'Google / Microsoft / Apple', use: 'Optional OAuth sign-in' },
              ].map((s) => (
                <div key={s.name} className="flex items-start gap-3 py-2.5 border-b border-white/6 last:border-0">
                  <span className="text-white font-medium w-44 flex-shrink-0">{s.name}</span>
                  <span>{s.use}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">5. Security</h2>
            <p className="mb-3">We protect your data with:</p>
            <ul className="space-y-1.5">
              {[
                'bcrypt password hashing (cost factor 12)',
                'HTTPS-only in production (HSTS)',
                'httpOnly session cookies',
                'Account lockout after 5 failed login attempts',
                'IP-based rate limiting on auth endpoints',
                'Stripe webhook signature verification',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <svg className="w-3.5 h-3.5 text-safe flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">6. Your Rights</h2>
            <p className="mb-3">You may request access to, correction of, or deletion of your personal data at any time by emailing al.cloud365@gmail.com. We will respond within 30 days.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">7. Cookies</h2>
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              {[
                { name: 'HydroSource_token', purpose: 'Authentication session', duration: '7 days' },
                { name: 'oauth_state', purpose: 'CSRF protection during OAuth', duration: 'Session' },
                { name: 'HydroSource_consent_v1', purpose: 'Cookie consent preference', duration: '1 year (localStorage)' },
              ].map((c, i) => (
                <div key={c.name} className="grid grid-cols-3 gap-2 px-4 py-3 text-xs border-b border-white/6 last:border-0"
                  style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : undefined }}>
                  <code className="text-pool-400 font-mono">{c.name}</code>
                  <span className="text-white/55">{c.purpose}</span>
                  <span className="text-white/35">{c.duration}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-white/40 text-xs">We use no advertising or tracking cookies.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">8. AI Recommendations — Scope and Limitations</h2>

            <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(0,111,255,0.07)', border: '1px solid rgba(0,111,255,0.2)' }}>
              <p className="text-white/80 font-semibold mb-1">General guidance only — not regulatory or legal advice</p>
              <p>HydroSource analyzes water chemistry data to provide general scientific suggestions based on standard pool chemistry principles (such as the Langelier Saturation Index). All recommendations are framed as suggestions, not authoritative instructions. Language such as &quot;based on your readings, we suggest…&quot; or &quot;a common approach is…&quot; is used intentionally. The AI will never state &quot;you must&quot; or &quot;you are required to&quot; with respect to any chemical action.</p>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-white font-semibold mb-1">No regulatory or legal compliance opinions</p>
                <p>HydroSource is not a licensed pool inspector, regulatory authority, or legal advisor. We do not cite, interpret, or apply any specific local, state, or federal regulations — including but not limited to TDLR rules, state health codes, OSHA standards, or HOA and commercial facility codes. Chemistry data you submit is used for service optimization only, not to render regulatory opinions.</p>
              </div>

              <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-white font-semibold mb-1">Commercial and public pools</p>
                <p>If your pool is a commercial or public facility (hotel, apartment complex, school, gym, HOA), our AI will include a prominent notice that commercial pools are subject to jurisdiction-specific health and safety regulations. You must verify all recommendations with your local authority or a licensed commercial pool operator before applying them. HydroSource assumes no responsibility for regulatory compliance decisions.</p>
              </div>

              <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-white font-semibold mb-1">No health safety guarantees</p>
                <p>HydroSource does not guarantee health or safety outcomes. We will not state that a pool &quot;is safe to swim in&quot; based solely on chemistry readings. Our language is deliberately limited to phrases such as &quot;the readings are within a commonly accepted range&quot; or &quot;these levels suggest the water is approaching a balanced state.&quot; When a reading indicates a potential health or equipment risk, we flag it clearly and recommend consulting a certified pool professional or local health authority before allowing pool use.</p>
              </div>

              <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-white font-semibold mb-1">Chemical dosing</p>
                <p>Dosing amounts provided are based on standard water chemistry formulas and are presented as ranges for general reference. Actual dosing must be confirmed against your specific product label and pool conditions. HydroSource is not liable for outcomes resulting from the application of any suggested chemical treatment without appropriate professional verification.</p>
              </div>

              <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-white font-semibold mb-1">Limitation of liability</p>
                <p>This tool provides general guidance only. Pool conditions vary and professional judgment should always be applied. HydroSource is not a substitute for professional inspection, regulatory compliance, or licensed pool service. By using this application, you acknowledge that all decisions regarding pool treatment and swimmer safety remain solely your responsibility.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">9. Contact</h2>
            <p className="mb-2">Questions about this Privacy Policy or your data? Reach us:</p>
            <ul className="space-y-1.5">
              <li>Email: <a href="mailto:hydrosource.ai@appscloud365.com" className="text-pool-400 hover:text-pool-300 underline underline-offset-2">hydrosource.ai@appscloud365.com</a></li>
              <li>Phone: <a href="tel:+12144277224" className="text-pool-400 hover:text-pool-300 underline underline-offset-2">+1 (214) 427-7224</a></li>
            </ul>
            <p className="mt-3 text-white/40 text-xs">We will respond to all data requests within 30 days.</p>
          </section>

        </div>

        <div className="mt-12 pt-6 border-t border-white/8 flex items-center justify-between text-xs text-white/25">
          <span>HydroSource · Last updated April 25, 2026</span>
          <Link href="/legal/terms" className="text-pool-400 hover:text-pool-300 transition-colors">Terms of Service →</Link>
        </div>

      </div>
    </div>
  )
}

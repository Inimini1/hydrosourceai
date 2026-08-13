import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function LandingPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (session) redirect('/dashboard')

  const features = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M4 7h16M4 7l1.5 12a2 2 0 002 1.8h9a2 2 0 002-1.8L20 7M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
        </svg>
      ),
      title: 'Scan your test strip',
      bullets: [
        'Snap a photo. Get instant readings.',
        'Exact product and amount for your pool size.',
        'No manual color-matching guesswork.',
      ],
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Full service history',
      bullets: [
        'Every test, logged automatically.',
        'Every chemical added, tracked.',
        'One searchable timeline, always up to date.',
      ],
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      title: 'Safety alerts',
      bullets: [
        'Instant alert when chlorine drops too low.',
        'Instant alert when pH swings out of range.',
        'Know before anyone swims.',
      ],
    },
  ]

  const steps = [
    { n: '01', title: 'Test your water', body: 'Use any standard test kit or test strips. Record what you see.' },
    { n: '02', title: 'Enter your readings', body: 'Chlorine, pH, alkalinity, and more. Takes seconds.' },
    { n: '03', title: 'Get your fix plan', body: 'Exact products and quantities, calculated for your pool size.' },
  ]

  const trustPoints = ['Encrypted & secure', 'Free during beta', 'No credit card', 'Satisfaction guarantee']

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'HydroSource AI',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: 'Pool water chemistry analysis and treatment plans for pool owners and professionals.',
    url: 'https://hydrosource.appscloud365.com',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  }

  // Structure borrows Apple's centered-hero, full-bleed-wash, pill-button
  // language — colors stay HydroSource's own teal/cyan, not Apple's blues.
  const INK = '#061b31'
  const SLATE = '#64748d'
  const STEEL = '#50617a'
  const SMOKE = '#839bc8'
  const FROST = '#e5edf5'
  const MIST = '#f8fafd'
  const CANVAS = '#f6f9fc'
  const TEAL_WASH = '#eefaf8'
  const TEAL = '#00C9B1'
  const CYAN = '#00f2ff'
  const TEAL_BORDER = '#8be3d8'
  const PILL = '9999px'

  return (
    <div className="min-h-screen bg-white" style={{ fontFeatureSettings: '"ss01" on, "tnum" on' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Nav ─────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white" style={{ borderBottom: `1px solid ${FROST}` }}>
        <div className="max-w-[1320px] mx-auto px-6 flex items-center justify-between" style={{ height: '72px' }}>
          <div className="flex items-center gap-2.5">
            <svg width="24" height="24" viewBox="0 0 100 100" aria-hidden="true">
              <defs>
                <linearGradient id="nav-drop-grad" x1="20%" y1="0%" x2="85%" y2="100%">
                  <stop stopColor={CYAN} />
                  <stop offset="1" stopColor={TEAL} />
                </linearGradient>
              </defs>
              <path d="M50 14 C50 14 26 46 26 66 C26 83.12 36.66 96 50 96 C63.34 96 74 83.12 74 66 C74 46 50 14 50 14 Z" fill="url(#nav-drop-grad)" />
              <circle cx="50" cy="68" r="11" fill="none" stroke="#ffffff" strokeWidth="3" />
            </svg>
            <span className="text-[15px] font-semibold tracking-tight" style={{ color: INK }}>HydroSource AI</span>
          </div>
          <div className="flex items-center gap-7">
            <a href="mailto:hydrosource.ai@appscloud365.com"
              className="hidden sm:block text-[13px] transition-colors"
              style={{ color: SLATE }}>
              Support
            </a>
            <Link href="/login" className="text-[13px] font-normal transition-colors" style={{ color: INK }}>
              Sign in
            </Link>
            <Link href="/signup"
              className="text-[13px] font-normal text-white transition-opacity hover:opacity-90"
              style={{ background: TEAL, borderRadius: PILL, padding: '9px 18px' }}>
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero — centered stack, product visual floating below ───── */}
      <section className="px-6 text-center" style={{ background: CANVAS, paddingTop: '176px', paddingBottom: '96px' }}>
        <div className="max-w-[880px] mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 mb-7 text-[12px] font-medium"
            style={{ border: `1px solid ${TEAL_BORDER}`, borderRadius: PILL, color: TEAL, background: '#ffffff' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: TEAL }} />
            Now in beta
          </span>

          <h1 className="font-semibold mb-5"
            style={{ fontSize: 'clamp(2.75rem, 7vw, 4.5rem)', lineHeight: 1.06, letterSpacing: '-2.2px', color: INK }}>
            Your pool chemistry,{' '}
            <span style={{ color: TEAL }}>perfected.</span>
          </h1>

          <p className="mb-10 mx-auto" style={{ fontSize: '21px', lineHeight: 1.45, letterSpacing: '-0.3px', color: SLATE, fontWeight: 300, maxWidth: '560px' }}>
            Know exactly what to add, and exactly when. Crystal-clear water, every time — no guesswork, no pool store trips.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-9">
            <Link href="/signup"
              className="inline-flex items-center justify-center text-white transition-opacity hover:opacity-90"
              style={{ fontSize: '17px', background: TEAL, borderRadius: PILL, padding: '13px 28px' }}>
              Start free, no card needed
            </Link>
            <Link href="/login"
              className="inline-flex items-center justify-center transition-colors"
              style={{ fontSize: '17px', background: 'transparent', color: TEAL, border: `1px solid ${TEAL_BORDER}`, borderRadius: PILL, padding: '12px 28px' }}>
              Already have an account
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-4">
            {trustPoints.map((label) => (
              <span key={label} className="inline-flex items-center gap-2 text-[13px]" style={{ color: STEEL }}>
                <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: TEAL }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 13l4 4L19 7" />
                </svg>
                {label}
              </span>
            ))}
          </div>
          <p className="text-[13px]" style={{ color: SLATE }}>
            Questions? <a href="mailto:hydrosource.ai@appscloud365.com" style={{ color: TEAL }}>hydrosource.ai@appscloud365.com</a>
          </p>
        </div>

        {/* Product visual — floating panel, the "device render" of the page */}
        <div className="max-w-[720px] mx-auto mt-16 text-left">
          <div className="p-6 bg-white"
            style={{ border: `1px solid ${FROST}`, borderRadius: '14px', boxShadow: '0 30px 70px -20px rgba(6,27,49,0.22), 0 10px 24px -8px rgba(6,27,49,0.10)' }}>

            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[10px] uppercase mb-0.5" style={{ color: SMOKE, letterSpacing: '0.08em' }}>Sample analysis</p>
                <p className="text-base font-normal" style={{ color: INK }}>Water Analysis</p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-medium"
                  style={{ background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.25)', color: '#b45309', borderRadius: PILL }}>
                  Needs attention
                </span>
                <p className="text-[10px] mt-1" style={{ color: SLATE }}>Score: 62 / 100</p>
              </div>
            </div>

            <div className="space-y-2 mb-5">
              {[
                { label: 'Free Chlorine', val: '0.8', unit: 'ppm', status: 'low', color: '#b45309', pct: 16, idealL: 20, idealW: 40 },
                { label: 'pH', val: '7.4', unit: '', status: 'ok', color: INK, pct: 47, idealL: 37, idealW: 27 },
                { label: 'Alkalinity', val: '105', unit: 'ppm', status: 'ok', color: INK, pct: 52, idealL: 32, idealW: 25 },
                { label: 'CYA', val: '55', unit: 'ppm', status: 'high', color: '#b45309', pct: 73, idealL: 40, idealW: 27 },
              ].map((r) => (
                <div key={r.label} className="px-3 py-2.5" style={{ background: MIST, border: `1px solid ${FROST}`, borderRadius: '8px' }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px]" style={{ color: SLATE }}>{r.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-medium px-1.5 py-0.5 uppercase" style={{ color: r.status === 'ok' ? SLATE : r.color, borderRadius: '4px' }}>
                        {r.status === 'ok' ? 'In range' : r.status === 'low' ? 'Low' : 'High'}
                      </span>
                      <span className="text-sm font-normal" style={{ color: r.color }}>
                        {r.val}<span className="text-[9px] ml-0.5" style={{ color: SLATE }}>{r.unit}</span>
                      </span>
                    </div>
                  </div>
                  <div className="relative h-1" style={{ background: FROST, borderRadius: PILL }}>
                    <div className="absolute h-full" style={{ left: `${r.idealL}%`, width: `${r.idealW}%`, background: 'rgba(0,201,177,0.18)', borderRadius: PILL }} />
                    <div className="absolute w-2.5 h-2.5 rounded-full border-2 -top-[3px] -translate-x-1/2"
                      style={{ left: `${r.pct}%`, background: r.color, borderColor: '#ffffff' }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3" style={{ background: 'rgba(0,201,177,0.04)', border: '1px solid rgba(0,201,177,0.14)', borderRadius: '8px' }}>
              <p className="text-[9px] uppercase mb-2" style={{ color: SMOKE, letterSpacing: '0.08em' }}>Treatment plan</p>
              <div className="space-y-1.5">
                {[
                  'Raise chlorine with liquid chlorine (10%): 52 fl oz for 20,000 gal',
                  'Reduce CYA with a 20% partial drain. No chemical fix exists.',
                  'Retest in 24 hrs after chlorine addition',
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-4 h-4 flex items-center justify-center text-[8px] font-medium flex-shrink-0 mt-0.5"
                      style={{ background: 'rgba(0,201,177,0.10)', color: TEAL, borderRadius: PILL }}>{i + 1}</span>
                    <p className="text-[10px] leading-relaxed" style={{ color: STEEL }}>{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[9px] uppercase mt-3 text-right" style={{ color: SMOKE, letterSpacing: '0.06em' }}>Illustrative example</p>
          </div>
          <p className="text-xs mt-4 text-center" style={{ color: SLATE }}>Instant diagnosis — no pool store trip</p>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section className="px-6 text-center" style={{ paddingTop: '112px', paddingBottom: '112px' }}>
        <div className="max-w-[1320px] mx-auto">
          <p className="text-[13px] uppercase mb-3" style={{ color: SLATE, letterSpacing: '0.08em' }}>Everything you need</p>
          <h2 className="font-semibold mb-16 mx-auto" style={{ fontSize: 'clamp(2.1rem, 5vw, 3rem)', lineHeight: 1.12, letterSpacing: '-1.1px', color: INK, maxWidth: '640px' }}>
            Built for pool owners who take water seriously
          </h2>

          <div className="grid md:grid-cols-3 gap-12 text-left">
            {features.map((f, i) => (
              <div key={i}>
                <div className="mb-5" style={{ color: TEAL }}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold mb-3" style={{ color: INK, letterSpacing: '-0.2px' }}>{f.title}</h3>
                <ul className="space-y-1.5">
                  {f.bullets.map((b) => (
                    <li key={b} className="text-[15px] leading-relaxed" style={{ color: STEEL }}>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────── */}
      <section className="px-6 text-center" style={{ paddingTop: '112px', paddingBottom: '112px', background: CANVAS }}>
        <div className="max-w-[1320px] mx-auto">
          <p className="text-[13px] uppercase mb-3" style={{ color: SLATE, letterSpacing: '0.08em' }}>Dead simple</p>
          <h2 className="font-semibold mb-16 mx-auto" style={{ fontSize: 'clamp(2.1rem, 5vw, 3rem)', lineHeight: 1.12, letterSpacing: '-1.1px', color: INK, maxWidth: '640px' }}>
            From test to answer in three steps
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            {steps.map((s) => (
              <div key={s.n}>
                <p className="text-[15px] mb-3" style={{ color: TEAL, fontWeight: 600, fontFeatureSettings: '"tnum" on' }}>{s.n}</p>
                <h3 className="text-lg font-semibold mb-2" style={{ color: INK, letterSpacing: '-0.2px' }}>{s.title}</h3>
                <p className="text-[15px] leading-relaxed" style={{ color: STEEL }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing teaser ───────────────────────────────────────── */}
      <section className="px-6 text-center" style={{ paddingTop: '112px', paddingBottom: '112px' }}>
        <div className="max-w-[640px] mx-auto">
          <p className="text-[13px] uppercase mb-3" style={{ color: SLATE, letterSpacing: '0.08em' }}>Pricing</p>
          <h2 className="font-semibold mb-4" style={{ fontSize: 'clamp(2.1rem, 5vw, 3rem)', lineHeight: 1.12, letterSpacing: '-1.1px', color: INK }}>
            Simple, honest pricing
          </h2>
          <p className="mb-10" style={{ fontSize: '19px', lineHeight: 1.45, color: SLATE, fontWeight: 300 }}>
            Free during beta. Plans for pool owners and pool professionals.
          </p>

          <div className="mb-10 px-5 py-4 flex items-start gap-4 text-left" style={{ background: MIST, border: `1px solid ${FROST}`, borderRadius: '14px' }}>
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: TEAL }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div>
              <p className="text-sm font-medium" style={{ color: INK }}>Performance guarantee</p>
              <p className="text-sm mt-0.5" style={{ color: STEEL }}>Not satisfied with a paid plan? Contact <a href="mailto:hydrosource.ai@appscloud365.com" style={{ color: TEAL }}>hydrosource.ai@appscloud365.com</a> and we will review within 48 hours.</p>
            </div>
          </div>

          <Link href="/pricing"
            className="inline-flex items-center justify-center text-white transition-opacity hover:opacity-90"
            style={{ fontSize: '17px', background: TEAL, borderRadius: PILL, padding: '13px 28px' }}>
            See plans & pricing
          </Link>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────── */}
      <section className="px-6 text-center" style={{ paddingTop: '112px', paddingBottom: '112px', background: TEAL_WASH }}>
        <div className="max-w-[640px] mx-auto">
          <p className="text-[13px] uppercase mb-3" style={{ color: SLATE, letterSpacing: '0.08em' }}>Now in early beta</p>
          <h2 className="font-semibold mb-5" style={{ fontSize: 'clamp(2.1rem, 5vw, 3rem)', lineHeight: 1.12, letterSpacing: '-1.1px', color: INK }}>
            Ready for perfectly balanced water?
          </h2>
          <p className="mb-9" style={{ fontSize: '19px', lineHeight: 1.45, color: SLATE, fontWeight: 300 }}>
            Stop guessing. Start knowing exactly what your pool needs. Free during beta.
          </p>
          <Link href="/signup"
            className="inline-flex items-center justify-center text-white transition-opacity hover:opacity-90"
            style={{ fontSize: '17px', background: TEAL, borderRadius: PILL, padding: '13px 28px' }}>
            Get started free, no card needed
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="px-6 pt-10 pb-8" style={{ background: MIST, borderTop: `1px solid ${FROST}` }}>
        <div className="max-w-[1320px] mx-auto space-y-6">

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6" style={{ borderBottom: `1px solid ${FROST}` }}>
            <div>
              <p className="text-xs" style={{ color: SLATE }}>Support</p>
              <a href="mailto:hydrosource.ai@appscloud365.com" className="text-sm" style={{ color: INK }}>
                hydrosource.ai@appscloud365.com
              </a>
            </div>
            <p className="text-xs text-center sm:text-right" style={{ color: SLATE }}>
              We respond within 48 hours. Satisfaction guarantee on all paid plans.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <svg width="20" height="20" viewBox="0 0 100 100" aria-hidden="true">
                <defs>
                  <linearGradient id="footer-drop-grad" x1="20%" y1="0%" x2="85%" y2="100%">
                    <stop stopColor={CYAN} />
                    <stop offset="1" stopColor={TEAL} />
                  </linearGradient>
                </defs>
                <path d="M50 14 C50 14 26 46 26 66 C26 83.12 36.66 96 50 96 C63.34 96 74 83.12 74 66 C74 46 50 14 50 14 Z" fill="url(#footer-drop-grad)" />
                <circle cx="50" cy="68" r="11" fill="none" stroke="#ffffff" strokeWidth="3" />
              </svg>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-4 text-xs" style={{ color: SLATE }}>
                <span className="text-sm font-semibold" style={{ color: INK }}>HydroSource AI</span>
                <span className="hidden sm:inline">·</span>
                <span>© {new Date().getFullYear()} All rights reserved.</span>
              </div>
            </div>
            <div className="flex items-center gap-5 text-xs" style={{ color: SLATE }}>
              <Link href="/legal/terms">Terms</Link>
              <Link href="/legal/privacy">Privacy</Link>
              <Link href="/legal/accessibility">Accessibility</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

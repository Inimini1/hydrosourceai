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
          <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
          <path d="M12 12l3-3m0 0l3 3m-3-3v6" />
        </svg>
      ),
      iconBg: 'rgba(0,201,177,0.10)',
      iconBorder: 'rgba(0,201,177,0.20)',
      iconColor: '#00A99A',
      title: 'AI Water Analysis',
      desc: 'Enter your readings — chlorine, pH, alkalinity, calcium hardness — and get an instant Gemini AI diagnosis with exact dosing instructions. No chemistry degree needed.',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      iconBg: 'rgba(0,111,255,0.08)',
      iconBorder: 'rgba(0,111,255,0.15)',
      iconColor: '#006FFF',
      title: 'Full Service History',
      desc: 'Every chemical added, every visit logged, every reading tracked. Your complete pool history in a searchable timeline — invaluable for troubleshooting and selling the house.',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      iconBg: 'rgba(245,158,11,0.08)',
      iconBorder: 'rgba(245,158,11,0.15)',
      iconColor: '#D97706',
      title: 'Safety Alerts',
      desc: 'Critical readings trigger real-time in-app notifications. Know the moment chlorine drops dangerously low or pH goes out of range — before anyone gets in the water.',
    },
  ]

  const steps = [
    { n: '01', title: 'Test your water', body: 'Use any standard test kit or test strips. Record the numbers you see.' },
    { n: '02', title: 'Enter your readings', body: 'Input chlorine, pH, alkalinity, and more into HydroSource in seconds.' },
    { n: '03', title: 'Get your fix plan', body: 'Gemini AI analyzes your readings and gives you exact products and quantities to add.' },
  ]

  const tickerItems = [
    'Powered by Google Gemini AI',
    'Free during beta',
    'Real-time safety alerts',
    'No credit card needed',
    'AI water diagnosis',
    'Full service history',
    'Encrypted & private',
    'iOS & Android coming soon',
  ]

  return (
    <div className="min-h-screen bg-white overflow-hidden">

      {/* ── Nav ─────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
              <path d="M15 3C15 3 5 12.5 5 18.5C5 24.299 9.477 29 15 29C20.523 29 25 24.299 25 18.5C25 12.5 15 3 15 3Z" fill="url(#drop-grad)" />
              <ellipse cx="11" cy="16" rx="2.5" ry="3.5" fill="rgba(255,255,255,0.35)" transform="rotate(-20 11 16)" />
              <defs>
                <linearGradient id="drop-grad" x1="5" y1="3" x2="25" y2="29" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00f2ff" />
                  <stop offset="1" stopColor="#00C9B1" />
                </linearGradient>
              </defs>
            </svg>
            <span className="font-display font-bold text-[17px] tracking-tight wordmark-gradient">HydroSource</span>
          </div>
          <div className="flex items-center gap-1.5">
            <a href="mailto:hydrosource.ai@appscloud365.com"
              className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 font-medium px-3 py-2 transition-colors duration-200">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Support
            </a>
            <Link href="/login" className="text-sm text-slate-500 hover:text-slate-900 font-medium px-4 py-2 transition-colors duration-200 cursor-pointer">
              Sign in
            </Link>
            <Link href="/signup"
              className="text-sm bg-slate-900 hover:bg-slate-700 text-white font-semibold px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Info Ticker ─────────────────────────────────────────── */}
      <div className="fixed top-[52px] inset-x-0 z-40 border-b border-slate-100 py-2 bg-slate-50/95 backdrop-blur-md">
        <div className="ticker-wrap">
          <div className="ticker-inner">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span key={i} className="flex items-center gap-6 px-8 text-xs text-slate-400 font-medium tracking-wider uppercase whitespace-nowrap">
                <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'rgba(0,201,177,0.60)' }} />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center px-5 pt-32 pb-20 bg-gradient-to-b from-white to-slate-50">

        {/* Subtle ambient gradients */}
        <div className="absolute top-0 left-0 w-[700px] h-[700px] pointer-events-none rounded-full opacity-60"
          style={{ background: 'radial-gradient(circle, rgba(0,201,177,0.06) 0%, transparent 65%)' }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] pointer-events-none rounded-full opacity-40"
          style={{ background: 'radial-gradient(circle, rgba(0,111,255,0.05) 0%, transparent 65%)' }} />

        <div className="relative max-w-6xl mx-auto w-full grid lg:grid-cols-[1fr_420px] gap-16 items-center">

          {/* Left — copy */}
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-8 animate-in">
              <span className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold tracking-wider uppercase"
                style={{ background: 'rgba(0,201,177,0.08)', border: '1px solid rgba(0,201,177,0.20)', color: '#00A99A' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                Now in Beta
              </span>
              {/* Google Gemini attribution — text only per Google API terms (no official logo) */}
              <span className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide"
                style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)', color: '#64748b' }}>
                <span className="flex items-center gap-0.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: '#4285F4' }} />
                  <span className="w-2 h-2 rounded-full" style={{ background: '#EA4335' }} />
                  <span className="w-2 h-2 rounded-full" style={{ background: '#FBBC04' }} />
                  <span className="w-2 h-2 rounded-full" style={{ background: '#34A853' }} />
                </span>
                AI powered by Google Gemini
              </span>
            </div>

            <h1 className="font-display font-bold text-slate-900 leading-[1.04] mb-6 tracking-tight animate-in-delay-1"
              style={{ fontSize: 'clamp(2.6rem, 5.5vw, 4.2rem)' }}>
              Your pool chemistry,{' '}
              <span className="gradient-text-vivid">perfected by AI.</span>
            </h1>

            <p className="text-lg text-slate-500 mb-8 max-w-[520px] leading-relaxed animate-in-delay-2" style={{ fontWeight: 400 }}>
              Know exactly what to add, when to add it, and why.
              No guessing. No algae. No expensive pool store visits.
              Just crystal-clear water, every time.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-in-delay-3">
              <Link href="/signup"
                className="btn-shimmer inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-sm cursor-pointer">
                Start Free — No Card Needed
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-sm font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 transition-all duration-200 cursor-pointer">
                Already have an account
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-2 animate-in-delay-3">
              {[
                { label: 'Encrypted & secure', lock: true },
                { label: 'Free during beta', lock: false },
                { label: 'No credit card', lock: false },
                { label: 'Satisfaction guarantee', lock: false },
              ].map((chip, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-slate-500 font-medium"
                  style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.07)', fontSize: '0.7rem', letterSpacing: '0.04em' }}>
                  {chip.lock ? (
                    <svg className="w-3 h-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3" style={{ color: '#00A99A' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {chip.label}
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-3 animate-in-delay-3">
              Questions? <a href="mailto:hydrosource.ai@appscloud365.com" className="text-slate-500 hover:text-slate-700 underline underline-offset-2 transition-colors">hydrosource.ai@appscloud365.com</a>
            </p>
          </div>

          {/* Right — realistic sample analysis output */}
          <div className="hidden lg:block relative">
            <div className="rounded-3xl p-5 animate-float-gentle relative bg-white"
              style={{ maxHeight: '520px', overflowY: 'hidden', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 20px 60px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.06)' }}>

              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] font-mono text-slate-400 tracking-widest uppercase mb-0.5">Sample Analysis</p>
                  <p className="font-display font-semibold text-slate-900 text-base">Water Analysis</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold"
                    style={{ background: 'rgba(255,184,48,0.10)', border: '1px solid rgba(255,184,48,0.25)', color: '#D97706' }}>
                    ⚡ Needs Attention
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">Score: 62 / 100</p>
                </div>
              </div>

              {/* Parameter gauges */}
              <div className="space-y-2 mb-4">
                {[
                  { label: 'Free Chlorine', val: '0.8', unit: 'ppm', status: 'low', color: '#D97706', pct: 16, idealL: 20, idealW: 40 },
                  { label: 'pH', val: '7.4', unit: '', status: 'ok', color: '#00A99A', pct: 47, idealL: 37, idealW: 27 },
                  { label: 'Alkalinity', val: '105', unit: 'ppm', status: 'ok', color: '#00A99A', pct: 52, idealL: 32, idealW: 25 },
                  { label: 'CYA', val: '55', unit: 'ppm', status: 'high', color: '#D97706', pct: 73, idealL: 40, idealW: 27 },
                ].map((r) => (
                  <div key={r.label} className="rounded-xl px-3 py-2.5"
                    style={{ background: r.status !== 'ok' ? 'rgba(255,184,48,0.04)' : '#f8fafc', border: `1px solid ${r.status !== 'ok' ? 'rgba(255,184,48,0.20)' : 'rgba(0,0,0,0.06)'}` }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-medium text-slate-500">{r.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase"
                          style={{ background: `${r.color}18`, color: r.color }}>
                          {r.status === 'ok' ? 'In Range' : r.status === 'low' ? 'Low' : 'High'}
                        </span>
                        <span className="font-display font-black text-sm" style={{ color: r.status === 'ok' ? '#0f172a' : r.color }}>
                          {r.val}<span className="text-[9px] font-medium text-slate-400 ml-0.5">{r.unit}</span>
                        </span>
                      </div>
                    </div>
                    <div className="relative h-1 rounded-full" style={{ background: 'rgba(0,0,0,0.06)' }}>
                      <div className="absolute h-full rounded-full" style={{ left: `${r.idealL}%`, width: `${r.idealW}%`, background: 'rgba(0,169,154,0.20)' }} />
                      <div className="absolute w-2.5 h-2.5 rounded-full border-2 -top-[3px] -translate-x-1/2"
                        style={{ left: `${r.pct}%`, background: r.color, borderColor: '#ffffff' }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* AI treatment plan */}
              <div className="rounded-xl p-3 mb-3" style={{ background: 'rgba(0,111,255,0.04)', border: '1px solid rgba(0,111,255,0.14)' }}>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Treatment Plan</p>
                <div className="space-y-1.5">
                  {[
                    'Raise chlorine with liquid chlorine (10%): 52 fl oz for 20,000 gal',
                    'Reduce CYA via 20% partial drain — no chemical fix exists',
                    'Retest in 24 hrs after chlorine addition',
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0 mt-0.5"
                        style={{ background: 'rgba(0,111,255,0.10)', color: '#006FFF' }}>{i + 1}</span>
                      <p className="text-[10px] text-slate-500 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="flex items-center gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#4285F4' }} />
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#EA4335' }} />
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#FBBC04' }} />
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#34A853' }} />
                  </span>
                  <p className="text-[9px] text-slate-400 tracking-wide">AI powered by Google Gemini</p>
                </div>
                <p className="text-[9px] text-slate-300 uppercase tracking-wider">Illustrative example</p>
              </div>

              {/* Fade-out gradient at bottom */}
              <div className="absolute bottom-0 inset-x-0 h-16 rounded-b-3xl pointer-events-none"
                style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.95))' }} />
            </div>

            <div className="absolute -bottom-4 -left-6 bg-white rounded-2xl px-4 py-3 animate-float"
              style={{ animationDelay: '1.6s', animationDuration: '6s', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#00C9B1' }} />
                <p className="text-[10px] font-semibold" style={{ color: '#00A99A' }}>Instant diagnosis — no pool store trip</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      {/* ── Features ─────────────────────────────────────────────── */}
      <section className="py-24 px-5 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-mono uppercase tracking-[0.15em] mb-4" style={{ color: '#00A99A' }}>Everything you need</p>
            <h2 className="font-display font-bold text-slate-900 mb-4 tracking-tight" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
              Built for pool owners
              <br />
              <span className="gradient-text-vivid">who take water seriously</span>
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto leading-relaxed">
              One app replaces the guesswork, the forum searches, and the expensive pool store visits.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div key={i} className="rounded-3xl p-7 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{ border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: f.iconBg, border: `1px solid ${f.iconBorder}`, color: f.iconColor }}>
                  {f.icon}
                </div>
                <h3 className="font-display font-semibold text-slate-900 text-lg mb-3">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────── */}
      <section className="py-20 px-5 bg-slate-50">
        <div className="max-w-4xl mx-auto relative">
          <div className="text-center mb-14">
            <p className="text-xs font-mono uppercase tracking-[0.15em] mb-4" style={{ color: '#00A99A' }}>Dead simple</p>
            <h2 className="font-display font-bold text-slate-900 tracking-tight" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
              From test to answer<br />
              <span className="gradient-text-vivid">in three steps</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-8 left-[calc(33%-12px)] right-[calc(33%-12px)] h-px"
              style={{ background: 'rgba(0,201,177,0.25)' }} />

            {steps.map((s, i) => (
              <div key={i} className="relative flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5 font-mono font-bold text-lg relative z-10"
                  style={{ background: 'rgba(0,201,177,0.08)', border: '2px solid rgba(0,201,177,0.25)', color: '#00A99A' }}>
                  {s.n}
                </div>
                <h3 className="font-display font-semibold text-slate-900 text-base mb-2">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      {/* ── Pricing ──────────────────────────────────────────────── */}
      <section className="py-24 px-5 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-mono uppercase tracking-[0.15em] mb-4" style={{ color: '#00A99A' }}>Pricing</p>
            <h2 className="font-display font-bold text-slate-900 tracking-tight mb-3" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
              Simple, honest pricing
            </h2>
            <p className="text-slate-500">Free to use during beta. Pro features coming soon.</p>
          </div>

          {/* Guarantee banner */}
          <div className="max-w-2xl mx-auto mb-8 rounded-2xl px-5 py-4 flex items-center gap-4"
            style={{ background: 'rgba(0,201,177,0.05)', border: '1px solid rgba(0,201,177,0.15)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(0,201,177,0.10)' }}>
              <svg className="w-5 h-5" style={{ color: '#00A99A' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Performance guarantee</p>
              <p className="text-xs text-slate-500 mt-0.5">If a paid subscription produces a demonstrably incorrect analysis or fails to deliver actionable guidance, we will issue a full refund for that billing period. Contact <a href="mailto:hydrosource.ai@appscloud365.com" className="text-teal-600 hover:text-teal-700 underline underline-offset-2 transition-colors">hydrosource.ai@appscloud365.com</a> with your account details and we will review within 48 hours.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {/* Free */}
            <div className="rounded-3xl p-7 bg-white" style={{ border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <p className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">Free</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="font-display text-4xl font-bold text-slate-900">$0</span>
              </div>
              <p className="text-slate-400 text-sm mb-6">Free during beta</p>
              <ul className="space-y-3 mb-8">
                {['5 water tests / month', '1 pool', 'AI water analysis', 'Service history log', 'In-app safety alerts'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-600">
                    <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#00A99A' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup"
                className="block text-center py-3 rounded-2xl font-semibold text-sm transition-all duration-200 cursor-pointer text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                style={{ border: '1px solid rgba(0,0,0,0.12)' }}>
                Get started free
              </Link>
            </div>

            {/* Pro — Coming Soon */}
            <div className="rounded-3xl p-7 relative overflow-hidden"
              style={{ background: 'linear-gradient(145deg, rgba(0,201,177,0.05), rgba(0,111,255,0.04))', border: '2px solid rgba(0,201,177,0.25)', boxShadow: '0 4px 24px rgba(0,201,177,0.08)' }}>
              <div className="absolute top-0 right-0 w-48 h-48 opacity-30 blur-3xl pointer-events-none"
                style={{ background: 'radial-gradient(circle, #00C9B1, transparent)', transform: 'translate(30%, -30%)' }} />

              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">Pro</p>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="font-display text-4xl font-bold text-slate-900">$9</span>
                    <span className="font-display text-xl font-bold text-slate-400 pb-1">.99</span>
                  </div>
                  <p className="text-slate-400 text-sm">per month</p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg"
                  style={{ background: 'rgba(0,201,177,0.10)', color: '#00A99A', border: '1px solid rgba(0,201,177,0.25)' }}>
                  Coming soon
                </span>
              </div>

              <ul className="space-y-3 mb-8 mt-5">
                {[
                  'Unlimited water tests',
                  'Multiple pools',
                  'Full service history',
                  'AI analysis & recommendations',
                  'In-app notifications',
                  'Email support',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-700">
                    <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#00C9B1' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/signup"
                className="btn-shimmer block text-center py-3 rounded-2xl text-sm cursor-pointer relative z-10">
                Sign Up — Get Early Access
              </Link>
              <p className="text-center text-[11px] text-slate-400 mt-3">Pro billing not yet active — sign up free</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────── */}
      <section className="py-20 px-5 bg-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,201,177,0.06) 0%, transparent 70%)' }} />
        </div>
        <div className="max-w-2xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6 text-xs font-bold uppercase tracking-wider"
            style={{ background: 'rgba(0,201,177,0.08)', border: '1px solid rgba(0,201,177,0.20)', color: '#00A99A' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            Now in early beta
          </div>
          <h2 className="font-display font-bold text-slate-900 mb-5 tracking-tight" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
            Ready for perfectly<br />
            <span className="gradient-text-vivid">balanced water?</span>
          </h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            Stop guessing. Start knowing exactly what your pool needs. Free during beta.
          </p>
          <Link href="/signup"
            className="btn-shimmer inline-flex items-center gap-2.5 px-10 py-4 rounded-2xl text-sm cursor-pointer">
            Get Started Free — No Card Needed
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-slate-200 pt-10 pb-8 px-5">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Support email row — always visible */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,201,177,0.08)' }}>
                <svg className="w-4 h-4" style={{ color: '#00A99A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Support</p>
                <a href="mailto:hydrosource.ai@appscloud365.com"
                  className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">
                  hydrosource.ai@appscloud365.com
                </a>
              </div>
            </div>
            <p className="text-xs text-slate-400 text-center sm:text-right">
              We respond within 48 hours · Satisfaction guarantee on all paid plans
            </p>
          </div>

          {/* Bottom row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <svg width="22" height="22" viewBox="0 0 30 30" fill="none">
                <path d="M15 3C15 3 5 12.5 5 18.5C5 24.299 9.477 29 15 29C20.523 29 25 24.299 25 18.5C25 12.5 15 3 15 3Z" fill="url(#drop-grad-f)" />
                <ellipse cx="11" cy="16" rx="2.5" ry="3.5" fill="rgba(255,255,255,0.35)" transform="rotate(-20 11 16)" />
                <defs>
                  <linearGradient id="drop-grad-f" x1="5" y1="3" x2="25" y2="29" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#00f2ff" />
                    <stop offset="1" stopColor="#00C9B1" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-4 text-xs text-slate-400">
                <span className="wordmark-gradient font-semibold text-sm">HydroSource</span>
                <span className="hidden sm:inline text-slate-300">·</span>
                <span>© {new Date().getFullYear()} All rights reserved.</span>
              </div>
            </div>
            <div className="flex items-center gap-5 text-xs text-slate-400">
              {/* Google Gemini attribution per API terms */}
              <span className="flex items-center gap-1.5">
                <span className="flex items-center gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#4285F4' }} />
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#EA4335' }} />
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#FBBC04' }} />
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#34A853' }} />
                </span>
                AI by Google Gemini
              </span>
              <Link href="/legal/terms" className="hover:text-slate-600 transition-colors cursor-pointer">Terms</Link>
              <Link href="/legal/privacy" className="hover:text-slate-600 transition-colors cursor-pointer">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

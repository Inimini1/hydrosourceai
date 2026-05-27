'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'

function daysLeft(dateStr: string): number {
  return Math.max(0, Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000))
}

function formatExpiry(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}

export default function BillingPage() {
  const { user } = useAuth()
  const [betaExpiresAt, setBetaExpiresAt] = useState<string | null>(null)
  const [isBeta, setIsBeta] = useState(false)
  const [loadedUsage, setLoadedUsage] = useState(false)

  useEffect(() => {
    fetch('/api/usage')
      .then((r) => r.json())
      .then((d) => {
        setIsBeta(d.isBeta ?? false)
        setBetaExpiresAt(d.betaExpiresAt ?? null)
        setLoadedUsage(true)
      })
      .catch(() => setLoadedUsage(true))
  }, [])

  const days = betaExpiresAt ? daysLeft(betaExpiresAt) : 0

  return (
    <div className="space-y-5 animate-in">
      <h1 className="font-display text-2xl font-bold text-white">Plan &amp; Access</h1>

      {/* Beta access banner */}
      {loadedUsage && isBeta && betaExpiresAt && (
        <div className="rounded-3xl overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, rgba(15,196,144,0.15), rgba(0,111,255,0.15))', border: '1px solid rgba(15,196,144,0.3)' }}>
          <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl" style={{ background: 'linear-gradient(90deg,#0FC490,#006FFF)' }} />
          <div className="p-5 pt-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 mb-3 text-xs font-bold tracking-wider" style={{ background: 'rgba(15,196,144,0.2)', border: '1px solid rgba(15,196,144,0.4)', color: '#0FC490' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  BETA TESTER
                </div>
                <h2 className="font-display font-bold text-white text-lg mb-1">All Pro Features — Free</h2>
                <p className="text-white/50 text-sm">You have full access to every feature during the beta period. No payment required.</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-display text-4xl font-black text-white">{days}</p>
                <p className="text-white/40 text-xs mt-0.5">{days === 1 ? 'day left' : 'days left'}</p>
              </div>
            </div>
            <div className="mt-4 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.max(2, (days / 7) * 100)}%`, background: days <= 2 ? '#EF4444' : days <= 4 ? '#F59E0B' : '#0FC490' }}
              />
            </div>
            <p className="text-white/30 text-xs mt-2">Expires {formatExpiry(betaExpiresAt)}</p>
          </div>
        </div>
      )}

      {/* What's included */}
      <div className="rounded-3xl border border-white/10 p-5" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <p className="text-xs font-bold text-white/25 uppercase tracking-widest mb-4">Beta Includes Everything</p>
        <div className="space-y-3">
          {[
            { label: 'Unlimited water tests', included: true },
            { label: 'Multiple pools', included: true },
            { label: 'Full history & trends', included: true },
            { label: 'AI analysis & dosing guide', included: true },
            { label: 'PDF report + email delivery', included: true },
            { label: 'Test strip photo scanning', included: true },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2.5 text-sm">
              <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#0FC490' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-white/70">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Future pricing notice */}
      <div className="rounded-3xl border border-white/8 p-5" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <p className="text-white/60 text-sm font-semibold mb-2">Pricing coming after beta</p>
        <p className="text-white/35 text-sm leading-relaxed">
          After your beta period, paid plans will be introduced. As a beta tester, you&apos;ll be notified before any billing begins. We value your feedback — it&apos;s directly shaping the product.
        </p>
      </div>

      {/* Feedback CTA */}
      <div className="rounded-3xl p-5" style={{ background: 'rgba(15,196,144,0.07)', border: '1px solid rgba(15,196,144,0.2)' }}>
        <p className="text-sm font-semibold mb-1" style={{ color: '#0FC490' }}>Help us improve</p>
        <p className="text-white/45 text-sm leading-relaxed mb-3">
          Found a bug? Have a suggestion? Your feedback is the most valuable thing you can give us right now.
        </p>
        <a
          href="mailto:hydrosource.ai@appscloud365.com?subject=HydroSource Beta Feedback"
          className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-2xl transition-colors"
          style={{ background: 'rgba(15,196,144,0.15)', color: '#0FC490', border: '1px solid rgba(15,196,144,0.25)' }}
        >
          Send feedback →
        </a>
      </div>

      <p className="text-xs text-white/15 text-center">
        <Link href="/legal/terms" className="hover:text-white/30 transition-colors">Terms of Service</Link>
        {' · '}
        <Link href="/legal/privacy" className="hover:text-white/30 transition-colors">Privacy Policy</Link>
      </p>
    </div>
  )
}

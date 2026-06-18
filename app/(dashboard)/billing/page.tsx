'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PLAN_DEFINITIONS, PLAN_ORDER, type PlanType, type BillingCycle } from '@/lib/plans'

interface SubscriptionData {
  planType: PlanType
  planName: string
  status: string
  billingCycle: string | null
  currentPeriodEnd: string | null
  trialEndsAt: string | null
  cancelAtPeriodEnd: boolean
  poolLimit: number
  analysisLimit: number
  isActive: boolean
  isTrial: boolean
  isBeta: boolean
  features: {
    maintenanceLog: boolean
    emailReports: boolean
    pdfReports: boolean
    teamMembers: boolean
    apiAccess: boolean
    poolLimit: number | null
    analysesPerMonth: number | null
  }
}

function daysLeft(isoDate: string | null): number {
  if (!isoDate) return 0
  return Math.max(0, Math.ceil((new Date(isoDate).getTime() - Date.now()) / 86400000))
}

function formatDate(isoDate: string | null): string {
  if (!isoDate) return '—'
  return new Date(isoDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function PlanBadge({ type }: { type: PlanType }) {
  const plan = PLAN_DEFINITIONS[type]
  return (
    <span
      className="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide"
      style={{ background: `${plan.accentColor}20`, color: plan.accentColor, border: `1px solid ${plan.accentColor}35` }}
    >
      {plan.name}
    </span>
  )
}

export default function BillingPage() {
  const [sub, setSub] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [cycle, setCycle] = useState<BillingCycle>('monthly')

  useEffect(() => {
    fetch('/api/subscription')
      .then((r) => r.json())
      .then((d) => { setSub(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function handleCheckout(planType: PlanType, billingCycle: BillingCycle) {
    setCheckoutLoading(`${planType}:${billingCycle}`)
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType, billingCycle }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setCheckoutLoading(null)
    }
  }

  async function handlePortal() {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setPortalLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-in">
        <div className="h-8 w-40 rounded-xl skeleton-dark" />
        <div className="h-36 rounded-3xl skeleton-dark" />
        <div className="h-48 rounded-3xl skeleton-dark" />
      </div>
    )
  }

  const planType = sub?.planType ?? 'FREE'
  const plan = PLAN_DEFINITIONS[planType]
  const isPaid = planType !== 'FREE'
  const hasPortal = isPaid && !sub?.isBeta && !sub?.isTrial
  const trialDays = daysLeft(sub?.trialEndsAt ?? null)
  const periodDays = daysLeft(sub?.currentPeriodEnd ?? null)

  return (
    <div className="space-y-5 animate-in">
      <h1 className="font-display text-2xl font-bold text-white">Plan &amp; Billing</h1>

      {/* Current plan card */}
      <div
        className="rounded-3xl overflow-hidden relative"
        style={{
          background: `linear-gradient(135deg, ${plan.accentColor}14, ${plan.accentColor}06)`,
          border: `1px solid ${plan.accentColor}30`,
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-3xl" style={{ background: plan.accentColor }} />
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <PlanBadge type={planType} />
              {sub?.isBeta && (
                <span className="ml-2 text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(15,196,144,0.2)', color: '#0FC490', border: '1px solid rgba(15,196,144,0.35)' }}>
                  BETA
                </span>
              )}
              {sub?.isTrial && (
                <span className="ml-2 text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(0,111,255,0.2)', color: '#36aaf6', border: '1px solid rgba(0,111,255,0.35)' }}>
                  TRIAL
                </span>
              )}
            </div>
            {(sub?.isTrial || sub?.isBeta) && (
              <div className="text-right">
                <p className="font-display font-black text-3xl text-white">{sub.isTrial ? trialDays : daysLeft(null)}</p>
                <p className="text-white/35 text-xs">{sub.isTrial ? 'days left in trial' : 'days remaining'}</p>
              </div>
            )}
          </div>

          {/* Feature checklist */}
          <div className="space-y-2">
            {[
              { label: `${sub?.poolLimit === -1 ? 'Unlimited' : sub?.poolLimit ?? 1} pool profile${(sub?.poolLimit ?? 1) !== 1 ? 's' : ''}`, included: true },
              { label: sub?.analysisLimit === -1 ? 'Unlimited analyses' : `${sub?.analysisLimit ?? 5} analyses/month`, included: true },
              { label: 'Maintenance log & treatment checklists', included: sub?.features.maintenanceLog ?? false },
              { label: 'PDF report export', included: sub?.features.pdfReports ?? false },
              { label: 'Email report delivery', included: sub?.features.emailReports ?? false },
              { label: 'Team members', included: sub?.features.teamMembers ?? false },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2.5 text-sm">
                {item.included ? (
                  <svg className="w-4 h-4 flex-shrink-0" style={{ color: plan.accentColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 flex-shrink-0 text-white/15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <span style={{ color: item.included ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)' }}>{item.label}</span>
              </div>
            ))}
          </div>

          {/* Renewal / trial expiry */}
          {(isPaid || sub?.isTrial) && (
            <div className="mt-4 pt-4 border-t border-white/8 flex items-center justify-between text-xs text-white/35">
              {sub?.isTrial ? (
                <span>Trial ends {formatDate(sub.trialEndsAt)}</span>
              ) : sub?.cancelAtPeriodEnd ? (
                <span className="text-amber-400">Cancels {formatDate(sub.currentPeriodEnd)}</span>
              ) : (
                <span>Renews {formatDate(sub?.currentPeriodEnd ?? null)}</span>
              )}
              <span className="capitalize">{sub?.billingCycle ?? 'monthly'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Manage subscription (for paid users) */}
      {hasPortal && (
        <button
          onClick={handlePortal}
          disabled={portalLoading}
          className="w-full py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          {portalLoading
            ? <><div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" /> Opening portal…</>
            : <>Manage subscription &amp; invoices →</>
          }
        </button>
      )}

      {/* Trial CTA */}
      {sub?.isTrial && (
        <div
          className="rounded-3xl p-5"
          style={{ background: 'rgba(0,111,255,0.08)', border: '1px solid rgba(0,111,255,0.2)' }}
        >
          <p className="text-sm font-semibold text-white mb-1">Keep your Pro access</p>
          <p className="text-white/40 text-sm mb-4">
            Your trial ends {formatDate(sub.trialEndsAt)}. Add a payment method to continue without interruption.
          </p>
          <button
            onClick={handlePortal}
            className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ background: '#006FFF', color: 'white', boxShadow: '0 4px 12px rgba(0,111,255,0.35)' }}
          >
            Add payment method →
          </button>
        </div>
      )}

      {/* Upgrade section — only shown when not on top plan */}
      {planType !== 'POOL_TEAM' && planType !== 'ENTERPRISE' && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <p className="text-sm font-bold text-white/60 uppercase tracking-widest">Upgrade your plan</p>
            <div className="flex-1 h-px bg-white/8" />
            {/* billing cycle toggle */}
            <div
              className="inline-flex p-0.5 rounded-xl gap-0.5"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {(['monthly', 'annual'] as BillingCycle[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCycle(c)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={cycle === c
                    ? { background: '#00C9B1', color: 'white' }
                    : { color: 'rgba(255,255,255,0.35)' }
                  }
                >
                  {c === 'monthly' ? 'Monthly' : 'Annual −17%'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {PLAN_ORDER
              .filter((p) => {
                const def = PLAN_DEFINITIONS[p]
                if (p === 'FREE' || p === 'ENTERPRISE') return false
                // Only show plans above current
                const currentIdx = PLAN_ORDER.indexOf(planType)
                return PLAN_ORDER.indexOf(p) > currentIdx
              })
              .map((upgradePlan) => {
                const def = PLAN_DEFINITIONS[upgradePlan]
                const price = cycle === 'annual' ? def.price.annualMonthly : def.price.monthly
                const key = `${upgradePlan}:${cycle}`
                const isLoading = checkoutLoading === key
                return (
                  <div
                    key={upgradePlan}
                    className="rounded-3xl p-5"
                    style={{
                      background: `${def.accentColor}08`,
                      border: `1px solid ${def.accentColor}25`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-bold text-white">{def.name}</span>
                          {def.badge && (
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ background: def.accentColor, color: 'white' }}
                            >
                              {def.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/40">{def.tagline}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-display font-black text-2xl text-white">${price}</span>
                        <span className="text-white/35 text-xs">/mo</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 mb-4">
                      {def.highlights.slice(0, 4).map((h, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-white/50">
                          <svg className="w-3 h-3 flex-shrink-0" style={{ color: def.accentColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          {h}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handleCheckout(upgradePlan as PlanType, cycle)}
                      disabled={isLoading}
                      className="w-full py-3 rounded-2xl text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      style={{ background: def.accentColor, color: 'white', boxShadow: `0 4px 14px ${def.accentColor}35` }}
                    >
                      {isLoading
                        ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Redirecting…</>
                        : <>{def.cta}{def.features.trial && <span className="opacity-70 text-xs">· 14-day free trial</span>}</>
                      }
                    </button>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* View full pricing page */}
      <Link
        href="/pricing"
        className="block w-full text-center py-3 rounded-2xl text-sm font-semibold transition-colors"
        style={{ color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.03)' }}
      >
        View full pricing comparison →
      </Link>

      <p className="text-xs text-white/15 text-center">
        <Link href="/legal/terms" className="hover:text-white/30 transition-colors">Terms of Service</Link>
        {' · '}
        <Link href="/legal/privacy" className="hover:text-white/30 transition-colors">Privacy Policy</Link>
      </p>
    </div>
  )
}

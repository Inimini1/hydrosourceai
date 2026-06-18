'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import posthog from 'posthog-js'
import {
  PLAN_DEFINITIONS, PLAN_ORDER, COMPARISON_FEATURES,
  type PlanType, type BillingCycle,
} from '@/lib/plans'

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function formatLimit(value: number | boolean | null, format?: string): string {
  if (format === 'boolean') return value ? '✓' : '—'
  if (value === null || value === -1) return '∞'
  if (format === 'days') return value === null ? 'Unlimited' : `${value} days`
  if (format === 'number') return value === null ? 'Unlimited' : String(value)
  return String(value)
}

function formatPrice(plan: typeof PLAN_DEFINITIONS[PlanType], cycle: BillingCycle): string {
  if (plan.type === 'FREE') return 'Free'
  if (plan.type === 'ENTERPRISE') return 'Custom'
  const price = cycle === 'annual' ? plan.price.annualMonthly : plan.price.monthly
  return `$${price}`
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECK ICON
// ─────────────────────────────────────────────────────────────────────────────

function Check({ color = '#10B981' }: { color?: string }) {
  return (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke={color} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  )
}

function X() {
  return (
    <svg className="w-4 h-4 flex-shrink-0 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PLAN CARD
// ─────────────────────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  cycle,
  onSelect,
}: {
  plan: typeof PLAN_DEFINITIONS[PlanType]
  cycle: BillingCycle
  onSelect: (planType: PlanType, cycle: BillingCycle) => void
}) {
  const isPopular  = plan.badge === 'Most Popular'
  const isFree     = plan.type === 'FREE'
  const isEnterprise = plan.type === 'ENTERPRISE'
  const hasTrial   = plan.features.trial

  return (
    <div
      className="relative flex flex-col rounded-3xl p-6 transition-all duration-200"
      style={{
        background: isPopular
          ? `linear-gradient(145deg, ${plan.accentColor}14, ${plan.accentColor}06)`
          : 'rgba(255,255,255,0.02)',
        border: isPopular
          ? `2px solid ${plan.accentColor}50`
          : '1px solid rgba(255,255,255,0.1)',
        boxShadow: isPopular ? `0 0 40px ${plan.accentColor}18` : 'none',
      }}
    >
      {/* Popular badge */}
      {plan.badge && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold tracking-wide whitespace-nowrap"
          style={{ background: plan.accentColor, color: 'white', boxShadow: `0 4px 12px ${plan.accentColor}50` }}
        >
          {plan.badge}
        </div>
      )}

      {/* Plan name + tagline */}
      <div className="mb-5">
        <div
          className="text-xs font-bold uppercase tracking-widest mb-2"
          style={{ color: plan.accentColor }}
        >
          {plan.name}
        </div>
        <div className="flex items-end gap-1 mb-2">
          <span className="font-display font-black text-4xl text-white leading-none">
            {formatPrice(plan, cycle)}
          </span>
          {!isFree && !isEnterprise && (
            <span className="text-white/40 text-sm mb-1">/mo</span>
          )}
        </div>
        {cycle === 'annual' && !isFree && !isEnterprise && (
          <div className="text-xs text-emerald-400 font-semibold">
            ${plan.price.annual}/yr — 2 months free
          </div>
        )}
        <p className="text-xs text-white/40 mt-2 leading-relaxed">{plan.tagline}</p>
      </div>

      {/* Feature bullets */}
      <ul className="space-y-2.5 flex-1 mb-6">
        {plan.highlights.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-white/65">
            <Check color={plan.accentColor} />
            {item}
          </li>
        ))}
      </ul>

      {/* CTA */}
      {isEnterprise ? (
        <a
          href="mailto:hydrosource.ai@appscloud365.com?subject=Enterprise Inquiry"
          className="w-full py-3.5 rounded-2xl text-sm font-bold text-center transition-all duration-200 block"
          style={{ background: `${plan.accentColor}20`, color: plan.accentColor, border: `1px solid ${plan.accentColor}40` }}
        >
          {plan.cta}
        </a>
      ) : isFree ? (
        <Link
          href="/signup"
          className="w-full py-3.5 rounded-2xl text-sm font-bold text-center transition-all duration-200 block"
          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          {plan.cta}
        </Link>
      ) : (
        <button
          onClick={() => onSelect(plan.type, cycle)}
          className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all duration-200"
          style={isPopular
            ? { background: plan.accentColor, color: 'white', boxShadow: `0 4px 16px ${plan.accentColor}40` }
            : { background: `${plan.accentColor}20`, color: plan.accentColor, border: `1px solid ${plan.accentColor}40` }
          }
        >
          {plan.cta}
          {hasTrial && <span className="ml-1.5 text-[11px] opacity-75">14 days free</span>}
        </button>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPARISON TABLE (desktop)
// ─────────────────────────────────────────────────────────────────────────────

function ComparisonTable({ cycle }: { cycle: BillingCycle }) {
  const plans = PLAN_ORDER
    .filter((p) => p !== 'ENTERPRISE')
    .map((p) => PLAN_DEFINITIONS[p])

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left py-3 pr-4 text-xs font-bold text-white/30 uppercase tracking-wider w-48">Feature</th>
            {plans.map((plan) => (
              <th key={plan.type} className="text-center py-3 px-3 min-w-[110px]">
                <div className="text-xs font-bold uppercase tracking-wide" style={{ color: plan.accentColor }}>
                  {plan.name.replace('Homeowner ', '')}
                </div>
                <div className="text-base font-black text-white mt-0.5">
                  {formatPrice(plan, cycle)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COMPARISON_FEATURES.map((feature, i) => (
            <tr key={feature.key} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <td className="py-3 pr-4 text-white/50 text-xs">{feature.label}</td>
              {plans.map((plan) => {
                const rawValue = plan.features[feature.key]
                const display = formatLimit(rawValue as number | boolean | null, feature.format)
                const isTick  = display === '✓'
                const isDash  = display === '—'
                return (
                  <td key={plan.type} className="text-center py-3 px-3">
                    {isTick ? (
                      <span className="flex justify-center"><Check color={plan.accentColor} /></span>
                    ) : isDash ? (
                      <span className="flex justify-center"><X /></span>
                    ) : (
                      <span className="text-white/70 text-xs font-semibold">{display}</span>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// FAQ
// ─────────────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: 'Do I need a credit card to start the free trial?',
    a: 'No. Pool Pro and Pool Team trials start immediately with no credit card required. You\'ll only be asked for payment when you decide to continue after the 14 days.',
  },
  {
    q: 'Can I switch plans at any time?',
    a: 'Yes. Upgrades take effect immediately. Downgrades take effect at the end of your current billing cycle so you never lose access mid-period.',
  },
  {
    q: 'What happens if I exceed my pool limit?',
    a: 'We\'ll prompt you to upgrade. Your existing pools and all their data remain intact — you just won\'t be able to add new ones until you upgrade or remove an existing pool.',
  },
  {
    q: 'Do annual plans auto-renew?',
    a: 'Yes. Annual plans renew yearly. You can cancel anytime from the Billing page and your access continues until the end of the paid year.',
  },
  {
    q: 'What is the maintenance log?',
    a: 'After each water test, Pool Pro and Team subscribers can save the AI treatment plan as an actionable checklist. Each checklist lives under the pool profile so technicians can check off steps as they treat the pool — creating a complete service history.',
  },
  {
    q: 'Can I try the software before choosing a plan?',
    a: 'Yes. The Homeowner Free plan lets you run 5 analyses per month at no cost. Pool professionals can start a 14-day free trial of Pool Pro with no credit card.',
  },
  {
    q: 'Is my data safe?',
    a: 'All data is encrypted at rest and in transit. We use Supabase (built on AWS) with row-level security — each user can only access their own data.',
  },
]

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="space-y-2">
      {FAQ_ITEMS.map((item, i) => (
        <div
          key={i}
          className="rounded-2xl overflow-hidden cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          onClick={() => setOpen(open === i ? null : i)}
        >
          <div className="flex items-center justify-between p-5">
            <p className="text-sm font-semibold text-white/80 pr-4">{item.q}</p>
            <svg
              className="w-4 h-4 text-white/30 flex-shrink-0 transition-transform duration-200"
              style={{ transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)' }}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          {open === i && (
            <div className="px-5 pb-5">
              <p className="text-sm text-white/45 leading-relaxed">{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const welcomePro = searchParams.get('welcome') === 'pro'
  const [cycle, setCycle] = useState<BillingCycle>('monthly')
  const [loading, setLoading] = useState<string | null>(null)

  useEffect(() => {
    posthog.capture('pricing_page_viewed', { billing_cycle: cycle, from_onboarding: welcomePro })
  }, [])

  async function handleSelectPlan(planType: PlanType, billingCycle: BillingCycle) {
    setLoading(`${planType}:${billingCycle}`)
    const plan = PLAN_DEFINITIONS[planType]
    posthog.capture('upgrade_initiated', {
      plan: planType,
      billing_cycle: billingCycle,
      price: billingCycle === 'annual' ? plan.price.annual : plan.price.monthly,
      has_trial: plan.features.trial,
    })
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType, billingCycle }),
      })
      const data = await res.json()
      if (res.status === 401) {
        router.push(`/signup?plan=${planType}&cycle=${billingCycle}`)
        return
      }
      if (data.url) {
        if (plan.features.trial) {
          posthog.capture('trial_started', { plan: planType, billing_cycle: billingCycle })
        }
        window.location.href = data.url
      }
    } catch {
      // noop
    } finally {
      setLoading(null)
    }
  }

  const paidPlans: PlanType[] = ['HOMEOWNER_PLUS', 'POOL_PRO', 'POOL_TEAM']

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #060D14 0%, #091622 100%)' }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <Link href="/" className="font-display font-black text-white text-lg tracking-tight">
          Hydro<span style={{ color: '#00C9B1' }}>Source</span> AI
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-white/50 hover:text-white transition-colors">Sign in</Link>
          <Link
            href="/signup"
            className="text-sm font-semibold px-4 py-2 rounded-xl transition-all"
            style={{ background: '#00C9B1', color: 'white' }}
          >
            Start free
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 pb-24">

        {/* Hero */}
        <div className="text-center py-14 max-w-3xl mx-auto">
          {welcomePro && (
            <div
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold mb-5"
              style={{ background: 'rgba(0,111,255,0.15)', color: '#60A5FA', border: '1px solid rgba(0,111,255,0.35)' }}
            >
              👋 Welcome! You qualify for a free 14-day Pool Pro trial — no credit card needed.
            </div>
          )}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-6"
            style={{ background: 'rgba(0,201,177,0.12)', color: '#00C9B1', border: '1px solid rgba(0,201,177,0.25)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            14-day free trial · No credit card required
          </div>
          <h1 className="font-display font-black text-4xl md:text-5xl text-white leading-tight mb-4">
            Intelligent Pool Chemistry Analysis and<br />
            <span style={{ color: '#00C9B1' }}>Client Reporting for Modern Pool Service Professionals</span>
          </h1>
          <p className="text-lg text-white/45 leading-relaxed max-w-2xl mx-auto">
            Save time, improve treatment accuracy, and generate professional client reports in minutes.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex justify-center mb-10">
          <div
            className="inline-flex items-center p-1 rounded-2xl gap-1"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {(['monthly', 'annual'] as BillingCycle[]).map((c) => (
              <button
                key={c}
                onClick={() => setCycle(c)}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                style={cycle === c
                  ? { background: '#00C9B1', color: 'white', boxShadow: '0 2px 8px rgba(0,201,177,0.35)' }
                  : { color: 'rgba(255,255,255,0.45)' }
                }
              >
                {c === 'monthly' ? 'Monthly' : 'Annual'}
                {c === 'annual' && (
                  <span
                    className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(16,185,129,0.2)', color: '#10B981' }}
                  >
                    -17%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {PLAN_ORDER.filter((p) => p !== 'ENTERPRISE').map((planType) => {
            const plan = PLAN_DEFINITIONS[planType]
            const key = `${planType}:${cycle}`
            const isLoading = loading === key
            return (
              <div key={planType} className={isLoading ? 'opacity-70 pointer-events-none' : ''}>
                <PlanCard
                  plan={plan}
                  cycle={cycle}
                  onSelect={(pt, bc) => handleSelectPlan(pt, bc)}
                />
              </div>
            )
          })}
        </div>

        {/* Enterprise row */}
        <div
          className="rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 mb-16"
          style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}
        >
          <div>
            <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#F59E0B' }}>Enterprise</div>
            <h3 className="font-display font-bold text-white text-xl mb-1">Unlimited pools. Custom everything.</h3>
            <p className="text-sm text-white/40">For large pool management companies that need API access, custom onboarding, and dedicated support.</p>
          </div>
          <a
            href="mailto:hydrosource.ai@appscloud365.com?subject=Enterprise Inquiry"
            className="flex-shrink-0 px-8 py-3.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap"
            style={{ background: 'rgba(245,158,11,0.2)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.35)' }}
          >
            Contact Sales →
          </a>
        </div>

        {/* Comparison table */}
        <div className="mb-16">
          <h2 className="font-display font-bold text-white text-2xl text-center mb-8">Compare plans</h2>
          <div
            className="rounded-3xl p-6"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <ComparisonTable cycle={cycle} />
          </div>
        </div>

        {/* Social proof */}
        <div
          className="rounded-3xl p-8 text-center mb-16"
          style={{ background: 'linear-gradient(135deg, rgba(0,111,255,0.08), rgba(0,201,177,0.08))', border: '1px solid rgba(0,201,177,0.15)' }}
        >
          <div className="text-4xl mb-3">💧</div>
          <p className="text-lg font-bold text-white mb-2">
            "Saves me 45 minutes per route day. The treatment checklists mean my techs never miss a chemical step."
          </p>
          <p className="text-sm text-white/35">Pool Pro subscriber · 32 pools managed</p>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display font-bold text-white text-2xl text-center mb-8">Frequently asked questions</h2>
          <FAQSection />
        </div>

        {/* Bottom CTA */}
        <div className="text-center pt-16">
          <p className="text-white/35 text-sm mb-6">No contracts. Cancel anytime. All plans include SSL-encrypted data storage.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 rounded-2xl font-bold text-sm transition-all"
              style={{ background: '#00C9B1', color: 'white', boxShadow: '0 4px 20px rgba(0,201,177,0.35)' }}
            >
              Start free →
            </Link>
            <button
              onClick={() => handleSelectPlan('POOL_PRO', cycle)}
              className="px-8 py-4 rounded-2xl font-bold text-sm transition-all"
              style={{ background: 'rgba(0,111,255,0.15)', color: '#36aaf6', border: '1px solid rgba(0,111,255,0.3)' }}
            >
              Start Pool Pro trial — 14 days free
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

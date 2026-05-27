'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function OAuthButton({ provider, label, icon }: { provider: string; label: string; icon: React.ReactNode }) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: provider as 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    })
    // browser redirects — no cleanup needed
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl border border-white/15 text-white/80 text-sm font-semibold hover:bg-white/8 hover:border-white/25 transition-all duration-200 disabled:opacity-50 cursor-pointer"
      style={{ background: 'rgba(255,255,255,0.05)' }}
    >
      {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white/80 rounded-full animate-spin" /> : icon}
      {!loading && label}
    </button>
  )
}

const PW_RULES = [
  { label: '8+ characters',       test: (p: string) => p.length >= 8 },
  { label: 'Uppercase letter',    test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter',    test: (p: string) => /[a-z]/.test(p) },
  { label: 'Number',              test: (p: string) => /[0-9]/.test(p) },
  { label: 'Special character',   test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const betaToken = searchParams.get('beta') ?? null
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwRules, setShowPwRules] = useState(false)
  const [role, setRole] = useState<'OWNER' | 'PROFESSIONAL'>('OWNER')
  const [agreedTerms, setAgreedTerms] = useState(false)
  const [agreedPrivacy, setAgreedPrivacy] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const pwStrength = PW_RULES.filter((r) => r.test(password)).length
  const pwColor = pwStrength <= 2 ? '#FF3B5C' : pwStrength <= 3 ? '#FFB830' : '#00C17A'

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const firstFail = PW_RULES.find((r) => !r.test(password))
    if (firstFail) { setError(firstFail.label + ' requirement not met.'); return }
    if (!agreedTerms || !agreedPrivacy) {
      setError('Please agree to the Terms of Service and Privacy Policy to continue.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role, ...(betaToken ? { betaToken } : {}) }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Signup failed'); return }
      if (data.needsEmailConfirmation) {
        router.push('/login?message=check-email')
      } else {
        router.refresh()
        router.push('/dashboard')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm animate-in">
      <div className="text-center mb-8">
        {betaToken && (
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 mb-4 text-xs font-bold tracking-wider" style={{ background: 'rgba(15,196,144,0.15)', border: '1px solid rgba(15,196,144,0.4)', color: '#0FC490' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            BETA ACCESS — ALL PRO FEATURES FREE
          </div>
        )}
        <h1 className="font-display text-3xl font-bold text-white mb-2">Create your account</h1>
        <p className="text-white/40 text-sm">{betaToken ? '7-day full access — no payment needed' : 'Start managing your pool with AI — free forever'}</p>
      </div>

      <div className="card-glass p-7 rounded-3xl space-y-4">
        {error && (
          <div className="p-3.5 rounded-2xl bg-critical/15 border border-critical/30 text-critical text-sm font-medium flex items-start gap-2">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        )}

        {/* OAuth consent notice */}
        <p className="text-[10px] text-white/30 text-center leading-relaxed">
          By continuing with any sign-up method, you agree to our{' '}
          <Link href="/legal/terms" target="_blank" className="text-pool-400/80 hover:text-pool-300 underline underline-offset-1">Terms of Service</Link>
          {' '}and{' '}
          <Link href="/legal/privacy" target="_blank" className="text-pool-400/80 hover:text-pool-300 underline underline-offset-1">Privacy Policy</Link>
          , including the AI recommendations disclaimer.
        </p>

        {/* OAuth buttons */}
        <div className="space-y-2.5">
          <OAuthButton provider="google" label="Sign up with Google" icon={
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          } />
          <button type="button" disabled
            className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl border text-sm font-semibold cursor-not-allowed"
            style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.25)' }}>
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#F25022" opacity="0.4" d="M1 1h10v10H1z"/>
              <path fill="#00A4EF" opacity="0.4" d="M13 1h10v10H13z"/>
              <path fill="#7FBA00" opacity="0.4" d="M1 13h10v10H1z"/>
              <path fill="#FFB900" opacity="0.4" d="M13 13h10v10H13z"/>
            </svg>
            Microsoft — Coming Soon
          </button>
          <button type="button" disabled
            className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl border text-sm font-semibold cursor-not-allowed"
            style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.25)' }}>
            <svg className="w-4 h-4 opacity-40" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Apple — Coming Soon
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/25 text-xs font-medium">or with email</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-white/60 mb-2">I am a…</label>
            <div className="grid grid-cols-2 gap-2">
              {(['OWNER', 'PROFESSIONAL'] as const).map((r) => (
                <button key={r} type="button" onClick={() => setRole(r)}
                  className={`py-3 rounded-2xl text-sm font-semibold border transition-all duration-200 ${
                    role === r
                      ? 'bg-pool-600 text-white border-pool-500 shadow-glow-blue'
                      : 'bg-white/5 text-white/50 border-white/12 hover:border-white/25 hover:bg-white/10'
                  }`}>
                  {r === 'OWNER' ? 'Pool Owner' : 'Pool Pro'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/60 mb-2">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" className="input-dark" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-white/60">Password</label>
              {password.length > 0 && (
                <span className="text-xs font-bold" style={{ color: pwColor }}>
                  {pwStrength <= 2 ? 'Weak' : pwStrength <= 3 ? 'Fair' : pwStrength === 4 ? 'Good' : 'Strong'}
                </span>
              )}
            </div>
            <input type="password" required value={password}
              onChange={(e) => { setPassword(e.target.value); setShowPwRules(true) }}
              onFocus={() => setShowPwRules(true)}
              placeholder="Create a strong password" className="input-dark" />

            {/* Strength bar */}
            {password.length > 0 && (
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                    style={{ background: i <= pwStrength ? pwColor : 'rgba(255,255,255,0.1)' }} />
                ))}
              </div>
            )}

            {/* Requirements checklist */}
            {showPwRules && (
              <div className="mt-3 space-y-1.5 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                {PW_RULES.map((rule) => {
                  const met = rule.test(password)
                  return (
                    <div key={rule.label} className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
                        style={{ background: met ? 'rgba(0,193,122,0.2)' : 'rgba(255,255,255,0.06)' }}>
                        {met
                          ? <svg className="w-2.5 h-2.5 text-safe" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          : <div className="w-1 h-1 rounded-full bg-white/20" />
                        }
                      </div>
                      <span className="text-xs transition-colors duration-200"
                        style={{ color: met ? '#00C17A' : 'rgba(255,255,255,0.35)' }}>
                        {rule.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Explicit policy consent checkboxes */}
          <div className="space-y-2.5 pt-1">
            {[
              { key: 'terms' as const, checked: agreedTerms, onChange: setAgreedTerms, label: 'I have read and agree to the', link: '/legal/terms', linkLabel: 'Terms of Service' },
              { key: 'privacy' as const, checked: agreedPrivacy, onChange: setAgreedPrivacy, label: 'I have read and agree to the', link: '/legal/privacy', linkLabel: 'Privacy Policy & AI Disclaimer' },
            ].map(({ key, checked, onChange, label, link, linkLabel }) => (
              <label key={key} className="flex items-start gap-3 cursor-pointer">
                <div className="relative mt-0.5 flex-shrink-0">
                  <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
                  <div
                    className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200"
                    style={checked
                      ? { background: '#006FFF', borderColor: '#006FFF' }
                      : { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)' }}>
                    {checked && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {label}{' '}
                  <Link href={link} target="_blank" className="text-pool-400 hover:text-pool-300 underline underline-offset-2 font-semibold">
                    {linkLabel}
                  </Link>
                </span>
              </label>
            ))}
          </div>

          <div className="pt-1">
            <button type="submit" disabled={loading || pwStrength < 5 || !agreedTerms || !agreedPrivacy}
              className="btn-primary w-full py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Creating account…</>
              ) : 'Create free account →'}
            </button>
          </div>
        </form>
      </div>

      <p className="text-center text-sm text-white/30 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-pool-400 font-semibold hover:text-pool-300 transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  )
}

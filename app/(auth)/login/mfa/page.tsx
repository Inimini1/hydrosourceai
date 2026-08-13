'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { usePageTitle } from '@/lib/usePageTitle'

export default function LoginMfaPage() {
  usePageTitle('Verify Your Identity')
  const router = useRouter()
  const [code, setCode] = useState('')
  const [factorId, setFactorId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    ;(async () => {
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      if (!aal || aal.currentLevel === aal.nextLevel) {
        router.replace('/dashboard')
        return
      }
      const { data: factorsData } = await supabase.auth.mfa.listFactors()
      const totp = factorsData?.totp?.find((f) => f.status === 'verified')
      if (!totp) {
        router.replace('/dashboard')
        return
      }
      setFactorId(totp.id)
      setChecking(false)
    })()
  }, [router])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!factorId) return
    setError('')
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: code.trim(),
      })
      if (verifyError) {
        setError('That code is incorrect or expired. Please try again.')
        return
      }
      router.replace('/dashboard')
    } catch {
      setError('Could not verify your code. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSignOutInstead() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (checking) {
    return (
      <div className="w-full max-w-sm flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm animate-in">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">Verify your identity</h1>
        <p className="text-slate-500 text-sm">Enter the 6-digit code from your authenticator app</p>
      </div>

      <div className="card-glass p-7 rounded-3xl space-y-4">
        {error && (
          <div className="p-3.5 rounded-2xl bg-critical/8 border border-critical/20 text-critical text-sm font-medium flex items-start gap-2">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Authentication code</label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="input-dark text-center tracking-[0.3em] text-lg"
              autoFocus
            />
          </div>
          <button type="submit" disabled={loading || code.length !== 6}
            className="btn-teal w-full py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Verifying…</>
            ) : 'Verify'}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-slate-400 mt-6">
        Lost access to your authenticator?{' '}
        <button onClick={handleSignOutInstead} className="text-teal-600 font-semibold hover:text-teal-700 transition-colors cursor-pointer">
          Sign out
        </button>
      </p>
    </div>
  )
}

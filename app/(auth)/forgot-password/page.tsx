'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { usePageTitle } from '@/lib/usePageTitle'

export default function ForgotPasswordPage() {
  usePageTitle('Reset Password')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [devUrl, setDevUrl] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Something went wrong.'); return }
      setSent(true)
      if (data.devResetUrl) setDevUrl(data.devResetUrl)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="w-full max-w-sm animate-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-safe/15 border border-safe/30 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-safe" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900 mb-2">Check your email</h1>
          <p className="text-slate-500 text-sm">
            If an account exists for <span className="text-slate-900/70 font-medium">{email}</span>, a reset link is on its way.
          </p>
        </div>

        {devUrl && (
          <div className="card-glass p-4 rounded-3xl mb-4 border border-caution/30 bg-caution/8">
            <p className="text-caution text-xs font-bold uppercase tracking-widest mb-2">Dev Mode — No email service configured</p>
            <p className="text-slate-900/50 text-xs mb-3">Click this link to reset your password:</p>
            <a href={devUrl} className="text-teal-600 text-sm font-semibold break-all hover:text-teal-700 transition-colors">
              {devUrl}
            </a>
          </div>
        )}

        <div className="card-glass p-5 rounded-3xl text-center">
          <p className="text-slate-500 text-sm mb-4">Didn&apos;t receive it? Check your spam folder or try again.</p>
          <button
            onClick={() => { setSent(false); setDevUrl(null) }}
            className="text-teal-600 font-semibold text-sm hover:text-teal-700 transition-colors"
          >
            Try a different email
          </button>
        </div>

        <p className="text-center text-sm text-slate-900/30 mt-6">
          <Link href="/login" className="text-teal-600 font-semibold hover:text-teal-700 transition-colors">
            ← Back to sign in
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm animate-in">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">Forgot password?</h1>
        <p className="text-slate-500 text-sm">Enter your email and we&apos;ll send you a reset link</p>
      </div>

      <div className="card-glass p-7 rounded-3xl">
        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-critical/15 border border-critical/30 text-critical text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-900/60 mb-2">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input-dark"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-teal w-full py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Sending…</>
            ) : 'Send reset link'}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-slate-900/30 mt-6">
        <Link href="/login" className="text-teal-600 font-semibold hover:text-teal-700 transition-colors">
          ← Back to sign in
        </Link>
      </p>
    </div>
  )
}

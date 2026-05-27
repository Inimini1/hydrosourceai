'use client'

import { useState } from 'react'
import { useAuth } from './AuthProvider'

export function EmailVerificationBanner() {
  const { user } = useAuth()
  const [dismissed, setDismissed] = useState(false)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!user || user.emailVerified || dismissed) return null

  async function resend() {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user!.email }),
      })
      if (res.ok) setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-4 mt-4 p-3.5 rounded-2xl flex items-center gap-3 text-sm" style={{ background: 'rgba(0,111,255,0.08)', border: '1px solid rgba(0,111,255,0.2)' }}>
      <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#006FFF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      <p className="flex-1 text-xs font-medium text-slate-700">
        {sent ? 'Verification email sent — check your inbox.' : 'Please verify your email address.'}
      </p>
      {!sent && (
        <button
          onClick={resend}
          disabled={loading}
          className="text-xs font-bold flex-shrink-0 disabled:opacity-50"
          style={{ color: '#006FFF' }}
        >
          {loading ? 'Sending…' : 'Resend'}
        </button>
      )}
      <button onClick={() => setDismissed(true)} className="text-slate-400 hover:text-slate-600 flex-shrink-0 ml-1">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

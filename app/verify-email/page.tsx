'use client'

import { useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { HydroSourceLogo } from '@/components/brand'

function VerifyContent() {
  const params = useSearchParams()
  const success = params.get('success') === '1'
  const error = params.get('error')
  const [resendEmail, setResendEmail] = useState('')
  const [resendSent, setResendSent] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)

  async function handleResend(e: React.FormEvent) {
    e.preventDefault()
    setResendLoading(true)
    try {
      await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail }),
      })
      setResendSent(true)
    } finally {
      setResendLoading(false)
    }
  }

  const errorMessages: Record<string, string> = {
    expired: 'This verification link has expired. Request a new one below.',
    already_used: 'This link has already been used. Your email may already be verified.',
    invalid_token: 'This verification link is invalid. Request a new one below.',
    missing_token: 'No verification token found.',
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #0B1120 0%, #0a1f44 50%, #003380 100%)' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center gap-2">
            <HydroSourceLogo size={40} variant="dark" />
            <span className="font-bold text-2xl text-white">HydroSource</span>
          </Link>
        </div>

        <div className="rounded-3xl p-8 text-center" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
          {success && (
            <>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(0,201,177,0.15)' }}>
                <svg className="w-8 h-8" fill="none" stroke="#00C9B1" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Email verified!</h1>
              <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Your account is now fully active. Enjoy crystal-clear pool water.
              </p>
              <Link
                href="/dashboard"
                className="block w-full py-3.5 rounded-2xl font-semibold text-sm text-white text-center transition-all duration-200"
                style={{ background: 'linear-gradient(135deg, #00C9B1, #00A99A)' }}
              >
                Go to dashboard →
              </Link>
            </>
          )}

          {error && (
            <>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(239,68,68,0.15)' }}>
                <svg className="w-8 h-8" fill="none" stroke="#EF4444" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-white mb-2">
                {error === 'already_used' ? 'Already verified' : 'Link problem'}
              </h1>
              <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {errorMessages[error] ?? 'Something went wrong with this verification link.'}
              </p>

              {error !== 'already_used' && !resendSent && (
                <form onSubmit={handleResend} className="space-y-3 text-left">
                  <input
                    type="email"
                    required
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3.5 rounded-2xl text-sm font-medium text-white focus:outline-none transition-all duration-200"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.15)', caretColor: '#00C9B1' }}
                  />
                  <button
                    type="submit"
                    disabled={resendLoading}
                    className="w-full py-3.5 rounded-2xl font-semibold text-sm text-white disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #00C9B1, #00A99A)' }}
                  >
                    {resendLoading ? 'Sending…' : 'Resend verification email'}
                  </button>
                </form>
              )}

              {resendSent && (
                <p className="text-sm" style={{ color: '#00C9B1' }}>
                  Check your inbox — a new link has been sent.
                </p>
              )}

              {error === 'already_used' && (
                <Link
                  href="/dashboard"
                  className="block w-full py-3.5 rounded-2xl font-semibold text-sm text-white text-center"
                  style={{ background: 'linear-gradient(135deg, #00C9B1, #00A99A)' }}
                >
                  Go to dashboard →
                </Link>
              )}
            </>
          )}

          {!success && !error && (
            <>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(0,111,255,0.15)' }}>
                <svg className="w-8 h-8" fill="none" stroke="#006FFF" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Check your email</h1>
              <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>
                We sent a verification link to your email address. Click it to activate your account.
              </p>
              <Link href="/onboarding" className="text-sm font-semibold" style={{ color: '#00C9B1' }}>
                Continue to setup →
              </Link>
            </>
          )}
        </div>

        <p className="text-center mt-6 text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
          <Link href="/login" className="hover:text-white transition-colors">← Back to login</Link>
        </p>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  )
}

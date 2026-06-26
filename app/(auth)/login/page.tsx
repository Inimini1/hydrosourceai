'use client'

import { useState, FormEvent, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { usePageTitle } from '@/lib/usePageTitle'

const OAUTH_ERRORS: Record<string, string> = {
  auth_cancelled: 'Sign-in was cancelled.',
  invalid_state: 'Security check failed. Please try again.',
  oauth_failed: 'Social sign-in failed. Please try again.',
  no_email: 'Could not get your email from the provider.',
  auth_callback_failed: 'Authentication failed. Please try again.',
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function LoginContent() {
  usePageTitle('Sign In')
  const router = useRouter()
  const searchParams = useSearchParams()
  const oauthError = searchParams.get('error')
  const message = searchParams.get('message')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(oauthError ? (OAUTH_ERRORS[oauthError] ?? 'Sign-in failed. Please try again.') : '')
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(false)

  async function handleGoogleSignIn() {
    setOauthLoading(true)
    const supabase = createClient()
    const { error: oauthErr } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })
    if (oauthErr) {
      setError('Google sign-in failed. Please try again.')
      setOauthLoading(false)
    }
    // browser redirects — no need to do anything else
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 401) {
          setError('That email and password combination is incorrect. Please check and try again.')
        } else if (res.status === 429) {
          setError('Too many sign-in attempts. Please wait a few minutes before trying again.')
        } else {
          setError(data.error ?? 'Sign-in failed. Please try again.')
        }
        return
      }
      router.refresh()
      router.push('/dashboard')
    } catch {
      setError('Could not reach the server. Check your internet connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm animate-in">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-2">Welcome back</h1>
        <p className="text-white/40 text-sm">Sign in to your HydroSource account</p>
      </div>

      <div className="card-glass p-7 rounded-3xl space-y-4">
        {/* Check-email success message */}
        {message === 'check-email' && !error && (
          <div className="p-3.5 rounded-2xl bg-safe/10 border border-safe/25 text-safe text-sm font-medium flex items-start gap-2">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Account created! Check your email to verify, then sign in here.
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-2xl bg-critical/15 border border-critical/30 text-critical text-sm font-medium flex items-start gap-2">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        )}

        {/* Google OAuth */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={oauthLoading || loading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl border border-white/15 text-white/80 text-sm font-semibold
                       hover:bg-white/8 hover:border-white/25 transition-all duration-200 disabled:opacity-50 cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            {oauthLoading
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white/80 rounded-full animate-spin" />
              : <GoogleIcon />
            }
            {!oauthLoading && 'Continue with Google'}
          </button>

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
          <span className="text-white/25 text-xs font-medium">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Email/password form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-white/60 mb-2">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" className="input-dark" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-white/60">Password</label>
              <Link href="/forgot-password" className="text-xs text-pool-400 font-semibold hover:text-pool-300 transition-colors">
                Forgot password?
              </Link>
            </div>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" className="input-dark" />
          </div>
          <button type="submit" disabled={loading || oauthLoading}
            className="btn-primary w-full py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Signing in…</>
            ) : 'Sign in'}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-white/30 mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-pool-400 font-semibold hover:text-pool-300 transition-colors">
          Sign up free
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-8 h-8 border-2 border-pool-500 border-t-transparent rounded-full animate-spin" />}>
      <LoginContent />
    </Suspense>
  )
}

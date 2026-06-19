'use client'

import { useState, FormEvent, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function ResetForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        setError('Failed to update password. Your reset link may have expired — please request a new one.')
        return
      }
      setDone(true)
      await supabase.auth.signOut()
      setTimeout(() => router.push('/login'), 2500)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-safe/15 border border-safe/30 rounded-3xl flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-safe" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="font-display text-xl font-bold text-white mb-2">Password updated!</h2>
        <p className="text-white/40 text-sm">Redirecting you to sign in…</p>
      </div>
    )
  }

  return (
    <div className="card-glass p-7 rounded-3xl">
      {error && (
        <div className="mb-5 p-3.5 rounded-2xl bg-critical/15 border border-critical/30 text-critical text-sm font-medium">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-white/60 mb-2">New password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            className="input-dark"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-white/60 mb-2">Confirm new password</label>
          <input
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            className="input-dark"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Updating…</>
          ) : 'Set new password'}
        </button>
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-sm animate-in">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-2">Set new password</h1>
        <p className="text-white/40 text-sm">Choose a strong password for your account</p>
      </div>
      <Suspense fallback={<div className="text-white/40 text-center text-sm">Loading…</div>}>
        <ResetForm />
      </Suspense>
      <p className="text-center text-sm text-white/30 mt-6">
        <Link href="/login" className="text-pool-400 font-semibold hover:text-pool-300 transition-colors">
          ← Back to sign in
        </Link>
      </p>
    </div>
  )
}

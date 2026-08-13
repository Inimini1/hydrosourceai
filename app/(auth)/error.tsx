'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen auth-mesh flex flex-col items-center justify-center px-6 text-center">
      <div
        className="w-16 h-16 flex items-center justify-center mb-5 select-none"
        style={{
          borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
          background: 'radial-gradient(circle at 30% 30%, rgba(239,68,68,0.18) 0%, rgba(185,28,28,0.25) 80%)',
          boxShadow: '0 4px 20px rgba(239,68,68,0.12)',
        }}
      >
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
        </svg>
      </div>

      <p className="font-mono text-[10px] tracking-[0.14em] uppercase mb-2 text-red-400">
        Auth Error
      </p>
      <h2 className="font-display font-bold text-lg mb-2 text-slate-900">
        Something went wrong
      </h2>
      <p className="text-sm max-w-[260px] leading-relaxed mb-7 text-slate-500">
        We hit an unexpected error on this page. Try again or return to the sign-in page.
      </p>

      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-5 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: '#00C9B1' }}
        >
          Try Again
        </button>
        <Link
          href="/login"
          className="px-5 py-2 rounded-xl text-sm font-semibold text-slate-600"
          style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)' }}
        >
          Sign In
        </Link>
      </div>

      {error.digest && (
        <p className="text-[10px] mt-4 font-mono text-slate-400">
          ref: {error.digest}
        </p>
      )}
    </div>
  )
}

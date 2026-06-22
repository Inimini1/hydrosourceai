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
    <div className="min-h-screen mesh-bg flex flex-col items-center justify-center px-6 text-center">
      <div
        className="w-16 h-16 flex items-center justify-center mb-5 select-none"
        style={{
          borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
          background: 'radial-gradient(circle at 30% 30%, rgba(255,180,171,0.50) 0%, rgba(147,0,10,0.60) 80%)',
          boxShadow: 'inset -6px -6px 16px rgba(0,0,0,0.40), 0 0 24px rgba(255,180,171,0.18)',
        }}
      >
        <svg className="w-6 h-6" style={{ color: '#ffb4ab' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
        </svg>
      </div>

      <p className="font-mono text-[10px] tracking-[0.14em] uppercase mb-2" style={{ color: '#ffb4ab' }}>
        Auth Error
      </p>
      <h2 className="font-display font-bold text-lg mb-2" style={{ color: '#dee3ea' }}>
        Something went wrong
      </h2>
      <p className="text-sm max-w-[260px] leading-relaxed mb-7" style={{ color: '#849495' }}>
        We hit an unexpected error on this page. Try again or return to the sign-in page.
      </p>

      <div className="flex gap-3">
        <button onClick={reset} className="btn-glass px-5 py-2 rounded-xl text-sm font-semibold w-auto">
          Try Again
        </button>
        <Link
          href="/login"
          className="px-5 py-2 rounded-xl text-sm font-semibold"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: '#b9cacb' }}
        >
          Sign In
        </Link>
      </div>

      {error.digest && (
        <p className="text-[10px] mt-4 font-mono" style={{ color: 'rgba(255,255,255,0.15)' }}>
          ref: {error.digest}
        </p>
      )}
    </div>
  )
}

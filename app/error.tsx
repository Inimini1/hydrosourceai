'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen mesh-bg flex flex-col items-center justify-center px-6 text-center">
      <div className="relative mb-6">
        <div
          className="w-20 h-20 flex items-center justify-center select-none"
          style={{
            borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
            background: 'radial-gradient(circle at 30% 30%, rgba(239,68,68,0.20) 0%, rgba(185,28,28,0.30) 80%)',
            boxShadow: '0 4px 24px rgba(239,68,68,0.12)',
          }}
        >
          <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
          </svg>
        </div>
      </div>

      <p className="font-mono text-[10px] tracking-[0.14em] uppercase mb-3 text-red-400">
        System Error
      </p>
      <h1 className="font-display font-bold text-[22px] mb-2 text-slate-900">
        Something went wrong
      </h1>
      <p className="text-sm max-w-[280px] leading-relaxed mb-8 text-slate-500">
        An unexpected error occurred. Your pool data is safe — try refreshing or return to the dashboard.
      </p>

      <div className="flex gap-3">
        <button
          onClick={reset}
          className="btn-teal px-6 py-2.5 rounded-xl text-sm font-semibold w-auto"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors text-slate-600 hover:text-slate-900"
          style={{
            background: 'rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.10)',
          }}
        >
          Dashboard
        </Link>
      </div>

      {error.digest && (
        <p className="font-mono text-[9px] mt-6 text-slate-400">
          REF: {error.digest}
        </p>
      )}
    </div>
  )
}

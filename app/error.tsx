'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen mesh-bg flex flex-col items-center justify-center px-6 text-center">
      {/* Droplet with error tint */}
      <div className="relative mb-6">
        <div
          className="w-20 h-20 flex items-center justify-center select-none"
          style={{
            borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
            background: 'radial-gradient(circle at 30% 30%, rgba(255,180,171,0.60) 0%, rgba(147,0,10,0.70) 80%)',
            boxShadow: 'inset -8px -8px 20px rgba(0,0,0,0.40), 0 0 30px rgba(255,180,171,0.20)',
          }}
        >
          <svg className="w-7 h-7" style={{ color: '#ffb4ab' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
          </svg>
        </div>
      </div>

      <p className="font-mono text-[10px] tracking-[0.14em] uppercase mb-3" style={{ color: '#ffb4ab' }}>
        System Error
      </p>
      <h1 className="font-display font-bold text-[22px] mb-2" style={{ color: '#dee3ea' }}>
        Something went wrong
      </h1>
      <p className="text-sm max-w-[280px] leading-relaxed mb-8" style={{ color: '#849495' }}>
        An unexpected error occurred. Your pool data is safe — try refreshing or return to the dashboard.
      </p>

      <div className="flex gap-3">
        <button
          onClick={reset}
          className="btn-glass px-6 py-2.5 rounded-xl text-sm font-semibold w-auto"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.10)',
            color: '#b9cacb',
          }}
        >
          Dashboard
        </Link>
      </div>

      {error.digest && (
        <p className="font-mono text-[9px] mt-6" style={{ color: '#3a494b' }}>
          REF: {error.digest}
        </p>
      )}
    </div>
  )
}

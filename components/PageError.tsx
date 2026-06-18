'use client'

import Link from 'next/link'

interface PageErrorProps {
  onRetry?: () => void
  title?: string
  message?: string
  backHref?: string
  backLabel?: string
  variant?: 'dark' | 'light'
}

export function PageError({
  onRetry,
  title = 'Could not load',
  message = 'Check your connection and try again. Your data is safe.',
  backHref,
  backLabel = 'Go back',
  variant = 'light',
}: PageErrorProps) {
  const isDark = variant === 'dark'

  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      {/* Error droplet */}
      <div
        className="w-16 h-16 flex items-center justify-center mb-5 select-none"
        style={{
          borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
          background: isDark
            ? 'radial-gradient(circle at 30% 30%, rgba(255,180,171,0.45) 0%, rgba(120,0,10,0.60) 80%)'
            : 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.06))',
          boxShadow: isDark
            ? 'inset -8px -8px 20px rgba(0,0,0,0.45), 0 0 28px rgba(255,180,171,0.18)'
            : '0 4px 20px rgba(239,68,68,0.10)',
          border: isDark ? 'none' : '1px solid rgba(239,68,68,0.14)',
        }}
      >
        <svg className="w-6 h-6" style={{ color: isDark ? '#ffb4ab' : '#EF4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <p className="font-mono text-[10px] tracking-[0.14em] uppercase mb-1.5"
        style={{ color: isDark ? 'rgba(255,180,171,0.65)' : '#EF4444' }}>
        Connection error
      </p>

      <h3 className="font-display font-bold text-base mb-2"
        style={{ color: isDark ? '#dee3ea' : '#1E293B' }}>
        {title}
      </h3>

      <p className="text-sm max-w-[240px] leading-relaxed mb-7"
        style={{ color: isDark ? '#849495' : '#64748B' }}>
        {message}
      </p>

      <div className="flex gap-3">
        {onRetry && (
          isDark ? (
            <button
              onClick={onRetry}
              className="px-6 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 active:scale-95"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#dee3ea' }}
            >
              Try again
            </button>
          ) : (
            <button
              onClick={onRetry}
              className="btn-teal px-6 py-2.5 rounded-2xl text-sm font-semibold"
            >
              Try again
            </button>
          )
        )}
        {backHref && (
          isDark ? (
            <Link
              href={backHref}
              className="px-6 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#849495' }}
            >
              {backLabel}
            </Link>
          ) : (
            <Link
              href={backHref}
              className="px-6 py-2.5 rounded-2xl text-sm font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all duration-200"
            >
              {backLabel}
            </Link>
          )
        )}
      </div>
    </div>
  )
}

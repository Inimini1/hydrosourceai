import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen mesh-bg flex flex-col items-center justify-center px-6 text-center">
      <div className="relative mb-6">
        <div
          className="w-20 h-20 flex items-center justify-center select-none"
          style={{
            borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
            background: 'radial-gradient(circle at 30% 30%, rgba(0,201,177,0.25) 0%, rgba(0,130,120,0.35) 80%)',
            boxShadow: '0 4px 24px rgba(0,201,177,0.15)',
          }}
        >
          <svg className="w-7 h-7" style={{ color: '#00A99A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      <p className="font-mono text-[10px] tracking-[0.14em] uppercase mb-3" style={{ color: '#00A99A' }}>
        404
      </p>
      <h1 className="font-display font-bold text-[22px] mb-2 text-slate-900">
        Page not found
      </h1>
      <p className="text-sm max-w-[280px] leading-relaxed mb-8 text-slate-500">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>

      <div className="flex gap-3">
        <Link
          href="/dashboard"
          className="btn-teal px-6 py-2.5 rounded-xl text-sm font-semibold"
        >
          Go to Dashboard
        </Link>
        <Link
          href="/"
          className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors text-slate-600 hover:text-slate-900"
          style={{
            background: 'rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.10)',
          }}
        >
          Home
        </Link>
      </div>
    </div>
  )
}

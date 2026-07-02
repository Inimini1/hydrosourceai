'use client'

import { useEffect } from 'react'

const SUPPORT_EMAIL = 'hydrosource.ai@appscloud365.com'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  const subject = encodeURIComponent('HydroSource — Critical App Error')
  const body = encodeURIComponent(
    `Hi support,\n\nHydroSource crashed completely for me.\n\nError: ${error.message ?? 'Unknown'}\nDigest: ${error.digest ?? 'N/A'}\n\nPlease help!\n`
  )

  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center', padding: '24px', maxWidth: '340px' }}>

          {/* Drop icon */}
          <div style={{
            width: 72, height: 72, margin: '0 auto 20px',
            borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
            background: 'radial-gradient(circle at 30% 30%, rgba(239,68,68,0.20) 0%, rgba(185,28,28,0.30) 80%)',
            boxShadow: '0 4px 24px rgba(239,68,68,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="28" height="28" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M12 9v2m0 4h.01" />
            </svg>
          </div>

          <p style={{ color: '#EF4444', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>
            Critical Error
          </p>
          <h1 style={{ color: '#0f172a', fontSize: 20, fontWeight: 700, marginBottom: 10 }}>
            HydroSource ran into a problem
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
            Something unexpected went wrong at the app level. Your pool data is stored safely — this is just a display issue.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 24 }}>
            <button
              onClick={reset}
              style={{
                padding: '10px 22px', borderRadius: 14, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                background: 'linear-gradient(135deg, #00C9B1, #00A99A)', color: 'white', border: 'none',
                boxShadow: '0 4px 16px rgba(0,201,177,0.3)',
              }}
            >
              Reload App
            </button>
            <button
              onClick={() => { window.location.href = '/' }}
              style={{
                padding: '10px 22px', borderRadius: 14, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                background: 'rgba(0,0,0,0.04)', color: '#475569', border: '1px solid rgba(0,0,0,0.10)',
              }}
            >
              Home
            </button>
          </div>

          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`}
            style={{ color: '#94a3b8', fontSize: 12, textDecoration: 'none' }}
          >
            Need help? Contact {SUPPORT_EMAIL}
          </a>

          {error.digest && (
            <p style={{ color: '#cbd5e1', fontSize: 10, marginTop: 10, fontFamily: 'monospace' }}>
              ref: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  )
}

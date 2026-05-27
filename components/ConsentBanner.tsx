'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const CONSENT_KEY = 'HydroSource_consent_v1'

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem(CONSENT_KEY, 'accepted')
    setVisible(false)
  }

  function decline() {
    localStorage.setItem(CONSENT_KEY, 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie and privacy consent"
      className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6"
    >
      <div
        className="max-w-2xl mx-auto rounded-2xl border border-white/10 p-5 shadow-2xl"
        style={{ background: 'rgba(11,17,32,0.97)', backdropFilter: 'blur(20px)' }}
      >
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-10 h-10 rounded-xl bg-pool-gradient flex items-center justify-center shadow-glow-blue">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white mb-1">Your privacy matters</p>
            <p className="text-xs text-white/60 leading-relaxed">
              HydroSource uses one session cookie for authentication. Your pool data is processed
              by Google Gemini AI to generate recommendations. By continuing, you agree to our{' '}
              <Link href="/legal/terms" className="text-pool-400 hover:text-pool-300 underline underline-offset-2">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/legal/privacy" className="text-pool-400 hover:text-pool-300 underline underline-offset-2">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-4">
          <button
            onClick={decline}
            className="text-xs text-white/40 hover:text-white/60 transition-colors px-3 py-2"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="text-xs font-bold bg-pool-gradient text-white px-5 py-2 rounded-full hover:opacity-90 transition-opacity shadow-glow-blue"
          >
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  )
}

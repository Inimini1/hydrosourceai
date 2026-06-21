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
      className="fixed bottom-0 inset-x-0 z-50 px-3 pb-3"
    >
      <div
        className="max-w-3xl mx-auto rounded-2xl border border-white/10 px-4 py-3 shadow-2xl flex items-center gap-3 flex-wrap sm:flex-nowrap"
        style={{ background: 'rgba(11,17,32,0.97)', backdropFilter: 'blur(20px)' }}
      >
        <svg className="w-4 h-4 text-pool-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <p className="text-xs text-white/50 flex-1 leading-relaxed">
          We use one auth cookie. Pool data is processed by Google Gemini AI.{' '}
          <Link href="/legal/terms" className="text-pool-400 hover:text-pool-300 underline underline-offset-2">Terms</Link>
          {' & '}
          <Link href="/legal/privacy" className="text-pool-400 hover:text-pool-300 underline underline-offset-2">Privacy</Link>.
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={decline} className="text-xs text-white/35 hover:text-white/55 transition-colors px-2 py-1.5">
            Decline
          </button>
          <button onClick={accept} className="text-xs font-bold bg-pool-gradient text-white px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity shadow-glow-blue whitespace-nowrap">
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  )
}

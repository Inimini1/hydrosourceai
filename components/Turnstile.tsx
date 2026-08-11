'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string
      reset: (widgetId?: string) => void
    }
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

/** Renders nothing if NEXT_PUBLIC_TURNSTILE_SITE_KEY isn't set, so forms
 *  keep working before Turnstile is configured in Cloudflare. */
export function Turnstile({ onVerify }: { onVerify: (token: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || !window.turnstile || !SITE_KEY) return
    window.turnstile.render(containerRef.current, {
      sitekey: SITE_KEY,
      callback: onVerify,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptLoaded])

  if (!SITE_KEY) return null

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <div ref={containerRef} />
    </>
  )
}

export const isTurnstileEnabled = Boolean(SITE_KEY)

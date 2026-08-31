import type { CSSProperties } from 'react'

// Shared sanitizer-type icon — used by the pool creation and edit pages so
// the same three icons (matching CHLORINE/SALT/BROMINE) aren't hand-drawn
// twice, and so neither page reaches for an emoji.
interface SanitizerIconProps {
  type: 'CHLORINE' | 'SALT' | 'BROMINE'
  className?: string
  style?: CSSProperties
}

export function SanitizerIcon({ type, className = 'w-5 h-5', style }: SanitizerIconProps) {
  if (type === 'SALT') {
    return (
      <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 9c1.5-3 3.5-3 5 0s3.5 3 5 0 3.5-3 5 0 3.5 3 5 0" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 15c1.5-3 3.5-3 5 0s3.5 3 5 0 3.5-3 5 0 3.5 3 5 0" />
      </svg>
    )
  }
  if (type === 'BROMINE') {
    return (
      <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3h6M10 3v5.5L5.5 17a2 2 0 001.8 3h9.4a2 2 0 001.8-3L14 8.5V3" />
      </svg>
    )
  }
  // CHLORINE — the same beaker glyph used for "Test Water" elsewhere in the app
  return (
    <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  )
}

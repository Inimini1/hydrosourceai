import type { ReactNode } from 'react'

// Matches numeric measurements (amounts, durations, percentages) and a small
// set of safety/urgency words — the terms a reader scanning quickly needs to
// catch. Token-based (no dangerouslySetInnerHTML) so it's safe on AI-generated
// text.
const KEYWORD_PATTERN =
  /\d+(?:\.\d+)?\s?(?:ppm|hours?|hrs?|minutes?|mins?|days?|gallons?|gal\.?|oz\.?|lbs?|%|°[FC]?)|do not|never|immediately|caution|warning|critical|before (?:swimming|retest(?:ing)?|next)/gi

export function highlightKeywords(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let lastIndex = 0
  let i = 0
  for (const m of Array.from(text.matchAll(KEYWORD_PATTERN))) {
    const idx = m.index ?? 0
    if (idx > lastIndex) nodes.push(<span key={i++}>{text.slice(lastIndex, idx)}</span>)
    nodes.push(<strong key={i++} className="font-bold">{m[0]}</strong>)
    lastIndex = idx + m[0].length
  }
  if (lastIndex < text.length) nodes.push(<span key={i++}>{text.slice(lastIndex)}</span>)
  return nodes
}

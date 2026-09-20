type Status = 'safe' | 'caution' | 'critical'

const config: Record<Status, { label: string; bg: string; text: string; dot: string }> = {
  safe:     { label: 'Safe',     bg: 'bg-safe/15',    text: 'text-safe',    dot: 'bg-safe' },
  caution:  { label: 'Caution',  bg: 'bg-caution/15', text: 'text-caution', dot: 'bg-caution' },
  critical: { label: 'Critical', bg: '',              text: '',             dot: '' },
}

export default function StatusBadge({ status, size = 'sm' }: { status: Status; size?: 'sm' | 'lg' }) {
  const c = config[status]
  const sizeClasses = size === 'lg' ? 'text-sm px-3 py-1.5' : 'text-xs px-2.5 py-1'
  const dotSize = size === 'lg' ? 'w-2 h-2' : 'w-1.5 h-1.5'

  // Critical is solidified rather than glowing — a filled gradient reads as
  // "important" without the pulsing halo that made every alert look the same.
  if (status === 'critical') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-bold rounded-full text-white transition-transform duration-150 ${sizeClasses}`}
        style={{
          background: 'linear-gradient(135deg, #ff5470, #dc2626)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.12), 0 2px 6px rgba(220,38,38,0.35)',
        }}
      >
        <span className={`rounded-full flex-shrink-0 bg-white/90 ${dotSize}`} />
        {c.label}
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center gap-1.5 font-bold border rounded-full ${c.bg} ${c.text} ${
      status === 'caution' ? 'border-caution/30' : 'border-safe/30'
    } ${sizeClasses}`}>
      <span className={`rounded-full flex-shrink-0 animate-pulse ${c.dot} ${dotSize}`} />
      {c.label}
    </span>
  )
}

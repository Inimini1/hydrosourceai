type Status = 'safe' | 'caution' | 'critical'

const config: Record<Status, { label: string; bg: string; text: string; dot: string; glow: string }> = {
  safe:     { label: 'Safe',     bg: 'bg-safe/15',     text: 'text-safe',     dot: 'bg-safe',     glow: 'shadow-glow-safe' },
  caution:  { label: 'Caution',  bg: 'bg-caution/15',  text: 'text-caution',  dot: 'bg-caution',  glow: 'shadow-glow-caution' },
  critical: { label: 'Critical', bg: 'bg-critical/15', text: 'text-critical', dot: 'bg-critical', glow: 'shadow-glow-critical' },
}

export default function StatusBadge({ status, size = 'sm' }: { status: Status; size?: 'sm' | 'lg' }) {
  const c = config[status]
  return (
    <span className={`inline-flex items-center gap-1.5 font-bold border rounded-full ${c.bg} ${c.text} ${
      status === 'critical' ? `border-critical/30 ${c.glow}` :
      status === 'caution' ? 'border-caution/30' : 'border-safe/30'
    } ${size === 'lg' ? 'text-sm px-3 py-1.5' : 'text-xs px-2.5 py-1'}`}>
      <span className={`rounded-full flex-shrink-0 animate-pulse ${c.dot} ${size === 'lg' ? 'w-2 h-2' : 'w-1.5 h-1.5'}`} />
      {c.label}
    </span>
  )
}

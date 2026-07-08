const NAVY = '#1c3f66'

export type WaterStatus = 'safe' | 'caution' | 'critical'

// Same mascot body/collar/glasses as app/icon.svg and PoolLensIcon; only the
// eyebrows/eyes/mouth change per mood so the face reads at a glance.
function Face({ status }: { status: WaterStatus }) {
  if (status === 'safe') {
    // Happy: big smile, blush cheeks
    return (
      <>
        <circle cx="47" cy="73" r="4" fill={NAVY} />
        <circle cx="77" cy="73" r="4" fill={NAVY} />
        <circle cx="45.3" cy="71" r="1.4" fill="#ffffff" />
        <circle cx="75.3" cy="71" r="1.4" fill="#ffffff" />
        <ellipse cx="35" cy="83" rx="4" ry="2.5" fill="#ff9d9d" opacity="0.55" />
        <ellipse cx="85" cy="83" rx="4" ry="2.5" fill="#ff9d9d" opacity="0.55" />
        <path d="M50 87 Q60 97 70 87" fill="none" stroke={NAVY} strokeWidth="2.8" strokeLinecap="round" />
      </>
    )
  }
  if (status === 'critical') {
    // Sad: worried brows, downturned mouth
    return (
      <>
        <circle cx="46" cy="75" r="4" fill={NAVY} />
        <circle cx="76" cy="75" r="4" fill={NAVY} />
        <circle cx="44.3" cy="73.5" r="1.4" fill="#ffffff" />
        <circle cx="74.3" cy="73.5" r="1.4" fill="#ffffff" />
        <line x1="35" y1="58" x2="47" y2="62" stroke={NAVY} strokeWidth="2.2" strokeLinecap="round" />
        <line x1="85" y1="58" x2="73" y2="62" stroke={NAVY} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M52 93 Q60 85 68 93" fill="none" stroke={NAVY} strokeWidth="2.8" strokeLinecap="round" />
      </>
    )
  }
  // caution — neutral/meh: flat mouth
  return (
    <>
      <circle cx="47" cy="73" r="4" fill={NAVY} />
      <circle cx="77" cy="73" r="4" fill={NAVY} />
      <circle cx="45.3" cy="71" r="1.4" fill="#ffffff" />
      <circle cx="75.3" cy="71" r="1.4" fill="#ffffff" />
      <line x1="52" y1="89" x2="68" y2="89" stroke={NAVY} strokeWidth="2.6" strokeLinecap="round" />
    </>
  )
}

/** The mascot as a mood indicator — same character as the app logo, but its
 *  face changes with water test status: happy (safe), meh (caution), sad (critical). */
export function WaterMoodDrop({
  status,
  size = 96,
  className = '',
}: {
  status: WaterStatus
  size?: number
  className?: string
}) {
  return (
    <svg
      width={size}
      height={Math.round(size * (140 / 120))}
      viewBox="0 0 120 140"
      className={className}
      role="img"
      aria-label={
        status === 'safe' ? 'Water balanced — happy' : status === 'critical' ? 'Water needs attention — sad' : 'Water okay — neutral'
      }
    >
      <defs>
        <linearGradient id={`moodGrad-${status}`} x1="20%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" stopColor="#bfe3fb" />
          <stop offset="100%" stopColor="#5aa8dd" />
        </linearGradient>
      </defs>

      <path
        d="M60 4 C58 4 22 52 22 80 C22 108 39 132 60 132 C81 132 98 108 98 80 C98 52 62 4 60 4Z"
        fill={`url(#moodGrad-${status})`} stroke={NAVY} strokeWidth="3"
      />

      <path
        d="M27 94 C23 111 38 133 60 133 C82 133 97 111 93 94 Z"
        fill="#ffffff" stroke={NAVY} strokeWidth="2.5" strokeLinejoin="round"
      />
      <line x1="27" y1="94" x2="49" y2="107" stroke={NAVY} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="93" y1="94" x2="71" y2="107" stroke={NAVY} strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M60 101 L66 112 L61.5 126 L60 131 L58.5 126 L54 112Z"
        fill="#4a90d9" stroke={NAVY} strokeWidth="2" strokeLinejoin="round"
      />

      <circle cx="45" cy="72" r="13" fill="none" stroke={NAVY} strokeWidth="3.2" />
      <circle cx="75" cy="72" r="13" fill="none" stroke={NAVY} strokeWidth="3.2" />
      <line x1="58" y1="72" x2="62" y2="72" stroke={NAVY} strokeWidth="3" />
      <circle cx="45" cy="72" r="7" fill="#ffffff" />
      <circle cx="75" cy="72" r="7" fill="#ffffff" />

      <Face status={status} />
    </svg>
  )
}

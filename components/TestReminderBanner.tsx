'use client'

import Link from 'next/link'

// ─────────────────────────────────────────────────────────────────────────────
// State logic
// ─────────────────────────────────────────────────────────────────────────────

export interface ReminderState {
  daysSince: number
  label: string
  sublabel: string
  urgency: 'fresh' | 'due-soon' | 'overdue' | 'urgent'
  color: string
  bg: string
  border: string
}

export function getReminderState(
  lastTestedAt: string | null | undefined,
  nextTestDays?: number | null,
): ReminderState {
  if (!lastTestedAt) {
    return {
      daysSince: -1,
      label: 'No tests yet',
      sublabel: 'Run your first water test to get an AI analysis.',
      urgency: 'urgent',
      color: '#EF4444',
      bg: 'rgba(239,68,68,0.07)',
      border: 'rgba(239,68,68,0.18)',
    }
  }

  const daysSince = Math.floor((Date.now() - new Date(lastTestedAt).getTime()) / 86400000)
  const interval  = nextTestDays ?? 7

  if (daysSince <= Math.max(1, interval - 2)) {
    return {
      daysSince,
      label: daysSince === 0 ? 'Tested today' : `Tested ${daysSince}d ago`,
      sublabel: `Next test in ${Math.max(1, interval - daysSince)} day${Math.max(1, interval - daysSince) !== 1 ? 's' : ''}.`,
      urgency: 'fresh',
      color: '#00C9B1',
      bg: 'rgba(0,201,177,0.07)',
      border: 'rgba(0,201,177,0.18)',
    }
  }

  if (daysSince <= interval + 2) {
    return {
      daysSince,
      label: `Test due — ${daysSince}d since last test`,
      sublabel: 'Your AI-recommended window is now. Test to stay ahead of imbalance.',
      urgency: 'due-soon',
      color: '#F59E0B',
      bg: 'rgba(245,158,11,0.07)',
      border: 'rgba(245,158,11,0.20)',
    }
  }

  if (daysSince <= 21) {
    return {
      daysSince,
      label: `Overdue — ${daysSince}d since last test`,
      sublabel: 'Chemistry can shift in this time. Test now to prevent bigger issues.',
      urgency: 'overdue',
      color: '#F97316',
      bg: 'rgba(249,115,22,0.07)',
      border: 'rgba(249,115,22,0.20)',
    }
  }

  return {
    daysSince,
    label: `${daysSince}d without testing`,
    sublabel: 'Chlorine may be depleted. Algae or unsafe conditions are likely.',
    urgency: 'urgent',
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.07)',
    border: 'rgba(239,68,68,0.18)',
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Animated pool water droplet icon
// ─────────────────────────────────────────────────────────────────────────────

// Constant fill — color carries all urgency information
const FILL_LEVEL: Record<ReminderState['urgency'], number> = {
  fresh:      0.75,
  'due-soon': 0.75,
  overdue:    0.75,
  urgent:     0.75,
}

const WAVE_SPEED_MS: Record<ReminderState['urgency'], number> = {
  fresh:      3200,   // slow gentle waves
  'due-soon': 2200,   // moderate
  overdue:    1400,   // faster, choppier
  urgent:     800,    // rapid, alarming
}

// Unique-enough key per urgency so keyframes don't collide across instances
const KEY: Record<ReminderState['urgency'], string> = {
  fresh:      'fr',
  'due-soon': 'ds',
  overdue:    'ov',
  urgent:     'ur',
}

export function PoolDropIcon({
  urgency,
  color,
  size = 44,
}: {
  urgency: ReminderState['urgency']
  color: string
  size?: number
}) {
  const w    = size
  const h    = size
  const cx   = w / 2
  const k    = KEY[urgency]

  // Teardrop path — tip at top, round bulge at bottom
  const drop = `M${cx},${h * 0.06}
    C${cx},${h * 0.06} ${w * 0.94},${h * 0.55} ${w * 0.94},${h * 0.66}
    a${w * 0.44},${h * 0.31} 0 0 1 -${w * 0.88},0
    C${w * 0.06},${h * 0.55} ${cx},${h * 0.06} ${cx},${h * 0.06}Z`

  const fill   = FILL_LEVEL[urgency]
  const waveMs = WAVE_SPEED_MS[urgency]

  // waterY: the top of the water surface inside the droplet.
  // Droplet interior spans roughly h*0.10 to h*0.94, total ~h*0.84 of fillable space.
  const waterY = h * 0.10 + h * 0.84 * (1 - fill)

  // Wave amplitude — bigger when water is lower / more urgent
  const amp = h * (urgency === 'urgent' ? 0.065 : urgency === 'overdue' ? 0.050 : 0.038)

  // Build a seamless 3-period wide wave path so we can translate -33.33% without a seam
  function wavePath(yBase: number, phase: number): string {
    const period = w          // one visual period = full icon width
    const total  = period * 3 // 3 full periods
    const pts: string[] = [`M0,${yBase}`]
    const segs = 12           // 4 quarter-waves per period × 3 periods
    for (let i = 0; i < segs; i++) {
      const x1 = (i + 0.5) / segs * total
      const x2 = (i + 1)   / segs * total
      const sign = ((i + (phase === 0 ? 0 : 1)) % 2 === 0) ? -1 : 1
      pts.push(`q${x1 - (i / segs * total)},${sign * amp} ${x2 - (i / segs * total)},0`)
    }
    pts.push(`L${total},${h} L0,${h} Z`)
    return pts.join(' ')
  }

  const wave1 = wavePath(waterY, 0)
  const wave2 = wavePath(waterY + amp * 0.5, 1)

  // Glow intensity — pulses on urgent
  const glowColor = `${color}70`

  return (
    <>
      <style>{`
        @keyframes hs-wave-${k}-${size} {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
        @keyframes hs-pulse-${k}-${size} {
          0%,100% { filter: drop-shadow(0 0 3px ${glowColor}); }
          50%      { filter: drop-shadow(0 0 10px ${color}); }
        }
        @keyframes hs-bob-${k}-${size} {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-2px); }
        }
      `}</style>

      <div
        style={{
          width: size,
          height: size,
          flexShrink: 0,
          animation: urgency !== 'fresh'
            ? `hs-bob-${k}-${size} ${waveMs * 1.5}ms ease-in-out infinite`
            : undefined,
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${w} ${h}`}
          style={{
            animation: urgency === 'urgent'
              ? `hs-pulse-${k}-${size} 1s ease-in-out infinite`
              : `hs-pulse-${k}-${size} 3s ease-in-out infinite`,
            overflow: 'visible',
          }}
        >
          <defs>
            <clipPath id={`dc-${k}-${size}`}>
              <path d={drop} />
            </clipPath>
            {/* Water gradient — lighter at top, richer at bottom */}
            <linearGradient id={`wg-${k}-${size}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={color} stopOpacity="0.55" />
              <stop offset="100%" stopColor={color} stopOpacity="0.90" />
            </linearGradient>
            {/* Outer glow gradient */}
            <radialGradient id={`og-${k}-${size}`} cx="50%" cy="60%" r="50%">
              <stop offset="0%"   stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Soft outer glow ring */}
          <ellipse
            cx={cx} cy={h * 0.66}
            rx={w * 0.52} ry={h * 0.36}
            fill={`url(#og-${k}-${size})`}
          />

          {/* Drop background (empty water color) */}
          <path d={drop} fill={`${color}12`} />

          {/* ── Water + waves, clipped inside droplet ── */}
          <g clipPath={`url(#dc-${k}-${size})`}>

            {/* Solid water base beneath waves */}
            <rect
              x={0} y={waterY + amp * 0.8}
              width={w * 3} height={h}
              fill={`url(#wg-${k}-${size})`}
            />

            {/* Wave 1 — primary */}
            <g
              style={{
                animation: `hs-wave-${k}-${size} ${waveMs}ms linear infinite`,
                willChange: 'transform',
              }}
            >
              <path d={wave1} fill={`url(#wg-${k}-${size})`} opacity="0.75" />
            </g>

            {/* Wave 2 — secondary, half-period offset, contrasting direction */}
            <g
              style={{
                animation: `hs-wave-${k}-${size} ${waveMs}ms linear infinite`,
                animationDelay: `-${waveMs * 0.5}ms`,
                willChange: 'transform',
              }}
            >
              <path d={wave2} fill={color} opacity="0.30" />
            </g>

            {/* Surface sheen — thin bright strip right at waterline */}
            <rect
              x={0} y={waterY - 0.5}
              width={w * 3} height={1.5}
              fill="white" opacity="0.22"
            />
          </g>

          {/* Drop outline */}
          <path
            d={drop}
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            opacity="0.55"
          />

          {/* Gloss highlight — top-left of drop */}
          <ellipse
            cx={w * 0.37} cy={h * 0.27}
            rx={w * 0.07} ry={h * 0.12}
            fill="white"
            opacity={fill > 0.5 ? 0.35 : 0.15}
            transform={`rotate(-28,${w * 0.37},${h * 0.27})`}
          />

          {/* Urgent state: inner ripple ring at bulge center */}
          {urgency === 'urgent' && (
            <circle
              cx={cx} cy={h * 0.68}
              r={w * 0.24}
              fill="none"
              stroke={color}
              strokeWidth="1"
              opacity="0.35"
              style={{ animation: `hs-pulse-${k}-${size} 0.8s ease-in-out infinite` }}
            />
          )}
        </svg>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Banner & Pill
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  lastTestedAt: string | null | undefined
  poolId: string
  nextTestDays?: number | null
  variant?: 'banner' | 'pill'
}

export default function TestReminderBanner({
  lastTestedAt,
  poolId,
  nextTestDays,
  variant = 'banner',
}: Props) {
  const state = getReminderState(lastTestedAt, nextTestDays)

  // ── Pill variant ────────────────────────────────────────────────────────────
  if (variant === 'pill') {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full"
        style={{
          background: state.bg,
          border: `1px solid ${state.border}`,
        }}
      >
        <PoolDropIcon urgency={state.urgency} color={state.color} size={18} />
        <span
          className="text-[11px] font-semibold"
          style={{ color: state.color }}
        >
          {state.label}
        </span>
      </div>
    )
  }

  // ── Banner: hide when fresh (water is clean, nothing to warn about) ─────────
  if (state.urgency === 'fresh') return null

  return (
    <div
      className="rounded-2xl p-4 flex items-center gap-3.5"
      style={{
        background: state.bg,
        border: `1px solid ${state.border}`,
      }}
    >
      <PoolDropIcon urgency={state.urgency} color={state.color} size={44} />

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm leading-tight" style={{ color: state.color }}>
          {state.label}
        </p>
        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
          {state.sublabel}
        </p>
      </div>

      <Link
        href={`/pools/${poolId}/test`}
        className="text-xs font-bold px-3.5 py-2 rounded-xl flex-shrink-0 transition-opacity duration-150 hover:opacity-80 whitespace-nowrap"
        style={{ background: state.color, color: 'white' }}
      >
        Test Now
      </Link>
    </div>
  )
}

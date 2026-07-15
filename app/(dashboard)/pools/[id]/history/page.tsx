'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { EmptyStateView } from '@/components/EmptyStateView'
import TestReminderBanner from '@/components/TestReminderBanner'
import { PageError } from '@/components/PageError'
import { cyaAdjustedMinChlorine } from '@/lib/pool-chemistry-db'

interface WaterTest {
  id: string
  status: string
  chlorine: number
  pH: number
  alkalinity: number
  calciumHardness: number | null
  cyanuricAcid: number | null
  aiAnalysis: string
  createdAt: string
}

interface ParsedAnalysis {
  health_score?: number
  diagnosis?: string
  immediate_action_plan?: string[]
  chemical_dosing_guide?: { chemical: string; amount: string; how_to_apply: string }[]
  treatment_summary?: string
  next_test_days?: number
  preventative_alerts?: string[]
  safety_notes?: string
}

function parseAnalysis(raw: string): ParsedAnalysis {
  try { return JSON.parse(raw) } catch { return {} }
}

function parseScore(raw: string): number {
  try {
    const a = JSON.parse(raw) as ParsedAnalysis
    return Math.round(Math.max(0, Math.min(100, a.health_score ?? 0)))
  } catch { return 0 }
}

const TIME_FILTERS = [
  { label: '7d',  days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
  { label: '1yr', days: 365 },
]

// ── Interactive SVG chart ─────────────────────────────────────────────────────
interface ChartPoint { value: number; date: string }

function Chart({
  points, color, idealMin, idealMax, unit = '',
}: {
  points: ChartPoint[]
  color: string
  idealMin: number
  idealMax: number
  unit?: string
}) {
  const [hovered, setHovered] = useState<{ x: number; y: number; pt: ChartPoint } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  if (points.length === 0) {
    return (
      <div className="h-20 flex items-center justify-center text-slate-300 text-xs">
        No data in this range
      </div>
    )
  }

  const W = 300, H = 64, padX = 6, padY = 8
  const values = points.map((p) => p.value)
  const allVals = [...values, idealMin, idealMax]
  const vMin = Math.min(...allVals) - (idealMax - idealMin) * 0.2
  const vMax = Math.max(...allVals) + (idealMax - idealMin) * 0.2
  const vRange = vMax - vMin || 1

  function toX(i: number) {
    return padX + (i / Math.max(points.length - 1, 1)) * (W - padX * 2)
  }
  function toY(v: number) {
    return H - padY - ((v - vMin) / vRange) * (H - padY * 2)
  }

  const pts: [number, number][] = points.map((p, i) => [toX(i), toY(p.value)])

  // Smooth cubic bezier line
  let linePath = `M ${pts[0][0]} ${pts[0][1]}`
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1]
    const [cx, cy] = pts[i]
    const mx = (px + cx) / 2
    linePath += ` C ${mx} ${py}, ${mx} ${cy}, ${cx} ${cy}`
  }
  const areaPath = `${linePath} L ${pts[pts.length - 1][0]} ${H} L ${pts[0][0]} ${H} Z`
  const gId = `g${color.replace('#', '')}`

  // Date labels: show first and last
  const firstLabel = new Date(points[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const lastLabel  = new Date(points[points.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const relX = ((e.clientX - rect.left) / rect.width) * W
    // Find nearest point
    let nearest = 0
    let minDist = Infinity
    for (let i = 0; i < pts.length; i++) {
      const d = Math.abs(pts[i][0] - relX)
      if (d < minDist) { minDist = d; nearest = i }
    }
    setHovered({ x: pts[nearest][0], y: pts[nearest][1], pt: points[nearest] })
  }

  const isIdealZoneVisible = toY(idealMax) < H && toY(idealMin) > 0

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: 76 }}
        preserveAspectRatio="none"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHovered(null)}
      >
        <defs>
          <linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Ideal zone band */}
        {isIdealZoneVisible && (
          <rect
            x={padX}
            y={toY(idealMax)}
            width={W - padX * 2}
            height={Math.max(0, toY(idealMin) - toY(idealMax))}
            fill={color}
            fillOpacity="0.08"
            rx="3"
          />
        )}

        {/* Area fill */}
        <path d={areaPath} fill={`url(#${gId})`} />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Hover crosshair */}
        {hovered && (
          <>
            <line
              x1={hovered.x} y1={padY} x2={hovered.x} y2={H - padY}
              stroke={color} strokeWidth="1" strokeDasharray="3 2" strokeOpacity="0.5"
            />
            <circle cx={hovered.x} cy={hovered.y} r="5" fill={color} stroke="white" strokeWidth="2" />
          </>
        )}

        {/* Latest dot */}
        {!hovered && pts.length > 0 && (
          <circle
            cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]}
            r="4.5" fill={color} stroke="white" strokeWidth="2"
          />
        )}
      </svg>

      {/* Date axis labels */}
      {points.length > 1 && (
        <div className="flex justify-between px-1.5 -mt-0.5">
          <span className="text-[9px] text-slate-300">{firstLabel}</span>
          <span className="text-[9px] text-slate-300">{lastLabel}</span>
        </div>
      )}

      {/* Hover tooltip */}
      {hovered && (
        <div
          className="absolute top-0 pointer-events-none z-10 bg-slate-900 text-white rounded-xl px-2.5 py-1.5 text-xs shadow-xl"
          style={{
            left: `${Math.min(85, (hovered.x / 300) * 100)}%`,
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
          }}
        >
          <span className="font-bold">{hovered.pt.value.toFixed(unit === '' ? 1 : 0)}{unit ? ` ${unit}` : ''}</span>
          <span className="text-slate-400 ml-1.5 text-[10px]">
            {new Date(hovered.pt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      )}
    </div>
  )
}

function trendInsight(
  values: number[],
  label: string,
  unit: string,
  idealMin: number,
  idealMax: number,
): { text: string; color: string; badge: string } {
  if (values.length < 2) return { text: 'Not enough data to detect a trend.', color: '#94A3B8', badge: '—' }

  const delta = values[values.length - 1] - values[0]
  const last  = values[values.length - 1]
  const threshold = (idealMax - idealMin) * 0.15
  const dir = Math.abs(delta) < threshold ? 'stable' : delta > 0 ? 'rising' : 'falling'
  const outOfRange = last < idealMin || last > idealMax

  if (dir === 'stable' && !outOfRange)
    return { text: `${label} is stable and within the ideal range of ${idealMin}–${idealMax}${unit ? ' ' + unit : ''}.`, color: '#10B981', badge: '↗ Stable' }
  if (dir === 'stable' && outOfRange)
    return { text: `${label} is stable but outside ideal range (${idealMin}–${idealMax}${unit}). Adjust to bring it in range.`, color: '#F59E0B', badge: '⚠ Off-range' }
  if (dir === 'rising')
    return {
      text: `${label} trending up +${Math.abs(delta).toFixed(1)}${unit}. ${last > idealMax ? `Now above ideal — action recommended.` : 'Still within range.'}`,
      color: last > idealMax ? '#F97316' : '#10B981',
      badge: `↑ Rising`,
    }
  return {
    text: `${label} trending down −${Math.abs(delta).toFixed(1)}${unit}. ${last < idealMin ? `Now below ideal — action recommended.` : 'Still within range.'}`,
    color: last < idealMin ? '#F97316' : '#10B981',
    badge: `↓ Dropping`,
  }
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 75 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444'
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1 rounded-full bg-slate-100">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-xs font-bold w-5 text-right" style={{ color }}>{score}</span>
    </div>
  )
}

// ── Treatment Plan card ───────────────────────────────────────────────────────
function TreatmentPlanCard({ test }: { test: WaterTest }) {
  const [open, setOpen] = useState(false)
  const analysis = parseAnalysis(test.aiAnalysis)
  const hasDosing = (analysis.chemical_dosing_guide?.length ?? 0) > 0
  const hasSteps  = (analysis.immediate_action_plan?.length ?? 0) > 0
  const dotColor  = test.status === 'safe' ? '#10B981' : test.status === 'caution' ? '#F59E0B' : '#EF4444'

  if (!hasDosing && !hasSteps) return null

  return (
    <div className="card-light p-4 rounded-3xl">
      <button
        className="w-full flex items-center justify-between"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${dotColor}18` }}>
            <svg className="w-4.5 h-4.5" style={{ color: dotColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div className="min-w-0 text-left">
            <p className="text-sm font-semibold text-slate-800">AI Treatment Plan</p>
            <p className="text-xs text-slate-400 mt-0.5 truncate">
              {analysis.treatment_summary ?? analysis.diagnosis ?? 'Based on your last test'}
            </p>
          </div>
        </div>
        <svg
          className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          {/* Action steps */}
          {hasSteps && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Action Plan</p>
              <div className="space-y-2">
                {analysis.immediate_action_plan!.map((step, i) => (
                  <div key={i} className="flex gap-2.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                      style={{ background: `${dotColor}18`, color: dotColor }}>
                      {i + 1}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dosing guide */}
          {hasDosing && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Chemical Dosing</p>
              <div className="space-y-2">
                {analysis.chemical_dosing_guide!.map((dose, i) => (
                  <div key={i} className="rounded-xl p-3" style={{ background: 'rgba(0,201,177,0.05)', border: '1px solid rgba(0,201,177,0.12)' }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-700">{dose.chemical}</span>
                      <span className="text-xs font-bold" style={{ color: '#00C9B1' }}>{dose.amount}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{dose.how_to_apply}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Safety notes */}
          {analysis.safety_notes && analysis.safety_notes !== 'None — water is safe to swim' && (
            <div className="rounded-xl p-3 flex gap-2.5" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.14)' }}>
              <span className="text-base flex-shrink-0">⚠️</span>
              <p className="text-xs text-red-600 leading-relaxed">{analysis.safety_notes}</p>
            </div>
          )}

          {/* Preventative alerts */}
          {(analysis.preventative_alerts?.length ?? 0) > 0 && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Watch Out For</p>
              {analysis.preventative_alerts!.map((a, i) => (
                <div key={i} className="flex gap-2 mb-1.5">
                  <span className="text-amber-400 text-xs flex-shrink-0 mt-0.5">•</span>
                  <p className="text-xs text-slate-500 leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Chart section ─────────────────────────────────────────────────────────────
interface ChartSectionProps {
  label: string
  unit: string
  color: string
  idealMin: number
  idealMax: number
  idealLabel: string
  points: ChartPoint[]
  poolType?: string
}

function ChartSection({ label, unit, color, idealMin, idealMax, idealLabel, points }: ChartSectionProps) {
  const values = points.map((p) => p.value)
  const last   = values[values.length - 1]
  const insight = trendInsight(values, label, unit, idealMin, idealMax)

  return (
    <div className="card-light p-4 animate-in">
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
          <p className="text-[9px] text-slate-300 mt-0.5">Ideal: {idealLabel}</p>
        </div>
        {last != null && (
          <div className="flex items-baseline gap-1.5">
            <span className="font-display font-black text-2xl text-slate-900">
              {Number.isInteger(last) ? last : last.toFixed(1)}
            </span>
            {unit && <span className="text-xs text-slate-400 mb-0.5">{unit}</span>}
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1"
              style={{ background: `${insight.color}15`, color: insight.color }}
            >
              {insight.badge}
            </span>
          </div>
        )}
      </div>

      <Chart points={points} color={color} idealMin={idealMin} idealMax={idealMax} unit={unit} />

      {values.length >= 2 && (
        <div className="mt-2.5 flex items-start gap-2 p-2.5 rounded-xl" style={{ background: `${insight.color}10` }}>
          <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: insight.color }} />
          <p className="text-xs leading-relaxed" style={{ color: insight.color }}>{insight.text}</p>
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function HistoryPage() {
  const { id } = useParams<{ id: string }>()
  const [tests, setTests]       = useState<WaterTest[]>([])
  const [pool, setPool]         = useState<{ poolName: string; chlorineType: string } | null>(null)
  const [loading, setLoading]   = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const [activeDays, setActiveDays] = useState(30)

  useEffect(() => {
    setLoading(true)
    setLoadError(false)
    Promise.all([
      fetch(`/api/tests?poolId=${id}&limit=120`).then((r) => { if (!r.ok) throw new Error(); return r.json() }),
      fetch(`/api/pools/${id}`).then((r) => { if (!r.ok) throw new Error(); return r.json() }),
    ]).then(([testData, poolData]) => {
      const sorted = ([...(testData.tests ?? [])]).sort(
        (a: WaterTest, b: WaterTest) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )
      setTests(sorted)
      setPool({ poolName: poolData.pool?.poolName ?? 'Pool', chlorineType: poolData.pool?.chlorineType ?? 'CHLORINE' })
    }).catch(() => setLoadError(true)).finally(() => setLoading(false))
  }, [id, retryKey])

  const cutoff  = new Date(Date.now() - activeDays * 86400000)
  const filtered = tests.filter((t) => new Date(t.createdAt) >= cutoff)

  const toPoints = (getter: (t: WaterTest) => number | null) =>
    filtered
      .map((t) => ({ value: getter(t), date: t.createdAt }))
      .filter((p): p is ChartPoint => p.value !== null)

  const phPoints  = toPoints((t) => t.pH)
  const clPoints  = toPoints((t) => t.chlorine)
  const alkPoints = toPoints((t) => t.alkalinity)
  const caPoints  = toPoints((t) => t.calciumHardness)
  const cyaPoints = toPoints((t) => t.cyanuricAcid)

  const lastTest = tests[tests.length - 1] ?? null
  const lastAnalysis = lastTest ? parseAnalysis(lastTest.aiAnalysis) : null
  const pastTests = [...filtered].reverse()

  // For salt pools, adjust ideal CYA range (SWG prefers lower CYA)
  const isSalt = pool?.chlorineType === 'SALT'
  const cyaIdealMin = isSalt ? 60 : 30
  const cyaIdealMax = isSalt ? 80 : 50

  // Free chlorine's real ideal floor depends on CYA (chlorine lock) — base the
  // chart's ideal band on the most recent CYA reading rather than a flat 1–3 ppm
  // that can silently disagree with the AI's own CYA-adjusted verdict.
  const clIdealMin = cyaAdjustedMinChlorine(lastTest?.cyanuricAcid ?? null)
  const clIdealMax = Math.max(3, clIdealMin + 1)

  if (loading) {
    return (
      <div className="pb-8">
        <div className="px-4 pt-12 pb-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl flex-shrink-0 skeleton" />
          <div className="space-y-2">
            <div className="h-6 w-40 rounded-xl skeleton" />
            <div className="h-3 w-36 rounded-full skeleton" />
          </div>
        </div>
        <div className="px-4 mb-5">
          <div className="card-light p-1 flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`flex-1 h-9 rounded-2xl skeleton ${i === 1 ? 'opacity-100' : 'opacity-60'}`} />
            ))}
          </div>
        </div>
        <div className="px-4 space-y-4">
          <div className="card-light p-5 rounded-3xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex-shrink-0 skeleton" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded skeleton" />
                <div className="h-3 w-48 rounded-full skeleton" />
              </div>
              <div className="w-4 h-4 rounded skeleton flex-shrink-0" />
            </div>
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} className="card-light p-4 rounded-3xl">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-1.5">
                  <div className="h-3 w-24 rounded skeleton" />
                  <div className="h-2.5 w-16 rounded-full skeleton" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-20 rounded-xl skeleton" />
                  <div className="h-8 w-16 rounded-xl skeleton" />
                </div>
              </div>
              <div className="h-[76px] rounded-xl skeleton" />
              <div className="mt-3 h-9 rounded-xl skeleton" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (loadError) return (
    <PageError
      variant="light"
      onRetry={() => setRetryKey((k) => k + 1)}
      title="Could not load history"
      backHref={`/pools/${id}`}
      backLabel="Pool details"
    />
  )

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="px-4 pt-12 pb-5 flex items-center gap-3">
        <Link href={`/pools/${id}`}
          className="w-9 h-9 rounded-2xl flex items-center justify-center bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors flex-shrink-0">
          <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="font-display font-bold text-slate-900 text-xl">History & Trends</h1>
          <p className="text-xs text-slate-400 mt-0.5">{pool?.poolName} · Chemistry over time</p>
        </div>
      </div>

      {/* Test reminder */}
      {lastTest && (
        <div className="px-4 mb-4">
          <TestReminderBanner
            lastTestedAt={lastTest.createdAt}
            poolId={id}
            nextTestDays={lastAnalysis?.next_test_days}
          />
        </div>
      )}

      {/* Time filter */}
      <div className="px-4 mb-5">
        <div className="card-light p-1 flex gap-1">
          {TIME_FILTERS.map((f) => (
            <button
              key={f.days}
              onClick={() => setActiveDays(f.days)}
              className="flex-1 py-2 rounded-2xl text-xs font-semibold transition-all duration-200"
              style={activeDays === f.days
                ? { background: '#00C9B1', color: 'white', boxShadow: '0 2px 8px rgba(0,201,177,0.28)' }
                : { color: '#94A3B8' }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {tests.length === 0 ? (
        <div className="px-4">
          <EmptyStateView
            scene="no-history"
            action={{ label: 'Add first test', href: `/pools/${id}/test` }}
          />
        </div>
      ) : (
        <div className="px-4 space-y-4">

          {/* AI Treatment Plan — always from latest test */}
          {lastTest && <TreatmentPlanCard test={lastTest} />}

          {/* Core chemistry charts */}
          <ChartSection
            label="Free Chlorine"
            unit="ppm"
            color="#006FFF"
            idealMin={clIdealMin}
            idealMax={clIdealMax}
            idealLabel={`${clIdealMin}–${clIdealMax} ppm${lastTest?.cyanuricAcid != null ? ' (CYA-adj.)' : ''}`}
            points={clPoints}
            poolType={pool?.chlorineType}
          />
          <ChartSection
            label="pH"
            unit=""
            color="#00C9B1"
            idealMin={7.2}
            idealMax={7.6}
            idealLabel="7.2–7.6"
            points={phPoints}
            poolType={pool?.chlorineType}
          />
          <ChartSection
            label="Total Alkalinity"
            unit="ppm"
            color="#8B5CF6"
            idealMin={isSalt ? 60 : 80}
            idealMax={isSalt ? 80 : 120}
            idealLabel={isSalt ? '60–80 ppm (SWG)' : '80–120 ppm'}
            points={alkPoints}
            poolType={pool?.chlorineType}
          />

          {/* Optional: Calcium Hardness — only show if we have data */}
          {caPoints.length > 0 && (
            <ChartSection
              label="Calcium Hardness"
              unit="ppm"
              color="#F59E0B"
              idealMin={200}
              idealMax={400}
              idealLabel="200–400 ppm"
              points={caPoints}
              poolType={pool?.chlorineType}
            />
          )}

          {/* Optional: Cyanuric Acid — only show if we have data */}
          {cyaPoints.length > 0 && (
            <ChartSection
              label="Cyanuric Acid (Stabilizer)"
              unit="ppm"
              color="#EC4899"
              idealMin={cyaIdealMin}
              idealMax={cyaIdealMax}
              idealLabel={`${cyaIdealMin}–${cyaIdealMax} ppm${isSalt ? ' (SWG)' : ''}`}
              points={cyaPoints}
              poolType={pool?.chlorineType}
            />
          )}

          {/* Science callout */}
          <div className="rounded-2xl p-4" style={{ background: 'rgba(0,111,255,0.05)', border: '1px solid rgba(0,111,255,0.1)' }}>
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1.5">Chemistry Priority Order</p>
            <div className="space-y-1">
              {[
                { n: '1', t: 'Alkalinity first', d: 'Buffers pH and controls chemical stability' },
                { n: '2', t: 'pH second', d: 'Determines how effectively chlorine sanitizes' },
                { n: '3', t: 'Chlorine last', d: 'Now works at full efficiency at correct pH' },
              ].map((s) => (
                <div key={s.n} className="flex gap-2.5 items-start">
                  <span className="text-[10px] font-bold text-blue-400 w-3 flex-shrink-0 mt-0.5">{s.n}.</span>
                  <div>
                    <span className="text-xs font-semibold text-slate-700">{s.t} </span>
                    <span className="text-[11px] text-slate-400">{s.d}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Past tests list */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-slate-800">Test Log</p>
              <Link href={`/pools/${id}/test`} className="text-xs font-semibold px-3 py-1.5 rounded-xl"
                style={{ background: 'rgba(0,201,177,0.1)', color: '#00C9B1' }}>
                + New test
              </Link>
            </div>
            <div className="space-y-2">
              {pastTests.map((test) => {
                const score    = parseScore(test.aiAnalysis)
                const analysis = parseAnalysis(test.aiAnalysis)
                const d        = new Date(test.createdAt)
                const dotColor = test.status === 'safe' ? '#10B981' : test.status === 'caution' ? '#F59E0B' : '#EF4444'
                const isToday  = new Date().toDateString() === d.toDateString()
                const isYest   = new Date(Date.now() - 86400000).toDateString() === d.toDateString()
                const dateLabel = isToday ? 'Today' : isYest ? 'Yesterday'
                  : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined })

                return (
                  <div key={test.id} className="card-light p-4 flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5" style={{ background: dotColor }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-800">{dateLabel}</p>
                        <p className="text-xs text-slate-400">
                          {d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </p>
                      </div>
                      {analysis.treatment_summary && (
                        <p className="text-xs text-slate-500 truncate mt-0.5">{analysis.treatment_summary}</p>
                      )}
                      {score > 0 && <ScoreBar score={score} />}
                    </div>
                    <span
                      className="font-display font-black text-lg flex-shrink-0"
                      style={{ color: score >= 75 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444' }}
                    >
                      {score || '—'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

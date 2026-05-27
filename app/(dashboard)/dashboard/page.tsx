'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/AuthProvider'

import { EmptyStateView } from '@/components/EmptyStateView'

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show:   { opacity: 1, y: 0,  scale: 1, transition: { type: 'spring' as const, stiffness: 420, damping: 38 } },
}

interface WaterTest {
  id: string
  status: string
  chlorine: number
  pH: number
  alkalinity: number
  aiAnalysis: string
  createdAt: string
}

interface Pool {
  id: string
  poolName: string
  gallons: number
  chlorineType: string
  _count: { waterTests: number; serviceLogs: number }
  waterTests: WaterTest[]
}

interface ParsedAnalysis {
  health_score?: number
  diagnosis?: string
  preventative_alerts?: string[]
  key_causes?: string[]
  status?: 'safe' | 'caution' | 'critical'
}

function parseAnalysis(raw: string): ParsedAnalysis {
  try { return JSON.parse(raw) } catch { return {} }
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'Good morning'
  if (h >= 12 && h < 17) return 'Good afternoon'
  if (h >= 17 && h < 21) return 'Good evening'
  return 'Late night check-in'
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''} ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? 's' : ''} ago`
  const days = Math.floor(hrs / 24)
  return `${days} day${days !== 1 ? 's' : ''} ago`
}

// ── Animated health ring ────────────────────────────────────────────────────
function HealthRing({ score, size = 120 }: { score: number; size?: number }) {
  const [animated, setAnimated] = useState(false)
  const [displayed, setDisplayed] = useState(0)
  const r = size * 0.42
  const c = 2 * Math.PI * r
  const color = score >= 75 ? '#00C9B1' : score >= 50 ? '#F59E0B' : '#EF4444'

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!animated) return
    const duration = 1400
    const start = performance.now()
    function tick(now: number) {
      const p = Math.min((now - start) / duration, 1)
      const e = 1 - Math.pow(1 - p, 3)
      setDisplayed(Math.round(e * score))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [animated, score])

  const offset = animated ? c * (1 - score / 100) : c

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={size * 0.075} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={size * 0.075}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)',
            filter: `drop-shadow(0 0 8px ${color}80)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
        <span className="font-display font-black text-white leading-none" style={{ fontSize: size * 0.27 }}>{displayed}</span>
        <span className="font-semibold text-white/50 mt-0.5" style={{ fontSize: size * 0.10 }}>/ 100</span>
      </div>
    </div>
  )
}

// ── Sparkline SVG ───────────────────────────────────────────────────────────
function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) {
    return <div className="h-10 flex items-center justify-center text-slate-300 text-xs">Not enough data</div>
  }
  const w = 200, h = 40, pad = 4
  const min = Math.min(...values) - pad
  const max = Math.max(...values) + pad
  const range = max - min || 1
  const pts: [number, number][] = values.map((v, i) => [
    (i / (values.length - 1)) * w,
    h - ((v - min) / range) * (h - 4) - 2,
  ])
  let d = `M ${pts[0][0]} ${pts[0][1]}`
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1]
    const [cx, cy] = pts[i]
    const mx = (px + cx) / 2
    d += ` C ${mx} ${py}, ${mx} ${cy}, ${cx} ${cy}`
  }
  const areaD = `${d} L ${pts[pts.length - 1][0]} ${h} L ${pts[0][0]} ${h} Z`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 44 }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#grad-${color.replace('#', '')})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3.5" fill={color} />
    </svg>
  )
}

// ── Trend card ──────────────────────────────────────────────────────────────
function TrendCard({
  label, unit, value, ideal, values, color, trend, trendLabel,
}: {
  label: string; unit: string; value: number; ideal: string
  values: number[]; color: string; trend: number; trendLabel: string
}) {
  const isUp = trend >= 0
  const trendColor = trendLabel === 'Stable' ? '#10B981' : '#F59E0B'
  return (
    <div className="card-light p-4 flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: `${trendColor}18`, color: trendColor }}>
          {isUp ? '↗' : '↘'} {trendLabel}
        </span>
      </div>
      <div className="flex items-baseline gap-1 mb-0.5">
        <span className="font-display font-black text-2xl text-slate-900">{value.toFixed(1)}</span>
        {unit && <span className="text-slate-400 text-xs">{unit}</span>}
      </div>
      <p className="text-[10px] text-slate-400 mb-2">Ideal {ideal}</p>
      <Sparkline values={values} color={color} />
    </div>
  )
}

// ── Alert severity badge ─────────────────────────────────────────────────────
const ALERT_SEVERITY: { keyword: string; level: 'medium' | 'low' }[] = [
  { keyword: 'algae',    level: 'medium' },
  { keyword: 'chlorine', level: 'medium' },
  { keyword: 'unsafe',   level: 'medium' },
  { keyword: 'critical', level: 'medium' },
  { keyword: 'pH',       level: 'low' },
  { keyword: 'alkalinity', level: 'low' },
]
function alertLevel(msg: string): 'medium' | 'low' {
  const lower = msg.toLowerCase()
  for (const a of ALERT_SEVERITY) {
    if (lower.includes(a.keyword.toLowerCase())) return a.level
  }
  return 'low'
}

// ── Empty state ─────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="px-4">
      <EmptyStateView
        scene="no-pools"
        action={{ label: 'Add Pool', href: '/pools/new' }}
      />
    </div>
  )
}

// ── Skeleton ────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div>
      <div className="animate-pulse" style={{ background: 'linear-gradient(155deg, #0B2030, #0B3535)', minHeight: 280 }} />
      <div className="px-4 py-4 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 h-24 bg-slate-200 rounded-3xl animate-pulse" />
          <div className="flex-1 h-24 bg-slate-200 rounded-3xl animate-pulse" />
        </div>
        <div className="flex gap-3">
          <div className="flex-1 h-28 bg-slate-200 rounded-3xl animate-pulse" />
          <div className="flex-1 h-28 bg-slate-200 rounded-3xl animate-pulse" />
        </div>
      </div>
    </div>
  )
}

// ── Other pools pill ─────────────────────────────────────────────────────────
function OtherPoolPill({ pool }: { pool: Pool }) {
  const last = pool.waterTests[0]
  const statusColors: Record<string, string> = {
    safe:     '#10B981',
    caution:  '#F59E0B',
    critical: '#EF4444',
  }
  const color = statusColors[last?.status ?? ''] ?? '#94A3B8'
  return (
    <Link href={`/pools/${pool.id}`}
      className="card-light p-4 flex items-center gap-3 hover:-translate-y-0.5 transition-transform duration-200">
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{pool.poolName}</p>
        <p className="text-xs text-slate-400">{pool.gallons.toLocaleString()} gal</p>
      </div>
      {last ? (
        <div className="text-right">
          <p className="text-xs font-semibold" style={{ color }}>
            {last.status === 'safe' ? 'Balanced' : last.status === 'caution' ? 'Monitor' : 'Action needed'}
          </p>
        </div>
      ) : (
        <span className="text-xs text-slate-400">No tests</span>
      )}
      <svg className="w-4 h-4 text-slate-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}

// ── Main component ──────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth()
  const [pools, setPools] = useState<Pool[]>([])
  const [loading, setLoading] = useState(true)
  const greeting = getGreeting()

  useEffect(() => {
    fetch('/api/pools?trend=true')
      .then((r) => r.json())
      .then((data) => {
        const statusOrder: Record<string, number> = { critical: 0, caution: 1, safe: 2 }
        const list: Pool[] = (data.pools ?? []).sort((a: Pool, b: Pool) => {
          const as = a.waterTests[0]?.status ?? 'none'
          const bs = b.waterTests[0]?.status ?? 'none'
          return (statusOrder[as] ?? 3) - (statusOrder[bs] ?? 3)
        })
        setPools(list)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Skeleton />

  if (pools.length === 0) return <EmptyState />

  const primary = pools[0]
  const others = pools.slice(1)
  const lastTest = primary.waterTests[0]
  const analysis = lastTest ? parseAnalysis(lastTest.aiAnalysis) : {}
  const score = Math.round(Math.max(0, Math.min(100, analysis.health_score ?? 0)))
  const scoreColor = score >= 75 ? '#00C9B1' : score >= 50 ? '#F59E0B' : '#EF4444'

  // Trend data (oldest→newest for sparklines)
  const tests = [...primary.waterTests].reverse()
  const pHValues = tests.map((t) => t.pH)
  const clValues = tests.map((t) => t.chlorine)
  const pHTrend = pHValues.length >= 2 ? pHValues[pHValues.length - 1] - pHValues[0] : 0
  const clTrend = clValues.length >= 2 ? clValues[clValues.length - 1] - clValues[0] : 0
  const pHLabel = Math.abs(pHTrend) < 0.15 ? 'Stable' : pHTrend > 0 ? 'Rising' : 'Dropping'
  const clLabel = Math.abs(clTrend) < 0.3 ? 'Stable' : clTrend > 0 ? 'Rising' : 'Dropping'

  // Alerts from analysis
  const alerts = [
    ...(analysis.preventative_alerts ?? []).slice(0, 3),
  ]

  const statusText: Record<string, string> = {
    safe:     'All systems balanced',
    caution:  'Needs attention',
    critical: 'Immediate action needed',
  }
  const poolStatus = lastTest?.status ?? 'safe'
  const statusDotColor = { safe: '#10B981', caution: '#F59E0B', critical: '#EF4444' }[poolStatus] ?? '#94A3B8'

  const scoreGlowColor = score >= 75 ? 'rgba(60,221,199,0.25)' : score >= 50 ? 'rgba(177,197,255,0.20)' : 'rgba(255,180,171,0.25)'
  const scoreTextColor = score >= 75 ? '#3cddc7' : score >= 50 ? '#b1c5ff' : '#ffb4ab'
  const heroStatusLabel = score >= 75 ? 'Optimal Status' : score >= 50 ? 'Needs Attention' : 'Action Required'

  return (
    <div className="pb-6">

      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <div>
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] mb-0.5"
            style={{ color: '#849495' }}>{greeting}</p>
          <h1 className="font-display font-bold text-[#dee3ea] text-2xl leading-tight">{primary.poolName}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/notifications"
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <svg className="w-5 h-5" style={{ color: '#b9cacb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            </svg>
          </Link>
          <Link href="/pools/new"
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-colors"
            style={{ background: 'rgba(0,242,255,0.08)', border: '1px solid rgba(0,242,255,0.18)' }}>
            <svg className="w-5 h-5" style={{ color: '#00f2ff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Link>
        </div>
      </div>

      {/* ── Hero: 3D Droplet Health Score ─────────────────────────── */}
      <div className="relative flex flex-col items-center justify-center py-8 px-4 min-h-[320px]">
        {/* Ripple rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[240px] h-[240px] rounded-full absolute ripple-ring-1" />
          <div className="w-[360px] h-[360px] rounded-full absolute ripple-ring-2" />
        </div>

        {lastTest ? (
          <>
            {/* 3D Droplet blob — floats continuously */}
            <motion.div
              className="droplet-3d relative z-10 flex flex-col items-center justify-center w-52 h-52 select-none"
              style={{
                borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
                boxShadow: `inset -15px -15px 35px rgba(0,0,0,0.50), inset 8px 8px 25px rgba(255,255,255,0.25), 0 0 50px ${scoreGlowColor}`,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, y: [0, -11, -5, 0] }}
              transition={{
                opacity: { duration: 0.5, delay: 0.1 },
                scale:   { type: 'spring', stiffness: 300, damping: 28, delay: 0.1 },
                y: { duration: 4.8, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop', delay: 0.6 },
              }}
            >
              <span className="font-display font-black leading-none text-[#0a0f14]"
                style={{ fontSize: 72 }}>{score}</span>
              <span className="font-mono text-[10px] tracking-[0.12em] uppercase mt-1"
                style={{ color: 'rgba(10,15,20,0.55)' }}>/ 100</span>
            </motion.div>

            {/* Status label */}
            <motion.div
              className="mt-7 flex flex-col items-center z-10"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] mb-1.5"
                style={{ color: '#00f2ff' }}>System Health</span>
              <h2 className="font-display font-bold text-[26px] leading-tight text-center"
                style={{ color: '#dee3ea' }}>{heroStatusLabel}</h2>
              {analysis.diagnosis && (
                <p className="text-sm text-center mt-2 max-w-[280px] leading-relaxed"
                  style={{ color: '#b9cacb' }}>{analysis.diagnosis}</p>
              )}
              <p className="font-mono text-[10px] tracking-wider mt-2"
                style={{ color: '#849495' }}>
                LAST TESTED {timeAgo(lastTest.createdAt).toUpperCase()}
              </p>
            </motion.div>
          </>
        ) : (
          <div className="flex flex-col items-center z-10 py-6">
            <div
              className="droplet-3d w-40 h-40 flex items-center justify-center select-none"
              style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%', opacity: 0.5 }}
            >
              <span className="font-mono text-sm" style={{ color: 'rgba(10,15,20,0.5)' }}>—</span>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] mt-6"
              style={{ color: '#849495' }}>NO TEST DATA YET</p>
          </div>
        )}
      </div>

      {/* ── Bento Metrics Row ──────────────────────────────────────── */}
      {lastTest && (
        <motion.div
          className="px-4 grid grid-cols-2 gap-bento_gap"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {/* pH */}
          {(() => {
            const val = lastTest.pH
            const ok = val >= 7.2 && val <= 7.6
            const err = val < 7.0 || val > 8.0
            const color = err ? '#ffb4ab' : ok ? '#3cddc7' : '#b1c5ff'
            const label = err ? 'Out of Range' : ok ? 'Optimal Range' : 'Monitor'
            return (
              <motion.div variants={fadeUp} whileTap={{ scale: 0.97 }}
                className="bento-glass rounded-xl p-5 flex flex-col justify-between min-h-[148px] relative overflow-hidden group"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex justify-between items-start">
                  <span className="label-mono">pH Level</span>
                  <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                    style={{ borderColor: color, boxShadow: `0 0 12px ${color}40` }}>
                    <svg className="w-3.5 h-3.5" style={{ color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <div className="font-display font-bold leading-none" style={{ fontSize: 40, color: '#dee3ea' }}>
                    {val.toFixed(1)}
                  </div>
                  <p className="font-mono text-[10px] tracking-wider mt-1" style={{ color }}>{label}</p>
                </div>
                <div className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full blur-2xl pointer-events-none"
                  style={{ background: `${color}12` }} />
                <div className="absolute bottom-0 left-0 right-0 h-1/2 pointer-events-none opacity-10"
                  style={{ background: `linear-gradient(to top, ${color}, transparent)` }} />
              </motion.div>
            )
          })()}

          {/* Free Chlorine */}
          {(() => {
            const val = lastTest.chlorine
            const ok = val >= 1 && val <= 3
            const err = val < 0.5 || val > 5
            const color = err ? '#ffb4ab' : ok ? '#3cddc7' : '#b1c5ff'
            const label = err ? 'Critical' : ok ? 'Optimal Range' : 'Adjust Soon'
            return (
              <motion.div variants={fadeUp} whileTap={{ scale: 0.97 }}
                className="bento-glass rounded-xl p-5 flex flex-col justify-between min-h-[148px] relative overflow-hidden group"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex justify-between items-start">
                  <span className="label-mono">Free Chlorine</span>
                  <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                    style={{ borderColor: color, boxShadow: `0 0 12px ${color}40` }}>
                    <svg className="w-3.5 h-3.5" style={{ color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display font-bold leading-none" style={{ fontSize: 40, color: '#dee3ea' }}>
                      {val % 1 === 0 ? val : val.toFixed(1)}
                    </span>
                    <span className="font-mono text-[11px]" style={{ color: '#849495' }}>ppm</span>
                  </div>
                  <p className="font-mono text-[10px] tracking-wider mt-1" style={{ color }}>{label}</p>
                </div>
                <div className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full blur-2xl pointer-events-none"
                  style={{ background: `${color}12` }} />
                <div className="absolute bottom-0 left-0 right-0 h-1/2 pointer-events-none opacity-10"
                  style={{ background: `linear-gradient(to top, ${color}, transparent)` }} />
              </motion.div>
            )
          })()}

          {/* Alkalinity */}
          {(() => {
            const val = lastTest.alkalinity
            const ok = val >= 80 && val <= 120
            const color = ok ? '#3cddc7' : '#b1c5ff'
            return (
              <motion.div variants={fadeUp} whileTap={{ scale: 0.97 }}
                className="bento-glass rounded-xl p-5 flex flex-col justify-between min-h-[120px] relative overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="label-mono">Total Alkalinity</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="font-display font-bold text-3xl leading-none" style={{ color: '#dee3ea' }}>{val}</span>
                  <span className="font-mono text-[11px]" style={{ color: '#849495' }}>ppm</span>
                </div>
                <p className="font-mono text-[10px] tracking-wider mt-1" style={{ color }}>{ok ? 'Balanced' : 'Check Level'}</p>
              </motion.div>
            )
          })()}

          {/* Status Summary */}
          <motion.div variants={fadeUp} whileTap={{ scale: 0.97 }}
            className="bento-glass rounded-xl p-5 flex flex-col justify-between min-h-[120px] relative overflow-hidden"
            style={{ border: `1px solid ${scoreTextColor}22` }}>
            <span className="label-mono">Water Status</span>
            <div className="mt-2">
              <div className="w-9 h-9 rounded-full border-2 flex items-center justify-center mb-2"
                style={{ borderColor: scoreTextColor, boxShadow: `0 0 12px ${scoreTextColor}40` }}>
                <svg className="w-4 h-4" style={{ color: scoreTextColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {score >= 75
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    : score >= 50
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  }
                </svg>
              </div>
              <p className="font-display font-bold text-xl leading-tight" style={{ color: '#dee3ea' }}>
                {score >= 75 ? 'Safe to\nSwim' : score >= 50 ? 'Monitor\nClosely' : 'Take\nAction'}
              </p>
            </div>
            <div className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full blur-2xl pointer-events-none"
              style={{ background: `${scoreTextColor}10` }} />
          </motion.div>
        </motion.div>
      )}

      {/* ── Quick Actions ──────────────────────────────────────────── */}
      <div className="px-4 mt-bento_gap grid grid-cols-2 gap-bento_gap animate-in-delay-2">
        <Link href={`/pools/${primary.id}/test`}
          className="btn-glass flex items-center gap-3 px-4 py-4 rounded-xl text-left"
          style={{ textDecoration: 'none' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(0,242,255,0.12)' }}>
            <svg className="w-4 h-4" style={{ color: '#00f2ff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 01-6.23-.693L4.2 15.3m15.6 0l-1.2 3.6a2.25 2.25 0 01-2.16 1.65H7.56a2.25 2.25 0 01-2.16-1.65L4.2 15.3" />
            </svg>
          </div>
          <div>
            <p className="font-display font-semibold text-sm" style={{ color: '#dee3ea' }}>Test Water</p>
            <p className="font-mono text-[10px] tracking-wider mt-0.5" style={{ color: '#849495' }}>~90 SECONDS</p>
          </div>
        </Link>

        <Link href={`/pools/${primary.id}/history`}
          className="bento-glass flex items-center gap-3 px-4 py-4 rounded-xl transition-colors hover:bg-white/5"
          style={{ border: '1px solid rgba(255,255,255,0.06)', textDecoration: 'none' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.06)' }}>
            <svg className="w-4 h-4" style={{ color: '#b9cacb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <div>
            <p className="font-display font-semibold text-sm" style={{ color: '#dee3ea' }}>History</p>
            <p className="font-mono text-[10px] tracking-wider mt-0.5" style={{ color: '#849495' }}>VIEW TRENDS</p>
          </div>
        </Link>
      </div>

      {/* ── Trend Sparklines ───────────────────────────────────────── */}
      {lastTest && pHValues.length >= 2 && (
        <div className="px-4 mt-bento_gap animate-in-delay-2">
          <div className="glass-panel rounded-xl p-5"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between mb-4">
              <span className="font-display font-semibold text-sm" style={{ color: '#dee3ea' }}>30-Day Trends</span>
              <Link href={`/pools/${primary.id}/history`}
                className="font-mono text-[10px] tracking-wider uppercase"
                style={{ color: '#00f2ff' }}>View All →</Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <TrendCard
                label="pH Level" unit="" value={pHValues[pHValues.length - 1]} ideal="7.2–7.6"
                values={pHValues} color="#00f2ff" trend={pHTrend} trendLabel={pHLabel}
              />
              <TrendCard
                label="Chlorine" unit="ppm" value={clValues[clValues.length - 1]} ideal="1–3"
                values={clValues} color="#3cddc7" trend={clTrend} trendLabel={clLabel}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Alerts ─────────────────────────────────────────────────── */}
      {alerts.length > 0 && (
        <div className="px-4 mt-bento_gap animate-in-delay-3">
          <div className="glass-panel rounded-xl p-5 space-y-3"
            style={{ border: '1px solid rgba(177,197,255,0.15)' }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="label-mono">Preventative Alerts</span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(177,197,255,0.12)', color: '#b1c5ff' }}>
                {alerts.length}
              </span>
            </div>
            {alerts.map((alert, i) => {
              const level = alertLevel(alert)
              const isM = level === 'medium'
              const color = isM ? '#b1c5ff' : '#3cddc7'
              return (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${color}18` }}>
                    <svg className="w-3.5 h-3.5" style={{ color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d={isM ? "M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                             : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"} />
                    </svg>
                  </div>
                  <p className="text-sm leading-relaxed flex-1" style={{ color: '#b9cacb' }}>{alert}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Fleet: Other pools ─────────────────────────────────────── */}
      {others.length > 0 && (
        <div className="px-4 mt-bento_gap animate-in-delay-4">
          <div className="glass-panel rounded-xl p-5"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex justify-between items-center mb-4">
              <span className="font-display font-semibold text-sm" style={{ color: '#dee3ea' }}>Fleet Overview</span>
              <Link href="/pools" className="font-mono text-[10px] tracking-wider uppercase"
                style={{ color: '#00f2ff' }}>VIEW ALL →</Link>
            </div>
            <div className="space-y-3">
              {others.map((p) => {
                const lt = p.waterTests[0]
                const pStatus = lt?.status ?? 'none'
                const isOnline = pStatus !== 'none'
                const pillColor = pStatus === 'critical' ? '#ffb4ab' : pStatus === 'caution' ? '#b1c5ff' : '#3cddc7'
                return (
                  <Link key={p.id} href={`/pools/${p.id}`}
                    className="flex items-center gap-4 py-2 border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors rounded"
                    style={{ textDecoration: 'none' }}>
                    <div className="w-2 rounded-full flex-shrink-0"
                      style={{ height: 36, background: isOnline ? pillColor : '#30353b',
                        boxShadow: isOnline ? `0 0 8px ${pillColor}50` : 'none' }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-semibold text-sm truncate" style={{ color: '#dee3ea' }}>{p.poolName}</p>
                      <p className="font-mono text-[10px] tracking-wider mt-0.5" style={{ color: '#849495' }}>
                        {p.gallons.toLocaleString()} GAL
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {lt ? (
                        <span className="font-mono text-[10px] tracking-wider" style={{ color: pillColor }}>
                          {pStatus === 'safe' ? 'BALANCED' : pStatus === 'caution' ? 'MONITOR' : 'ACTION'}
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] tracking-wider" style={{ color: '#849495' }}>NO DATA</span>
                      )}
                    </div>
                    <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#3a494b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Add another pool ───────────────────────────────────────── */}
      <div className="px-4 mt-bento_gap animate-in-delay-4">
        <Link href="/pools/new"
          className="flex items-center justify-center gap-2.5 py-4 rounded-xl font-mono text-[11px] tracking-wider uppercase transition-all duration-200 hover:bg-white/5"
          style={{ border: '1px dashed rgba(58,73,75,0.60)', color: '#849495', textDecoration: 'none' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {pools.length === 1 ? 'Add another pool' : 'Add pool'}
        </Link>
      </div>

    </div>
  )
}

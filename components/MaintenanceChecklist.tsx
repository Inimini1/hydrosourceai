'use client'

import { useState, useEffect, useCallback } from 'react'

export interface TreatmentStep {
  chemical: string
  amount: string
  how_to_apply: string
}

interface MaintenanceChecklistProps {
  logId: string
  steps: TreatmentStep[]
  createdAt: string
  notes?: string | null
  poolStatus?: 'safe' | 'caution' | 'critical'
  onDelete?: () => void
}

type ChemType = 'acid' | 'alkali' | 'chlorine' | 'mineral' | 'other'

function classifyChemical(name: string): ChemType {
  const n = name.toLowerCase()
  if (n.includes('acid') || n.includes('muriatic') || n.includes('sodium bisulfate') || n.includes('dry acid')) return 'acid'
  if (n.includes('soda ash') || n.includes('baking soda') || n.includes('sodium bicarbonate') || n.includes('sodium carbonate')) return 'alkali'
  if (n.includes('chlor') || n.includes('shock') || n.includes('bleach') || n.includes('trichlor') || n.includes('dichlor') || n.includes('cal-hypo') || n.includes('cal hypo')) return 'chlorine'
  if (n.includes('calcium') || n.includes('cyanuric') || n.includes('stabilizer') || n.includes('salt') || n.includes('algaecide') || n.includes('algae')) return 'mineral'
  return 'other'
}

const CHEM_STYLE: Record<ChemType, {
  bg: string; border: string; badge: string; color: string; label: string; icon: string
}> = {
  acid:     { bg: 'rgba(220,38,38,0.06)',   border: 'rgba(220,38,38,0.18)',   badge: 'rgba(220,38,38,0.10)',   color: '#DC2626', label: 'Acid',      icon: '🧪' },
  alkali:   { bg: 'rgba(16,185,129,0.06)',  border: 'rgba(16,185,129,0.18)', badge: 'rgba(16,185,129,0.10)', color: '#059669', label: 'Alkali',    icon: '🧂' },
  chlorine: { bg: 'rgba(13,148,136,0.06)',  border: 'rgba(13,148,136,0.18)', badge: 'rgba(13,148,136,0.10)', color: '#0D9488', label: 'Chlorine',  icon: '⚡' },
  mineral:  { bg: 'rgba(139,92,246,0.06)',  border: 'rgba(139,92,246,0.18)', badge: 'rgba(139,92,246,0.10)', color: '#7C3AED', label: 'Mineral',   icon: '💎' },
  other:    { bg: 'rgba(100,116,139,0.06)', border: 'rgba(100,116,139,0.18)',badge: 'rgba(100,116,139,0.10)',color: '#64748B', label: 'Treatment', icon: '🔬' },
}

const STATUS_COLORS = {
  safe:     { text: '#0D9488', bg: 'rgba(13,148,136,0.08)',  border: 'rgba(13,148,136,0.20)',  label: '✓ Balanced' },
  caution:  { text: '#D97706', bg: 'rgba(217,119,6,0.08)',   border: 'rgba(217,119,6,0.20)',   label: '⚡ Needs Attention' },
  critical: { text: '#DC2626', bg: 'rgba(220,38,38,0.08)',   border: 'rgba(220,38,38,0.20)',   label: '✗ Action Required' },
}

function StepItem({ step, index, total, done, onToggle }: {
  step: TreatmentStep; index: number; total: number; done: boolean; onToggle: () => void
}) {
  const type = classifyChemical(step.chemical)
  const s = CHEM_STYLE[type]

  return (
    <div className="rounded-2xl p-4 transition-all duration-300"
      style={{
        background: done ? 'rgba(13,148,136,0.04)' : s.bg,
        border: done ? '1px solid rgba(13,148,136,0.18)' : `1px solid ${s.border}`,
        opacity: done ? 0.75 : 1,
      }}>
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 mt-0.5"
          style={done
            ? { background: '#0D9488', boxShadow: '0 2px 8px rgba(13,148,136,0.30)' }
            : { background: s.badge, border: `1.5px solid ${s.border}` }}
          aria-label={done ? 'Mark incomplete' : 'Mark complete'}
        >
          {done ? (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <span className="text-xs font-black" style={{ color: s.color }}>{index + 1}</span>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm">{s.icon}</span>
              <span className="text-sm font-bold"
                style={{ color: done ? '#0D9488' : '#0f172a', textDecoration: done ? 'line-through' : 'none' }}>
                {step.chemical}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                style={{ background: s.badge, color: s.color }}>
                {s.label}
              </span>
            </div>
            <div className="flex-shrink-0 text-right px-2.5 py-1 rounded-xl"
              style={{ background: done ? 'rgba(13,148,136,0.10)' : s.badge }}>
              <p className="font-display font-black text-base leading-none" style={{ color: done ? '#0D9488' : s.color }}>
                {step.amount}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">{step.how_to_apply}</p>
        </div>
      </div>

      {index < total - 1 && (
        <div className="flex items-center gap-2 mt-3 ml-11">
          <div className="w-0.5 h-4 rounded-full" style={{ background: done ? '#0D9488' : 'rgba(0,0,0,0.10)' }} />
        </div>
      )}
    </div>
  )
}

export default function MaintenanceChecklist({ logId, steps, createdAt, notes, poolStatus = 'caution', onDelete }: MaintenanceChecklistProps) {
  const storageKey = `maintenance-checklist-${logId}`

  const [done, setDone] = useState<boolean[]>(() => {
    if (typeof window === 'undefined') return steps.map(() => false)
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved) as boolean[]
        if (parsed.length === steps.length) return parsed
      }
    } catch {}
    return steps.map(() => false)
  })

  const [expanded, setExpanded] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem(storageKey, JSON.stringify(done))
  }, [done, storageKey])

  const toggle = useCallback((i: number) => {
    setDone((prev) => { const next = [...prev]; next[i] = !next[i]; return next })
  }, [])

  const completedCount = done.filter(Boolean).length
  const allDone = completedCount === steps.length && steps.length > 0
  const pct = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0

  const sc = STATUS_COLORS[poolStatus]
  const date = new Date(createdAt)
  const isToday = new Date().toDateString() === date.toDateString()
  const isYest  = new Date(Date.now() - 86400000).toDateString() === date.toDateString()
  const dateLabel = isToday ? 'Today' : isYest ? 'Yesterday'
    : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <div className="rounded-3xl overflow-hidden"
      style={{
        background: allDone ? 'rgba(13,148,136,0.04)' : '#ffffff',
        border: allDone ? '1px solid rgba(13,148,136,0.18)' : '1px solid rgba(0,0,0,0.07)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}>

      {/* Header */}
      <button className="w-full p-5 flex items-center gap-3 text-left" onClick={() => setExpanded((e) => !e)}>
        <div className="relative w-12 h-12 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
            <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="3.5" />
            <circle cx="22" cy="22" r="18" fill="none"
              stroke={allDone ? '#0D9488' : sc.text}
              strokeWidth="3.5" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 18}`}
              strokeDashoffset={`${2 * Math.PI * 18 * (1 - pct / 100)}`}
              style={{ transition: 'stroke-dashoffset 0.4s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            {allDone ? (
              <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <span className="text-xs font-black text-slate-600">{pct}%</span>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              {dateLabel} · {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
              {sc.label}
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-700 truncate">
            {allDone ? '✓ All steps complete' : `${completedCount} of ${steps.length} steps done`}
          </p>
          {notes && !expanded && (
            <p className="text-xs text-slate-400 truncate mt-0.5">{notes}</p>
          )}
        </div>

        <svg className="w-4 h-4 text-slate-300 flex-shrink-0 transition-transform duration-200"
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Progress bar */}
      <div className="h-0.5 mx-5" style={{ background: 'rgba(0,0,0,0.06)' }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: allDone ? '#0D9488' : sc.text }} />
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="p-5 pt-4 space-y-2">
          {notes && (
            <div className="rounded-2xl px-4 py-3 mb-4" style={{ background: '#f8fafc', border: '1px solid rgba(0,0,0,0.06)' }}>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Service Notes</p>
              <p className="text-sm text-slate-600 leading-relaxed">{notes}</p>
            </div>
          )}

          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Treatment Plan · {steps.length} step{steps.length !== 1 ? 's' : ''}
            </p>
            {completedCount > 0 && !allDone && (
              <button onClick={() => setDone(steps.map(() => false))}
                className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors">
                Reset
              </button>
            )}
          </div>

          <div className="space-y-2">
            {steps.map((step, i) => (
              <StepItem key={i} step={step} index={i} total={steps.length} done={done[i] ?? false} onToggle={() => toggle(i)} />
            ))}
          </div>

          {allDone && (
            <div className="rounded-2xl p-4 text-center mt-4"
              style={{ background: 'rgba(13,148,136,0.06)', border: '1px solid rgba(13,148,136,0.18)' }}>
              <p className="text-2xl mb-1">✅</p>
              <p className="text-sm font-bold text-teal-700">Treatment complete!</p>
              <p className="text-xs text-slate-400 mt-1">All steps checked off. Retest in 24–48 hours to verify results.</p>
            </div>
          )}

          {onDelete && (
            <div className="pt-2">
              {showDeleteConfirm ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => { onDelete(); setShowDeleteConfirm(false) }}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
                    style={{ background: 'rgba(220,38,38,0.08)', color: '#DC2626', border: '1px solid rgba(220,38,38,0.20)' }}>
                    Yes, delete
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors bg-slate-100">
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full py-2 text-xs text-slate-300 hover:text-red-400 transition-colors">
                  Delete this log entry
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

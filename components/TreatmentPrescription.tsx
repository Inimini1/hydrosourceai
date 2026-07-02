'use client'

import { useState } from 'react'

export interface PrescriptionStep {
  chemical: string
  amount: string
  how_to_apply: string
}

export interface TreatmentPrescriptionProps {
  steps: PrescriptionStep[]
  conflicts: string[]
  warnings: string[]
  poolStatus?: 'safe' | 'caution' | 'critical'
}

function parseWaitTime(text: string): { duration: string; note: string } | null {
  const t = text.toLowerCase()
  const hourRange = t.match(/(?:wait|allow|let it circulate|circulate)[^.]*?(\d+)[–\-–](\d+)\s*hours?/i)
  if (hourRange) return { duration: `${hourRange[1]}–${hourRange[2]} hours`, note: 'Pump must be running. Retest before next step.' }
  const hourSingle = t.match(/(?:wait|allow|let it circulate|circulate|for)[^.]*?(\d+)\s*hours?/i)
  if (hourSingle) { const h = parseInt(hourSingle[1]); return { duration: `${h} hour${h !== 1 ? 's' : ''}`, note: 'Pump must be running. Retest before next step.' } }
  const minMatch = t.match(/(?:wait|allow)[^.]*?(\d+)\s*minutes?/i)
  if (minMatch) return { duration: `${minMatch[1]} minutes`, note: 'Keep pump running.' }
  const dayMatch = t.match(/(?:wait|allow)[^.]*?(\d+)[–\-]?(\d+)?\s*days?/i)
  if (dayMatch) { const range = dayMatch[2] ? `${dayMatch[1]}–${dayMatch[2]}` : dayMatch[1]; return { duration: `${range} day${range === '1' ? '' : 's'}`, note: 'Do not add more chemicals until retested.' } }
  if (t.includes('before retest') || t.includes('before swimming') || t.includes('before next')) return { duration: '4–6 hours', note: 'Retest before proceeding.' }
  return null
}

type ChemType = 'acid' | 'alkali' | 'chlorine' | 'mineral' | 'other'

function classifyChemical(name: string): ChemType {
  const n = name.toLowerCase()
  if (n.includes('muriatic') || n.includes('hydrochloric') || n.includes('bisulfate') || n.includes('ph down') || n.includes('ph minus') || n.includes('dry acid') || (n.includes('acid') && !n.includes('cyanuric') && !n.includes('ascorbic'))) return 'acid'
  if (n.includes('soda ash') || n.includes('sodium carbonate') || n.includes('ph up') || n.includes('ph plus') || n.includes('sodium bicarbonate') || n.includes('baking soda') || n.includes('alkalinity')) return 'alkali'
  if (n.includes('chlor') || n.includes('hypochlor') || n.includes('cal-hypo') || n.includes('shock') || n.includes('bleach') || n.includes('trichlor') || n.includes('dichlor') || n.includes('sanitiz')) return 'chlorine'
  if (n.includes('calcium') || n.includes('cyanuric') || n.includes('stabilizer') || n.includes('conditioner') || n.includes('salt') || n.includes('algaecide') || n.includes('clarifier') || n.includes('sequestrant') || n.includes('phosphate')) return 'mineral'
  return 'other'
}

const CHEM_STYLE: Record<ChemType, {
  color: string; bg: string; border: string; badgeBg: string;
  label: string; inlineTitle: string; inlineTip: string
}> = {
  acid: {
    color: '#DC2626', bg: 'rgba(220,38,38,0.06)', border: 'rgba(220,38,38,0.18)',
    badgeBg: 'rgba(220,38,38,0.08)',
    label: 'Acid',
    inlineTitle: '⚠ Acid Safety',
    inlineTip: 'Always add acid TO water — never the reverse. Pre-dilute in a 5-gal bucket of pool water. Pour slowly around the perimeter. Never add directly to skimmer.',
  },
  alkali: {
    color: '#7C3AED', bg: 'rgba(124,58,237,0.06)', border: 'rgba(124,58,237,0.18)',
    badgeBg: 'rgba(124,58,237,0.08)',
    label: 'Alkalinity / pH Raiser',
    inlineTitle: 'Pre-dissolve Required',
    inlineTip: 'Dissolve in a bucket of pool water before adding. Pour near the return jets with the pump running at high speed. May cause temporary cloudiness — this clears within 2 hours.',
  },
  chlorine: {
    color: '#0D9488', bg: 'rgba(13,148,136,0.06)', border: 'rgba(13,148,136,0.18)',
    badgeBg: 'rgba(13,148,136,0.08)',
    label: 'Chlorine / Sanitizer',
    inlineTitle: '⏰ Add at Dusk',
    inlineTip: 'UV destroys 50%+ of chlorine in direct sunlight within hours. Always add liquid chlorine or shock in the evening. Never mix directly with acid — toxic chlorine gas releases.',
  },
  mineral: {
    color: '#D97706', bg: 'rgba(217,119,6,0.06)', border: 'rgba(217,119,6,0.18)',
    badgeBg: 'rgba(217,119,6,0.08)',
    label: 'Mineral / Stabilizer',
    inlineTitle: 'Dissolves Slowly',
    inlineTip: 'Add to skimmer sock or dissolve in a bucket. Do not retest for 5–7 days — full concentration takes time to register. Calcium chloride is exothermic — always add to water.',
  },
  other: {
    color: '#64748B', bg: 'rgba(100,116,139,0.06)', border: 'rgba(100,116,139,0.18)',
    badgeBg: 'rgba(100,116,139,0.08)',
    label: 'Chemical',
    inlineTitle: 'Application Note',
    inlineTip: 'Add with pump running. Spread evenly around pool perimeter. Wait and retest before adding additional chemicals.',
  },
}

const UNIVERSAL_SAFETY = [
  { icon: '🚫', rule: 'NEVER mix two pool chemicals together — add each separately to the pool water' },
  { icon: '⚗️', rule: 'NEVER add acid and chlorine near each other — produces toxic chlorine gas' },
  { icon: '💧', rule: 'ALWAYS add chemicals TO water, never water to chemicals (especially acids)' },
  { icon: '⚙️', rule: 'Run pump at FULL speed during all additions and for 30 min after each one' },
  { icon: '🧤', rule: 'Wear chemical-resistant gloves and safety glasses for every addition' },
  { icon: '🚿', rule: 'Rinse equipment and hands thoroughly after handling pool chemicals' },
]

export default function TreatmentPrescription({ steps, conflicts, warnings, poolStatus }: TreatmentPrescriptionProps) {
  const [checked, setChecked] = useState<Record<number, boolean>>({})
  if (steps.length === 0) return null

  const allDone = steps.every((_, i) => checked[i])
  const doneCount = steps.filter((_, i) => checked[i]).length

  const safetyItems = [...conflicts.filter(Boolean), ...warnings.filter(Boolean).slice(0, 3)]

  const statusAccent = poolStatus === 'critical' ? '#DC2626' : poolStatus === 'caution' ? '#D97706' : '#0D9488'

  return (
    <div className="overflow-hidden rounded-3xl border" style={{ borderColor: `${statusAccent}22` }}>

      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-center justify-between"
        style={{ background: `linear-gradient(135deg, ${statusAccent}08, ${statusAccent}04)`, borderBottom: `1px solid ${statusAccent}18` }}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-display font-black text-lg flex-shrink-0"
            style={{ background: `${statusAccent}12`, border: `1.5px solid ${statusAccent}30`, color: statusAccent }}>
            Rx
          </div>
          <div>
            <p className="font-display font-black text-slate-900 text-base leading-none">Treatment Prescription</p>
            <p className="text-[11px] text-slate-400 mt-0.5 uppercase tracking-wider">
              {steps.length} chemical step{steps.length !== 1 ? 's' : ''} · Must follow in order
            </p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-display font-black text-xl leading-none" style={{ color: allDone ? '#0D9488' : '#94a3b8' }}>
            {doneCount}/{steps.length}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider">done</p>
        </div>
      </div>

      {/* Warnings */}
      {safetyItems.length > 0 && (
        <div className="px-5 py-4" style={{ background: 'rgba(220,38,38,0.04)', borderBottom: '1px solid rgba(220,38,38,0.12)' }}>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(220,38,38,0.12)' }}>
              <svg className="w-3.5 h-3.5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-[11px] font-black uppercase tracking-widest text-red-600">Read Before Starting — Warnings</p>
          </div>
          <ul className="space-y-2">
            {safetyItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-600">
                <span className="flex-shrink-0 font-bold mt-0.5 text-red-500">✕</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Steps */}
      {steps.map((step, i) => {
        const type = classifyChemical(step.chemical)
        const s = CHEM_STYLE[type]
        const waitTime = parseWaitTime(step.how_to_apply)
        const isDone = !!checked[i]
        const isLast = i === steps.length - 1

        return (
          <div key={i}>
            <div className="px-5 py-5 transition-colors duration-300"
              style={{
                background: isDone ? 'rgba(13,148,136,0.03)' : '#ffffff',
                borderBottom: isLast && !waitTime ? 'none' : '1px solid rgba(0,0,0,0.05)',
              }}>

              {/* Row 1: step + chemical + done toggle */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-display font-black text-base flex-shrink-0 transition-all duration-300"
                    style={isDone
                      ? { background: 'rgba(13,148,136,0.12)', color: '#0D9488', border: '1.5px solid rgba(13,148,136,0.25)' }
                      : { background: s.bg, color: s.color, border: `1.5px solid ${s.border}` }}>
                    {isDone
                      ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      : i + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: isDone ? '#0D9488' : s.color }}>
                      Step {i + 1} · {s.label}
                    </p>
                    <p className="font-semibold text-slate-800 text-sm leading-tight truncate" style={{ opacity: isDone ? 0.5 : 1 }}>
                      {step.chemical}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setChecked((prev) => ({ ...prev, [i]: !prev[i] }))}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex-shrink-0 ml-3"
                  style={isDone
                    ? { background: 'rgba(13,148,136,0.12)', color: '#0D9488', border: '1px solid rgba(13,148,136,0.25)' }
                    : { background: '#f1f5f9', color: '#94a3b8', border: '1px solid rgba(0,0,0,0.06)' }}>
                  {isDone ? (
                    <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg> Done</>
                  ) : 'Mark done'}
                </button>
              </div>

              {/* Row 2: Amount badge + inline tip */}
              <div className="flex items-stretch gap-3 mb-4">
                <div className="rounded-2xl p-4 text-center flex-shrink-0 min-w-[110px] flex flex-col items-center justify-center"
                  style={{ background: s.badgeBg, border: `1.5px solid ${s.border}` }}>
                  <p className="font-display font-black leading-none" style={{ color: s.color, fontSize: '1.6rem' }}>{step.amount}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest mt-1.5 opacity-60" style={{ color: s.color }}>exact dose</p>
                </div>
                <div className="flex-1 rounded-2xl p-3.5 flex flex-col justify-center" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: s.color }}>{s.inlineTitle}</p>
                  <p className="text-[11px] leading-relaxed text-slate-500">{s.inlineTip}</p>
                </div>
              </div>

              {/* Row 3: How to apply */}
              <div className="rounded-2xl px-4 py-3.5 flex items-start gap-3" style={{ background: '#f8fafc', border: '1px solid rgba(0,0,0,0.06)' }}>
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-sm leading-relaxed text-slate-600">{step.how_to_apply}</p>
              </div>
            </div>

            {/* Wait time divider */}
            {!isLast && (
              <div className="flex items-center gap-0 relative" style={{ background: '#f8fafc', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <div className="flex-1 flex justify-center">
                  <div className="w-px h-full min-h-[40px]" style={{ background: 'rgba(0,0,0,0.07)' }} />
                </div>
                <div className="flex items-center gap-2.5 py-3.5 px-4 rounded-2xl mx-4 flex-shrink-0" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)' }}>
                  <svg className="w-4 h-4 flex-shrink-0 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                      {waitTime ? `Wait ${waitTime.duration}` : 'Then continue'}
                    </p>
                    <p className="text-[10px] mt-0.5 text-slate-400">
                      {waitTime ? waitTime.note : 'Retest if unsure before next step'}
                    </p>
                  </div>
                  <svg className="w-3.5 h-3.5 flex-shrink-0 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="w-px h-full min-h-[40px]" style={{ background: 'rgba(0,0,0,0.07)' }} />
                </div>
              </div>
            )}
          </div>
        )
      })}

      {/* All done */}
      {allDone && (
        <div className="px-5 py-4" style={{ background: 'rgba(13,148,136,0.06)', borderTop: '1px solid rgba(13,148,136,0.15)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(13,148,136,0.12)' }}>
              <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-teal-700">All steps completed!</p>
              <p className="text-xs mt-0.5 text-slate-400">Retest water in 4–6 hours to confirm balance</p>
            </div>
          </div>
        </div>
      )}

      {/* Safety footer */}
      <div className="px-5 pt-4 pb-5" style={{ background: '#f8fafc', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <p className="text-[10px] font-black uppercase tracking-widest mb-3 text-slate-400">Universal Chemical Safety</p>
        <ul className="space-y-2">
          {UNIVERSAL_SAFETY.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[11px] leading-relaxed text-slate-500">
              <span className="flex-shrink-0 text-sm leading-none mt-px">{item.icon}</span>
              {item.rule}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

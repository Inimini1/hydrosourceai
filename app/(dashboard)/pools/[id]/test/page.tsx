'use client'

import { useState, useEffect, useRef, FormEvent } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { haptics } from '@/lib/haptics'
import { PoolDropIcon } from '@/components/TestReminderBanner'

interface ChemicalDose { chemical: string; amount: string; how_to_apply: string }

interface Analysis {
  status: 'safe' | 'caution' | 'critical'
  health_score: number
  diagnosis: string
  confidence: 'low' | 'medium' | 'high'
  key_causes: string[]
  immediate_action_plan: string[]
  chemical_dosing_guide: ChemicalDose[]
  timeline: string
  preventative_alerts: string[]
  mistakes_to_avoid: string[]
  why_this_works: string
  safety_notes: string
}

interface TestResult {
  id: string
  status: string
  chlorine: number
  pH: number
  alkalinity: number
  calciumHardness: number | null
  cyanuricAcid: number | null
  temperature: number | null
  aiAnalysis: Analysis
}

// ── Animated health score ring ───────────────────────────────────────────────
function HealthRing({ score, color }: { score: number; color: string }) {
  const [animated, setAnimated] = useState(false)
  const [displayed, setDisplayed] = useState(0)
  const r = 54
  const c = 2 * Math.PI * r

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200)
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
    <div className="relative w-40 h-40 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="11" />
        <circle
          cx="65" cy="65" r={r}
          fill="none"
          stroke={color}
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)',
            filter: `drop-shadow(0 0 10px ${color}90)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
        <span className="font-display font-black text-4xl text-white leading-none">{displayed}</span>
        <span className="text-[11px] font-bold text-white/35 mt-0.5 tracking-wide">/ 100</span>
      </div>
    </div>
  )
}

// ── Readings ideal ranges ────────────────────────────────────────────────────
const RANGES: Record<string, { label: string; unit: string; ideal: string; min: number; max: number; critMin?: number; critMax?: number }> = {
  chlorine:        { label: 'Free Chlorine', unit: 'ppm', ideal: '1–3',      min: 1,   max: 3,   critMin: 0.5, critMax: 5 },
  pH:              { label: 'pH',            unit: '',    ideal: '7.2–7.6',   min: 7.2, max: 7.6, critMin: 7.0, critMax: 8.0 },
  alkalinity:      { label: 'Alkalinity',    unit: 'ppm', ideal: '80–120',    min: 80,  max: 120, critMin: 60,  critMax: 150 },
  calciumHardness: { label: 'Ca. Hardness',  unit: 'ppm', ideal: '200–400',   min: 200, max: 400 },
  cyanuricAcid:    { label: 'Cyanuric Acid', unit: 'ppm', ideal: '30–50',     min: 30,  max: 50 },
  temperature:     { label: 'Temperature',   unit: '°F',  ideal: '70–85',     min: 70,  max: 85 },
}

function readingStatus(key: string, val: number): 'safe' | 'caution' | 'critical' {
  const r = RANGES[key]
  if (!r) return 'safe'
  if ((r.critMin !== undefined && val < r.critMin) || (r.critMax !== undefined && val > r.critMax)) return 'critical'
  if (val < r.min || val > r.max) return 'caution'
  return 'safe'
}

const STATUS_COLORS = {
  safe:     { text: '#00C17A', bg: 'rgba(0,193,122,0.12)',  border: 'rgba(0,193,122,0.25)' },
  caution:  { text: '#FFB830', bg: 'rgba(255,184,48,0.12)', border: 'rgba(255,184,48,0.25)' },
  critical: { text: '#FF3B5C', bg: 'rgba(255,59,92,0.15)',  border: 'rgba(255,59,92,0.30)' },
}

const SCORE_COLOR = (s: number) => s >= 75 ? '#00C17A' : s >= 50 ? '#FFB830' : '#FF3B5C'

const SYMPTOM_CHIPS = [
  { label: 'Clear', emoji: '💎' },
  { label: 'Cloudy', emoji: '☁️' },
  { label: 'Green tint', emoji: '🌿' },
  { label: 'Strong smell', emoji: '💨' },
  { label: 'Eye irritation', emoji: '👁' },
  { label: 'Foaming', emoji: '🫧' },
]

// ── Slider card component ────────────────────────────────────────────────────
function ParameterSlider({
  label, unit, ideal, idealMin, idealMax,
  sliderMin, sliderMax, step, value, onChange, required,
}: {
  label: string; unit: string; ideal: string;
  idealMin: number; idealMax: number;
  sliderMin: number; sliderMax: number; step: number;
  value: string; onChange: (v: string) => void; required?: boolean;
}) {
  const hasValue = value !== ''
  const numVal = hasValue ? parseFloat(value) : (idealMin + idealMax) / 2
  const clampedVal = Math.min(Math.max(numVal, sliderMin), sliderMax)
  const pct = ((clampedVal - sliderMin) / (sliderMax - sliderMin)) * 100

  const inRange = hasValue && numVal >= idealMin && numVal <= idealMax
  const tooLow  = hasValue && numVal < idealMin
  const tooHigh = hasValue && numVal > idealMax
  const isCrit  = hasValue && (
    (numVal < idealMin * (idealMin > 10 ? 0.75 : 0.9)) ||
    (numVal > idealMax * (idealMax > 10 ? 1.5 : 1.1))
  )

  const color = !hasValue ? '#CBD5E1'
    : inRange ? '#10B981'
    : isCrit  ? '#EF4444'
    : '#F59E0B'

  const badgeLabel = !hasValue ? null
    : inRange ? '✓ Ideal'
    : tooLow  ? '↓ Low'
    : tooHigh ? '↑ High'
    : null

  return (
    <div className="card-light p-4 rounded-2xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-slate-700">{label}</p>
          {required && (
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>req</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {badgeLabel && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full transition-all"
              style={{ background: `${color}18`, color }}>
              {badgeLabel}
            </span>
          )}
          <span className="font-display font-black text-xl leading-none" style={{ color: hasValue ? color : '#CBD5E1' }}>
            {hasValue ? (step < 1 ? parseFloat(value).toFixed(1) : Math.round(parseFloat(value))) : '—'}
          </span>
          {unit && <span className="text-xs text-slate-400 -ml-0.5">{unit}</span>}
        </div>
      </div>

      {/* Custom slider track */}
      <div className="relative h-10 flex items-center select-none">
        {/* Base track */}
        <div className="absolute w-full h-2 rounded-full" style={{ background: '#E2E8F0' }} />
        {/* Ideal range band */}
        <div className="absolute h-2 rounded-full"
          style={{
            left:  `${((idealMin - sliderMin) / (sliderMax - sliderMin)) * 100}%`,
            width: `${((idealMax - idealMin) / (sliderMax - sliderMin)) * 100}%`,
            background: 'rgba(16,185,129,0.20)',
          }} />
        {/* Filled portion */}
        {hasValue && (
          <div className="absolute h-2 rounded-full transition-all duration-150"
            style={{ width: `${pct}%`, background: color }} />
        )}
        {/* Native range (invisible, handles interaction) */}
        <input
          type="range"
          min={sliderMin} max={sliderMax} step={step}
          value={hasValue ? value : String((idealMin + idealMax) / 2)}
          onChange={(e) => onChange(e.target.value)}
          className="absolute w-full h-10 opacity-0 cursor-pointer z-10"
          style={{ touchAction: 'none' }}
        />
        {/* Visual thumb */}
        <div
          className="absolute w-5 h-5 rounded-full border-2 border-white shadow-md pointer-events-none transition-all duration-150"
          style={{
            left: `calc(${hasValue ? pct : 50}% - 10px)`,
            background: hasValue ? color : '#CBD5E1',
            boxShadow: hasValue ? `0 0 0 4px ${color}22, 0 2px 4px rgba(0,0,0,0.15)` : '0 2px 4px rgba(0,0,0,0.10)',
            opacity: hasValue ? 1 : 0.5,
          }}
        />
      </div>

      <div className="flex justify-between mt-0.5">
        <span className="text-[10px] text-slate-300">{sliderMin}{unit ? ' '+unit : ''}</span>
        <span className="text-[10px] font-medium text-slate-400">Ideal: {ideal}{unit ? ' '+unit : ''}</span>
        <span className="text-[10px] text-slate-300">{sliderMax}{unit ? ' '+unit : ''}</span>
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
export default function AddTestPage() {
  const { id } = useParams<{ id: string }>()

  const [tab, setTab] = useState<'manual' | 'photo'>('manual')
  const [chlorine, setChlorine] = useState('')
  const [pH, setPH] = useState('')
  const [alkalinity, setAlkalinity] = useState('')
  const [calciumHardness, setCalciumHardness] = useState('')
  const [cyanuricAcid, setCyanuricAcid] = useState('')
  const [temperature, setTemperature] = useState('')
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [additionalNotes, setAdditionalNotes] = useState('')

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [stripBrand, setStripBrand] = useState<string>('aquachek')
  const fileRef = useRef<HTMLInputElement>(null)

  const [btnState, setBtnState] = useState<'idle' | 'loading' | 'success'>('idle')
  const [error, setError] = useState('')
  const [result, setResult] = useState<TestResult | null>(null)
  const loading = btnState === 'loading'

  const [showSendModal, setShowSendModal] = useState(false)
  const [reportEmail, setReportEmail] = useState('')
  const [sendingReport, setSendingReport] = useState(false)
  const [reportSentOk, setReportSentOk] = useState(false)
  const [reportSendError, setReportSendError] = useState('')

  function toggleSymptom(label: string) {
    haptics.light()
    setSelectedSymptoms((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    )
  }

  function handleImageSelect(file: File) {
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      const url = e.target?.result as string
      setImagePreview(url)
      setImageBase64(url.split(',')[1])
    }
    reader.readAsDataURL(file)
  }

  async function handleScanStrip() {
    if (!imageBase64) return
    setScanning(true)
    setScanResult(null)
    try {
      const res = await fetch('/api/ai/scan-strip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, brand: stripBrand }),
      })
      const data = await res.json()
      if (res.ok && data.readings) {
        const r = data.readings
        if (r.pH != null) setPH(String(r.pH))
        if (r.chlorine != null) setChlorine(String(r.chlorine))
        if (r.alkalinity != null) setAlkalinity(String(r.alkalinity))
        if (r.calciumHardness != null) setCalciumHardness(String(r.calciumHardness))
        if (r.cyanuricAcid != null) setCyanuricAcid(String(r.cyanuricAcid))
        setScanResult('✓ Readings extracted — review below then tap Analyze.')
        setTab('manual')
      } else {
        setScanResult('Could not read strip clearly. Please enter values manually.')
      }
    } catch {
      setScanResult('Scan failed. Enter values manually.')
    } finally {
      setScanning(false)
    }
  }

  async function handleSubmit(e?: FormEvent) {
    e?.preventDefault()
    setError('')
    if (!chlorine || !pH || !alkalinity) {
      haptics.error()
      setError('Chlorine, pH, and alkalinity are required.')
      return
    }
    haptics.heavy()
    setBtnState('loading')
    try {
      const symptomsStr = [
        ...(selectedSymptoms.length > 0 ? [`Visible symptoms: ${selectedSymptoms.join(', ')}`] : []),
        ...(additionalNotes.trim() ? [additionalNotes.trim()] : []),
      ].join('. ')

      const body: Record<string, unknown> = {
        poolId: id,
        chlorine: parseFloat(chlorine),
        pH: parseFloat(pH),
        alkalinity: parseFloat(alkalinity),
      }
      if (calciumHardness) body.calciumHardness = parseFloat(calciumHardness)
      if (cyanuricAcid) body.cyanuricAcid = parseFloat(cyanuricAcid)
      if (temperature) body.temperature = parseFloat(temperature)
      if (symptomsStr) body.symptoms = symptomsStr
      if (imageBase64) body.imageBase64 = imageBase64

      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        haptics.error()
        setError(data.error ?? 'Analysis failed. Please try again.')
        setBtnState('idle')
        return
      }
      haptics.success()
      setBtnState('success')
      setTimeout(() => {
        setResult(data.test)
        setBtnState('idle')
      }, 900)
    } catch {
      haptics.error()
      setError('Something went wrong. Please try again.')
      setBtnState('idle')
    }
  }

  async function handleSendReport() {
    if (!result || !reportEmail || sendingReport) return
    setSendingReport(true)
    setReportSendError('')
    try {
      const res = await fetch('/api/reports/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId: result.id, recipientEmail: reportEmail }),
      })
      const data = await res.json()
      if (!res.ok) { setReportSendError(data.error ?? 'Failed to send. Please try again.'); return }
      setReportSentOk(true)
      setTimeout(() => { setShowSendModal(false); setReportEmail(''); setReportSentOk(false) }, 2200)
    } catch {
      setReportSendError('Connection error. Please try again.')
    } finally {
      setSendingReport(false)
    }
  }

  function closeSendModal() {
    setShowSendModal(false)
    setReportEmail('')
    setReportSentOk(false)
    setReportSendError('')
  }

  // ── RESULTS SCREEN (dark treatment for dramatic analysis reveal) ─────────────
  if (result) {
    const a = result.aiAnalysis
    const score = Math.round(Math.max(0, Math.min(100, a.health_score ?? 50)))
    const scoreColor = SCORE_COLOR(score)
    const sc = STATUS_COLORS[a.status]

    const readings = [
      { key: 'chlorine', val: result.chlorine },
      { key: 'pH', val: result.pH },
      { key: 'alkalinity', val: result.alkalinity },
      ...(result.calciumHardness != null ? [{ key: 'calciumHardness', val: result.calciumHardness }] : []),
      ...(result.cyanuricAcid != null ? [{ key: 'cyanuricAcid', val: result.cyanuricAcid }] : []),
      ...(result.temperature != null ? [{ key: 'temperature', val: result.temperature }] : []),
    ]

    const hasSafetyWarning = a.safety_notes && !a.safety_notes.toLowerCase().startsWith('none')

    return (
      <div className="-mx-4 -mt-4 px-4 pt-4 pb-6 min-h-screen" style={{ background: 'linear-gradient(180deg, #0B1E2D 0%, #0B1528 100%)' }}>
        <div className="space-y-4">

          {/* Header */}
          <div className="flex items-center gap-3 animate-in pt-8">
            <button onClick={() => setResult(null)}
              className="w-9 h-9 rounded-2xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="font-display text-xl font-bold text-white">Analysis Complete</h1>
              <p className="text-xs text-white/35">HydroSource Diagnostic Report</p>
            </div>
          </div>

          {/* Safety alert */}
          {hasSafetyWarning && (
            <div className="rounded-2xl p-4 flex items-start gap-3 animate-in"
              style={{ background: 'rgba(255,59,92,0.15)', border: '1px solid rgba(255,59,92,0.35)' }}>
              <svg className="w-5 h-5 text-critical flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-bold text-critical mb-0.5">Safety Warning</p>
                <p className="text-sm text-white/70 leading-relaxed">{a.safety_notes}</p>
              </div>
            </div>
          )}

          {/* Health score hero */}
          <div className="rounded-3xl p-6 text-center animate-in-delay-1"
            style={{ background: `linear-gradient(135deg, ${scoreColor}18, ${scoreColor}06)`, border: `1px solid ${scoreColor}30` }}>
            <div className="flex items-center justify-center gap-2 mb-5">
              <PoolDropIcon
                urgency={a.status === 'safe' ? 'fresh' : a.status === 'caution' ? 'due-soon' : 'urgent'}
                color={scoreColor}
                size={28}
              />
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Pool Health Score</p>
            </div>
            <HealthRing score={score} color={scoreColor} />
            <div className="mt-5">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-3"
                style={{ background: sc.bg, border: `1px solid ${sc.border}`, color: sc.text }}>
                {a.status === 'safe' ? '✓ Water Safe' : a.status === 'caution' ? '⚡ Needs Attention' : '✗ Action Required'}
              </div>
              <p className="text-base font-semibold text-white leading-relaxed px-2">{a.diagnosis}</p>
              <p className="text-xs text-white/35 mt-2">
                AI Confidence:{' '}
                <span style={{ color: { low: '#FF3B5C', medium: '#FFB830', high: '#00C17A' }[a.confidence] }}
                  className="font-bold uppercase tracking-wide">{a.confidence}</span>
              </p>
            </div>
          </div>

          {/* Readings table */}
          <div className="rounded-3xl border border-white/10 overflow-hidden animate-in-delay-2"
            style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className="px-5 py-4 border-b border-white/8">
              <p className="text-sm font-bold text-white">💧 Your Readings</p>
            </div>
            <div className="grid grid-cols-3 px-5 py-2 border-b border-white/6">
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Parameter</span>
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest text-center">Ideal</span>
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest text-right">Result</span>
            </div>
            {readings.map(({ key, val }) => {
              const meta = RANGES[key]
              if (!meta) return null
              const st = readingStatus(key, val)
              const c = STATUS_COLORS[st]
              return (
                <div key={key} className="grid grid-cols-3 px-5 py-3.5 border-b border-white/5 last:border-0 items-center"
                  style={st !== 'safe' ? { background: `${c.bg}` } : undefined}>
                  <span className="text-sm font-medium text-white/70">{meta.label}</span>
                  <span className="text-xs text-white/35 text-center">{meta.ideal}{meta.unit ? ` ${meta.unit}` : ''}</span>
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-sm font-bold" style={{ color: st === 'safe' ? 'rgba(255,255,255,0.85)' : c.text }}>
                      {val}{meta.unit}
                    </span>
                    {st === 'safe'
                      ? <svg className="w-4 h-4 text-safe flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      : st === 'caution'
                      ? <svg className="w-4 h-4 flex-shrink-0" style={{ color: c.text }} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      : <svg className="w-4 h-4 flex-shrink-0" style={{ color: c.text }} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    }
                  </div>
                </div>
              )
            })}
          </div>

          {/* Key causes */}
          {a.key_causes.length > 0 && (
            <div className="rounded-3xl border border-white/10 p-5"
              style={{ background: 'rgba(255,255,255,0.04)', animation: 'slide-up 0.5s cubic-bezier(0.4,0,0.2,1) 0.3s both' }}>
              <p className="text-sm font-bold text-white mb-4">🔍 Why This Is Happening</p>
              <ul className="space-y-2.5">
                {a.key_causes.map((cause, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-white/65 leading-relaxed">
                    <span className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center text-[10px] font-bold"
                      style={{ background: 'rgba(0,111,255,0.2)', color: '#36aaf6' }}>{i + 1}</span>
                    {cause}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Immediate action plan */}
          {a.immediate_action_plan.length > 0 && (
            <div className="space-y-3"
              style={{ animation: 'slide-up 0.5s cubic-bezier(0.4,0,0.2,1) 0.4s both' }}>
              <p className="text-sm font-bold text-white px-1">⚡ Immediate Action Plan</p>
              {a.immediate_action_plan.map((step, i) => {
                const parts = step.replace(/^Step\s*\d+\s*[—\-:]\s*/i, '').split(/[—\-:](.+)/)
                const title = parts.length > 1 ? parts[0].trim() : `Step ${i + 1}`
                const detail = parts.length > 1 ? parts.slice(1).join(':').trim() : step.replace(/^Step\s*\d+[:\.\s]*/i, '')
                return (
                  <div key={i} className="rounded-3xl p-5 flex gap-4"
                    style={{ background: 'rgba(0,111,255,0.08)', border: '1px solid rgba(0,111,255,0.2)' }}>
                    <div className="w-9 h-9 rounded-2xl flex items-center justify-center font-display font-black text-base flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #006FFF, #00D4AA)', boxShadow: '0 0 14px rgba(0,111,255,0.4)' }}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white mb-1">{title}</p>
                      <p className="text-sm text-white/60 leading-relaxed">{detail}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Chemical dosing guide */}
          {a.chemical_dosing_guide.length > 0 && (
            <div className="space-y-3"
              style={{ animation: 'slide-up 0.5s cubic-bezier(0.4,0,0.2,1) 0.5s both' }}>
              <p className="text-sm font-bold text-white px-1">⚗️ Chemical Dosing Guide</p>
              {a.chemical_dosing_guide.map((dose, i) => (
                <div key={i} className="rounded-3xl p-5"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <p className="text-base font-bold text-white">{dose.chemical}</p>
                    <span className="text-sm font-black px-3 py-1 rounded-xl flex-shrink-0"
                      style={{ background: 'rgba(0,193,122,0.15)', color: '#00C17A', border: '1px solid rgba(0,193,122,0.25)' }}>
                      {dose.amount}
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-white/25 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-white/55 leading-relaxed">{dose.how_to_apply}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Timeline */}
          {a.timeline && (
            <div className="rounded-3xl p-5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', animation: 'slide-up 0.5s cubic-bezier(0.4,0,0.2,1) 0.55s both' }}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(0,212,170,0.15)' }}>
                  <svg className="w-4 h-4" style={{ color: '#00D4AA' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-white mb-1">⏱ What to Expect (Next 24–48 hrs)</p>
                  <p className="text-sm text-white/60 leading-relaxed">{a.timeline}</p>
                </div>
              </div>
            </div>
          )}

          {/* Preventative alerts */}
          {a.preventative_alerts.length > 0 && (
            <div className="rounded-3xl p-5"
              style={{ background: 'rgba(255,184,48,0.07)', border: '1px solid rgba(255,184,48,0.2)', animation: 'slide-up 0.5s cubic-bezier(0.4,0,0.2,1) 0.6s both' }}>
              <p className="text-sm font-bold text-white mb-4">🔮 Preventative Alerts</p>
              <ul className="space-y-2.5">
                {a.preventative_alerts.map((alert, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-white/65 leading-relaxed">
                    <svg className="w-4 h-4 text-caution flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {alert}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Mistakes to avoid */}
          {a.mistakes_to_avoid.length > 0 && (
            <div className="rounded-3xl p-5"
              style={{ background: 'rgba(255,59,92,0.07)', border: '1px solid rgba(255,59,92,0.2)', animation: 'slide-up 0.5s cubic-bezier(0.4,0,0.2,1) 0.65s both' }}>
              <p className="text-sm font-bold text-white mb-4">🚫 Mistakes to Avoid</p>
              <ul className="space-y-2.5">
                {a.mistakes_to_avoid.map((m, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-white/65 leading-relaxed">
                    <svg className="w-4 h-4 text-critical flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Why this works */}
          {a.why_this_works && (
            <div className="rounded-3xl p-5"
              style={{ background: 'rgba(0,111,255,0.07)', border: '1px solid rgba(0,111,255,0.18)', animation: 'slide-up 0.5s cubic-bezier(0.4,0,0.2,1) 0.7s both' }}>
              <p className="text-sm font-bold text-white mb-2">🧪 Why This Works</p>
              <p className="text-sm text-white/60 leading-relaxed">{a.why_this_works}</p>
            </div>
          )}

          {/* CTA buttons */}
          <div className="space-y-3 pt-2"
            style={{ animation: 'slide-up 0.5s cubic-bezier(0.4,0,0.2,1) 0.75s both' }}>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setResult(null)
                  setChlorine(''); setPH(''); setAlkalinity('')
                  setCalciumHardness(''); setCyanuricAcid(''); setTemperature('')
                  setSelectedSymptoms([]); setAdditionalNotes('')
                  setImageFile(null); setImagePreview(null); setImageBase64(null); setScanResult(null)
                  closeSendModal()
                }}
                className="flex-1 py-3.5 rounded-2xl font-semibold text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
                New Test
              </button>
              <Link href={`/pools/${id}`}
                className="flex-1 text-center py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center text-white"
                style={{ background: 'linear-gradient(135deg, #00C9B1, #00A99A)', boxShadow: '0 4px 16px rgba(0,201,177,0.35)' }}>
                Done
              </Link>
            </div>

            {/* Send Report button */}
            <button
              onClick={() => setShowSendModal(true)}
              className="w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2.5 transition-all duration-200 hover:bg-white/10"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.55)' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Send Report as PDF
            </button>
          </div>

          {/* ── SEND REPORT BOTTOM SHEET ──────────────────────────────────── */}
          {showSendModal && (
            <div className="fixed inset-0 z-50 flex items-end">
              {/* Backdrop */}
              <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={closeSendModal} />

              {/* Sheet */}
              <div
                className="relative w-full rounded-t-3xl px-5 pt-5 pb-10 space-y-4"
                style={{
                  background: 'linear-gradient(180deg, #0F1E30 0%, #091523 100%)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderBottom: 'none',
                  animation: 'slide-up 0.35s cubic-bezier(0.32, 0.72, 0, 1) both',
                }}
              >
                {/* Handle */}
                <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-1" />

                {/* Header row */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display font-bold text-white text-lg leading-none">Send Report</h3>
                    <p className="text-xs text-white/35 mt-1">PDF delivered to any email instantly</p>
                  </div>
                  <button
                    onClick={closeSendModal}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white/35 hover:text-white hover:bg-white/10 transition-all flex-shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <p className="text-sm text-white/45 leading-relaxed">
                  Your full AI diagnosis, action plan, and chemical dosing guide will be compiled into a professional PDF and sent to the email below.
                </p>

                {!reportSentOk ? (
                  <>
                    {/* Email input */}
                    <div>
                      <label className="block text-xs font-semibold text-white/40 mb-2 uppercase tracking-wider">Recipient Email</label>
                      <input
                        type="email"
                        value={reportEmail}
                        onChange={(e) => { setReportEmail(e.target.value); setReportSendError('') }}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendReport()}
                        placeholder="name@example.com"
                        autoFocus
                        className="w-full px-4 py-3.5 rounded-2xl text-sm font-medium text-white placeholder-white/20 outline-none transition-all"
                        style={{
                          background: 'rgba(255,255,255,0.07)',
                          border: `1px solid ${reportSendError ? 'rgba(255,59,92,0.5)' : 'rgba(255,255,255,0.12)'}`,
                        }}
                      />
                    </div>

                    {reportSendError && (
                      <div className="flex items-center gap-2 text-sm font-medium text-critical">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {reportSendError}
                      </div>
                    )}

                    <button
                      onClick={handleSendReport}
                      disabled={sendingReport || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reportEmail)}
                      className="w-full py-4 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-40"
                      style={{
                        background: 'linear-gradient(135deg, #006FFF, #00D4AA)',
                        boxShadow: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reportEmail) ? '0 4px 20px rgba(0,111,255,0.4)' : 'none',
                      }}
                    >
                      {sendingReport ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Generating &amp; sending…
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Send PDF Report
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  /* Success state */
                  <div className="py-5 text-center space-y-3">
                    <div
                      className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
                      style={{ background: 'rgba(0,193,122,0.15)' }}
                    >
                      <svg className="w-8 h-8 text-safe" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-white text-base">Report Sent!</p>
                      <p className="text-sm text-white/40 mt-1">
                        Check inbox for <span className="text-white/65 font-medium">{reportEmail}</span>
                      </p>
                    </div>
                  </div>
                )}

                <p className="text-[10px] text-white/20 text-center">
                  Reports include AI guidance disclaimer and are not regulatory advice.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    )
  }

  // ── INPUT SCREEN ─────────────────────────────────────────────────────────────
  return (
    <div className="pb-6">

      {/* Header */}
      <div className="px-4 pt-12 pb-5 flex items-center gap-3">
        <Link href={`/pools/${id}`}
          className="w-9 h-9 rounded-2xl flex items-center justify-center bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors flex-shrink-0">
          <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="font-display font-bold text-slate-900 text-xl">Water Test</h1>
          <p className="text-xs font-semibold mt-0.5" style={{ color: '#00C9B1' }}>AI-powered analysis</p>
        </div>
      </div>

      <div className="px-4 space-y-4">

        {/* Tab selector */}
        <div className="card-light p-1 flex gap-1">
          {[
            { key: 'manual', label: 'Enter Readings', icon: '📝' },
            { key: 'photo',  label: 'Scan Test Strip', icon: '📸' },
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key as 'manual' | 'photo')}
              className="flex-1 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200"
              style={tab === t.key
                ? { background: '#00C9B1', color: 'white', boxShadow: '0 2px 8px rgba(0,201,177,0.28)' }
                : { color: '#94A3B8' }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Error / scan result banners */}
        {error && (
          <div className="p-4 rounded-2xl text-sm font-medium"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}>
            {error}
          </div>
        )}
        {scanResult && (
          <div className="p-4 rounded-2xl text-sm font-medium flex items-center gap-3"
            style={scanResult.includes('✓')
              ? { background: 'rgba(0,201,177,0.08)', border: '1px solid rgba(0,201,177,0.2)', color: '#00C9B1' }
              : { background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#F59E0B' }}>
            <PoolDropIcon
              urgency={scanResult.includes('✓') ? 'fresh' : 'due-soon'}
              color={scanResult.includes('✓') ? '#00C9B1' : '#F59E0B'}
              size={28}
            />
            <span>{scanResult.replace('✓ ', '')}</span>
          </div>
        )}

        {/* ── PHOTO TAB ── */}
        {tab === 'photo' && (
          <div className="space-y-4">

            {/* Brand selector — calibrates color reading per brand */}
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">What brand are your test strips?</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'aquachek', label: 'AquaChek', sub: 'Most common US brand' },
                  { key: 'lamottes', label: 'LaMotte', sub: 'Professional grade' },
                  { key: 'hth',      label: 'HTH',      sub: 'Retail / budget' },
                  { key: 'generic',  label: 'Other / Unknown', sub: 'Generic calibration' },
                ].map((b) => (
                  <button
                    key={b.key}
                    type="button"
                    onClick={() => setStripBrand(b.key)}
                    className="rounded-2xl px-3 py-2.5 text-left transition-all duration-200"
                    style={stripBrand === b.key
                      ? { background: 'rgba(0,201,177,0.1)', border: '1.5px solid #00C9B1' }
                      : { background: 'rgba(241,245,249,0.8)', border: '1.5px solid transparent' }}
                  >
                    <p className="text-xs font-semibold text-slate-700">{b.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{b.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleImageSelect(f) }}
              className="card-light rounded-3xl p-8 text-center cursor-pointer border-2 border-dashed border-slate-200 hover:border-teal-300 transition-all duration-200"
            >
              {imagePreview ? (
                <div className="space-y-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Test strip" className="max-h-48 mx-auto rounded-2xl object-contain" />
                  <p className="text-slate-400 text-sm">{imageFile?.name}</p>
                  <button onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); setImageBase64(null); setScanResult(null) }}
                    className="text-xs font-semibold text-red-400">
                    Remove photo
                  </button>
                </div>
              ) : (
                <div>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(0,201,177,0.10)' }}>
                    <svg className="w-8 h-8" style={{ color: '#00C9B1' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-slate-600 mb-1.5">Tap to upload your test strip photo</p>
                  <p className="text-xs text-slate-400">JPG, PNG — hold strip under good lighting for best results</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageSelect(f) }} />

            {imagePreview && (
              <button onClick={handleScanStrip} disabled={scanning}
                className="btn-teal w-full py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2.5 disabled:opacity-50">
                {scanning ? (
                  <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Reading strip with AI…</>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Scan Test Strip Values
                  </>
                )}
              </button>
            )}
            <p className="text-center text-slate-400 text-xs">AI extracts readings automatically — review them before analyzing</p>
          </div>
        )}

        {/* ── MANUAL TAB ── */}
        {tab === 'manual' && (
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Core chemistry sliders */}
            <div>
              <div className="flex items-center justify-between mb-2.5 px-0.5">
                <p className="text-sm font-bold text-slate-800">Core Chemistry</p>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg"
                  style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444' }}>Required</span>
              </div>
              <div className="space-y-3">
                <ParameterSlider
                  label="Free Chlorine" unit="ppm" ideal="1–3"
                  idealMin={1} idealMax={3} sliderMin={0} sliderMax={10} step={0.1}
                  value={chlorine} onChange={setChlorine} required
                />
                <ParameterSlider
                  label="pH Level" unit="" ideal="7.2–7.6"
                  idealMin={7.2} idealMax={7.6} sliderMin={6} sliderMax={9} step={0.1}
                  value={pH} onChange={setPH} required
                />
                <ParameterSlider
                  label="Total Alkalinity" unit="ppm" ideal="80–120"
                  idealMin={80} idealMax={120} sliderMin={0} sliderMax={300} step={1}
                  value={alkalinity} onChange={setAlkalinity} required
                />
              </div>
            </div>

            {/* Advanced chemistry sliders */}
            <div>
              <div className="mb-2.5 px-0.5">
                <p className="text-sm font-bold text-slate-800">Advanced Chemistry</p>
                <p className="text-xs text-slate-400 mt-0.5">Optional — improves analysis precision</p>
              </div>
              <div className="space-y-3">
                <ParameterSlider
                  label="Calcium Hardness" unit="ppm" ideal="200–400"
                  idealMin={200} idealMax={400} sliderMin={0} sliderMax={800} step={5}
                  value={calciumHardness} onChange={setCalciumHardness}
                />
                <ParameterSlider
                  label="Cyanuric Acid" unit="ppm" ideal="30–50"
                  idealMin={30} idealMax={50} sliderMin={0} sliderMax={200} step={1}
                  value={cyanuricAcid} onChange={setCyanuricAcid}
                />
                <ParameterSlider
                  label="Water Temperature" unit="°F" ideal="70–85"
                  idealMin={70} idealMax={85} sliderMin={40} sliderMax={104} step={1}
                  value={temperature} onChange={setTemperature}
                />
              </div>
            </div>

            {/* Symptom chips */}
            <div className="card-light p-4 rounded-2xl">
              <div className="mb-3">
                <p className="text-sm font-bold text-slate-800">Water Appearance</p>
                <p className="text-xs text-slate-400 mt-0.5">Tap all that apply</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {SYMPTOM_CHIPS.map((chip) => {
                  const active = selectedSymptoms.includes(chip.label)
                  return (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => toggleSymptom(chip.label)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold transition-all duration-150"
                      style={active
                        ? { background: '#00C9B1', color: 'white', boxShadow: '0 2px 8px rgba(0,201,177,0.25)' }
                        : { background: '#F1F5F9', color: '#64748B' }}>
                      <span>{chip.emoji}</span>
                      {chip.label}
                    </button>
                  )
                })}
              </div>
              <div className="mt-3">
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Additional notes (e.g. walls feel slimy, water turned green after rain…)"
                  rows={2}
                  className="input-light resize-none w-full text-sm"
                />
              </div>
            </div>

            {/* Attached photo indicator */}
            {imagePreview && (
              <div className="card-light rounded-2xl p-3 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Strip" className="w-12 h-12 rounded-xl object-cover" />
                <div>
                  <p className="text-sm font-semibold text-slate-700">Test strip photo attached</p>
                  <p className="text-xs text-slate-400">AI will use this image in the analysis</p>
                </div>
              </div>
            )}

            {/* Morphing analyze button */}
            <div className="flex justify-center">
              <AnimatePresence mode="wait" initial={false}>
                {btnState === 'success' ? (
                  <motion.div
                    key="success"
                    className="relative flex items-center justify-center"
                    style={{ width: 64, height: 64 }}
                  >
                    {/* Spring-expanding ring */}
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ background: 'rgba(0,193,122,0.35)' }}
                      initial={{ scale: 1, opacity: 0.7 }}
                      animate={{ scale: 3.5, opacity: 0 }}
                      transition={{ duration: 0.65, ease: 'easeOut' }}
                    />
                    {/* Second ring pulse */}
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ background: 'rgba(0,193,122,0.2)' }}
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 2.2, opacity: 0 }}
                      transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
                    />
                    {/* Checkmark circle */}
                    <motion.div
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ background: '#00C17A', boxShadow: '0 0 24px rgba(0,193,122,0.5)' }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 520, damping: 26 }}
                    >
                      <motion.svg
                        className="w-7 h-7"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.18 }}
                      >
                        <motion.path
                          d="M5 13l4 4L19 7"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.38, delay: 0.18, ease: 'easeOut' }}
                        />
                      </motion.svg>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.button
                    key="btn"
                    type="submit"
                    disabled={btnState === 'loading'}
                    className="btn-teal w-full py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {btnState === 'loading' ? (
                        <motion.span key="loading" className="flex items-center gap-2.5"
                          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.18 }}>
                          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Analyzing your water…
                        </motion.span>
                      ) : (
                        <motion.span key="idle" className="flex items-center gap-2.5"
                          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.18 }}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          Analyze My Water
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

          </form>
        )}

      </div>
    </div>
  )
}

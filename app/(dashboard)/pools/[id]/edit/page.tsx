'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

const CHLORINE_TYPES = [
  { value: 'CHLORINE',  label: 'Chlorine',   desc: 'Traditional tablets or liquid', emoji: '🧪' },
  { value: 'SALT',      label: 'Salt Water',  desc: 'Electrolytic chlorine generator', emoji: '🌊' },
  { value: 'BROMINE',   label: 'Bromine',     desc: 'Common in spas and hot tubs', emoji: '⚗️' },
  { value: 'BIGUANIDE', label: 'Biguanide',   desc: 'Chlorine-free (Baquacil)', emoji: '🟢' },
]

const GALLON_PRESETS = [
  { label: '5,000', value: 5000 },
  { label: '10,000', value: 10000 },
  { label: '15,000', value: 15000 },
  { label: '20,000', value: 20000 },
  { label: '25,000', value: 25000 },
]

export default function EditPoolPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [poolName, setPoolName] = useState('')
  const [gallons, setGallons] = useState('')
  const [chlorineType, setChlorineType] = useState('CHLORINE')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/pools/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.pool) {
          setPoolName(d.pool.poolName)
          setGallons(String(d.pool.gallons))
          setChlorineType(d.pool.chlorineType)
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setError('')
    const gal = parseInt(gallons)
    if (!poolName.trim()) { setError('Pool name is required.'); return }
    if (isNaN(gal) || gal < 100 || gal > 5_000_000) {
      setError('Enter a valid pool size between 100 and 5,000,000 gallons.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/pools/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poolName: poolName.trim(), gallons: gal, chlorineType }),
      })
      if (res.ok) {
        router.push(`/pools/${id}`)
      } else {
        const d = await res.json()
        setError(d.error ?? 'Failed to save changes.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="px-4 pt-12 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-3xl h-24 animate-pulse border border-slate-100" />
        ))}
      </div>
    )
  }

  return (
    <div className="pb-6 animate-in">
      {/* Header */}
      <div className="px-4 pt-12 pb-5 flex items-center gap-3">
        <Link href={`/pools/${id}`}
          className="w-9 h-9 rounded-2xl flex items-center justify-center bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors flex-shrink-0">
          <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="font-display font-bold text-slate-900 text-xl">Edit Pool</h1>
          <p className="text-xs text-slate-400 mt-0.5">Changes affect all future AI analysis</p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {error && (
          <div className="p-4 rounded-2xl text-sm font-medium"
            style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', color: '#EF4444' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">

          {/* Pool name */}
          <div className="card-light p-5 rounded-3xl">
            <label className="block text-sm font-semibold text-slate-600 mb-2">Pool name</label>
            <input
              type="text"
              required
              value={poolName}
              onChange={(e) => setPoolName(e.target.value)}
              placeholder="e.g. Backyard Pool"
              maxLength={60}
              className="input-light"
            />
          </div>

          {/* Pool size */}
          <div className="card-light p-5 rounded-3xl">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-slate-600">Pool size</label>
              <span className="text-xs text-slate-400">Used for precise dosing</span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="number"
                required
                min="100"
                max="5000000"
                step="500"
                value={gallons}
                onChange={(e) => setGallons(e.target.value)}
                placeholder="e.g. 15000"
                className="input-light flex-1"
              />
              <span className="text-sm font-medium text-slate-400 flex-shrink-0">gal</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {GALLON_PRESETS.map((p) => {
                const active = parseInt(gallons) === p.value
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setGallons(String(p.value))}
                    className="text-xs px-3 py-1.5 rounded-xl font-semibold transition-all duration-150"
                    style={active
                      ? { background: '#00C9B1', color: 'white' }
                      : { background: '#F1F5F9', color: '#64748B' }}>
                    {p.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Sanitizer type */}
          <div className="card-light p-5 rounded-3xl">
            <label className="block text-sm font-semibold text-slate-600 mb-3">Sanitizer type</label>
            <div className="space-y-2">
              {CHLORINE_TYPES.map((t) => {
                const active = chlorineType === t.value
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setChlorineType(t.value)}
                    className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all duration-150 border"
                    style={active
                      ? { background: 'rgba(0,201,177,0.08)', borderColor: '#00C9B1' }
                      : { background: '#F8FAFC', borderColor: '#E2E8F0' }}>
                    <span className="text-xl">{t.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800">{t.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{t.desc}</p>
                    </div>
                    <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={active
                        ? { borderColor: '#00C9B1', background: '#00C9B1' }
                        : { borderColor: '#CBD5E1' }}>
                      {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-teal w-full py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving…</>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save changes
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  )
}

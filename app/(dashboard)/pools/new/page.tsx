'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePageTitle } from '@/lib/usePageTitle'
import { useToast } from '@/components/Toaster'

const GALLON_PRESETS = [
  { label: '5,000', value: 5000 },
  { label: '10,000', value: 10000 },
  { label: '15,000', value: 15000 },
  { label: '20,000', value: 20000 },
  { label: '25,000', value: 25000 },
]

export default function NewPoolPage() {
  usePageTitle('Add Pool')
  const router = useRouter()
  const { success, error: toastError } = useToast()
  const [poolName, setPoolName] = useState('')
  const [gallons, setGallons] = useState('')
  const [chlorineType, setChlorineType] = useState('CHLORINE')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const g = parseInt(gallons)
    if (!poolName.trim()) {
      setError('Please give your pool a name so you can identify it later.')
      return
    }
    if (!g || g < 1000 || g > 200000) {
      setError('Pool size must be between 1,000 and 200,000 gallons. Enter the approximate water volume.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/pools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poolName, gallons: g, chlorineType }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 403) {
          setError(data.error ?? 'You have reached your pool limit. Upgrade your plan to add more pools.')
        } else {
          setError(data.error ?? 'Could not create pool. Check your details and try again.')
        }
        return
      }
      success(`${poolName} added successfully!`)
      router.push(`/pools/${data.pool.id}`)
    } catch {
      toastError('No internet connection. Check your network and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pb-6 animate-in">
      {/* Header */}
      <div className="px-4 pt-12 pb-5 flex items-center gap-3">
        <Link href="/pools"
          className="w-9 h-9 rounded-2xl flex items-center justify-center bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors flex-shrink-0">
          <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="font-display font-bold text-slate-900 text-xl">Add Pool</h1>
          <p className="text-xs text-slate-400 mt-0.5">Tell us about your pool for accurate dosing</p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {error && (
          <div className="p-4 rounded-2xl text-sm font-medium"
            style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', color: '#EF4444' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pool name */}
          <div className="card-light p-5 rounded-3xl">
            <label className="block text-sm font-semibold text-slate-600 mb-2">Pool name</label>
            <input
              required
              value={poolName}
              onChange={(e) => setPoolName(e.target.value)}
              placeholder="e.g. Backyard Pool"
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
                required
                type="number"
                value={gallons}
                onChange={(e) => setGallons(e.target.value)}
                placeholder="e.g. 15000"
                min={1000}
                max={200000}
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
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 'CHLORINE', label: 'Chlorine', emoji: '🧪' },
                { val: 'SALT',     label: 'Salt',     emoji: '🌊' },
                { val: 'BROMINE',  label: 'Bromine',  emoji: '⚗️' },
              ].map((opt) => {
                const active = chlorineType === opt.val
                return (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setChlorineType(opt.val)}
                    className="py-3 rounded-2xl text-sm font-semibold border transition-all duration-200"
                    style={active
                      ? { background: '#00C9B1', color: 'white', borderColor: '#00C9B1', boxShadow: '0 2px 8px rgba(0,201,177,0.25)' }
                      : { background: '#F8FAFC', color: '#64748B', borderColor: '#E2E8F0' }}>
                    <span className="block text-lg mb-0.5">{opt.emoji}</span>
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-teal w-full py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Creating pool…</>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Create Pool
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

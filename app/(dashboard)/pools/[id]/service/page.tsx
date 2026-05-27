'use client'

import { useState, FormEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

const SERVICE_CHIPS = [
  'Skimmed surface', 'Brushed walls', 'Vacuumed floor',
  'Cleaned filter', 'Backwashed filter', 'Emptied baskets',
  'Checked equipment', 'Adjusted chemistry',
]

export default function LogServicePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [selectedChips, setSelectedChips] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [chemicalsAdded, setChemicalsAdded] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function toggleChip(label: string) {
    setSelectedChips((prev) =>
      prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label]
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const combinedNotes = [
      ...(selectedChips.length > 0 ? [selectedChips.join(', ')] : []),
      ...(notes.trim() ? [notes.trim()] : []),
    ].join('. ')

    if (!combinedNotes) {
      setError('Please add at least one service note.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/service-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poolId: id,
          notes: combinedNotes,
          chemicalsAdded: chemicalsAdded || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to save log'); return }
      router.push(`/pools/${id}`)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
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
          <h1 className="font-display font-bold text-slate-900 text-xl">Log Service</h1>
          <p className="text-xs text-slate-400 mt-0.5">Record what was done today</p>
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

          {/* Quick chips */}
          <div className="card-light p-5 rounded-3xl">
            <p className="text-sm font-semibold text-slate-700 mb-1">What did you do?</p>
            <p className="text-xs text-slate-400 mb-3">Tap all that apply</p>
            <div className="flex flex-wrap gap-2">
              {SERVICE_CHIPS.map((chip) => {
                const active = selectedChips.includes(chip)
                return (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => toggleChip(chip)}
                    className="px-3 py-2 rounded-2xl text-xs font-semibold transition-all duration-150"
                    style={active
                      ? { background: '#00C9B1', color: 'white', boxShadow: '0 2px 8px rgba(0,201,177,0.25)' }
                      : { background: '#F1F5F9', color: '#64748B' }}>
                    {chip}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Additional notes */}
          <div className="card-light p-5 rounded-3xl">
            <label className="block text-sm font-semibold text-slate-600 mb-2">Additional notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Describe anything else — unusual readings, equipment issues, water appearance…"
              className="input-light resize-none w-full"
            />
          </div>

          {/* Chemicals added */}
          <div className="card-light p-5 rounded-3xl">
            <label className="block text-sm font-semibold text-slate-600 mb-1">
              Chemicals added
              <span className="text-slate-400 font-normal ml-1">(optional)</span>
            </label>
            <p className="text-xs text-slate-400 mb-2">Products, amounts, and reason</p>
            <input
              value={chemicalsAdded}
              onChange={(e) => setChemicalsAdded(e.target.value)}
              placeholder="e.g. 2 lbs Cal-Hypo shock, 1 qt pH down"
              className="input-light"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-teal w-full py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving…</>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Service Log
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  )
}

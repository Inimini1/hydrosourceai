'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'

const FOUNDER_EMAIL = 'to.iniyan@gmail.com'

type FeedbackStatus = 'new' | 'reviewed' | 'actioned' | 'closed'
type Category = 'bug' | 'feature' | 'ux' | 'pricing' | 'general'

interface FeedbackItem {
  id: string
  user_email: string | null
  message: string
  category: Category
  page_url: string | null
  status: FeedbackStatus
  founder_note: string | null
  created_at: string
}

const STATUS_BG: Record<FeedbackStatus, string> = {
  new:      'rgba(59,130,246,0.10)',
  reviewed: 'rgba(234,179,8,0.10)',
  actioned: 'rgba(0,201,177,0.10)',
  closed:   'rgba(0,0,0,0.06)',
}
const STATUS_TEXT: Record<FeedbackStatus, string> = {
  new: '#2563EB', reviewed: '#B45309', actioned: '#00A99A', closed: '#64748b',
}
const CAT_EMOJI: Record<Category, string> = {
  bug: '🐛', feature: '💡', ux: '🤔', pricing: '💰', general: '💬',
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function FounderFeedbackPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [items, setItems]             = useState<FeedbackItem[]>([])
  const [filter, setFilter]           = useState<FeedbackStatus | 'all'>('all')
  const [fetching, setFetching]       = useState(true)
  const [expanded, setExpanded]       = useState<string | null>(null)
  const [note, setNote]               = useState('')
  const [saving, setSaving]           = useState(false)

  const fetchFeedback = useCallback(async () => {
    setFetching(true)
    const qs = filter !== 'all' ? `?status=${filter}` : ''
    const res = await fetch(`/api/feedback${qs}`)
    if (res.ok) {
      const data = await res.json()
      setItems(data.feedback ?? [])
    }
    setFetching(false)
  }, [filter])

  useEffect(() => {
    if (!authLoading && user?.email !== FOUNDER_EMAIL) {
      router.replace('/')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user?.email === FOUNDER_EMAIL) fetchFeedback()
  }, [user, fetchFeedback])

  async function updateStatus(id: string, status: FeedbackStatus) {
    setSaving(true)
    await fetch('/api/feedback', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, status } : i))
    setSaving(false)
  }

  async function saveNote(id: string) {
    setSaving(true)
    await fetch('/api/feedback', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, founderNote: note }),
    })
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, founder_note: note } : i))
    setSaving(false)
  }

  if (authLoading || user?.email !== FOUNDER_EMAIL) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">Loading…</div>
  }

  const counts = items.reduce((acc, i) => { acc[i.status] = (acc[i.status] ?? 0) + 1; return acc }, {} as Record<string, number>)

  return (
    <div className="min-h-screen px-4 py-8 max-w-2xl mx-auto bg-slate-50">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Founder Inbox</h1>
        <p className="text-sm text-slate-500">
          HydroSource user feedback — {items.length} total
        </p>
        {/* Stats row */}
        <div className="flex gap-3 mt-4 flex-wrap">
          {(['new','reviewed','actioned','closed'] as FeedbackStatus[]).map((s) => (
            <div key={s} className="px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{ background: STATUS_BG[s], color: STATUS_TEXT[s] }}>
              {counts[s] ?? 0} {s}
            </div>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['all','new','reviewed','actioned','closed'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-full text-xs font-semibold transition-all"
            style={{
              background: filter === f ? '#00C9B1' : 'rgba(0,0,0,0.06)',
              color: filter === f ? 'white' : '#64748b',
            }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <button onClick={fetchFeedback}
          className="ml-auto px-4 py-2 rounded-full text-xs font-semibold text-slate-500"
          style={{ background: 'rgba(0,0,0,0.06)' }}>
          {fetching ? 'Loading…' : '↻ Refresh'}
        </button>
      </div>

      {/* Items */}
      {fetching ? (
        <div className="text-center py-16 text-sm text-slate-400">Loading feedback…</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-sm text-slate-400">No feedback yet. Share the app and it will start flowing in.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.id}
              className="rounded-2xl p-4 cursor-pointer transition-all bg-white"
              style={{
                border: `1px solid ${expanded === item.id ? 'rgba(0,201,177,0.30)' : 'rgba(0,0,0,0.07)'}`,
                boxShadow: expanded === item.id ? '0 2px 12px rgba(0,201,177,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
              }}
              onClick={() => {
                setExpanded(expanded === item.id ? null : item.id)
                setNote(item.founder_note ?? '')
              }}
            >
              {/* Row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-base">{CAT_EMOJI[item.category]}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: STATUS_BG[item.status], color: STATUS_TEXT[item.status] }}>
                      {item.status}
                    </span>
                    <span className="text-xs text-slate-400">{timeAgo(item.created_at)}</span>
                    {item.user_email && (
                      <span className="text-xs text-slate-400">{item.user_email}</span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed text-slate-700"
                    style={{ display: '-webkit-box', WebkitLineClamp: expanded === item.id ? 'unset' : 2, WebkitBoxOrient: 'vertical', overflow: expanded === item.id ? 'visible' : 'hidden' }}>
                    {item.message}
                  </p>
                </div>
                <svg className="w-4 h-4 flex-shrink-0 mt-1 transition-transform text-slate-400"
                  style={{ transform: expanded === item.id ? 'rotate(180deg)' : 'none' }}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Expanded actions */}
              {expanded === item.id && (
                <div className="mt-4 pt-4 border-t border-slate-100"
                  onClick={(e) => e.stopPropagation()}>

                  {item.page_url && (
                    <p className="text-xs mb-3 text-slate-400">Page: {item.page_url}</p>
                  )}

                  {/* Status buttons */}
                  <div className="flex gap-2 flex-wrap mb-4">
                    {(['new','reviewed','actioned','closed'] as FeedbackStatus[]).map((s) => (
                      <button key={s} onClick={() => updateStatus(item.id, s)} disabled={saving}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                        style={{
                          background: item.status === s ? STATUS_BG[s] : 'rgba(0,0,0,0.04)',
                          color: item.status === s ? STATUS_TEXT[s] : '#64748b',
                          border: `1px solid ${item.status === s ? 'rgba(0,0,0,0.10)' : 'transparent'}`,
                        }}>
                        {s}
                      </button>
                    ))}
                  </div>

                  {/* Founder note */}
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    placeholder="Add a private note for yourself…"
                    className="w-full px-3 py-2 rounded-xl text-xs text-slate-700 resize-none focus:outline-none mb-2 bg-slate-50"
                    style={{ border: '1px solid rgba(0,0,0,0.10)' }}
                  />
                  <button onClick={() => saveNote(item.id)} disabled={saving}
                    className="px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-50"
                    style={{ background: 'rgba(0,201,177,0.10)', color: '#00A99A' }}>
                    {saving ? 'Saving…' : 'Save note'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

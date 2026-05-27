'use client'

import { useState } from 'react'
import { useAuth } from './AuthProvider'

type Category = 'bug' | 'feature' | 'ux' | 'pricing' | 'general'

const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: 'bug',     label: 'Bug',         emoji: '🐛' },
  { value: 'feature', label: 'Feature idea', emoji: '💡' },
  { value: 'ux',      label: 'Confusing UX', emoji: '🤔' },
  { value: 'pricing', label: 'Pricing',      emoji: '💰' },
  { value: 'general', label: 'General',      emoji: '💬' },
]

export function BetaFeedback() {
  const { user } = useAuth()
  const [open, setOpen]         = useState(false)
  const [message, setMessage]   = useState('')
  const [category, setCategory] = useState<Category>('general')
  const [sent, setSent]         = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  function resetAndOpen() {
    setOpen(true)
    setSent(false)
    setMessage('')
    setCategory('general')
    setError(null)
  }

  async function send() {
    if (!message.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          category,
          pageUrl: typeof window !== 'undefined' ? window.location.pathname : null,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Something went wrong.')
      }
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send feedback. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating button — sits above BottomNav */}
      <button
        onClick={resetAndOpen}
        className="fixed right-4 z-30 flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          bottom: '80px',
          background: 'linear-gradient(135deg, #00C9B1, #00A99A)',
          color: 'white',
          boxShadow: '0 4px 20px rgba(0,201,177,0.4)',
        }}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        Feedback
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-6"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-6"
            style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {!sent ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-white text-base">Share Feedback</h3>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {user?.email ? `Logged in as ${user.email}` : 'We read every message'}
                    </p>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Category chips */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setCategory(c.value)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                      style={{
                        background: category === c.value ? 'rgba(0,201,177,0.2)' : 'rgba(255,255,255,0.07)',
                        border: `1.5px solid ${category === c.value ? '#00C9B1' : 'rgba(255,255,255,0.1)'}`,
                        color: category === c.value ? '#00C9B1' : 'rgba(255,255,255,0.6)',
                      }}
                    >
                      {c.emoji} {c.label}
                    </button>
                  ))}
                </div>

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder="What's working well? What's confusing? What feature would make this 10× better? We read every message."
                  className="w-full px-4 py-3 rounded-2xl text-sm text-white resize-none focus:outline-none mb-3"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1.5px solid rgba(255,255,255,0.12)',
                    caretColor: '#00C9B1',
                  }}
                  autoFocus
                />

                {error && (
                  <p className="text-xs mb-3 px-1" style={{ color: '#EF4444' }}>{error}</p>
                )}

                <button
                  onClick={send}
                  disabled={!message.trim() || loading}
                  className="w-full py-3.5 rounded-2xl font-semibold text-sm text-white disabled:opacity-50 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #00C9B1, #00A99A)' }}
                >
                  {loading ? 'Sending…' : 'Send Feedback'}
                </button>
              </>
            ) : (
              <div className="text-center py-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(0,201,177,0.15)' }}
                >
                  <svg className="w-7 h-7" fill="none" stroke="#00C9B1" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-white text-base mb-2">Thank you!</h3>
                <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Your feedback goes straight to the founder. We&apos;ll use it to make HydroSource better.
                </p>
                <button
                  onClick={() => setOpen(false)}
                  className="w-full py-3 rounded-2xl font-semibold text-sm text-white"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

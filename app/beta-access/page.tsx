'use client'

import { useState, FormEvent } from 'react'
import { PoolLensIcon } from '@/components/brand'

export default function BetaAccessPage() {
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!name.trim() || !email.trim()) {
      setError('Please fill in all required fields.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.')
      return
    }
    if (!agreed) {
      setError('You must agree to the confidentiality terms before submitting.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/beta/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), company: company.trim() || undefined, email: email.trim().toLowerCase() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }
      setDone(true)
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center"
            style={{ background: 'rgba(0,201,177,0.10)', border: '1px solid rgba(0,201,177,0.25)' }}>
            <svg className="w-10 h-10" style={{ color: '#00A99A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="font-display text-3xl font-bold text-slate-900 mb-3">Check your email</h2>
          <p className="text-slate-500 leading-relaxed mb-2">
            We&apos;ve sent a private signup link to <span className="text-slate-900 font-semibold">{email}</span>.
          </p>
          <p className="text-slate-400 text-sm leading-relaxed">
            Your 7-day beta access starts the moment you create your account. The link expires in 7 days — please use it promptly.
          </p>
          <div className="mt-6 rounded-2xl p-4 text-sm text-left"
            style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
            <p className="font-semibold mb-1 text-red-600">🔒 Reminder</p>
            <p className="text-slate-500 leading-relaxed text-xs">Keep your signup link and this domain confidential. Do not forward or share with anyone outside your organization.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="max-w-md w-full">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2.5 mb-6">
            <PoolLensIcon size={40} variant="light" />
            <span className="font-display font-bold text-slate-900 text-xl tracking-tight">HydroSource</span>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 mb-4 text-xs font-bold tracking-wider"
            style={{ background: 'rgba(0,201,177,0.08)', border: '1px solid rgba(0,201,177,0.25)', color: '#00A99A' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            PRIVATE BETA
          </div>
          <h1 className="font-display text-3xl font-bold text-slate-900 mb-3">Request Beta Access</h1>
          <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
            This form is for invited testers only. Complete all three fields to receive your personal access link.
          </p>
        </div>

        {/* Confidentiality notice */}
        <div className="rounded-2xl p-4 mb-6 text-sm"
          style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
          <p className="font-semibold mb-1 text-red-600">🔒 Confidential Access</p>
          <p className="text-slate-500 text-xs leading-relaxed">
            This URL and all access credentials are strictly confidential. Sharing this domain, link, or any access with parties outside your organization is prohibited and may result in immediate revocation and legal action.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Q1: Full Name */}
          <div>
            <label className="block text-slate-700 text-sm font-semibold mb-2">
              1. Full Name <span style={{ color: '#00A99A' }}>*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              autoComplete="name"
              required
              className="input-light"
            />
          </div>

          {/* Q2: Company / Org */}
          <div>
            <label className="block text-slate-700 text-sm font-semibold mb-2">
              2. Company or Organization <span className="text-slate-400 font-normal text-xs">(type &quot;Individual&quot; if none)</span>
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Acme Pool Services or Individual"
              autoComplete="organization"
              className="input-light"
            />
          </div>

          {/* Q3: Email */}
          <div>
            <label className="block text-slate-700 text-sm font-semibold mb-2">
              3. Email Address <span style={{ color: '#00A99A' }}>*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@yourcompany.com"
              autoComplete="email"
              required
              className="input-light"
            />
            <p className="text-slate-400 text-xs mt-1.5 ml-1">Your unique access link will be sent here.</p>
          </div>

          {/* NDA Checkbox */}
          <div className="rounded-2xl p-4 bg-white" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
            <label className="flex items-start gap-3 cursor-pointer">
              <button
                type="button"
                onClick={() => setAgreed(!agreed)}
                className="flex-shrink-0 mt-0.5 w-5 h-5 rounded flex items-center justify-center transition-all duration-200"
                style={{
                  background: agreed ? '#00C9B1' : 'transparent',
                  border: `2px solid ${agreed ? '#00C9B1' : 'rgba(0,0,0,0.25)'}`,
                }}
              >
                {agreed && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <span className="text-slate-600 text-xs leading-relaxed">
                I understand that this application and the HydroSource beta domain are <span className="text-slate-800 font-semibold">strictly confidential</span>. I will not share this URL, my access link, or any account credentials with anyone outside my organization. I understand that doing so may result in immediate revocation of access without notice.
              </span>
            </label>
          </div>

          {error && (
            <div className="rounded-2xl px-4 py-3 text-sm font-medium"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)', color: '#DC2626' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !name.trim() || !email.trim() || !agreed}
            className="w-full py-4 rounded-2xl font-bold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed text-white"
            style={{ background: 'linear-gradient(135deg,#00C9B1,#006FFF)' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Sending access link…
              </span>
            ) : 'Request Beta Access →'}
          </button>

        </form>

        <p className="text-center text-slate-400 text-xs mt-6">
          Already have an account? <a href="/login" className="text-slate-600 hover:text-slate-900 underline transition-colors">Sign in</a>
        </p>

      </div>
    </div>
  )
}

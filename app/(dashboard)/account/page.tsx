'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useAuth } from '@/components/AuthProvider'
import Link from 'next/link'
import { usePageTitle } from '@/lib/usePageTitle'
import { createClient } from '@/lib/supabase/client'

interface Usage {
  testsThisMonth: number
  limit: number | null
  isPro: boolean
  isBeta: boolean
  betaExpiresAt: string | null
}

const AVATAR_COLORS = [
  { hex: '#533afd', label: 'Teal' },
  { hex: '#006FFF', label: 'Ocean blue' },
  { hex: '#8B5CF6', label: 'Purple' },
  { hex: '#EC4899', label: 'Pink' },
  { hex: '#F59E0B', label: 'Amber' },
  { hex: '#10B981', label: 'Emerald' },
  { hex: '#EF4444', label: 'Red' },
  { hex: '#6366F1', label: 'Indigo' },
]

export default function AccountPage() {
  usePageTitle('Account')
  const { user, refresh } = useAuth()
  const [usage, setUsage] = useState<Usage | null>(null)

  const [displayName, setDisplayName] = useState('')
  const [avatarColor, setAvatarColor] = useState('#533afd')
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)

  const [deleteStep, setDeleteStep] = useState<'idle' | 'confirm' | 'typing'>('idle')
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)

  const [isFounder, setIsFounder] = useState(false)

  const [mfaFactors, setMfaFactors] = useState<{ id: string; status: string }[]>([])
  const [mfaEnrolling, setMfaEnrolling] = useState(false)
  const [mfaQrCode, setMfaQrCode] = useState('')
  const [mfaSecret, setMfaSecret] = useState('')
  const [mfaFactorId, setMfaFactorId] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const [mfaError, setMfaError] = useState('')
  const [mfaLoading, setMfaLoading] = useState(false)
  const mfaEnabled = mfaFactors.some((f) => f.status === 'verified')

  async function loadMfaFactors() {
    const supabase = createClient()
    const { data } = await supabase.auth.mfa.listFactors()
    setMfaFactors(data?.totp ?? [])
  }

  useEffect(() => {
    loadMfaFactors()
  }, [])

  async function handleStartMfaEnroll() {
    setMfaError('')
    setMfaLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
      if (error || !data) { setMfaError('Could not start setup. Please try again.'); return }
      setMfaFactorId(data.id)
      setMfaQrCode(data.totp.qr_code)
      setMfaSecret(data.totp.secret)
      setMfaEnrolling(true)
    } finally {
      setMfaLoading(false)
    }
  }

  async function handleVerifyMfaEnroll(e: FormEvent) {
    e.preventDefault()
    setMfaError('')
    setMfaLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: mfaFactorId, code: mfaCode.trim() })
      if (error) { setMfaError('That code is incorrect. Please try again.'); return }
      setMfaEnrolling(false)
      setMfaCode('')
      setMfaQrCode('')
      setMfaSecret('')
      await loadMfaFactors()
    } finally {
      setMfaLoading(false)
    }
  }

  async function handleCancelMfaEnroll() {
    const supabase = createClient()
    if (mfaFactorId) await supabase.auth.mfa.unenroll({ factorId: mfaFactorId })
    setMfaEnrolling(false)
    setMfaCode('')
    setMfaQrCode('')
    setMfaSecret('')
    setMfaFactorId('')
    setMfaError('')
  }

  async function handleDisableMfa(factorId: string) {
    setMfaError('')
    setMfaLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.mfa.unenroll({ factorId })
      if (error) { setMfaError('Could not disable two-factor authentication. Please try again.'); return }
      await loadMfaFactors()
    } finally {
      setMfaLoading(false)
    }
  }

  useEffect(() => {
    fetch('/api/usage').then((r) => r.json()).then((d) => setUsage(d)).catch(() => {})
  }, [])

  useEffect(() => {
    // The feedback inbox is gated server-side by FOUNDER_EMAIL — probing with a
    // cheap GET is the single source of truth for whether to show the link,
    // instead of duplicating that email as a second, driftable constant here.
    fetch('/api/feedback?limit=1').then((r) => setIsFounder(r.ok)).catch(() => {})
  }, [])

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName ?? '')
      setAvatarColor(user.avatarColor ?? '#533afd')
    }
  }, [user])

  async function handleProfileSave() {
    setProfileLoading(true)
    setProfileSuccess(false)
    try {
      await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, avatarColor }),
      })
      setProfileSuccess(true)
      await refresh()
      setTimeout(() => setProfileSuccess(false), 3000)
    } finally {
      setProfileLoading(false)
    }
  }

  async function handlePasswordChange(e: FormEvent) {
    e.preventDefault()
    setPwError('')
    setPwSuccess(false)
    if (newPassword !== confirmPassword) { setPwError('Passwords do not match.'); return }
    if (newPassword.length < 8) { setPwError('New password must be at least 8 characters.'); return }
    setPwLoading(true)
    try {
      const res = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) { setPwError(data.error ?? 'Failed to update password.'); return }
      setPwSuccess(true)
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    } catch {
      setPwError('Something went wrong. Please try again.')
    } finally {
      setPwLoading(false)
    }
  }

  async function handleDeleteAccount() {
    setDeleteError('')
    setDeleteLoading(true)
    try {
      const res = await fetch('/api/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
      })
      const data = await res.json()
      if (!res.ok) { setDeleteError(data.error ?? 'Failed to delete account.'); return }
      window.location.href = '/login'
    } catch {
      setDeleteError('Something went wrong. Please try again.')
    } finally {
      setDeleteLoading(false)
    }
  }

  const initials = (displayName || user?.email || 'U')[0].toUpperCase()
  const color = avatarColor || '#533afd'

  return (
    <div className="pb-6 animate-in">
      {/* Header */}
      <div className="px-4 pt-12 pb-5">
        <h1 className="font-display font-bold text-slate-900 text-xl">Profile</h1>
        <p className="text-xs text-slate-400 mt-0.5">Manage your account and preferences</p>
      </div>

      <div className="px-4 space-y-4">

        {/* Profile card */}
        <div className="card-light p-5 rounded-3xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Your profile</p>

          {/* Avatar preview + email */}
          <div className="flex items-center gap-4 mb-5">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-display font-bold text-white flex-shrink-0 transition-all duration-300"
              style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)`, boxShadow: `0 4px 16px ${color}40` }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 truncate">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-400">
                  {user?.role === 'PROFESSIONAL' ? 'Pool professional' : 'Pool owner'}
                </span>
                <span className="text-slate-200">·</span>
                <span className={`text-xs font-semibold ${user?.subscriptionStatus === 'PRO' ? 'text-indigo-500' : 'text-slate-400'}`}>
                  {user?.subscriptionStatus === 'PRO' ? '⭐ Pro' : 'Free plan'}
                </span>
              </div>
            </div>
          </div>

          {/* Display name */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-600 mb-2">Display name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={user?.email?.split('@')[0] ?? 'Your name'}
              maxLength={40}
              className="input-light"
            />
            <p className="text-xs text-slate-400 mt-1.5">Shown in your dashboard greeting.</p>
          </div>

          {/* Avatar color picker */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-slate-600 mb-3">Avatar color</label>
            <div className="flex gap-2 flex-wrap">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setAvatarColor(c.hex)}
                  title={c.label}
                  className="w-9 h-9 rounded-xl transition-all duration-200 hover:scale-110"
                  style={{
                    background: c.hex,
                    outline: avatarColor === c.hex ? `3px solid ${c.hex}` : '3px solid transparent',
                    outlineOffset: '2px',
                    boxShadow: avatarColor === c.hex ? `0 0 12px ${c.hex}60` : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          {profileSuccess && (
            <div className="mb-3 p-3 rounded-2xl text-sm font-medium flex items-center gap-2"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981' }}>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Profile saved.
            </div>
          )}

          <button
            onClick={handleProfileSave}
            disabled={profileLoading}
            className="btn-teal w-full py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {profileLoading ? (
              <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving…</>
            ) : 'Save profile'}
          </button>

          {usage?.isBeta && usage.betaExpiresAt && (
            <div className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-semibold border"
              style={{ background: 'rgba(15,196,144,0.07)', borderColor: 'rgba(15,196,144,0.25)', color: '#0FC490' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              Beta — All Pro features active
            </div>
          )}
        </div>

        {/* Usage */}
        {usage && (
          <div className="card-light p-5 rounded-3xl">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">This month</p>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-sm font-medium text-slate-600">Water tests run</p>
              <p className="text-sm font-bold text-slate-800">
                {usage.testsThisMonth}{usage.isPro ? '' : ` / ${usage.limit}`}
              </p>
            </div>
            {!usage.isPro && (
              <>
                <div className="w-full rounded-full h-2 bg-slate-100">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (usage.testsThisMonth / (usage.limit ?? 5)) * 100)}%`,
                      background: usage.testsThisMonth >= (usage.limit ?? 5) ? '#EF4444' : '#533afd',
                    }}
                  />
                </div>
                {usage.testsThisMonth >= (usage.limit ?? 5) && (
                  <p className="text-xs text-red-500 font-semibold mt-2">Monthly limit reached — contact support</p>
                )}
              </>
            )}
            {usage.isPro && (
              <p className="text-xs text-slate-400">Unlimited — {usage.isBeta ? 'Beta access active' : 'Pro plan'}</p>
            )}
          </div>
        )}

        {/* Change password */}
        <div className="card-light p-5 rounded-3xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Change password</p>

          {pwSuccess && (
            <div className="mb-4 p-3.5 rounded-2xl text-sm font-medium flex items-center gap-2"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981' }}>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Password updated.
            </div>
          )}
          {pwError && (
            <div className="mb-4 p-3.5 rounded-2xl text-sm font-medium"
              style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', color: '#EF4444' }}>
              {pwError}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            {[
              { label: 'Current password', val: currentPassword, set: setCurrentPassword, placeholder: '••••••••' },
              { label: 'New password',     val: newPassword,     set: setNewPassword,     placeholder: 'Min. 8 characters' },
              { label: 'Confirm new password', val: confirmPassword, set: setConfirmPassword, placeholder: '••••••••' },
            ].map((f) => (
              <div key={f.label}>
                <label className="block text-sm font-semibold text-slate-600 mb-2">{f.label}</label>
                <input
                  type="password"
                  required
                  value={f.val}
                  onChange={(e) => f.set(e.target.value)}
                  placeholder={f.placeholder}
                  className="input-light"
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={pwLoading}
              className="btn-teal w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pwLoading ? (
                <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Updating…</>
              ) : 'Update password'}
            </button>
          </form>
        </div>

        {/* Two-factor authentication */}
        <div className="card-light p-5 rounded-3xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Two-factor authentication</p>

          {mfaError && (
            <div className="mb-4 p-3.5 rounded-2xl text-sm font-medium"
              style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', color: '#EF4444' }}>
              {mfaError}
            </div>
          )}

          {mfaEnrolling ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">Scan this code with an authenticator app (like Google Authenticator or Authy), then enter the 6-digit code it shows.</p>
              {mfaQrCode && (
                <div className="flex justify-center p-4 bg-white rounded-2xl border border-slate-100"
                  dangerouslySetInnerHTML={{ __html: mfaQrCode }} />
              )}
              {mfaSecret && (
                <p className="text-xs text-slate-400 text-center break-all">Can&apos;t scan? Enter this code manually: <span className="font-mono text-slate-600">{mfaSecret}</span></p>
              )}
              <form onSubmit={handleVerifyMfaEnroll} className="space-y-3">
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="input-light text-center tracking-[0.3em] text-lg"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button type="button" onClick={handleCancelMfaEnroll}
                    className="flex-1 py-3 rounded-2xl text-sm font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all">
                    Cancel
                  </button>
                  <button type="submit" disabled={mfaLoading || mfaCode.length !== 6}
                    className="btn-teal flex-1 py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {mfaLoading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Verify & enable'}
                  </button>
                </div>
              </form>
            </div>
          ) : mfaEnabled ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5" style={{ color: '#10B981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-slate-700">Enabled</p>
              </div>
              <button
                onClick={() => { const f = mfaFactors.find((x) => x.status === 'verified'); if (f) handleDisableMfa(f.id) }}
                disabled={mfaLoading}
                className="text-sm font-semibold text-red-400 hover:text-red-500 transition-colors disabled:opacity-50"
              >
                Disable
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-slate-500">Add an extra layer of security with an authenticator app.</p>
              <button
                onClick={handleStartMfaEnroll}
                disabled={mfaLoading}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex-shrink-0 transition-all disabled:opacity-50"
                style={{ background: '#533afd' }}
              >
                {mfaLoading ? 'Loading…' : 'Enable'}
              </button>
            </div>
          )}
        </div>

        {/* Founder tools — only visible to the account whose email matches FOUNDER_EMAIL */}
        {isFounder && (
          <Link
            href="/admin/feedback"
            className="card-light p-5 rounded-3xl flex items-center justify-between gap-3 transition-all hover:bg-slate-50"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(0,111,255,0.10)' }}>
                <svg className="w-5 h-5" style={{ color: '#006FFF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800">Feedback Inbox</p>
                <p className="text-xs text-slate-400 mt-0.5">View and manage user feedback</p>
              </div>
            </div>
            <svg className="w-4 h-4 text-slate-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}

        {/* Danger zone */}
        <div className="rounded-3xl border p-5"
          style={{ background: 'rgba(239,68,68,0.03)', borderColor: 'rgba(239,68,68,0.15)' }}>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Danger zone</p>

          {/* Sign out */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
            <div>
              <p className="text-sm font-medium text-slate-700">Sign out</p>
              <p className="text-xs text-slate-400 mt-0.5">Sign out on this device.</p>
            </div>
            <button
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' })
                window.location.replace('/login')
              }}
              className="text-sm font-semibold text-red-400 hover:text-red-500 transition-colors"
            >
              Sign out
            </button>
          </div>

          {/* Delete account */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-500">Delete account</p>
                <p className="text-xs text-slate-400 mt-0.5">Permanently removes all your data.</p>
              </div>
              {deleteStep === 'idle' && (
                <button
                  onClick={() => setDeleteStep('confirm')}
                  className="text-sm font-semibold text-red-400 hover:text-red-500 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>

            {deleteStep === 'confirm' && (
              <div className="mt-4 p-4 rounded-2xl border"
                style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.2)' }}>
                <p className="text-sm font-semibold text-red-500 mb-1">Are you absolutely sure?</p>
                <p className="text-xs text-slate-500 mb-4">This permanently deletes your account, all pools, water tests, and service logs. Cannot be undone.</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDeleteStep('idle')}
                    className="flex-1 py-2.5 rounded-2xl text-sm font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setDeleteStep('typing')}
                    className="flex-1 py-2.5 rounded-2xl text-sm font-semibold text-white transition-all"
                    style={{ background: '#EF4444' }}
                  >
                    Yes, delete it
                  </button>
                </div>
              </div>
            )}

            {deleteStep === 'typing' && (
              <div className="mt-4 space-y-3">
                {deleteError && (
                  <div className="p-3 rounded-2xl text-xs font-medium"
                    style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', color: '#EF4444' }}>
                    {deleteError}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">
                    Confirm your password to continue
                  </label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Your current password"
                    className="input-light"
                    autoFocus
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setDeleteStep('idle'); setDeletePassword(''); setDeleteError('') }}
                    className="flex-1 py-2.5 rounded-2xl text-sm font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteLoading || !deletePassword}
                    className="flex-1 py-2.5 rounded-2xl text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ background: '#EF4444' }}
                  >
                    {deleteLoading ? (
                      <><div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Deleting…</>
                    ) : 'Delete my account'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

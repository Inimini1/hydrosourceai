'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import StatusBadge from '@/components/StatusBadge'
import { EmptyStateView } from '@/components/EmptyStateView'
import TestReminderBanner, { getReminderState, PoolDropIcon } from '@/components/TestReminderBanner'
import { PageError } from '@/components/PageError'

interface Pool {
  id: string
  poolName: string
  gallons: number
  chlorineType: string
  createdAt: string
  _count: { waterTests: number; serviceLogs: number }
  waterTests: Array<{
    id: string; status: string; chlorine: number; pH: number; alkalinity: number
    createdAt: string; aiAnalysis: string
  }>
}

interface UsageData {
  planType: string
  features?: { maintenanceLog?: boolean }
}

function parseNextTestDays(aiAnalysis: string): number | null {
  try {
    const a = JSON.parse(aiAnalysis) as { next_test_days?: number }
    return typeof a.next_test_days === 'number' ? a.next_test_days : null
  } catch { return null }
}

const READING_STATUS = (val: number, min: number, max: number) =>
  val >= min && val <= max ? '#10B981' : '#F59E0B'

export default function PoolDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [pool, setPool] = useState<Pool | null>(null)
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    setLoading(true)
    setLoadError(false)
    Promise.all([
      fetch(`/api/pools/${id}`).then((r) => { if (!r.ok) throw new Error(); return r.json() }),
      fetch('/api/usage').then((r) => r.ok ? r.json() : null),
    ])
      .then(([poolData, usageData]) => {
        setPool(poolData.pool ?? null)
        setUsage(usageData)
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false))
  }, [id, retryKey])

  async function handleDelete() {
    if (!confirm('Delete this pool? This cannot be undone.')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/pools/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data.error ?? 'Failed to delete pool. Please try again.')
        return
      }
      router.push('/pools')
    } catch {
      alert('Failed to delete pool. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="pb-6">
        <div className="px-4 pt-12 pb-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl flex-shrink-0 skeleton" />
          <div className="flex-1 space-y-2">
            <div className="h-6 w-40 rounded-xl skeleton" />
            <div className="h-3 w-28 rounded-full skeleton" />
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="h-7 w-16 rounded-full skeleton" />
            <div className="w-9 h-9 rounded-2xl skeleton" />
          </div>
        </div>
        <div className="px-4 space-y-4">
          <div className="h-14 rounded-2xl skeleton" />
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="card-light rounded-3xl p-4 text-center space-y-2">
                <div className="h-3 w-14 rounded-full skeleton mx-auto" />
                <div className="h-8 w-12 rounded-lg skeleton mx-auto" />
                <div className="h-2.5 w-10 rounded-full skeleton mx-auto" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[0, 1].map((i) => (
              <div key={i} className="card-light rounded-3xl p-5 flex flex-col items-center gap-2.5">
                <div className="w-12 h-12 rounded-2xl skeleton" />
                <div className="space-y-1.5 text-center">
                  <div className="h-4 w-20 rounded skeleton mx-auto" />
                  <div className="h-3 w-24 rounded-full skeleton mx-auto" />
                </div>
              </div>
            ))}
          </div>
          <div className="card-light rounded-3xl p-4 grid grid-cols-3 divide-x divide-slate-100">
            {[0, 1, 2].map((i) => (
              <div key={i} className="text-center px-3 space-y-1.5">
                <div className="h-6 w-10 rounded-lg skeleton mx-auto" />
                <div className="h-2.5 w-14 rounded-full skeleton mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (loadError) return (
    <PageError
      variant="light"
      onRetry={() => setRetryKey((k) => k + 1)}
      title="Could not load pool"
      backHref="/pools"
      backLabel="My Pools"
    />
  )

  if (!pool) return (
    <PageError
      variant="light"
      title="Pool not found"
      message="This pool may have been deleted or the link is incorrect."
      backHref="/pools"
      backLabel="My Pools"
    />
  )

  const lastTest = pool.waterTests[0]
  const nextTestDays = lastTest ? parseNextTestDays(lastTest.aiAnalysis) : null
  const reminderState = getReminderState(lastTest?.createdAt, nextTestDays)

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
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-bold text-slate-900 text-xl truncate">{pool.poolName}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{pool.gallons.toLocaleString()} gal · {pool.chlorineType}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {lastTest && <StatusBadge status={lastTest.status as 'safe' | 'caution' | 'critical'} size="lg" />}
          <Link href={`/pools/${id}/edit`}
            className="w-9 h-9 rounded-2xl flex items-center justify-center bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="px-4 space-y-4">

        {/* Test reminder — shown when due or overdue */}
        <TestReminderBanner
          lastTestedAt={lastTest?.createdAt}
          poolId={id}
          nextTestDays={nextTestDays}
        />

        {/* "Last tested X days ago" pill — shown when fresh (banner hidden) */}
        {reminderState.urgency === 'fresh' && lastTest && (
          <div className="flex items-center gap-2">
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: reminderState.bg, color: reminderState.color, border: `1px solid ${reminderState.border}` }}
            >
              <PoolDropIcon urgency={reminderState.urgency} color={reminderState.color} size={16} />
              <span>{reminderState.label}</span>
            </div>
            {nextTestDays != null && reminderState.daysSince >= 0 && (
              <span className="text-xs text-slate-400">
                Next test in {Math.max(1, nextTestDays - reminderState.daysSince)} day{Math.max(1, nextTestDays - reminderState.daysSince) !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}

        {/* Current readings */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Chlorine', value: lastTest?.chlorine, unit: 'ppm', idealMin: 1, idealMax: 3, ideal: '1–3' },
            { label: 'pH',        value: lastTest?.pH,        unit: '',    idealMin: 7.2, idealMax: 7.6, ideal: '7.2–7.6' },
            { label: 'Alkalinity', value: lastTest?.alkalinity, unit: 'ppm', idealMin: 80, idealMax: 120, ideal: '80–120' },
          ].map((m) => {
            const color = m.value != null ? READING_STATUS(m.value, m.idealMin, m.idealMax) : '#CBD5E1'
            return (
              <div key={m.label} className="card-light rounded-3xl p-4 text-center">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{m.label}</p>
                <p className="font-display font-black text-2xl mt-1 leading-none" style={{ color }}>
                  {m.value != null ? m.value : '—'}
                </p>
                {m.unit && m.value != null && <p className="text-slate-400 text-xs mt-0.5">{m.unit}</p>}
                <p className="text-slate-300 text-[10px] mt-1.5">ideal {m.ideal}</p>
              </div>
            )
          })}
        </div>

        {/* Quick actions */}
        <div className={`grid gap-3 ${usage?.features?.maintenanceLog ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <Link href={`/pools/${id}/test`}
            className="card-light rounded-3xl p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all duration-200 text-center"
            style={{ borderTop: '3px solid #00C9B1' }}>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #00C9B1, #00A99A)', boxShadow: '0 4px 14px rgba(0,201,177,0.3)' }}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">Test Water</p>
              <p className="text-slate-400 text-xs mt-0.5">Get AI analysis</p>
            </div>
          </Link>

          <Link href={`/pools/${id}/service`}
            className="card-light rounded-3xl p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all duration-200 text-center"
            style={{ borderTop: '3px solid #10B981' }}>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <svg className="w-5 h-5" style={{ color: '#10B981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">Log Service</p>
              <p className="text-slate-400 text-xs mt-0.5">Record maintenance</p>
            </div>
          </Link>

          {/* Maintenance Log — Pool Pro only */}
          {usage?.features?.maintenanceLog && (
            <Link href={`/pools/${id}/maintenance`}
              className="card-light rounded-3xl p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all duration-200 text-center"
              style={{ borderTop: '3px solid #006FFF' }}>
              <div className="relative w-11 h-11 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(0,111,255,0.12)', border: '1px solid rgba(0,111,255,0.2)' }}>
                <svg className="w-5 h-5" style={{ color: '#36aaf6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span
                  className="absolute -top-1 -right-1 text-[8px] font-black px-1 py-px rounded-full leading-none"
                  style={{ background: '#006FFF', color: 'white' }}
                >PRO</span>
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-sm">Maint. Log</p>
                <p className="text-slate-400 text-xs mt-0.5">Treatment plans</p>
              </div>
            </Link>
          )}
        </div>

        {/* Stats row */}
        <div className="card-light rounded-3xl p-4 grid grid-cols-3 divide-x divide-slate-100">
          {[
            { label: 'Tests', value: pool._count.waterTests },
            { label: 'Service logs', value: pool._count.serviceLogs },
            { label: 'Since', value: new Date(pool.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) },
          ].map((s) => (
            <div key={s.label} className="text-center px-3 first:pl-0 last:pr-0">
              <p className="font-display font-black text-xl text-slate-900">{s.value}</p>
              <p className="text-[10px] font-medium text-slate-400 mt-0.5 uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>

        {/* History link */}
        <Link href={`/pools/${id}/history`}
          className="card-light rounded-3xl p-4 flex items-center justify-between hover:shadow-md transition-all duration-200 block">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(139,92,246,0.10)' }}>
              <svg className="w-5 h-5" style={{ color: '#8B5CF6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">View History</p>
              <p className="text-slate-400 text-xs mt-0.5">Track water chemistry trends</p>
            </div>
          </div>
          <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        {/* No test yet CTA */}
        {!lastTest && (
          <EmptyStateView
            scene="no-tests"
            action={{ label: 'Start first test', href: `/pools/${id}/test` }}
          />
        )}

        {/* Delete */}
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-full text-sm text-slate-300 hover:text-red-400 py-3 transition-colors disabled:opacity-40 font-medium"
        >
          {deleting ? 'Deleting…' : 'Delete this pool'}
        </button>

      </div>
    </div>
  )
}

'use client'

/**
 * Maintenance Log — Pool Pro feature
 *
 * Shows all service logs for a pool, with AI treatment plan checklists
 * displayed as interactive step-by-step cards that professionals can
 * check off on-site. Available exclusively on Pool Pro and Pool Team plans.
 */

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import MaintenanceChecklist, { type TreatmentStep } from '@/components/MaintenanceChecklist'
import { PageError } from '@/components/PageError'

interface ServiceLog {
  id: string
  notes: string
  chemicalsAdded: string | null
  treatmentPlan: string | null
  createdAt: string
}

interface Pool {
  id: string
  poolName: string
  gallons: number
  chlorineType: string
  waterTests: Array<{ status: string; createdAt: string }>
}

function parseTreatmentPlan(raw: string | null): TreatmentStep[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}

function getPoolStatus(tests: Pool['waterTests']): 'safe' | 'caution' | 'critical' {
  if (tests.length === 0) return 'caution'
  const last = tests[0]
  return (last.status as 'safe' | 'caution' | 'critical') || 'caution'
}

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────────────────────

function EmptyMaintenance({ poolId }: { poolId: string }) {
  return (
    <div className="text-center py-16 px-4">
      <div
        className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-5"
        style={{ background: 'rgba(0,111,255,0.12)', border: '1px solid rgba(0,111,255,0.2)' }}
      >
        <svg className="w-7 h-7" style={{ color: '#36aaf6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      </div>
      <p className="font-display font-bold text-white text-lg mb-2">No maintenance logs yet</p>
      <p className="text-white/40 text-sm leading-relaxed max-w-xs mx-auto mb-6">
        Run a water test to get AI treatment recommendations, then save them as a maintenance log entry.
      </p>
      <Link
        href={`/pools/${poolId}/test`}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all"
        style={{ background: 'linear-gradient(135deg, #00C9B1, #00A99A)', color: 'white', boxShadow: '0 4px 14px rgba(0,201,177,0.3)' }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        Run first water test
      </Link>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// UPGRADE GATE
// ─────────────────────────────────────────────────────────────────────────────

function UpgradeGate() {
  return (
    <div className="text-center py-16 px-4">
      <div
        className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-5"
        style={{ background: 'rgba(0,111,255,0.12)', border: '1px solid rgba(0,111,255,0.2)' }}
      >
        <svg className="w-7 h-7" style={{ color: '#36aaf6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <p className="font-display font-bold text-white text-lg mb-2">Maintenance Log</p>
      <p className="text-white/40 text-sm leading-relaxed max-w-xs mx-auto mb-2">
        Save AI treatment plans as interactive checklists your team can check off on-site.
      </p>
      <p className="text-xs font-semibold mb-6" style={{ color: '#36aaf6' }}>
        Available on Pool Pro and Pool Team plans
      </p>
      <Link
        href="/billing"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all"
        style={{ background: '#006FFF', color: 'white', boxShadow: '0 4px 14px rgba(0,111,255,0.35)' }}
      >
        Start 14-day free trial →
      </Link>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SIMPLE LOG CARD (no treatment plan)
// ─────────────────────────────────────────────────────────────────────────────

function SimpleLogCard({ log, onDelete }: { log: ServiceLog; onDelete: () => void }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const d = new Date(log.createdAt)
  const isToday = new Date().toDateString() === d.toDateString()
  const isYest  = new Date(Date.now() - 86400000).toDateString() === d.toDateString()
  const dateLabel = isToday ? 'Today' : isYest ? 'Yesterday'
    : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <div
      className="rounded-3xl p-5"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest">
            {dateLabel} · {d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </p>
          <p className="text-sm font-semibold text-white/70 mt-0.5">Service Visit</p>
        </div>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(16,185,129,0.12)' }}
        >
          <svg className="w-4 h-4" style={{ color: '#10B981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
      </div>

      <p className="text-sm text-white/50 leading-relaxed">{log.notes}</p>

      {log.chemicalsAdded && (
        <div className="mt-3 pt-3 border-t border-white/6">
          <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-1">Chemicals Added</p>
          <p className="text-xs text-white/45">{log.chemicalsAdded}</p>
        </div>
      )}

      {showConfirm ? (
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => { onDelete(); setShowConfirm(false) }}
            className="flex-1 py-2 rounded-xl text-xs font-bold"
            style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            Delete
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            className="flex-1 py-2 rounded-xl text-xs text-white/35 hover:text-white/55 transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full pt-3 text-xs text-white/15 hover:text-white/30 transition-colors"
        >
          Delete
        </button>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function MaintenancePage() {
  const { id } = useParams<{ id: string }>()
  const [pool, setPool]     = useState<Pool | null>(null)
  const [logs, setLogs]     = useState<ServiceLog[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    setLoading(true)
    setLoadError(false)

    Promise.all([
      fetch(`/api/pools/${id}`).then((r) => { if (!r.ok) throw new Error(); return r.json() }),
      fetch(`/api/service-logs?poolId=${id}`).then((r) => { if (!r.ok) throw new Error(); return r.json() }),
      fetch('/api/usage').then((r) => r.ok ? r.json() : null),
    ])
      .then(([poolData, logData, usageData]) => {
        setPool(poolData.pool ?? null)
        setLogs(logData.logs ?? [])
        // Check plan-level access to maintenance log feature
        const hasAccess = usageData?.features?.maintenanceLog ?? false
        if (!hasAccess) setAccessDenied(true)
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false))
  }, [id, retryKey])

  async function deleteLog(logId: string) {
    await fetch(`/api/service-logs/${logId}`, { method: 'DELETE' })
    setLogs((prev) => prev.filter((l) => l.id !== logId))
  }

  const poolStatus = pool ? getPoolStatus(pool.waterTests) : 'caution'
  const logsWithPlan = logs.filter((l) => l.treatmentPlan)
  const logsWithoutPlan = logs.filter((l) => !l.treatmentPlan)
  const totalLogs = logs.length

  if (loading) {
    return (
      <div className="pb-8">
        <div className="px-4 pt-12 pb-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl flex-shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <div className="space-y-2">
            <div className="h-6 w-40 rounded-xl" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="h-3 w-28 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
          </div>
        </div>
        <div className="px-4 space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 rounded-3xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }} />
          ))}
        </div>
      </div>
    )
  }

  if (loadError) return (
    <PageError
      variant="dark"
      onRetry={() => setRetryKey((k) => k + 1)}
      title="Could not load maintenance log"
      backHref={`/pools/${id}`}
      backLabel="Pool details"
    />
  )

  return (
    <div className="pb-8 -mx-4 -mt-4 px-4 pt-4 min-h-screen" style={{ background: 'linear-gradient(180deg, #0B1E2D 0%, #0B1528 100%)' }}>

      {/* Header */}
      <div className="px-0 pt-8 pb-5 flex items-center gap-3">
        <Link
          href={`/pools/${id}`}
          className="w-9 h-9 rounded-2xl flex items-center justify-center transition-all"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-bold text-white text-xl">Maintenance Log</h1>
          <p className="text-xs text-white/30 mt-0.5 truncate">
            {pool?.poolName} · {totalLogs} entr{totalLogs !== 1 ? 'ies' : 'y'}
          </p>
        </div>
        {/* Add service log */}
        <Link
          href={`/pools/${id}/service`}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
          style={{ background: 'rgba(0,201,177,0.15)', color: '#00C9B1', border: '1px solid rgba(0,201,177,0.25)' }}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Log service
        </Link>
      </div>

      {accessDenied ? (
        <UpgradeGate />
      ) : logs.length === 0 ? (
        <EmptyMaintenance poolId={id} />
      ) : (
        <div className="space-y-4">

          {/* Stats bar */}
          <div
            className="rounded-2xl p-4 grid grid-cols-3 divide-x divide-white/8"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {[
              { label: 'Total visits', value: totalLogs },
              { label: 'With treatment plan', value: logsWithPlan.length },
              { label: 'This month', value: logs.filter((l) => {
                const d = new Date(l.createdAt)
                const now = new Date()
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
              }).length },
            ].map((s) => (
              <div key={s.label} className="text-center px-3 first:pl-0 last:pr-0">
                <p className="font-display font-black text-2xl text-white">{s.value}</p>
                <p className="text-[10px] font-medium text-white/30 mt-0.5 uppercase tracking-wide leading-tight">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Treatment plan checklists — the Pro feature */}
          {logsWithPlan.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">AI Treatment Plans</p>
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(0,111,255,0.15)', color: '#36aaf6' }}
                >
                  Pool Pro
                </span>
              </div>
              <div className="space-y-3">
                {logsWithPlan.map((log) => {
                  const steps = parseTreatmentPlan(log.treatmentPlan)
                  if (steps.length === 0) return null
                  return (
                    <MaintenanceChecklist
                      key={log.id}
                      logId={log.id}
                      steps={steps}
                      createdAt={log.createdAt}
                      notes={log.notes}
                      poolStatus={poolStatus}
                      onDelete={() => deleteLog(log.id)}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* Regular service logs */}
          {logsWithoutPlan.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Service Visits</p>
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
              </div>
              <div className="space-y-3">
                {logsWithoutPlan.map((log) => (
                  <SimpleLogCard key={log.id} log={log} onDelete={() => deleteLog(log.id)} />
                ))}
              </div>
            </div>
          )}

          {/* Add new test CTA */}
          <div
            className="rounded-2xl p-4 flex items-center gap-4"
            style={{ background: 'rgba(0,201,177,0.06)', border: '1px solid rgba(0,201,177,0.15)' }}
          >
            <div className="flex-1">
              <p className="text-sm font-semibold text-white/70">Run a new test</p>
              <p className="text-xs text-white/35 mt-0.5">Get AI treatment recommendations to add to this log</p>
            </div>
            <Link
              href={`/pools/${id}/test`}
              className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all"
              style={{ background: 'rgba(0,201,177,0.2)', color: '#00C9B1', border: '1px solid rgba(0,201,177,0.3)' }}
            >
              Test now →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

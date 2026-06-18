'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { EmptyStateView } from '@/components/EmptyStateView'
import { PageError } from '@/components/PageError'

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.05 } },
}
const itemVariants = {
  hidden: { opacity: 0, x: -14, scale: 0.97 },
  show:   { opacity: 1, x: 0,   scale: 1, transition: { type: 'spring' as const, stiffness: 380, damping: 34 } },
}

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const typeConfig: Record<string, { iconBg: string; iconColor: string; icon: React.ReactNode }> = {
  UNSAFE_WATER: {
    iconBg: 'rgba(239,68,68,0.10)',
    iconColor: '#EF4444',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  SUBSCRIPTION: {
    iconBg: 'rgba(0,201,177,0.10)',
    iconColor: '#00C9B1',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  MISSED_TEST: {
    iconBg: 'rgba(245,158,11,0.10)',
    iconColor: '#F59E0B',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
}

const defaultConfig = {
  iconBg: 'rgba(148,163,184,0.12)',
  iconColor: '#94A3B8',
  icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    setLoading(true)
    setLoadError(false)
    fetch('/api/notifications')
      .then((r) => { if (!r.ok) throw new Error(); return r.json() })
      .then((d) => setNotifications(d.notifications ?? []))
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false))
  }, [retryKey])

  async function markRead(id: string) {
    await fetch(`/api/notifications?id=${id}`, { method: 'PATCH' })
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  async function markAllRead() {
    await fetch('/api/notifications?all=true', { method: 'PATCH' })
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  if (loading) {
    return (
      <div className="pb-6">
        <div className="px-4 pt-12 pb-5 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-20 rounded-xl skeleton" />
            <div className="h-3 w-28 rounded-full skeleton" />
          </div>
          <div className="h-8 w-24 rounded-xl skeleton" />
        </div>
        <div className="px-4 space-y-2.5">
          {[1, 0.85, 0.7, 0.55, 0.4].map((opacity, i) => (
            <div key={i} className="card-light rounded-3xl p-4 flex items-start gap-3.5" style={{ opacity }}>
              <div className="w-10 h-10 rounded-2xl flex-shrink-0 skeleton" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-32 rounded skeleton" />
                  <div className="w-2 h-2 rounded-full skeleton flex-shrink-0" />
                </div>
                <div className="h-3 w-full rounded-full skeleton" />
                <div className="h-3 w-3/4 rounded-full skeleton" />
                <div className="h-2.5 w-20 rounded-full skeleton" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (loadError) return (
    <PageError
      variant="light"
      onRetry={() => setRetryKey((k) => k + 1)}
      title="Could not load alerts"
      backHref="/dashboard"
      backLabel="Dashboard"
    />
  )

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-4 pt-12 pb-5 flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-slate-900 text-xl">Alerts</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-sm font-semibold transition-colors"
            style={{ color: '#00C9B1' }}
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="px-4">
        {notifications.length === 0 ? (
          <EmptyStateView scene="no-alerts" />
        ) : (
          <motion.div className="space-y-2.5" variants={listVariants} initial="hidden" animate="show">
            {notifications.map((n) => {
              const cfg = typeConfig[n.type] ?? defaultConfig
              return (
                <motion.div
                  key={n.id}
                  variants={itemVariants}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => !n.read && markRead(n.id)}
                  className="card-light rounded-3xl p-4 flex items-start gap-3.5 cursor-pointer transition-shadow duration-200 hover:shadow-md"
                  style={{ opacity: n.read ? 0.55 : 1 }}
                >
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: cfg.iconBg, color: cfg.iconColor }}>
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse"
                          style={{ background: '#00C9B1' }} />
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-xs text-slate-300 mt-1.5">{formatDate(n.createdAt)}</p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>
    </div>
  )
}

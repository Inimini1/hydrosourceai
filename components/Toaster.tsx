'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastItem {
  id: string
  type: ToastType
  message: string
  duration: number
}

interface ToastCtx {
  add: (message: string, type?: ToastType, duration?: number) => void
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const STYLES: Record<ToastType, { bg: string; border: string; iconColor: string }> = {
  success: { bg: 'rgba(0,201,177,0.13)',   border: 'rgba(0,201,177,0.32)',   iconColor: '#3cddc7' },
  error:   { bg: 'rgba(255,75,75,0.13)',   border: 'rgba(255,100,100,0.35)', iconColor: '#ffb4ab' },
  warning: { bg: 'rgba(245,158,11,0.13)',  border: 'rgba(245,158,11,0.32)',  iconColor: '#FCD34D' },
  info:    { bg: 'rgba(0,111,255,0.13)',   border: 'rgba(0,111,255,0.32)',   iconColor: '#60A5FA' },
}

const DEFAULT_DURATION: Record<ToastType, number> = {
  success: 4000,
  info:    4000,
  warning: 5000,
  error:   7000,
}

const ICONS: Record<ToastType, React.ReactNode> = {
  success: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  warning: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  info: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

// ─── Individual toast ─────────────────────────────────────────────────────────

function Toast({ item, onRemove }: { item: ToastItem; onRemove: (id: string) => void }) {
  const onRemoveRef = useRef(onRemove)
  useEffect(() => { onRemoveRef.current = onRemove })

  const timer = useRef<ReturnType<typeof setTimeout>>()
  const remaining = useRef(item.duration)
  const startedAt = useRef(0)

  function clear() {
    if (timer.current) clearTimeout(timer.current)
  }

  function start() {
    clear()
    startedAt.current = Date.now()
    timer.current = setTimeout(() => onRemoveRef.current(item.id), remaining.current)
  }

  function pause() {
    clear()
    remaining.current = Math.max(0, remaining.current - (Date.now() - startedAt.current))
  }

  useEffect(() => {
    start()
    return clear
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const s = STYLES[item.type]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.93, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 440, damping: 36 }}
      role="alert"
      aria-live={item.type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      onMouseEnter={pause}
      onMouseLeave={start}
      className="flex items-start gap-3 px-4 py-3 rounded-2xl shadow-2xl max-w-xs w-full"
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
      }}
    >
      <span style={{ color: s.iconColor, marginTop: 1 }}>{ICONS[item.type]}</span>
      <p className="text-sm font-medium flex-1 leading-snug" style={{ color: '#dee3ea' }}>
        {item.message}
      </p>
      <button
        onClick={() => onRemove(item.id)}
        className="flex-shrink-0 mt-0.5 transition-opacity"
        style={{ color: '#849495', opacity: 0.6 }}
        aria-label="Dismiss"
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  )
}

// ─── Context ──────────────────────────────────────────────────────────────────

const Ctx = createContext<ToastCtx | null>(null)

// Global imperative API (works outside React components too)
let _dispatch: ((item: Omit<ToastItem, 'id'>) => void) | null = null

export const toast = Object.assign(
  (message: string, type: ToastType = 'info', duration?: number) => {
    _dispatch?.({ message, type, duration: duration ?? DEFAULT_DURATION[type] })
  },
  {
    success: (m: string) => toast(m, 'success'),
    error:   (m: string) => toast(m, 'error'),
    warning: (m: string) => toast(m, 'warning'),
    info:    (m: string) => toast(m, 'info'),
  }
)

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useToast must be inside <ToastProvider>')
  return {
    toast:   (m: string, type?: ToastType, d?: number) => ctx.add(m, type, d),
    success: (m: string) => ctx.add(m, 'success'),
    error:   (m: string) => ctx.add(m, 'error'),
    warning: (m: string) => ctx.add(m, 'warning'),
    info:    (m: string) => ctx.add(m, 'info'),
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const counter = useRef(0)

  const add = useCallback((message: string, type: ToastType = 'info', duration?: number) => {
    const id = `t${++counter.current}`
    setToasts((prev) => [{ id, message, type, duration: duration ?? DEFAULT_DURATION[type] }, ...prev.slice(0, 4)])
  }, [])

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  useEffect(() => {
    _dispatch = (item) => add(item.message, item.type, item.duration)
    return () => { _dispatch = null }
  }, [add])

  return (
    <Ctx.Provider value={{ add }}>
      {children}
      {/* Hidden ARIA live region for screen readers */}
      <div
        aria-live="polite"
        aria-relevant="additions"
        className="sr-only"
      >
        {toasts[0]?.message}
      </div>
      {/* Visual stack — top-right, slides down from top */}
      <div
        className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 items-end pointer-events-none"
        style={{ maxWidth: 'calc(100vw - 2rem)' }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto">
              <Toast item={t} onRemove={remove} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  )
}

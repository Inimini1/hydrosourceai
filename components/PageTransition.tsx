'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useRef } from 'react'

const TAB_ROOTS = ['/dashboard', '/pools', '/notifications', '/account']

function tabIndex(pathname: string): number {
  return TAB_ROOTS.findIndex(
    (t) => pathname === t || (t !== '/dashboard' && pathname.startsWith(t + '/'))
  )
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const prevIdxRef = useRef<number>(-1)

  const idx = tabIndex(pathname)
  const prevIdx = prevIdxRef.current
  const dir = idx >= 0 && prevIdx >= 0 && idx !== prevIdx ? Math.sign(idx - prevIdx) : 0
  if (idx >= 0) prevIdxRef.current = idx

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={pathname}
        initial={{ x: dir * 28, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: dir * -28, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 420, damping: 42, mass: 0.8 }}
        style={{ willChange: 'transform, opacity' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

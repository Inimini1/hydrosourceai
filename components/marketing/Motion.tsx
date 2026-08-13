'use client'

import { Children, isValidElement, type ReactNode } from 'react'
import { motion, MotionConfig } from 'framer-motion'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

// reducedMotion="user" makes every motion component below defer to the OS-level
// prefers-reduced-motion setting — transforms are skipped, opacity fades stay.

// Staggers its direct children in on mount — used for the hero copy stack so
// the badge, headline, tagline, and CTAs arrive in sequence instead of all at once.
const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
}
const staggerItem = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
}

export function HeroStagger({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div initial="hidden" animate="show" variants={staggerContainer} className={className}>
        {Children.map(children, (child) =>
          isValidElement(child) ? <motion.div variants={staggerItem}>{child}</motion.div> : child
        )}
      </motion.div>
    </MotionConfig>
  )
}

// Fades a block up into place the first time it scrolls into view.
export function Reveal({
  children,
  delay = 0,
  y = 26,
  className,
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0, y }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.65, delay, ease: EASE }}
        className={className}
      >
        {children}
      </motion.div>
    </MotionConfig>
  )
}

// The hero's "product render" — settles into place on load, floats gently
// forever after, and lifts slightly on hover, the way Apple's hero shots do.
export function FloatingPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className={className}
        initial={{ opacity: 0, y: 44, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.85, delay: 0.4, ease: EASE }}
        whileHover={{ y: -6, transition: { duration: 0.4, ease: EASE } }}
      >
        <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
          {children}
        </motion.div>
      </motion.div>
    </MotionConfig>
  )
}

// Subtle press feedback for pill buttons/links.
export function PressableLink({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className={className}
        whileHover={{ scale: 1.035 }}
        whileTap={{ scale: 0.965 }}
        transition={{ duration: 0.15, ease: EASE }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  )
}

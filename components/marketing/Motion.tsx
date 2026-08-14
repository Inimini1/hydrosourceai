'use client'

import { Children, isValidElement, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react'
import {
  motion,
  MotionConfig,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  AnimatePresence,
} from 'framer-motion'

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
// forever after, and tilts toward the cursor in 3D like a physical object
// catching the light, the way Apple's flagship product shots do.
export function FloatingPanel({ children, className }: { children: ReactNode; className?: string }) {
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const springX = useSpring(rotateX, { stiffness: 160, damping: 18 })
  const springY = useSpring(rotateY, { stiffness: 160, damping: 18 })

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    rotateY.set(px * 7)
    rotateX.set(-py * 7)
  }
  function handleMouseLeave() {
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className={className}
        style={{ perspective: 1200 }}
        initial={{ opacity: 0, y: 44, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.85, delay: 0.4, ease: EASE }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileHover={{ y: -6, transition: { duration: 0.4, ease: EASE } }}
      >
        <motion.div
          style={{ rotateX: springX, rotateY: springY, transformStyle: 'preserve-3d' }}
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          {children}
        </motion.div>
      </motion.div>
    </MotionConfig>
  )
}

// Ambient glow behind the hero visual — drifts at a different rate than the
// page scroll for a subtle sense of depth, the way Apple's hero washes do.
export function ParallaxGlow({ className, style }: { className?: string; style?: CSSProperties }) {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 700], [0, 90])
  return <motion.div aria-hidden="true" className={className} style={{ ...style, y }} />
}

// Bouncing "keep going" cue at the bottom of the hero — fades out as soon as
// the visitor starts scrolling, so it never lingers as clutter.
export function ScrollCue({ className, style }: { className?: string; style?: CSSProperties }) {
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 140], [1, 0])
  return (
    <MotionConfig reducedMotion="user">
      <motion.div style={{ ...style, opacity }} className={className} aria-hidden="true">
        <motion.svg
          width="20" height="20" viewBox="0 0 24 24" fill="none"
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
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

// Apple's "product mini-nav" — pins directly below the global nav once the
// visitor scrolls past the hero, surfacing quick jump links + the primary CTA
// without permanently occupying header space.
export function StickyMiniNav({
  logo,
  wordmark,
  ink,
  teal,
  border,
  links,
  ctaHref,
  ctaLabel,
}: {
  logo: ReactNode
  wordmark: string
  ink: string
  teal: string
  border: string
  links: { href: string; label: string }[]
  ctaHref: string
  ctaLabel: string
}) {
  const { scrollY } = useScroll()
  const [visible, setVisible] = useState(false)
  useMotionValueEvent(scrollY, 'change', (y) => setVisible(y > 620))

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ y: -56, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -56, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="fixed inset-x-0 z-40 bg-white/92 backdrop-blur-md"
            style={{ top: '72px', borderBottom: `1px solid ${border}` }}
          >
            <div className="max-w-[1320px] mx-auto px-6 flex items-center justify-between" style={{ height: '52px' }}>
              <div className="flex items-center gap-2">
                {logo}
                <span className="text-[14px] font-semibold" style={{ color: ink }}>{wordmark}</span>
              </div>
              <div className="hidden md:flex items-center gap-7">
                {links.map((l) => (
                  <a key={l.href} href={l.href} className="text-[13px] transition-colors" style={{ color: ink }}>
                    {l.label}
                  </a>
                ))}
              </div>
              <PressableLink className="inline-block">
                <a href={ctaHref}
                  className="inline-flex items-center justify-center text-[13px] font-normal text-white"
                  style={{ background: teal, borderRadius: '9999px', padding: '7px 16px' }}>
                  {ctaLabel}
                </a>
              </PressableLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  )
}

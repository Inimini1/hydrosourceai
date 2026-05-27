'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export type EmptyScene = 'no-pools' | 'no-alerts' | 'no-tests' | 'no-history'

interface Props {
  scene: EmptyScene
  title?: string
  description?: string
  action?: { label: string; href: string }
}

const DEFAULTS: Record<EmptyScene, { title: string; description: string }> = {
  'no-pools':   { title: 'Add your first pool',   description: 'Set up a pool to start testing water chemistry with AI-powered guidance.' },
  'no-alerts':  { title: "You're all clear",       description: 'No alerts right now — your pools are looking balanced.' },
  'no-tests':   { title: 'No tests yet',           description: 'Run your first water test to get AI analysis and exact chemical dosing.' },
  'no-history': { title: 'No history yet',         description: 'Test history and trend charts will appear here once you run your first analysis.' },
}

// ── Mascot SVG ───────────────────────────────────────────────────────────────
function HydroMascot({ scene }: { scene: EmptyScene }) {
  const gid = scene // gradient id suffix
  const sleeping = scene === 'no-alerts'

  return (
    <svg
      viewBox="0 0 120 130"
      className="w-full h-full"
      overflow="visible"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`drop-${gid}`} x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#00D4AA" />
          <stop offset="100%" stopColor="#0BB88A" />
        </linearGradient>
        <radialGradient id={`shine-${gid}`} cx="32%" cy="28%" r="55%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.42)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <filter id={`glow-${gid}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* ── Scene background decorations ── */}

      {/* no-pools: animated water surface waves */}
      {scene === 'no-pools' && (
        <g opacity="0.5">
          <motion.path
            d="M2 112 Q18 104 35 112 Q52 120 68 112 Q84 104 100 112 Q116 120 130 112"
            fill="none" stroke="#00C9B1" strokeWidth="3" strokeLinecap="round"
            animate={{
              d: [
                'M2 112 Q18 104 35 112 Q52 120 68 112 Q84 104 100 112 Q116 120 130 112',
                'M2 112 Q18 120 35 112 Q52 104 68 112 Q84 120 100 112 Q116 104 130 112',
                'M2 112 Q18 104 35 112 Q52 120 68 112 Q84 104 100 112 Q116 120 130 112',
              ],
            }}
            transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
          />
          <motion.path
            d="M-5 122 Q15 114 35 122 Q55 130 75 122 Q95 114 115 122 Q135 130 145 122"
            fill="none" stroke="#00C9B1" strokeWidth="1.8" strokeLinecap="round"
            animate={{
              d: [
                'M-5 122 Q15 114 35 122 Q55 130 75 122 Q95 114 115 122 Q135 130 145 122',
                'M-5 122 Q15 130 35 122 Q55 114 75 122 Q95 130 115 122 Q135 114 145 122',
                'M-5 122 Q15 114 35 122 Q55 130 75 122 Q95 114 115 122 Q135 130 145 122',
              ],
            }}
            transition={{ repeat: Infinity, duration: 2.0, ease: 'easeInOut', delay: 0.4 }}
          />
          {/* Tiny floating bubbles */}
          {[
            { cx: 22, cy: 100, r: 3, delay: 0 },
            { cx: 88, cy: 96, r: 2, delay: 0.8 },
            { cx: 55, cy: 104, r: 1.5, delay: 1.5 },
          ].map((b, i) => (
            <motion.circle
              key={i} cx={b.cx} cy={b.cy} r={b.r}
              fill="none" stroke="#00C9B1" strokeWidth="1.5"
              animate={{ cy: [b.cy, b.cy - 14], opacity: [0.6, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, delay: b.delay, ease: 'easeOut' }}
            />
          ))}
        </g>
      )}

      {/* no-history: empty bar chart */}
      {scene === 'no-history' && (
        <g opacity="0.25" transform="translate(18, 0)">
          <rect x="0"  y="70" width="12" height="20" rx="3" fill="#94A3B8" />
          <rect x="18" y="58" width="12" height="32" rx="3" fill="#94A3B8" />
          <rect x="36" y="76" width="12" height="14" rx="3" fill="#94A3B8" />
          <rect x="54" y="64" width="12" height="26" rx="3" fill="#94A3B8" />
          <rect x="72" y="55" width="12" height="35" rx="3" fill="#94A3B8" />
          <line x1="-4" y1="92" x2="90" y2="92" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}

      {/* ── Floating mascot ── */}
      <motion.g
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
      >
        {/* Drop body */}
        <path
          d="M60 10 C40 10,18 30,18 55 C18 76,37 91,60 91 C83 91,102 76,102 55 C102 30,80 10,60 10 Z"
          fill={`url(#drop-${gid})`}
          filter={`url(#glow-${gid})`}
        />
        {/* Shine */}
        <ellipse
          cx="44" cy="34" rx="11" ry="7"
          fill={`url(#shine-${gid})`}
          transform="rotate(-18 44 34)"
        />

        {/* Face */}
        {sleeping ? (
          <>
            {/* Closed eyes */}
            <path d="M39 54 Q45 48 51 54" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M69 54 Q75 48 81 54" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            {/* Eyelashes */}
            <line x1="39" y1="54" x2="37" y2="57" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="81" y1="54" x2="83" y2="57" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            {/* Gentle smile */}
            <path d="M46 70 Q60 77 74 70" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </>
        ) : (
          <>
            {/* Open eyes */}
            <circle cx="45" cy="54" r="6.5" fill="white" />
            <circle cx="75" cy="54" r="6.5" fill="white" />
            <circle cx="46.5" cy="53" r="3.2" fill="#0A2D5A" />
            <circle cx="76.5" cy="53" r="3.2" fill="#0A2D5A" />
            {/* Eye shine */}
            <circle cx="47.8" cy="51.8" r="1.3" fill="white" />
            <circle cx="77.8" cy="51.8" r="1.3" fill="white" />
            {/* Smile */}
            <path d="M46 70 Q60 81 74 70" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </>
        )}

        {/* no-tests: test tube */}
        {scene === 'no-tests' && (
          <g transform="translate(98,40) rotate(22)">
            <rect x="-6" y="-22" width="12" height="34" rx="6" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="1.5" />
            <rect x="-5" y="7" width="10" height="9" rx="5" fill="#00C9B1" opacity="0.85" />
            {/* Liquid surface shimmer */}
            <path d="M-5 7 Q0 5 5 7" fill="none" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
            <rect x="-7" y="-27" width="14" height="8" rx="2.5" fill="#94A3B8" />
            {/* Bubbles in tube */}
            <circle cx="0" cy="-2" r="1.5" fill="white" opacity="0.5" />
            <circle cx="2" cy="-10" r="1" fill="white" opacity="0.35" />
          </g>
        )}

        {/* no-pools: magnifying glass */}
        {scene === 'no-pools' && (
          <g transform="translate(-8,42) rotate(-15)">
            <circle cx="0" cy="0" r="10" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" />
            <circle cx="0" cy="0" r="10" fill="rgba(255,255,255,0.12)" />
            {/* Cross hairs inside lens */}
            <line x1="-5" y1="0" x2="5" y2="0" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="0" y1="-5" x2="0" y2="5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="7" y1="7" x2="13" y2="13" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}
      </motion.g>

      {/* ZZZ floating particles (no-alerts) */}
      {sleeping &&
        [
          { x: 92, baseY: 52, size: 13, delay: 0 },
          { x: 100, baseY: 41, size: 10, delay: 0.65 },
          { x: 106, baseY: 33, size: 8,  delay: 1.25 },
        ].map((z, i) => (
          <motion.g key={i}
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: [-0, -18], opacity: [0, 0.75, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, delay: z.delay, ease: 'easeOut' }}
          >
            <text x={z.x} y={z.baseY} fontSize={z.size} fontWeight="800"
              fill="#00C9B1" textAnchor="middle" style={{ fontFamily: 'system-ui' }}>
              Z
            </text>
          </motion.g>
        ))}

      {/* Sparkle dots (no-history) */}
      {scene === 'no-history' &&
        [
          { cx: 16, cy: 20, delay: 0 },
          { cx: 108, cy: 28, delay: 0.5 },
          { cx: 18, cy: 72, delay: 1.1 },
          { cx: 110, cy: 68, delay: 0.8 },
        ].map((s, i) => (
          <motion.circle key={i} cx={s.cx} cy={s.cy} r="2.5" fill="#00C9B1"
            animate={{ scale: [0, 1.2, 0], opacity: [0, 0.6, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, delay: s.delay, ease: 'easeInOut' }}
          />
        ))}
    </svg>
  )
}

// ── Exported component ────────────────────────────────────────────────────────
export function EmptyStateView({ scene, title, description, action }: Props) {
  const def = DEFAULTS[scene]

  return (
    <motion.div
      className="py-10 px-6 text-center flex flex-col items-center"
      initial={{ opacity: 0, y: 22, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 360, damping: 28 }}
    >
      {/* Mascot illustration */}
      <div className="w-28 h-32 mb-5 select-none">
        <HydroMascot scene={scene} />
      </div>

      {/* Staggered text */}
      <motion.h3
        className="font-display font-bold text-slate-800 text-xl mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, type: 'spring', stiffness: 400, damping: 35 }}
      >
        {title ?? def.title}
      </motion.h3>

      <motion.p
        className="text-slate-400 text-sm max-w-[260px] mx-auto leading-relaxed mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14, type: 'spring', stiffness: 400, damping: 35 }}
      >
        {description ?? def.description}
      </motion.p>

      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 35 }}
        >
          <Link
            href={action.href}
            className="btn-teal inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm"
          >
            {action.label}
          </Link>
        </motion.div>
      )}
    </motion.div>
  )
}

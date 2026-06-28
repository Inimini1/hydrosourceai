'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { haptics } from '@/lib/haptics'

// HeroIcons-style: outline (strokeWidth 1.5) for inactive, solid for active
const tabs = [
  {
    label: 'Home',
    href: '/dashboard',
    activeOn: ['/dashboard'],
    icon: (active: boolean) =>
      active ? (
        // Home solid
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
          <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a.206.206 0 0 0 .091-.086L12 5.432Z" />
        </svg>
      ) : (
        // Home outline thin
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      ),
  },
  {
    label: 'Test',
    href: '/pools',
    activeOn: ['/pools'],
    badge: false,
    icon: (active: boolean) =>
      active ? (
        // Beaker solid
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" d="M10.5 3.798v5.02a3 3 0 0 1-.879 2.121l-2.377 2.377a9.845 9.845 0 0 1 5.091 1.013 8.315 8.315 0 0 0 5.713.636l.285-.071-3.954-3.955a3 3 0 0 1-.879-2.121v-5.02a23.614 23.614 0 0 0-3 0Zm4.5.138a.75.75 0 0 0 .093-1.495A24.837 24.837 0 0 0 12 2.25a25.048 25.048 0 0 0-3.093.191A.75.75 0 0 0 9 3.936v4.882a1.5 1.5 0 0 1-.44 1.06Ll-6.293 6.293A1.5 1.5 0 0 0 3.75 18a3.75 3.75 0 0 0 3.75 3.75h9a3.75 3.75 0 0 0 3.75-3.75 1.5 1.5 0 0 0-.44-1.06l-6.293-6.293A1.5 1.5 0 0 1 13.5 9V4.136l1.5-.2Z" clipRule="evenodd" />
        </svg>
      ) : (
        // Beaker outline thin
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 1-6.23-.693L4.2 15.3m15.6 0-1.2 3.6a2.25 2.25 0 0 1-2.16 1.65H7.56a2.25 2.25 0 0 1-2.16-1.65L4.2 15.3" />
        </svg>
      ),
  },
  {
    label: 'Alerts',
    href: '/notifications',
    activeOn: ['/notifications'],
    badge: true,
    icon: (active: boolean) =>
      active ? (
        // Bell solid
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0 1 13.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 0 1-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 1 1-7.48 0 24.585 24.585 0 0 1-4.831-1.244.75.75 0 0 1-.298-1.205A8.217 8.217 0 0 0 5.25 9.75V9Zm4.502 8.9a2.25 2.25 0 1 0 4.496 0 25.057 25.057 0 0 1-4.496 0Z" clipRule="evenodd" />
        </svg>
      ) : (
        // Bell outline thin
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
        </svg>
      ),
  },
  {
    label: 'Profile',
    href: '/account',
    activeOn: ['/account'],
    icon: (active: boolean) =>
      active ? (
        // User solid
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
        </svg>
      ) : (
        // User outline thin
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((d) => setUnread((d.notifications ?? []).filter((n: { read: boolean }) => !n.read).length))
      .catch(() => {})
  }, [pathname])

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 border-t border-slate-200/70"
      style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
    >
      {/* Beta ribbon */}
      <div className="flex justify-center pt-1.5">
        <span className="text-[9px] font-mono font-bold tracking-widest px-2.5 py-0.5 rounded-full"
          style={{ background: 'rgba(0,201,177,0.08)', color: '#00A99A', border: '1px solid rgba(0,201,177,0.20)' }}>
          BETA
        </span>
      </div>

      <div className="flex items-center justify-around h-14 max-w-2xl mx-auto px-2 pb-safe">
        {tabs.map((tab) => {
          const active = tab.activeOn.some((p) =>
            p === '/dashboard' ? pathname === p : pathname === p || pathname.startsWith(p + '/')
          )

          return (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={() => { if (!active) haptics.tab() }}
              className="flex flex-col items-center justify-center gap-1 flex-1 h-full"
              style={{ color: active ? '#00A99A' : '#94a3b8' }}
            >
              <div className="relative">
                {active && (
                  <motion.div
                    layoutId="tab-active-bg"
                    className="absolute -inset-2 rounded-xl"
                    style={{ background: 'rgba(0,201,177,0.10)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}

                <motion.div
                  className="relative z-10"
                  animate={{ color: active ? '#00A99A' : '#94A3B8' }}
                  whileTap={{ scale: 0.82 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  {tab.icon(active)}
                </motion.div>

                {tab.badge && unread > 0 && (
                  <span
                    className="absolute -top-1 -right-1.5 w-4 h-4 text-white text-[9px] font-bold rounded-full flex items-center justify-center"
                    style={{ background: '#dc2626' }}
                  >
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </div>

              <motion.span
                className="text-[10px] font-mono font-medium tracking-wider uppercase"
                animate={{ color: active ? '#00A99A' : '#94a3b8' }}
                transition={{ duration: 0.15 }}
              >
                {tab.label}
              </motion.span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

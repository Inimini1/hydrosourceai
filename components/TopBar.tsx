'use client'

import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { HydroSourceLogo } from '@/components/brand'

export default function TopBar() {
  const { user } = useAuth()

  const initials = ((user?.displayName || user?.email || 'U')[0]).toUpperCase()
  const avatarColor = user?.avatarColor ?? '#006FFF'

  return (
    <header className="fixed top-0 inset-x-0 z-40 border-b border-white/8"
      style={{ background: 'rgba(11,17,32,0.85)', backdropFilter: 'blur(20px)' }}>
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <HydroSourceLogo size={32} variant="dark" />
          <span className="font-display font-bold text-white tracking-tight group-hover:opacity-80 transition-opacity">HydroSource</span>
          <span className="text-[10px] font-bold bg-teal-500/20 text-teal-400 border border-teal-500/30 px-2 py-0.5 rounded-full tracking-wider">BETA</span>
        </Link>

        <div className="flex items-center gap-2.5">
          {user?.subscriptionStatus !== 'PRO' && (
            <Link
              href="/billing"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold bg-pool-600/20 text-pool-400 border border-pool-500/30 px-3 py-1.5 rounded-full hover:bg-pool-600/30 transition-all duration-200"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Upgrade
            </Link>
          )}
          <Link
            href="/account"
            aria-label="Account settings"
            className="w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-white text-sm hover:scale-105 transition-transform duration-200"
            style={{
              background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}99)`,
              boxShadow: `0 0 14px ${avatarColor}40`,
            }}
          >
            {initials}
          </Link>
        </div>
      </div>
    </header>
  )
}

'use client'

import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { HydroSourceLogo } from '@/components/brand'

export default function TopBar() {
  const { user } = useAuth()

  const initials = ((user?.displayName || user?.email || 'U')[0]).toUpperCase()
  const avatarColor = user?.avatarColor ?? '#00C9B1'

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-white" style={{ borderBottom: '1px solid rgba(6,27,49,0.08)' }}>
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <HydroSourceLogo size={32} variant="light" />
          <span className="font-semibold tracking-tight group-hover:opacity-70 transition-opacity" style={{ color: '#061b31' }}>HydroSource AI</span>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full tracking-wider"
            style={{ background: 'rgba(0,201,177,0.10)', color: '#00C9B1', border: '1px solid rgba(0,201,177,0.20)' }}>BETA</span>
        </Link>

        <div className="flex items-center gap-2.5">
          {user?.subscriptionStatus !== 'PRO' && (
            <Link
              href="/billing"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-150"
              style={{ background: 'rgba(0,201,177,0.08)', color: '#00C9B1', border: '1px solid rgba(0,201,177,0.20)' }}
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
            className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-white text-sm hover:opacity-90 transition-opacity duration-150"
            style={{ background: avatarColor }}
          >
            {initials}
          </Link>
        </div>
      </div>
    </header>
  )
}

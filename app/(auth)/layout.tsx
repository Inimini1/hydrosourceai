import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { HydroSourceLogo } from '@/components/brand'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <div className="min-h-screen auth-mesh overflow-hidden">
      {/* Nav */}
      <div className="relative z-10 p-5">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <HydroSourceLogo size={36} variant="light" />
          <span className="font-display font-bold text-slate-900 tracking-tight group-hover:opacity-70 transition-opacity">HydroSource AI</span>
        </Link>
      </div>

      <div className="relative z-10 flex items-center justify-center px-4 pb-12 min-h-[calc(100vh-80px)]">
        {children}
      </div>

      <div className="relative z-10 pb-6 flex flex-wrap justify-center gap-6 text-xs text-slate-400">
        <Link href="/legal/terms" className="hover:text-slate-600 transition-colors">Terms of Service</Link>
        <Link href="/legal/privacy" className="hover:text-slate-600 transition-colors">Privacy Policy</Link>
        <Link href="/legal/accessibility" className="hover:text-slate-600 transition-colors">Accessibility</Link>
      </div>
    </div>
  )
}

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import Link from 'next/link'
import { HydroSourceLogo } from '@/components/brand'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get('HydroSource_token')?.value
  if (token) {
    try {
      await verifyToken(token)
      redirect('/dashboard')
    } catch {}
  }

  return (
    <div className="min-h-screen bg-ink text-white overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, #006FFF 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #00D4AA 0%, transparent 70%)' }} />
      </div>

      {/* Nav */}
      <div className="relative z-10 p-5">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <HydroSourceLogo size={36} variant="dark" />
          <span className="font-display font-bold text-white tracking-tight group-hover:opacity-80 transition-opacity">HydroSource</span>
        </Link>
      </div>

      <div className="relative z-10 flex items-center justify-center px-4 pb-12 min-h-[calc(100vh-80px)]">
        {children}
      </div>
    </div>
  )
}

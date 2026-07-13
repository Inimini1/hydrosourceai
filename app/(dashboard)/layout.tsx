import { AuthProvider } from '@/components/AuthProvider'
import { EmailVerificationBanner } from '@/components/EmailVerificationBanner'
import BottomNav from '@/components/BottomNav'
import { PageTransition } from '@/components/PageTransition'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <main className="flex-1 pb-36 min-h-screen overflow-x-hidden mesh-bg bg-page">
        <div className="max-w-2xl mx-auto overflow-x-hidden">
          <EmailVerificationBanner />
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </main>
      <BottomNav />
    </AuthProvider>
  )
}

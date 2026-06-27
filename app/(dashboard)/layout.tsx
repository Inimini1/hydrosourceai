import { AuthProvider } from '@/components/AuthProvider'
import { ThemeProvider } from '@/components/ThemeProvider'
import { EmailVerificationBanner } from '@/components/EmailVerificationBanner'
import { BetaFeedback } from '@/components/BetaFeedback'
import BottomNav from '@/components/BottomNav'
import { PageTransition } from '@/components/PageTransition'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <main className="flex-1 pb-36 min-h-screen overflow-x-hidden mesh-bg">
          <div className="max-w-2xl mx-auto overflow-x-hidden">
            <EmailVerificationBanner />
            <PageTransition>
              {children}
            </PageTransition>
          </div>
        </main>
        <BetaFeedback />
        <BottomNav />
      </ThemeProvider>
    </AuthProvider>
  )
}

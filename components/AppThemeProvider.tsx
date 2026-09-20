'use client'

import { ThemeProvider } from '@/components/ThemeProvider'
import { useAuth } from '@/components/AuthProvider'

// Bridges the authenticated user's saved accent color (avatarColor) into
// ThemeProvider — must live inside AuthProvider's tree to read useAuth().
export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  return <ThemeProvider initialAccent={user?.avatarColor}>{children}</ThemeProvider>
}

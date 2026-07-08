'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface AuthUser {
  id: string
  email: string
  role: string
  subscriptionStatus: string
  displayName: string | null
  avatarColor: string | null
  onboardingComplete: boolean
  emailVerified: boolean
  experienceLevel: string | null
  primaryGoal: string | null
}

interface AuthCtx {
  user: AuthUser | null
  loading: boolean
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]     = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const { user: u } = await res.json()
        setUser(u)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    window.location.href = '/login'
  }

  useEffect(() => {
    refresh()

    // Listen for Supabase auth state changes (token refresh, sign-out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setLoading(false)
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        refresh()
      }
    })

    return () => subscription.unsubscribe()
  }, [refresh, supabase.auth])

  return <Ctx.Provider value={{ user, loading, logout, refresh }}>{children}</Ctx.Provider>
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

/** Same as useAuth(), but returns null instead of throwing when rendered
 *  outside an AuthProvider (e.g. on public pages like the landing page). */
export function useAuthOptional(): AuthCtx | null {
  return useContext(Ctx)
}

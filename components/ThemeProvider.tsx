'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'

const THEME_KEY = 'hydrosource-theme'
const ACCENT_KEY = 'hydrosource-accent'
const DEFAULT_ACCENT = '#00C9B1'

function darkenHex(hex: string, amount = 0.12): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!m) return hex
  const [, r, g, b] = m
  const channel = (h: string) => Math.max(0, Math.round(parseInt(h, 16) * (1 - amount)))
    .toString(16).padStart(2, '0')
  return `#${channel(r)}${channel(g)}${channel(b)}`
}

function applyTheme(mode: ThemeMode) {
  const isDark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', isDark)
}

function applyAccent(hex: string) {
  document.documentElement.style.setProperty('--teal', hex)
  document.documentElement.style.setProperty('--pool-primary', hex)
  document.documentElement.style.setProperty('--teal-dark', darkenHex(hex))
}

interface ThemeCtx {
  theme: ThemeMode
  setTheme: (mode: ThemeMode) => void
  accent: string
  setAccent: (hex: string) => void
}

const Ctx = createContext<ThemeCtx | null>(null)

export function ThemeProvider({ children, initialAccent }: { children: ReactNode; initialAccent?: string | null }) {
  const [theme, setThemeState] = useState<ThemeMode>('system')
  const [accent, setAccentState] = useState(initialAccent || DEFAULT_ACCENT)

  // Apply saved/OS preference on mount, before paint where possible.
  useEffect(() => {
    const savedTheme = (localStorage.getItem(THEME_KEY) as ThemeMode | null) ?? 'system'
    setThemeState(savedTheme)
    applyTheme(savedTheme)

    const savedAccent = localStorage.getItem(ACCENT_KEY)
    const resolvedAccent = savedAccent || initialAccent || DEFAULT_ACCENT
    setAccentState(resolvedAccent)
    applyAccent(resolvedAccent)

    if (savedTheme === 'system') {
      const mql = window.matchMedia('(prefers-color-scheme: dark)')
      const onChange = () => applyTheme('system')
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // AuthProvider resolves the user (and their saved avatarColor/accent) after
  // this component mounts — pick it up once it arrives, but only when the
  // visitor hasn't already chosen an accent locally.
  useEffect(() => {
    if (!initialAccent) return
    if (localStorage.getItem(ACCENT_KEY)) return
    setAccentState(initialAccent)
    applyAccent(initialAccent)
  }, [initialAccent])

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode)
    localStorage.setItem(THEME_KEY, mode)
    applyTheme(mode)
  }, [])

  const setAccent = useCallback((hex: string) => {
    setAccentState(hex)
    localStorage.setItem(ACCENT_KEY, hex)
    applyAccent(hex)
  }, [])

  return (
    <Ctx.Provider value={{ theme, setTheme, accent, setAccent }}>
      {children}
    </Ctx.Provider>
  )
}

export function useTheme(): ThemeCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
  return ctx
}

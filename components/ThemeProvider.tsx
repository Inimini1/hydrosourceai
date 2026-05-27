'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProvider({ children, initialTheme }: { children: React.ReactNode; initialTheme?: string }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (initialTheme === 'dark') return 'dark'
    return 'light'
  })

  useEffect(() => {
    // Sync from localStorage on mount (client-side preference takes priority)
    const stored = localStorage.getItem('HydroSource-theme') as Theme | null
    if (stored === 'dark' || stored === 'light') {
      setThemeState(stored)
    }
  }, [])

  const applyTheme = useCallback((t: Theme) => {
    setThemeState(t)
    localStorage.setItem('HydroSource-theme', t)
    // Persist to server (non-blocking)
    fetch('/api/account/theme', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: t }),
    }).catch(() => {})
  }, [])

  const toggleTheme = useCallback(() => {
    applyTheme(theme === 'light' ? 'dark' : 'light')
  }, [theme, applyTheme])

  const setTheme = useCallback((t: Theme) => {
    applyTheme(t)
  }, [applyTheme])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      <div className={theme === 'dark' ? 'dark' : ''} style={{ minHeight: '100vh', background: 'var(--page-bg)' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

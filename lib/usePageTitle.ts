'use client'

import { useEffect } from 'react'

const BASE = 'HydroSource'

export function usePageTitle(title: string) {
  useEffect(() => {
    const prev = document.title
    document.title = title ? `${title} — ${BASE}` : `${BASE} — Pool Intelligence`
    return () => { document.title = prev }
  }, [title])
}

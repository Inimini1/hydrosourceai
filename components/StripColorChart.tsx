'use client'

import { useState } from 'react'
import { getBrandChart } from '@/lib/stripBrandColors'

/** Customer-facing color reference chart for the selected test strip brand —
 *  the same brand/value/color data the AI uses to read the photo, so users
 *  can see exactly what a "good" reading looks like before they scan. */
export function StripColorChart({ brand }: { brand: string }) {
  const [open, setOpen] = useState(false)
  const chart = getBrandChart(brand)

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 transition-colors"
        style={{ background: 'rgba(0,201,177,0.05)' }}
      >
        <span className="text-xs font-semibold text-slate-600">
          🎨 View {chart.name} color chart
        </span>
        <svg
          className="w-4 h-4 text-slate-400 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="p-4 space-y-4 bg-white">
          <p className="text-[11px] text-slate-400 leading-relaxed">{chart.note}</p>

          {chart.params.map((param) => (
            <div key={param.label}>
              <p className="text-xs font-semibold text-slate-600 mb-1.5">{param.label}</p>
              <div className="flex gap-1">
                {param.swatches.map((s) => (
                  <div key={s.value} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full h-7 rounded-lg"
                      style={{
                        background: s.hex,
                        border: s.ideal ? '2px solid #0d9488' : '1px solid rgba(0,0,0,0.08)',
                      }}
                      title={`${param.label}: ${s.value}${param.unit}`}
                    />
                    <span
                      className="text-[9px] font-mono leading-none"
                      style={{ color: s.ideal ? '#0d9488' : '#94a3b8', fontWeight: s.ideal ? 700 : 400 }}
                    >
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <p className="text-[10px] text-slate-400 pt-1" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <span style={{ color: '#0d9488', fontWeight: 700 }}>Teal outline</span> = ideal range. Colors are a reference
            guide — actual strip colors vary slightly by lighting and strip age.
          </p>
        </div>
      )}
    </div>
  )
}

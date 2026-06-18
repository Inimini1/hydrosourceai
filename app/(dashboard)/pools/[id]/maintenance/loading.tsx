export default function MaintenanceLoading() {
  return (
    <div className="pb-8 -mx-4 -mt-4 px-4 pt-4 min-h-screen animate-pulse"
      style={{ background: 'linear-gradient(180deg, #0B1E2D 0%, #0B1528 100%)' }}>
      <div className="pt-8 pb-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-2xl" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div className="space-y-1.5">
          <div className="h-6 w-36 rounded-xl" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <div className="h-3 w-24 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-16 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }} />
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 rounded-3xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }} />
        ))}
      </div>
    </div>
  )
}

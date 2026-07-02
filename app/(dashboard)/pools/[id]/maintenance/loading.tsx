export default function MaintenanceLoading() {
  return (
    <div className="pb-8 px-4 pt-4 min-h-screen animate-pulse bg-slate-50">
      <div className="pt-8 pb-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-2xl skeleton" />
        <div className="space-y-1.5">
          <div className="h-6 w-36 rounded-xl skeleton" />
          <div className="h-3 w-24 rounded-full skeleton" />
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-16 rounded-2xl skeleton" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 rounded-3xl skeleton" />
        ))}
      </div>
    </div>
  )
}

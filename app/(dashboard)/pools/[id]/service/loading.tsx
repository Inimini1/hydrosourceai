export default function Loading() {
  return (
    <div className="pb-6 animate-pulse">
      {/* Header */}
      <div className="px-4 pt-12 pb-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-2xl bg-slate-200 flex-shrink-0" />
        <div>
          <div className="h-6 w-28 bg-slate-200 rounded-lg mb-1.5" />
          <div className="h-3 w-40 bg-slate-100 rounded" />
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Service type chips */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100">
          <div className="h-3 w-24 bg-slate-200 rounded mb-3" />
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-9 bg-slate-100 rounded-2xl" />)}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100">
          <div className="h-3 w-16 bg-slate-200 rounded mb-3" />
          <div className="h-24 bg-slate-100 rounded-xl" />
        </div>

        {/* Chemicals used */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100">
          <div className="h-3 w-32 bg-slate-200 rounded mb-3" />
          <div className="space-y-2">
            {[1, 2].map((i) => <div key={i} className="h-11 bg-slate-100 rounded-xl" />)}
          </div>
        </div>

        <div className="h-14 bg-slate-200 rounded-2xl" />
      </div>
    </div>
  )
}

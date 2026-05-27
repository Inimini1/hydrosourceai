export default function Loading() {
  return (
    <div className="pb-6 animate-pulse">
      {/* Header */}
      <div className="px-4 pt-12 pb-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-2xl bg-slate-200 flex-shrink-0" />
        <div className="flex-1">
          <div className="h-6 w-36 bg-slate-200 rounded-lg mb-1.5" />
          <div className="h-3 w-28 bg-slate-100 rounded" />
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Reminder banner placeholder */}
        <div className="h-16 bg-slate-100 rounded-2xl" />

        {/* Treatment plan card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100">
          <div className="h-4 w-32 bg-slate-200 rounded mb-3" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-3 bg-slate-100 rounded w-full" />)}
            <div className="h-3 bg-slate-100 rounded w-3/4" />
          </div>
        </div>

        {/* Chart cards × 3 */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-3xl p-5 border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="h-4 w-24 bg-slate-200 rounded mb-1" />
                <div className="h-3 w-16 bg-slate-100 rounded" />
              </div>
              <div className="h-8 w-16 bg-slate-100 rounded-xl" />
            </div>
            {/* Chart area */}
            <div className="h-36 bg-slate-50 rounded-2xl" />
          </div>
        ))}

        {/* Test log list */}
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="h-4 w-28 bg-slate-200 rounded" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="px-5 py-4 border-b border-slate-50 last:border-0 flex items-center justify-between">
              <div>
                <div className="h-3.5 w-24 bg-slate-200 rounded mb-1.5" />
                <div className="h-3 w-32 bg-slate-100 rounded" />
              </div>
              <div className="h-6 w-16 bg-slate-100 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

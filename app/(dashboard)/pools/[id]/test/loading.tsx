export default function Loading() {
  return (
    <div className="pb-6 animate-pulse">
      {/* Header */}
      <div className="px-4 pt-12 pb-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-2xl bg-slate-200 flex-shrink-0" />
        <div>
          <div className="h-6 w-28 bg-slate-200 rounded-lg mb-1.5" />
          <div className="h-3 w-36 bg-slate-100 rounded" />
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Tab selector */}
        <div className="bg-white rounded-2xl p-1 flex gap-1 border border-slate-100">
          <div className="flex-1 h-10 bg-slate-200 rounded-2xl" />
          <div className="flex-1 h-10 bg-slate-100 rounded-2xl" />
        </div>

        {/* Section label */}
        <div className="flex items-center justify-between px-0.5">
          <div className="h-4 w-32 bg-slate-200 rounded" />
          <div className="h-6 w-20 bg-slate-100 rounded-lg" />
        </div>

        {/* Parameter sliders × 3 */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="h-4 w-28 bg-slate-200 rounded" />
              <div className="h-7 w-12 bg-slate-100 rounded-lg" />
            </div>
            <div className="h-10 bg-slate-100 rounded-full" />
            <div className="flex justify-between mt-1">
              <div className="h-2.5 w-8 bg-slate-100 rounded" />
              <div className="h-2.5 w-20 bg-slate-100 rounded" />
              <div className="h-2.5 w-8 bg-slate-100 rounded" />
            </div>
          </div>
        ))}

        {/* Analyze button */}
        <div className="h-14 bg-slate-200 rounded-2xl" />
      </div>
    </div>
  )
}

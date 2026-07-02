// Skeleton — mirrors actual dashboard layout
export default function Loading() {
  return (
    <div className="pb-6" style={{ minHeight: '100vh' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <div className="space-y-2">
          <div className="h-2.5 w-20 rounded-full skeleton" style={{ borderRadius: 99 }} />
          <div className="h-7 w-44 rounded-xl skeleton" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl skeleton" />
          <div className="w-10 h-10 rounded-2xl skeleton" />
        </div>
      </div>

      {/* Hero — droplet blob + labels */}
      <div className="flex flex-col items-center justify-center py-8 px-4 min-h-[320px]">
        <div
          className="w-52 h-52 skeleton"
          style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }}
        />
        <div className="mt-7 flex flex-col items-center gap-2.5">
          <div className="h-2.5 w-24 rounded-full skeleton" />
          <div className="h-7 w-52 rounded-xl skeleton" />
          <div className="h-4 w-64 rounded-lg skeleton" />
          <div className="h-3 w-36 rounded-full skeleton mt-0.5" />
        </div>
      </div>

      {/* Bento 2×2 */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-xl p-5 min-h-[148px] flex flex-col justify-between bg-white"
            style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-between">
              <div className="h-2.5 w-16 rounded-full skeleton" />
              <div className="w-8 h-8 rounded-full skeleton" />
            </div>
            <div>
              <div className="h-10 w-16 rounded-lg skeleton" />
              <div className="h-2.5 w-20 rounded-full mt-2 skeleton" />
            </div>
          </div>
        ))}
        {[0, 1].map((i) => (
          <div key={i} className="rounded-xl p-5 min-h-[120px] flex flex-col justify-between bg-white"
            style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="h-2.5 w-20 rounded-full skeleton" />
            <div>
              <div className="h-8 w-14 rounded-lg skeleton" />
              <div className="h-2.5 w-16 rounded-full mt-1.5 skeleton" />
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="px-4 mt-3 grid grid-cols-2 gap-3">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-xl px-4 py-4 flex items-center gap-3 bg-white"
            style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="w-8 h-8 rounded-lg flex-shrink-0 skeleton" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-20 rounded skeleton" />
              <div className="h-2.5 w-14 rounded skeleton" />
            </div>
          </div>
        ))}
      </div>

      {/* 30-day trends panel */}
      <div className="px-4 mt-3">
        <div className="rounded-xl p-5 bg-white"
          style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 w-28 rounded-lg skeleton" />
            <div className="h-3 w-16 rounded skeleton" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[0, 1].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-14 rounded-full skeleton" />
                <div className="h-6 w-16 rounded skeleton" />
                <div className="h-11 w-full rounded-xl skeleton" />
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}

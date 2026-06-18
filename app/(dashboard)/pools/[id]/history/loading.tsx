// Skeleton for /pools/[id]/history — mirrors chart layout
export default function Loading() {
  return (
    <div className="pb-8">
      {/* Header */}
      <div className="px-4 pt-12 pb-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-2xl flex-shrink-0 skeleton" />
        <div className="space-y-2">
          <div className="h-6 w-40 rounded-xl skeleton" />
          <div className="h-3 w-36 rounded-full skeleton" />
        </div>
      </div>

      {/* Time filter pills */}
      <div className="px-4 mb-5">
        <div className="card-light p-1 flex gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`flex-1 h-9 rounded-2xl skeleton ${i === 1 ? 'opacity-100' : 'opacity-60'}`} />
          ))}
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* AI Treatment Plan card */}
        <div className="card-light p-5 rounded-3xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex-shrink-0 skeleton" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded skeleton" />
              <div className="h-3 w-48 rounded-full skeleton" />
            </div>
            <div className="w-4 h-4 rounded skeleton flex-shrink-0" />
          </div>
        </div>

        {/* Chart cards × 3 */}
        {[0, 1, 2].map((i) => (
          <div key={i} className="card-light p-4 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-1.5">
                <div className="h-3 w-24 rounded skeleton" />
                <div className="h-2.5 w-16 rounded-full skeleton" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 w-20 rounded-xl skeleton" />
                <div className="h-8 w-16 rounded-xl skeleton" />
              </div>
            </div>
            {/* Chart area */}
            <div className="h-[76px] rounded-xl skeleton" />
            <div className="flex justify-between mt-1.5">
              <div className="h-2.5 w-10 rounded-full skeleton" />
              <div className="h-2.5 w-10 rounded-full skeleton" />
            </div>
            {/* Insight bar */}
            <div className="mt-3 h-9 rounded-xl skeleton" />
          </div>
        ))}

        {/* Test log list */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="h-4 w-16 rounded skeleton" />
            <div className="h-8 w-20 rounded-xl skeleton" />
          </div>
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="card-light p-4 rounded-3xl flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full skeleton flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-24 rounded skeleton" />
                  <div className="h-3 w-40 rounded-full skeleton" />
                  <div className="h-1.5 w-full rounded-full skeleton mt-2" />
                </div>
                <div className="h-7 w-8 rounded skeleton flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

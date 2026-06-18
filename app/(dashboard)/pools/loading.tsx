// Skeleton for /pools list — mirrors pool card list on dark mesh bg
export default function Loading() {
  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-4 pt-12 pb-5 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-28 rounded-xl skeleton" />
          <div className="h-3 w-36 rounded-full skeleton" />
        </div>
        <div className="h-10 w-28 rounded-2xl skeleton" />
      </div>

      <div className="px-4 space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card-light rounded-3xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex-shrink-0 skeleton" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded-lg skeleton" />
              <div className="h-3 w-24 rounded-full skeleton" />
            </div>
            <div className="h-7 w-16 rounded-full skeleton flex-shrink-0" />
            <div className="w-4 h-4 rounded skeleton flex-shrink-0" />
          </div>
        ))}

        {/* Dashed add-pool placeholder */}
        <div className="rounded-3xl h-14"
          style={{ border: '2px dashed rgba(203,213,225,0.4)' }} />
      </div>
    </div>
  )
}

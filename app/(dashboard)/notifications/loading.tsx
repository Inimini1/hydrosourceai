// Skeleton for /notifications — mirrors notification card list
export default function Loading() {
  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-4 pt-12 pb-5 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-20 rounded-xl skeleton" />
          <div className="h-3 w-28 rounded-full skeleton" />
        </div>
        <div className="h-8 w-24 rounded-xl skeleton" />
      </div>

      <div className="px-4 space-y-2.5">
        {/* Notification items — vary opacity to feel realistic */}
        {[1, 0.85, 0.7, 0.55, 0.4].map((opacity, i) => (
          <div key={i} className="card-light rounded-3xl p-4 flex items-start gap-3.5" style={{ opacity }}>
            <div className="w-10 h-10 rounded-2xl flex-shrink-0 skeleton" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-4 w-32 rounded skeleton" />
                <div className="w-2 h-2 rounded-full skeleton flex-shrink-0" />
              </div>
              <div className="h-3 w-full rounded-full skeleton" />
              <div className="h-3 w-3/4 rounded-full skeleton" />
              <div className="h-2.5 w-20 rounded-full skeleton" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Skeleton for /pools/[id] — mirrors pool detail layout
export default function Loading() {
  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-4 pt-12 pb-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-2xl flex-shrink-0 skeleton" />
        <div className="flex-1 space-y-2">
          <div className="h-6 w-40 rounded-xl skeleton" />
          <div className="h-3 w-28 rounded-full skeleton" />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="h-7 w-16 rounded-full skeleton" />
          <div className="w-9 h-9 rounded-2xl skeleton" />
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Test reminder banner */}
        <div className="h-14 rounded-2xl skeleton" />

        {/* 3-column chemistry metrics */}
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card-light rounded-3xl p-4 text-center space-y-2">
              <div className="h-3 w-14 rounded-full skeleton mx-auto" />
              <div className="h-8 w-12 rounded-lg skeleton mx-auto" />
              <div className="h-2.5 w-10 rounded-full skeleton mx-auto" />
            </div>
          ))}
        </div>

        {/* 2-column quick actions */}
        <div className="grid grid-cols-2 gap-3">
          {[0, 1].map((i) => (
            <div key={i} className="card-light rounded-3xl p-5 flex flex-col items-center gap-2.5">
              <div className="w-12 h-12 rounded-2xl skeleton" />
              <div className="space-y-1.5 text-center">
                <div className="h-4 w-20 rounded skeleton mx-auto" />
                <div className="h-3 w-24 rounded-full skeleton mx-auto" />
              </div>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="card-light rounded-3xl p-4 grid grid-cols-3 divide-x divide-slate-100">
          {[0, 1, 2].map((i) => (
            <div key={i} className="text-center px-3 space-y-1.5">
              <div className="h-6 w-10 rounded-lg skeleton mx-auto" />
              <div className="h-2.5 w-14 rounded-full skeleton mx-auto" />
            </div>
          ))}
        </div>

        {/* History link */}
        <div className="card-light rounded-3xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl skeleton flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-24 rounded skeleton" />
            <div className="h-3 w-36 rounded-full skeleton" />
          </div>
          <div className="w-4 h-4 rounded skeleton flex-shrink-0" />
        </div>
      </div>
    </div>
  )
}

// Skeleton for /account — mirrors profile card, appearance toggle, usage bar, password form
export default function Loading() {
  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-4 pt-12 pb-5">
        <div className="h-7 w-20 rounded-xl skeleton" />
        <div className="h-3 w-48 rounded-full skeleton mt-2" />
      </div>

      <div className="px-4 space-y-4">
        {/* Profile card */}
        <div className="card-light p-5 rounded-3xl">
          <div className="h-2.5 w-20 rounded-full skeleton mb-4" />
          {/* Avatar + email row */}
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-2xl flex-shrink-0 skeleton" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-44 rounded skeleton" />
              <div className="h-3 w-32 rounded-full skeleton" />
            </div>
          </div>
          {/* Display name input */}
          <div className="mb-4 space-y-2">
            <div className="h-3.5 w-24 rounded skeleton" />
            <div className="h-11 w-full rounded-2xl skeleton" />
            <div className="h-2.5 w-48 rounded-full skeleton" />
          </div>
          {/* Color picker row */}
          <div className="mb-5 space-y-3">
            <div className="h-3.5 w-24 rounded skeleton" />
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="w-9 h-9 rounded-xl skeleton" />
              ))}
            </div>
          </div>
          {/* Save button */}
          <div className="h-11 w-full rounded-2xl skeleton" />
        </div>

        {/* Appearance toggle */}
        <div className="card-light p-5 rounded-3xl">
          <div className="h-2.5 w-24 rounded-full skeleton mb-4" />
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="h-3.5 w-20 rounded skeleton" />
              <div className="h-3 w-36 rounded-full skeleton" />
            </div>
            <div className="w-14 h-7 rounded-full skeleton flex-shrink-0" />
          </div>
        </div>

        {/* Usage bar */}
        <div className="card-light p-5 rounded-3xl">
          <div className="h-2.5 w-24 rounded-full skeleton mb-4" />
          <div className="flex items-center justify-between mb-2.5">
            <div className="h-3.5 w-24 rounded skeleton" />
            <div className="h-3.5 w-12 rounded skeleton" />
          </div>
          <div className="h-2 w-full rounded-full skeleton" />
        </div>

        {/* Password form */}
        <div className="card-light p-5 rounded-3xl">
          <div className="h-2.5 w-32 rounded-full skeleton mb-4" />
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3.5 w-28 rounded skeleton" />
                <div className="h-11 w-full rounded-2xl skeleton" />
              </div>
            ))}
            <div className="h-12 w-full rounded-2xl skeleton" />
          </div>
        </div>

        {/* Danger zone */}
        <div className="rounded-3xl p-5" style={{ border: '1px solid rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.03)' }}>
          <div className="h-2.5 w-24 rounded-full skeleton mb-4" />
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="space-y-1.5">
              <div className="h-3.5 w-16 rounded skeleton" />
              <div className="h-3 w-32 rounded-full skeleton" />
            </div>
            <div className="h-4 w-16 rounded skeleton" />
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="space-y-1.5">
              <div className="h-3.5 w-24 rounded skeleton" />
              <div className="h-3 w-40 rounded-full skeleton" />
            </div>
            <div className="h-4 w-14 rounded skeleton" />
          </div>
        </div>
      </div>
    </div>
  )
}

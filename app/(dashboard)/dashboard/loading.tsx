export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-8 w-48 bg-gray-200 rounded-lg mb-2" />
        <div className="h-4 w-64 bg-gray-100 rounded" />
      </div>
      {[1, 2].map((i) => (
        <div key={i} className="card p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="h-5 w-32 bg-gray-200 rounded mb-1.5" />
              <div className="h-3 w-24 bg-gray-100 rounded" />
            </div>
            <div className="h-5 w-16 bg-gray-100 rounded-full" />
          </div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[1, 2, 3].map((j) => (
              <div key={j} className="bg-slate-50 rounded-lg p-2 h-14" />
            ))}
          </div>
          <div className="flex gap-2">
            <div className="flex-1 h-10 bg-gray-200 rounded-lg" />
            <div className="flex-1 h-10 bg-gray-100 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

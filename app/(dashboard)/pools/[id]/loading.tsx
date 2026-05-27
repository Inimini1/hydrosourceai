export default function Loading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 bg-gray-200 rounded" />
        <div>
          <div className="h-6 w-36 bg-gray-200 rounded mb-1" />
          <div className="h-3 w-24 bg-gray-100 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-4 h-20" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-5 h-28" />
        <div className="card p-5 h-28" />
      </div>
      <div className="card p-4 h-16" />
    </div>
  )
}

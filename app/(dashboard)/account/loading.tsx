export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-28 bg-gray-200 rounded-lg" />
      <div className="card p-5">
        <div className="h-3 w-12 bg-gray-100 rounded mb-4" />
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gray-200 rounded-2xl flex-shrink-0" />
          <div className="space-y-1.5">
            <div className="h-4 w-40 bg-gray-200 rounded" />
            <div className="h-3 w-28 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
      <div className="card p-5 h-32" />
      <div className="card p-5 h-64" />
    </div>
  )
}

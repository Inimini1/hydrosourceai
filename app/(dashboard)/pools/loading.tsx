export default function Loading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-20 bg-gray-200 rounded-lg" />
        <div className="h-9 w-28 bg-gray-200 rounded-lg" />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="card p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="h-5 w-36 bg-gray-200 rounded mb-1.5" />
              <div className="h-3 w-24 bg-gray-100 rounded" />
            </div>
            <div className="h-5 w-14 bg-gray-100 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

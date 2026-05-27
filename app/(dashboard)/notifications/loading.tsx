export default function Loading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-8 w-40 bg-gray-200 rounded-lg" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="card p-4 flex items-start gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-3 w-full bg-gray-100 rounded" />
            <div className="h-3 w-20 bg-gray-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

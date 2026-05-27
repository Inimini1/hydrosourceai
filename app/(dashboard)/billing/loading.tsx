export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-20 bg-gray-200 rounded-lg" />
      <div className="card p-5 h-28" />
      <div className="space-y-3">
        <div className="card p-5 h-64 border-2 border-gray-100" />
        <div className="card p-5 h-48" />
      </div>
    </div>
  )
}

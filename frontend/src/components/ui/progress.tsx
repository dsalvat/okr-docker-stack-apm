export function Progress({ value }: { value: number }) {
  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div className="h-full bg-primary-500" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  )
}

/** Generic loading state for detail and table pages: a title, a few cards, then rows. */
export function PageSkeleton({ label = 'Loading' }: { label?: string }) {
  return (
    <div
      className="flex flex-col gap-6"
      aria-busy="true"
      aria-label={label}
      role="status"
    >
      <div className="flex flex-col gap-3">
        <div className="sk h-9 w-56 rounded-lg" />
        <div className="sk h-4 w-72 max-w-full rounded-md" />
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="sk h-24 rounded-3xl" />
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-3xl border border-border bg-surface p-5"
          >
            <div className="sk h-12 w-12 rounded-xl" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="sk h-4 w-40 rounded-md" />
              <div className="sk h-3.5 w-56 max-w-full rounded-md" />
            </div>
            <div className="sk h-5 w-16 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}

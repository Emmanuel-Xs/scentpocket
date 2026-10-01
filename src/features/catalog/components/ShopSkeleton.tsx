function Card() {
  return (
    <div className="flex flex-col gap-3.5" aria-hidden="true">
      <div className="sk aspect-4/5 rounded-[22px]" />
      <div className="sk h-3.5 w-2/5 rounded-md" />
      <div className="sk h-7.5 w-3/4 rounded-lg" />
      <div className="sk h-3.5 w-3/5 rounded-md" />
      <div className="sk h-4.5 w-[30%] rounded-md" />
    </div>
  )
}

/** Route pendingComponent: matches the real layout so nothing jumps. */
export function ShopSkeleton() {
  return (
    <main className="flex-1">
      <div
        className="page-container flex flex-col gap-6 pt-8 pb-18"
        aria-busy="true"
        aria-label="Loading scents"
      >
        <div className="sk h-3.5 w-30 rounded-md" />
        <div className="sk h-14 w-[min(320px,70%)] rounded-xl" />
        <div className="grid gap-10 md:grid-cols-[240px_minmax(0,1fr)]">
          <div className="hidden flex-col gap-4.5 md:flex" aria-hidden="true">
            {[50, 80, 70, 75, 60].map((w) => (
              <div
                key={w}
                className="sk h-3.5 rounded-md"
                style={{ width: `${w}%` }}
              />
            ))}
            {[70, 90, 60].map((w) => (
              <div
                key={w}
                className="sk h-10 rounded-pill"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex justify-between">
              <div className="sk h-3.5 w-20 rounded-md" />
              <div className="sk h-10 w-40 rounded-pill" />
            </div>
            <div className="grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => (
                <Card key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

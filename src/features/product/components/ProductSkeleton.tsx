export function ProductSkeleton() {
  return (
    <main className="flex-1">
      <div
        className="page-container grid grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))] gap-12 pt-6 pb-18"
        aria-busy="true"
        aria-label="Loading scent"
      >
        <div className="flex flex-col gap-3.5" aria-hidden="true">
          <div className="sk h-3.5 w-52 rounded-md" />
          <div className="sk aspect-4/5 rounded-3xl" />
        </div>
        <div className="flex flex-col gap-5.5" aria-hidden="true">
          <div className="sk h-3.5 w-36 rounded-md" />
          <div className="sk h-14 w-4/5 rounded-xl" />
          <div className="sk h-7 w-40 rounded-lg" />
          <div className="flex flex-col gap-2">
            <div className="sk h-3.5 w-full rounded-md" />
            <div className="sk h-3.5 w-11/12 rounded-md" />
            <div className="sk h-3.5 w-3/5 rounded-md" />
          </div>
          <div className="flex gap-2.5">
            <div className="sk h-20 w-32 rounded-lg" />
            <div className="sk h-20 w-32 rounded-lg" />
          </div>
          <div className="sk h-14 w-full rounded-pill" />
        </div>
      </div>
    </main>
  )
}

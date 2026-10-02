import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { DupeCard } from '#/features/catalog/components/DupeCard'
import type { DupePair } from '#/features/catalog/types'

export function DupesStrip({ dupes }: { dupes: DupePair[] }) {
  if (dupes.length === 0) return null
  return (
    <section className="border-y border-border bg-surface">
      <div className="page-container flex flex-col gap-7 py-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex max-w-160 flex-col gap-2.5">
            <span className="text-[13px] font-semibold tracking-[0.16em] text-pocket-text uppercase">
              Dupes
            </span>
            <h2 className="text-(length:--text-h2)">
              Same vibe, <em>smaller pocket.</em>
            </h2>
            <p className="text-base text-text-2">
              Love a luxury scent but not the price? These smell close enough
              that people will ask.
            </p>
          </div>
          <Link
            to="/dupes"
            className="inline-flex items-center gap-1.5 font-semibold underline decoration-1 underline-offset-4"
          >
            All dupes{' '}
            <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
          </Link>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(290px,100%),1fr))] gap-4">
          {dupes.map((pair) => (
            <DupeCard key={pair.dupe.id} {...pair} />
          ))}
        </div>
      </div>
    </section>
  )
}

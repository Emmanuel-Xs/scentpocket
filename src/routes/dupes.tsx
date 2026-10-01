import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { DupeCard } from '#/features/catalog/components/DupeCard'
import { dupesQueryOptions } from '#/features/catalog/queries'

export const Route = createFileRoute('/dupes')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(dupesQueryOptions()),
  head: () => ({
    meta: [
      { title: 'Perfume dupes in Lagos · Scentpocket' },
      {
        name: 'description',
        content:
          'Luxury scents and the affordable ones that smell close enough for people to ask. See what you save.',
      },
    ],
  }),
  component: Dupes,
})

function Dupes() {
  const { data } = useSuspenseQuery(dupesQueryOptions())
  return (
    <main className="flex-1">
      <section className="page-container flex flex-col gap-8 pt-12 pb-18">
        <div className="flex max-w-180 flex-col gap-3.5">
          <span className="text-[13px] font-semibold tracking-[0.16em] text-pocket-text uppercase">
            Dupes
          </span>
          <h1 className="text-(length:--text-h1)">
            Same vibe, <em>smaller pocket.</em>
          </h1>
          <p className="text-lg leading-relaxed text-text-2">
            Every pair here is a luxury scent and an affordable one that smells
            close enough for people to ask. We judge by the opening, the drydown
            and how long it lasts on Lagos skin.
          </p>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(290px,1fr))] gap-4">
          {data.map((pair) => (
            <DupeCard key={pair.dupe.id} {...pair} />
          ))}
        </div>
      </section>
    </main>
  )
}

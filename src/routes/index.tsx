import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { homeQueryOptions } from '#/features/catalog/queries'
import { DupesStrip } from '#/features/home/components/DupesStrip'
import { Featured } from '#/features/home/components/Featured'
import { Hero } from '#/features/home/components/Hero'
import { TierCards } from '#/features/home/components/TierCards'
import { TrustStrip } from '#/features/home/components/TrustStrip'

export const Route = createFileRoute('/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(homeQueryOptions()),
  head: () => ({
    meta: [{ title: 'Scentpocket · A scent for every pocket' }],
  }),
  component: Home,
})

function Home() {
  const { data } = useSuspenseQuery(homeQueryOptions())
  const priciest = data.ladder.at(-1)?.fromKobo ?? 0
  return (
    <main className="flex-1">
      <Hero ladder={data.ladder} priciest={priciest} />
      <TierCards tiers={data.tiers} total={data.totalProducts} />
      <DupesStrip dupes={data.dupes} />
      <Featured products={data.featured} />
      <TrustStrip />
    </main>
  )
}

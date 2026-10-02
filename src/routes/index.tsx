import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'
import { safeNext } from '#/features/auth/next'
import { logStrayCode } from '#/features/auth/server/diagnostics'
import { homeQueryOptions } from '#/features/catalog/queries'
import { DupesStrip } from '#/features/home/components/DupesStrip'
import { Featured } from '#/features/home/components/Featured'
import { Hero } from '#/features/home/components/Hero'
import { TierCards } from '#/features/home/components/TierCards'
import { TrustStrip } from '#/features/home/components/TrustStrip'

export const Route = createFileRoute('/')({
  // A sign in code can land here if the OAuth redirect falls back to the site root. Never leave
  // it in the address bar: finish the sign in, or drop it if the user is already signed in.
  validateSearch: z.object({
    code: z.string().optional().catch(undefined),
    next: z.string().optional().catch(undefined),
  }),
  beforeLoad: async ({ search }) => {
    await logStrayCode()
    if (!search.code) return
    const next = encodeURIComponent(safeNext(search.next))
    throw redirect({
      href: `/auth/callback?code=${encodeURIComponent(search.code)}&next=${next}`,
      reloadDocument: true,
    })
  },
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

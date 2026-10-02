import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { ShopPage } from '#/features/catalog/components/ShopPage'
import { ShopSkeleton } from '#/features/catalog/components/ShopSkeleton'
import { shopQueryOptions } from '#/features/catalog/queries'
import { shopSearchSchema } from '#/features/catalog/schemas'
import type { ShopSearch } from '#/features/catalog/schemas'
import { breadcrumbLd, seoHead } from '#/lib/seo'
import { tierStyles } from '#/features/catalog/tiers'

export const Route = createFileRoute('/shop')({
  validateSearch: shopSearchSchema,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(shopQueryOptions()),
  pendingComponent: ShopSkeleton,
  head: ({ match }) => {
    const tier = match.search.tier
    if (!tier)
      return seoHead({
        title: 'Shop all scents · Scentpocket',
        description:
          'Real perfumes in four budget tiers, from ₦3,500 body sprays to ₦680,000 Baccarat Rouge. Pay on delivery in Lagos.',
        path: '/shop',
      })
    const { label, blurb } = tierStyles[tier]
    const path = `/shop?tier=${tier}`
    return seoHead({
      title: `${label} perfumes in Lagos · Scentpocket`,
      description: `${blurb} Real perfumes, honest prices, pay on delivery in Lagos.`,
      path,
      jsonLd: [
        breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'Shop', path: '/shop' },
          { name: label, path },
        ]),
      ],
    })
  },
  component: Shop,
})

function Shop() {
  const { data } = useSuspenseQuery(shopQueryOptions())
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const setSearch = (patch: Partial<ShopSearch>, replace = false) =>
    void navigate({ search: (prev) => ({ ...prev, ...patch }), replace })
  const clearSearch = () => void navigate({ search: {} })

  return (
    <ShopPage
      products={data}
      search={search}
      setSearch={setSearch}
      clearSearch={clearSearch}
    />
  )
}

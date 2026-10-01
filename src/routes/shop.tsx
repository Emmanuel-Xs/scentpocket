import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { ShopPage } from '#/features/catalog/components/ShopPage'
import { ShopSkeleton } from '#/features/catalog/components/ShopSkeleton'
import { shopQueryOptions } from '#/features/catalog/queries'
import { shopSearchSchema } from '#/features/catalog/schemas'
import type { ShopSearch } from '#/features/catalog/schemas'
import { tierStyles } from '#/features/catalog/tiers'

export const Route = createFileRoute('/shop')({
  validateSearch: shopSearchSchema,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(shopQueryOptions()),
  pendingComponent: ShopSkeleton,
  head: ({ match }) => {
    const tier = match.search.tier
    return {
      meta: [
        {
          title: tier
            ? `${tierStyles[tier].label} perfumes in Lagos · Scentpocket`
            : 'Shop all scents · Scentpocket',
        },
      ],
    }
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

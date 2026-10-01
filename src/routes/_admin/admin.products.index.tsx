import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { AdminProductsPage } from '#/features/admin/components/AdminProductsPage'
import { adminProductsQueryOptions } from '#/features/admin/queries'

export const Route = createFileRoute('/_admin/admin/products/')({
  validateSearch: z.object({
    q: z.string().trim().max(80).optional().catch(undefined),
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(adminProductsQueryOptions(deps.q)),
  head: () => ({
    meta: [
      { title: 'Products · Admin · Scentpocket' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: Products,
})

function Products() {
  const { q } = Route.useSearch()
  const navigate = Route.useNavigate()
  const { data } = useQuery({
    ...adminProductsQueryOptions(q),
    placeholderData: (prev) => prev,
  })
  if (!data) return null
  return (
    <AdminProductsPage
      rows={data}
      q={q}
      onSearch={(next) =>
        void navigate({ search: { q: next || undefined }, replace: true })
      }
    />
  )
}

import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { AdminOrdersPage } from '#/features/admin/components/AdminOrdersPage'
import { adminOrdersQueryOptions } from '#/features/admin/queries'
import { ORDER_STATUSES } from '#/features/orders/status'
import { PageSkeleton } from '#/components/layout/PageSkeleton'

export const Route = createFileRoute('/_admin/admin/orders/')({
  validateSearch: z.object({
    status: z.enum(ORDER_STATUSES).optional().catch(undefined),
    q: z.string().trim().max(80).optional().catch(undefined),
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(adminOrdersQueryOptions(deps)),
  pendingComponent: () => <PageSkeleton label="Loading orders" />,
  head: () => ({
    meta: [
      { title: 'Orders · Admin · Scentpocket' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: Orders,
})

function Orders() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const { data } = useQuery({
    ...adminOrdersQueryOptions(search),
    placeholderData: (prev) => prev,
  })
  if (!data) return null
  return (
    <AdminOrdersPage
      data={data}
      status={search.status}
      q={search.q}
      onStatus={(status) =>
        void navigate({ search: (prev) => ({ ...prev, status }) })
      }
      onSearch={(q) =>
        void navigate({
          search: (prev) => ({ ...prev, q: q || undefined }),
          replace: true,
        })
      }
    />
  )
}

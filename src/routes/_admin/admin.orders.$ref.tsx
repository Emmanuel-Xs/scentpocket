import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { AdminOrderPage } from '#/features/admin/components/AdminOrderPage'
import { adminOrderQueryOptions } from '#/features/admin/queries'
import { PageSkeleton } from '#/components/layout/PageSkeleton'

export const Route = createFileRoute('/_admin/admin/orders/$ref')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(adminOrderQueryOptions(params.ref)),
  pendingComponent: () => <PageSkeleton label="Loading order" />,
  head: ({ params }) => ({
    meta: [
      { title: `${params.ref} · Admin · Scentpocket` },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: AdminOrder,
})

function AdminOrder() {
  const { ref } = Route.useParams()
  const { data } = useSuspenseQuery(adminOrderQueryOptions(ref))
  return <AdminOrderPage order={data} />
}

import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { OrderReceipt } from '#/features/orders/components/OrderReceipt'
import { orderQueryOptions } from '#/features/orders/queries'

export const Route = createFileRoute('/_authed/account/orders/$ref')({
  validateSearch: z.object({
    placed: z.literal([1, true]).optional().catch(undefined),
  }),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(orderQueryOptions(params.ref)),
  head: ({ params }) => ({
    meta: [
      { title: `Order ${params.ref} · Scentpocket` },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: Order,
})

function Order() {
  const { ref } = Route.useParams()
  const { placed } = Route.useSearch()
  const { data } = useSuspenseQuery(orderQueryOptions(ref))
  return <OrderReceipt order={data} placed={Boolean(placed)} />
}

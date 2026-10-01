import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
  OrdersEmpty,
  OrdersList,
  OrdersSkeleton,
} from '#/features/orders/components/OrdersList'
import { myOrdersQueryOptions } from '#/features/orders/queries'

export const Route = createFileRoute('/_authed/account/orders/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(myOrdersQueryOptions()),
  pendingComponent: () => (
    <main className="flex-1">
      <div className="page-container max-w-240 pt-8 pb-18">
        <OrdersSkeleton />
      </div>
    </main>
  ),
  head: () => ({
    meta: [
      { title: 'My orders · Scentpocket' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: Orders,
})

function Orders() {
  const { data } = useSuspenseQuery(myOrdersQueryOptions())
  return (
    <main className="flex-1">
      <div className="page-container flex max-w-240 flex-col gap-6 pt-8 pb-18">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-[clamp(40px,5vw,56px)]">My orders</h1>
          <span className="text-sm text-muted tabular-nums">
            {data.length} {data.length === 1 ? 'order' : 'orders'}
          </span>
        </div>
        {data.length === 0 ? <OrdersEmpty /> : <OrdersList orders={data} />}
      </div>
    </main>
  )
}

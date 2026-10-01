import { formatDateTime } from '#/lib/dates'
import { cn } from '#/lib/utils'
import type { OrderDetail } from '../types'

const steps = [
  { key: 'placed', label: 'Placed', at: (o: OrderDetail) => o.createdAt },
  {
    key: 'confirmed',
    label: 'Confirmed',
    at: (o: OrderDetail) => o.confirmedAt,
  },
  { key: 'shipped', label: 'Shipped', at: (o: OrderDetail) => o.shippedAt },
  {
    key: 'delivered',
    label: 'Delivered',
    at: (o: OrderDetail) => o.deliveredAt,
  },
] as const

/** Four steps; a cancelled order shows one clear line instead. */
export function OrderTimeline({ order }: { order: OrderDetail }) {
  if (order.status === 'cancelled') {
    return (
      <div className="flex flex-col gap-2 text-[13px]">
        <span className="h-1 rounded-pill bg-danger" />
        <span className="font-semibold">Cancelled</span>
        <span className="text-muted">
          {order.cancelledAt ? formatDateTime(order.cancelledAt) : ''}
        </span>
      </div>
    )
  }
  const currentIndex = steps.findIndex((s) => s.key === order.status)
  return (
    <ol className="m-0 grid list-none grid-cols-4 gap-2 p-0">
      {steps.map((step, i) => {
        const at = step.at(order)
        return (
          <li key={step.key} className="flex flex-col gap-2 text-[13px]">
            <span
              className={cn(
                'h-1 rounded-pill',
                i < currentIndex
                  ? 'bg-success'
                  : i === currentIndex
                    ? 'bg-ink'
                    : 'bg-border',
              )}
            />
            <span
              className={cn('font-semibold', i > currentIndex && 'text-muted')}
            >
              {step.label}
            </span>
            <span className="text-muted">
              {at ? formatDateTime(at) : 'Pending'}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

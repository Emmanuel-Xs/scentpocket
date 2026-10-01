import { cn } from '#/lib/utils'
import { STATUS_LABELS } from '../status'
import type { OrderStatus } from '../status'

const styles: Record<OrderStatus, string> = {
  placed: 'border-muted/35 bg-muted/8 text-muted',
  confirmed: 'border-designer/35 bg-designer/8 text-designer',
  shipped: 'border-arabian/35 bg-arabian/8 text-arabian',
  delivered: 'border-success/35 bg-success/8 text-success',
  cancelled: 'border-danger/35 bg-danger/8 text-danger',
}

export function StatusBadge({
  status,
  className,
}: {
  status: OrderStatus
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1 text-[13px] font-semibold whitespace-nowrap before:size-1.75 before:rounded-full before:bg-current',
        styles[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}

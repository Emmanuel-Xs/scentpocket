import { FREE_DELIVERY_THRESHOLD_KOBO } from '#/lib/config'
import { formatKobo } from '#/lib/money'
import { cn } from '#/lib/utils'

export function FreeDeliveryProgress({
  subtotalKobo,
}: {
  subtotalKobo: number
}) {
  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD_KOBO - subtotalKobo)
  const done = remaining === 0
  const ratio = Math.min(1, subtotalKobo / FREE_DELIVERY_THRESHOLD_KOBO)
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm">
        {done ? (
          <strong>You&apos;ve unlocked free delivery</strong>
        ) : (
          <>
            <strong className="tabular-nums">{formatKobo(remaining)}</strong>{' '}
            away from free delivery
          </>
        )}
      </span>
      <div
        role="progressbar"
        aria-label="Progress to free delivery"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(ratio * 100)}
        className="h-2 overflow-hidden rounded-pill bg-blush"
      >
        <span
          className={cn(
            'block h-full origin-left rounded-pill transition-transform duration-240 ease-(--ease-out)',
            done ? 'bg-success' : 'bg-pocket',
          )}
          style={{ transform: `scaleX(${ratio})` }}
        />
      </div>
    </div>
  )
}

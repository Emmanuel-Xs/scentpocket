import {
  DELIVERY_FEES_KOBO,
  DELIVERY_ZONE_ETA,
  DELIVERY_ZONE_LABELS,
  DELIVERY_ZONES,
} from '#/lib/config'
import type { DeliveryZone } from '#/lib/config'
import { formatKobo } from '#/lib/money'
import { cn } from '#/lib/utils'

type Props = {
  value: DeliveryZone
  onChange: (zone: DeliveryZone) => void
  /** Zones that make sense for the chosen state; the others are disabled. */
  allowed: readonly DeliveryZone[]
  error?: string
}

export function ZoneCards({
  value,
  onChange,
  allowed,
  error,
}: Props) {
  return (
    <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
      <legend className="mb-2.5 text-sm font-semibold">Delivery zone</legend>
      <div className="flex flex-wrap gap-2.5">
        {DELIVERY_ZONES.map((zone) => {
          const checked = zone === value
          const disabled = !allowed.includes(zone)
          return (
            <label
              key={zone}
              className={cn(
                'flex min-w-45 flex-[1_1_180px] cursor-pointer items-start gap-3 rounded-lg bg-surface p-4 transition-[border-color,transform] duration-180 ease-(--ease-out) active:scale-[0.99] has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-ink',
                checked
                  ? 'border-2 border-ink p-3.75'
                  : 'border border-border-strong',
                disabled && 'cursor-not-allowed opacity-50 active:scale-100',
                !checked && !disabled && 'hover:border-ink',
              )}
            >
              <input
                type="radio"
                name="deliveryZone"
                className="sr-only"
                checked={checked}
                disabled={disabled}
                onChange={() => onChange(zone)}
              />
              <span
                aria-hidden="true"
                className={cn(
                  'mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2',
                  checked ? 'border-ink' : 'border-border-strong',
                )}
              >
                {checked ? (
                  <span className="size-2.5 rounded-full bg-ink" />
                ) : null}
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="font-semibold">
                  {DELIVERY_ZONE_LABELS[zone]}
                </span>
                <span className="text-sm text-text-2">
                  <span className="font-semibold tabular-nums">
                    {formatKobo(DELIVERY_FEES_KOBO[zone])}
                  </span>{' '}
                  · {DELIVERY_ZONE_ETA[zone]}
                </span>
              </span>
            </label>
          )
        })}
      </div>
      {error ? (
        <span className="text-[13px] font-medium text-danger">{error}</span>
      ) : null}
    </fieldset>
  )
}

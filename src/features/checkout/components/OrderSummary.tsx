import { Link } from '@tanstack/react-router'
import { FreeDeliveryProgress } from '#/features/cart/components/FreeDeliveryProgress'
import type { CartLine } from '#/features/cart/store'
import type { CartLineData } from '#/features/cart/types'
import { tierStyles } from '#/features/catalog/tiers'
import { Image } from '#/features/images/Image'
import { DELIVERY_ZONE_LABELS } from '#/lib/config'
import type { DeliveryZone } from '#/lib/config'
import { formatKobo } from '#/lib/money'
import type { OrderTotals } from '#/lib/money'
import { cn } from '#/lib/utils'

type Props = {
  lines: { line: CartLine; info: CartLineData }[]
  totals: OrderTotals
  zone: DeliveryZone
}

/** Display only: the server recomputes every number when the order is placed. */
export function OrderSummary({ lines, totals, zone }: Props) {
  return (
    <aside
      aria-label="Order summary"
      className="flex flex-col gap-4.5 rounded-3xl border border-border bg-surface p-6 lg:sticky lg:top-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-[26px] leading-none">Order summary</h2>
        <Link
          to="/shop"
          className="text-sm font-semibold underline underline-offset-4"
        >
          Keep shopping
        </Link>
      </div>
      <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
        {lines.map(({ line, info }) => (
          <li key={line.variantId} className="flex items-center gap-3">
            <span
              className={cn(
                'relative grid h-17 w-14 shrink-0 place-items-center rounded-xl',
                tierStyles[info.tier].tint,
              )}
            >
              {info.image ? (
                <Image
                  src={info.image.src}
                  alt=""
                  width={info.image.width}
                  height={info.image.height}
                  sizes="56px"
                  className="mix-blend-multiply"
                />
              ) : null}
              <span className="absolute -top-1.5 -right-1.5 grid h-5.5 min-w-5.5 place-items-center rounded-pill bg-ink text-xs font-semibold text-cream tabular-nums">
                {line.qty}
              </span>
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate font-semibold">{info.productName}</span>
              <span className="text-[13px] text-muted">
                {info.brand} · {info.sizeMl}ml
              </span>
            </span>
            <span className="font-semibold tabular-nums">
              {formatKobo(info.priceKobo * line.qty)}
            </span>
          </li>
        ))}
      </ul>
      <hr className="border-0 border-t-2 border-dashed border-border" />
      <dl className="m-0 grid grid-cols-[1fr_auto] gap-2.5 text-[15px]">
        <dt className="text-text-2">Subtotal</dt>
        <dd className="m-0 font-semibold tabular-nums">
          {formatKobo(totals.subtotalKobo)}
        </dd>
        <dt className="text-text-2">Delivery · {DELIVERY_ZONE_LABELS[zone]}</dt>
        <dd className="m-0 font-semibold tabular-nums">
          {totals.deliveryFeeKobo === 0
            ? 'Free'
            : formatKobo(totals.deliveryFeeKobo)}
        </dd>
        <dt className="pt-1.5 text-[17px] font-semibold">Total</dt>
        <dd className="m-0 pt-1.5 text-[22px] font-semibold tabular-nums">
          {formatKobo(totals.totalKobo)}
        </dd>
      </dl>
      <div className="rounded-lg bg-blush p-3.5">
        <FreeDeliveryProgress subtotalKobo={totals.subtotalKobo} />
      </div>
    </aside>
  )
}

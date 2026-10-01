import { DELIVERY_ZONE_ETA, DELIVERY_ZONE_LABELS } from '#/lib/config'
import { formatKobo } from '#/lib/money'
import { Image } from '#/features/images/Image'
import type { OrderDetail } from '../types'

const infoCard =
  'flex flex-col gap-1.5 rounded-3xl border border-border bg-surface p-4.5'
const eyebrow = 'text-xs font-semibold tracking-[0.14em] text-muted uppercase'

/** `+2348031234567` to `+234 803 123 4567` */
function prettyPhone(phone: string) {
  const m = /^\+234(\d{3})(\d{3})(\d{4})$/.exec(phone)
  return m ? `+234 ${m[1]} ${m[2]} ${m[3]}` : phone
}

/** Items, totals and the delivery, payment and zone cards. Shared by the receipt and admin. */
export function OrderBody({ order }: { order: OrderDetail }) {
  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] items-start gap-6">
        <section className="rounded-3xl border border-border bg-surface p-6">
          <h2 className="font-serif text-2xl leading-none">What you ordered</h2>
          <ul className="m-0 list-none p-0">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3.5 border-b border-border py-3.5"
              >
                <span className="grid h-18 w-15 shrink-0 place-items-center overflow-hidden rounded-xl bg-blush">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt=""
                      width={500}
                      height={500}
                      sizes="60px"
                      className="mix-blend-multiply"
                    />
                  ) : null}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="font-semibold">{item.productName}</span>
                  <span className="text-[13px] text-muted">
                    {item.variantLabel} · Qty {item.qty}
                  </span>
                </span>
                <span className="font-semibold tabular-nums">
                  {formatKobo(item.lineTotalKobo)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="m-0 grid grid-cols-[1fr_auto] gap-2.5 pt-4 text-[15px]">
            <dt className="text-text-2">Subtotal</dt>
            <dd className="m-0 font-semibold tabular-nums">
              {formatKobo(order.subtotalKobo)}
            </dd>
            <dt className="text-text-2">
              Delivery · {DELIVERY_ZONE_LABELS[order.deliveryZone]}
            </dt>
            <dd className="m-0 font-semibold tabular-nums">
              {order.deliveryFeeKobo === 0
                ? 'Free'
                : formatKobo(order.deliveryFeeKobo)}
            </dd>
            <dt className="font-semibold">Total · pay on delivery</dt>
            <dd className="m-0 text-xl font-semibold tabular-nums">
              {formatKobo(order.totalKobo)}
            </dd>
          </dl>
        </section>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
          <div className={infoCard}>
            <span className={eyebrow}>Delivering to</span>
            <span className="font-semibold">{order.customerName}</span>
            <span className="text-sm text-text-2">
              {order.addressLine}, {order.city}, {order.state}
              <br />
              {prettyPhone(order.phone)}
            </span>
          </div>
          <div className={infoCard}>
            <span className={eyebrow}>Payment</span>
            <span className="font-semibold">Pay on delivery</span>
            <span className="text-sm text-text-2">
              Have {formatKobo(order.totalKobo)} ready in cash or transfer.
            </span>
          </div>
          <div className={infoCard}>
            <span className={eyebrow}>Delivery</span>
            <span className="font-semibold">
              {DELIVERY_ZONE_LABELS[order.deliveryZone]}
            </span>
            <span className="text-sm text-text-2">
              Usually {DELIVERY_ZONE_ETA[order.deliveryZone]}. We call before
              the rider leaves.
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

import { useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { ArrowLeft, Check, Mail, MailWarning, Truck } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '#/components/ui/ConfirmDialog'
import { Image } from '#/features/images/Image'
import { OrderTimeline } from '#/features/orders/components/OrderTimeline'
import { StatusBadge } from '#/features/orders/components/StatusBadge'
import { canCancel, TRANSITIONS } from '#/features/orders/status'
import type { OrderStatus } from '#/features/orders/status'
import type { OrderDetail } from '#/features/orders/types'
import { DELIVERY_ZONE_ETA, DELIVERY_ZONE_LABELS } from '#/lib/config'
import { formatDateTime } from '#/lib/dates'
import { formatKobo } from '#/lib/money'
import { resendOrderEmail, setOrderStatus } from '../server/orders'

const NEXT: Partial<Record<OrderStatus, { to: OrderStatus; label: string }>> = {
  placed: { to: 'confirmed', label: 'Confirm order' },
  confirmed: { to: 'shipped', label: 'Mark as shipped' },
  shipped: { to: 'delivered', label: 'Mark as delivered' },
}

const card = 'rounded-3xl border border-border bg-surface'
const eyebrow = 'text-xs font-semibold tracking-[0.14em] text-muted uppercase'
const btn =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-pill border px-5 text-[15px] font-semibold transition-transform duration-150 ease-(--ease-out) active:scale-[0.97] disabled:cursor-progress disabled:active:scale-100'

export function AdminOrderPage({ order }: { order: OrderDetail }) {
  const queryClient = useQueryClient()
  const changeStatus = useServerFn(setOrderStatus)
  const resend = useServerFn(resendOrderEmail)
  const [busy, setBusy] = useState<'status' | 'email' | null>(null)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const next = NEXT[order.status]
  const itemCount = order.items.reduce((sum, i) => sum + i.qty, 0)

  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['admin'] }),
      queryClient.invalidateQueries({ queryKey: ['orders'] }),
    ])

  const move = async (to: OrderStatus) => {
    setBusy('status')
    try {
      const res = await changeStatus({ data: { ref: order.ref, to } })
      if (res.ok) {
        await refresh()
        toast.success(
          to === 'cancelled'
            ? 'Order cancelled and stock put back'
            : 'Order updated',
        )
        setConfirmCancel(false)
      } else {
        toast.error(res.error)
      }
    } catch {
      toast.error('Could not update the order. Please try again.')
    } finally {
      setBusy(null)
    }
  }

  const sendEmail = async () => {
    setBusy('email')
    try {
      const res = await resend({ data: { ref: order.ref } })
      await refresh()
      if (res.ok) toast.success(`Email sent to ${order.email}`)
      else toast.error(`Email did not send: ${res.error}`)
    } catch {
      toast.error('Could not resend the email.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <>
      <Link
        to="/admin/orders"
        className="inline-flex items-center gap-1.5 text-sm no-underline hover:underline"
      >
        <ArrowLeft size={16} strokeWidth={1.5} aria-hidden="true" /> All orders
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-5xl tabular-nums">{order.ref}</h1>
            <StatusBadge status={order.status} />
          </div>
          <span className="text-text-2">
            {formatDateTime(order.createdAt)} · Pay on delivery ·{' '}
            {formatKobo(order.totalKobo)}
          </span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {canCancel(order.status) ? (
            <button
              type="button"
              onClick={() => setConfirmCancel(true)}
              className={`${btn} border-transparent text-danger underline underline-offset-4`}
            >
              Cancel order
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => void sendEmail()}
            disabled={busy !== null}
            className={`${btn} border-ink`}
          >
            <Mail size={18} strokeWidth={1.5} aria-hidden="true" />
            {busy === 'email' ? 'Sending…' : 'Resend email'}
          </button>
          {next ? (
            <button
              type="button"
              onClick={() => void move(next.to)}
              disabled={busy !== null}
              className={`${btn} border-ink bg-ink text-cream`}
            >
              {next.to === 'shipped' ? (
                <Truck size={18} strokeWidth={1.5} aria-hidden="true" />
              ) : (
                <Check size={18} strokeWidth={1.5} aria-hidden="true" />
              )}
              {busy === 'status' ? 'Saving…' : next.label}
            </button>
          ) : null}
        </div>
      </div>

      <div className={`${card} p-5`}>
        <OrderTimeline order={order} />
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] items-start gap-5">
        <section className={`${card} overflow-hidden`}>
          <h2 className="px-5 pt-4.5 pb-1 font-serif text-2xl leading-none">
            Items <span className="text-base text-muted">({itemCount})</span>
          </h2>
          <div className="relative overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="text-left text-xs tracking-[0.08em] text-muted uppercase">
                  <th
                    scope="col"
                    className="border-b border-border px-4 py-3 font-semibold"
                  >
                    Product
                  </th>
                  <th
                    scope="col"
                    className="border-b border-border px-4 py-3 font-semibold"
                  >
                    Qty
                  </th>
                  <th
                    scope="col"
                    className="border-b border-border px-4 py-3 font-semibold"
                  >
                    Unit
                  </th>
                  <th
                    scope="col"
                    className="border-b border-border px-4 py-3 text-right font-semibold"
                  >
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((i) => (
                  <tr key={i.id}>
                    <td className="border-b border-border px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="grid h-13 w-11 shrink-0 place-items-center overflow-hidden rounded-[10px] bg-blush">
                          {i.imageUrl ? (
                            <Image
                              src={i.imageUrl}
                              alt=""
                              width={500}
                              height={500}
                              sizes="44px"
                              className="mix-blend-multiply"
                            />
                          ) : null}
                        </span>
                        <div className="flex flex-col">
                          <span className="font-semibold">{i.productName}</span>
                          <span className="text-[13px] text-muted">
                            {i.variantLabel}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="border-b border-border px-4 py-3.5 tabular-nums">
                      {i.qty}
                    </td>
                    <td className="border-b border-border px-4 py-3.5 font-semibold tabular-nums">
                      {formatKobo(i.unitPriceKobo)}
                    </td>
                    <td className="border-b border-border px-4 py-3.5 text-right font-semibold tabular-nums">
                      {formatKobo(i.lineTotalKobo)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <dl className="m-0 grid grid-cols-[1fr_auto] gap-2 px-5 py-4 text-[15px]">
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

        <div className="flex flex-col gap-3.5">
          <div className={`${card} flex flex-col gap-1.5 p-4.5`}>
            <span className={eyebrow}>Customer</span>
            <span className="font-semibold">{order.customerName}</span>
            <a className="text-sm text-text-2" href={`mailto:${order.email}`}>
              {order.email}
            </a>
            <a className="text-sm text-text-2" href={`tel:${order.phone}`}>
              {order.phone}
            </a>
          </div>
          <div className={`${card} flex flex-col gap-1.5 p-4.5`}>
            <span className={eyebrow}>Delivery</span>
            <span className="font-semibold">
              {DELIVERY_ZONE_LABELS[order.deliveryZone]}
            </span>
            <span className="text-sm text-text-2">
              {order.addressLine}, {order.city}, {order.state}
              <br />
              Usually {DELIVERY_ZONE_ETA[order.deliveryZone]}
            </span>
          </div>
          <div className={`${card} flex items-start gap-2.5 p-4.5 text-sm`}>
            {order.emailSentAt ? (
              <Mail
                size={20}
                strokeWidth={1.5}
                aria-hidden="true"
                className="mt-0.5 shrink-0"
              />
            ) : (
              <MailWarning
                size={20}
                strokeWidth={1.5}
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-arabian"
              />
            )}
            <span>
              {order.emailSentAt
                ? `Confirmation sent via ${order.emailProvider === 'mailgun' ? 'Mailgun' : 'Gmail'} · ${formatDateTime(order.emailSentAt)}`
                : order.emailError
                  ? `Confirmation not sent: ${order.emailError}`
                  : 'Confirmation not sent yet.'}
            </span>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title={`Cancel ${order.ref}?`}
        description={
          <>
            The customer is not charged and the stock goes back on the shelf:{' '}
            {order.items
              .map((i) => `${i.qty} × ${i.productName} ${i.variantLabel}`)
              .join(', ')}
            . This can&apos;t be undone.
          </>
        }
        confirmLabel="Cancel order"
        danger
        pending={busy === 'status'}
        onConfirm={() => void move('cancelled')}
      />
    </>
  )
}

/** Exposed for tests of the status buttons. */
export const NEXT_ACTIONS = NEXT
export const LEGAL_MOVES = TRANSITIONS

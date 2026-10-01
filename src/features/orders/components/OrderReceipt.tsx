import { Link } from '@tanstack/react-router'
import { Check, Copy, MailCheck, MailWarning } from 'lucide-react'
import { toast } from 'sonner'
import { Breadcrumb } from '#/components/ui/Breadcrumb'
import { formatDateTime } from '#/lib/dates'
import { STATUS_LABELS } from '../status'
import type { OrderDetail } from '../types'
import { OrderBody } from './OrderBody'
import { OrderTimeline } from './OrderTimeline'
import { StatusBadge } from './StatusBadge'

const primary =
  'inline-flex min-h-12 items-center rounded-pill border border-ink bg-ink px-5.5 text-[15px] font-semibold text-cream no-underline transition-transform duration-150 ease-(--ease-out) active:scale-[0.97]'
const secondary =
  'inline-flex min-h-12 items-center rounded-pill border border-ink px-5.5 text-[15px] font-semibold text-ink no-underline transition-[transform,background-color,color] duration-150 ease-(--ease-out) active:scale-[0.97] hover:bg-ink hover:text-cream'

async function copyRef(ref: string) {
  try {
    await navigator.clipboard.writeText(ref)
    toast.success('Order number copied')
  } catch {
    toast.error('Could not copy. Select the number and copy it by hand.')
  }
}

function EmailLine({ order }: { order: OrderDetail }) {
  if (order.emailSentAt) {
    return (
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-surface p-4.5">
        <span className="flex items-center gap-2.5">
          <MailCheck size={20} strokeWidth={1.5} aria-hidden="true" />
          Confirmation sent to {order.email} ·{' '}
          {formatDateTime(order.emailSentAt)}
        </span>
      </section>
    )
  }
  if (order.emailError) {
    return (
      <section className="flex items-center gap-2.5 rounded-3xl border border-arabian/30 bg-arabian/6 p-4.5 text-sm">
        <MailWarning
          size={20}
          strokeWidth={1.5}
          aria-hidden="true"
          className="shrink-0"
        />
        <span>
          Your order is safe, but the confirmation email did not go out. Keep
          this page for your receipt.
        </span>
      </section>
    )
  }
  return null
}

/** The order page. With `placed` it opens with the thank you header. */
export function OrderReceipt({
  order,
  placed,
}: {
  order: OrderDetail
  placed: boolean
}) {
  const firstName = order.customerName.split(' ')[0]
  const itemCount = order.items.reduce((sum, i) => sum + i.qty, 0)

  return (
    <main className="flex-1">
      <div className="page-container flex max-w-240 flex-col gap-8 pt-10 pb-18">
        {placed ? (
          <section className="flex flex-col items-start gap-4.5">
            <span className="grid size-16 animate-pop place-items-center rounded-full bg-success text-white">
              <Check size={32} strokeWidth={2} aria-hidden="true" />
            </span>
            <h1 className="text-(length:--text-h1)">Thank you, {firstName}.</h1>
            <p className="text-lg leading-relaxed text-text-2">
              Your order is in. Your receipt is below and sent to{' '}
              <strong>{order.email}</strong>.
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-pill border border-dashed border-border-strong px-3.5 py-2 text-[15px]">
                Order{' '}
                <strong className="tracking-[0.04em] tabular-nums">
                  {order.ref}
                </strong>
              </span>
              <button
                type="button"
                onClick={() => void copyRef(order.ref)}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-pill bg-blush px-4 text-sm font-semibold transition-transform duration-150 active:scale-[0.97]"
              >
                <Copy size={16} strokeWidth={1.5} aria-hidden="true" /> Copy
              </button>
              <StatusBadge status={order.status} />
            </div>
          </section>
        ) : (
          <>
            <Breadcrumb
              items={[{ label: 'My orders' }, { label: order.ref }]}
            />
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex flex-col gap-2">
                <h1 className="text-[clamp(40px,5vw,56px)]">
                  Order <span className="tabular-nums">{order.ref}</span>
                </h1>
                <span className="text-text-2">
                  Placed {formatDateTime(order.createdAt)} · {itemCount}{' '}
                  {itemCount === 1 ? 'item' : 'items'}
                </span>
              </div>
              <StatusBadge
                status={order.status}
                className="px-3.5 py-1.5 text-[15px]"
              />
            </div>
          </>
        )}

        <OrderTimeline order={order} />
        {order.status === 'shipped' ? (
          <p className="rounded-lg border border-info/20 bg-info/5 px-4 py-3.5 text-sm text-info">
            Your rider is on the way. Expect a call on{' '}
            <strong>{order.phone}</strong> before arrival.
          </p>
        ) : null}
        <OrderBody order={order} />
        <EmailLine order={order} />

        {placed ? (
          <div className="flex flex-wrap gap-3">
            <Link to="/shop" className={primary}>
              Keep shopping
            </Link>
            <Link to="/account/orders" className={secondary}>
              View my orders
            </Link>
          </div>
        ) : (
          <p className="text-sm text-muted">
            Status: {STATUS_LABELS[order.status]}. Something wrong with this
            order? Reply to the confirmation email with your order number.
          </p>
        )}
      </div>
    </main>
  )
}

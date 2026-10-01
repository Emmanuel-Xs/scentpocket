import { Link } from '@tanstack/react-router'
import { ChevronRight, Receipt } from 'lucide-react'
import { useState } from 'react'
import { Image } from '#/features/images/Image'
import { formatDate } from '#/lib/dates'
import { formatKobo } from '#/lib/money'
import { cn } from '#/lib/utils'
import type { OrderStatus } from '../status'
import type { OrderRow } from '../types'
import { StatusBadge } from './StatusBadge'

type Tab = 'all' | 'active' | 'delivered' | 'cancelled'
const tabs: { key: Tab; label: string; match: (s: OrderStatus) => boolean }[] =
  [
    { key: 'all', label: 'All', match: () => true },
    {
      key: 'active',
      label: 'Active',
      match: (s) => s === 'placed' || s === 'confirmed' || s === 'shipped',
    },
    { key: 'delivered', label: 'Delivered', match: (s) => s === 'delivered' },
    { key: 'cancelled', label: 'Cancelled', match: (s) => s === 'cancelled' },
  ]

export function OrdersEmpty() {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-surface">
      <div className="mx-auto flex max-w-115 flex-col items-center gap-4 px-6 py-16 text-center">
        <span className="grid size-18 place-items-center rounded-full bg-blush">
          <Receipt size={30} strokeWidth={1.5} aria-hidden="true" />
        </span>
        <h2 className="font-serif text-[34px] leading-none">No orders yet</h2>
        <p className="text-text-2">
          When you place an order, it shows up here with its status.
        </p>
        <Link
          to="/shop"
          className="inline-flex min-h-12 items-center rounded-pill border border-ink bg-ink px-5.5 text-[15px] font-semibold text-cream no-underline transition-transform duration-150 ease-(--ease-out) active:scale-[0.97]"
        >
          Shop all scents
        </Link>
      </div>
    </div>
  )
}

export function OrdersSkeleton() {
  return (
    <div
      className="flex flex-col gap-3"
      aria-busy="true"
      aria-label="Loading orders"
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-3xl border border-border bg-surface p-5"
        >
          <div className="sk h-16 w-13 rounded-xl" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="sk h-4 w-28 rounded-md" />
            <div className="sk h-3.5 w-40 rounded-md" />
          </div>
          <div className="sk h-5 w-20 rounded-md" />
        </div>
      ))}
    </div>
  )
}

export function OrdersList({ orders }: { orders: OrderRow[] }) {
  const [tab, setTab] = useState<Tab>('all')
  const active = tabs.find((t) => t.key === tab) ?? tabs[0]
  const shown = orders.filter((o) => active.match(o.status))

  return (
    <div className="flex flex-col gap-6">
      <div
        role="tablist"
        aria-label="Order status"
        className="flex gap-2 overflow-x-auto"
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'min-h-11 shrink-0 rounded-pill border px-4 text-sm font-medium transition-[transform,border-color,background-color,color] duration-150 ease-(--ease-out) active:scale-[0.97]',
              tab === t.key
                ? 'border-ink bg-ink text-cream'
                : 'border-border bg-surface hover:border-ink',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <p className="py-10 text-center text-text-2">
          No {active.label.toLowerCase()} orders.
        </p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {shown.map((o) => (
            <li key={o.ref}>
              <Link
                to="/account/orders/$ref"
                params={{ ref: o.ref }}
                className="flex flex-wrap items-center gap-4.5 rounded-3xl border border-border bg-surface px-5 py-4.5 no-underline transition-transform duration-150 ease-(--ease-out) active:scale-[0.99]"
              >
                <span className="flex">
                  {o.imageUrls.map((url, i) => (
                    <span
                      key={url}
                      className="grid h-16 w-13 place-items-center overflow-hidden rounded-xl border-2 border-surface bg-blush"
                      style={{ marginLeft: i === 0 ? 0 : -16 }}
                    >
                      <Image
                        src={url}
                        alt=""
                        width={500}
                        height={500}
                        sizes="52px"
                        className="mix-blend-multiply"
                      />
                    </span>
                  ))}
                </span>
                <span className="flex min-w-45 flex-[1_1_180px] flex-col gap-1">
                  <span className="font-semibold tabular-nums">{o.ref}</span>
                  <span className="text-sm text-muted">
                    {formatDate(o.createdAt)} · {o.itemCount}{' '}
                    {o.itemCount === 1 ? 'item' : 'items'}
                  </span>
                </span>
                <span className="text-[17px] font-semibold tabular-nums">
                  {formatKobo(o.totalKobo)}
                </span>
                <StatusBadge status={o.status} />
                <ChevronRight
                  size={20}
                  strokeWidth={1.5}
                  aria-hidden="true"
                  className="hidden text-muted md:block"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

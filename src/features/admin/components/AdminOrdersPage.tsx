import { Link } from '@tanstack/react-router'
import { ChevronRight, Search } from 'lucide-react'
import { StatusBadge } from '#/features/orders/components/StatusBadge'
import { ORDER_STATUSES, STATUS_LABELS } from '#/features/orders/status'
import type { OrderStatus } from '#/features/orders/status'
import { formatDateTime } from '#/lib/dates'
import { formatKobo } from '#/lib/money'
import { cn } from '#/lib/utils'
import type { AdminOrdersData } from '../types'

type Props = {
  data: AdminOrdersData
  status?: OrderStatus
  q?: string
  onStatus: (status: OrderStatus | undefined) => void
  onSearch: (q: string) => void
}

/** ₦1.2m for the headline stat; exact figures live in the table. */
function compactNaira(kobo: number) {
  const naira = kobo / 100
  if (naira >= 1_000_000)
    return `₦${(naira / 1_000_000).toFixed(1).replace(/\.0$/, '')}m`
  if (naira >= 1_000)
    return `₦${(naira / 1_000).toFixed(naira >= 100_000 ? 0 : 1).replace(/\.0$/, '')}k`
  return `₦${naira}`
}

export function AdminOrdersPage({
  data,
  status,
  q,
  onStatus,
  onSearch,
}: Props) {
  const stats = [
    { label: 'To confirm', value: String(data.stats.toConfirm) },
    { label: 'To ship', value: String(data.stats.toShip) },
    { label: 'On the way', value: String(data.stats.onTheWay) },
    { label: 'This week', value: compactNaira(data.stats.weekKobo) },
  ]
  const tabs: { key: OrderStatus | undefined; label: string; count: number }[] =
    [
      { key: undefined, label: 'All', count: data.counts.all },
      ...ORDER_STATUSES.map((s) => ({
        key: s,
        label: STATUS_LABELS[s],
        count: data.counts[s],
      })),
    ]

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-5xl">Orders</h1>
        <div className="relative w-[min(320px,100%)]">
          <label className="sr-only" htmlFor="admin-q">
            Search orders
          </label>
          <Search
            size={18}
            strokeWidth={1.5}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted"
          />
          <input
            id="admin-q"
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            placeholder="Ref or email"
            defaultValue={q ?? ''}
            onChange={(e) => onSearch(e.target.value)}
            className="min-h-12 w-full rounded-md border border-border-strong bg-surface pr-4 pl-11 text-base transition-[border-color,box-shadow] duration-180 hover:border-muted focus:border-ink focus:ring-3 focus:ring-ink/12 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex min-w-35 flex-[1_1_140px] flex-col gap-1 rounded-3xl border border-border bg-surface px-4.5 py-4"
          >
            <span className="text-[13px] text-muted">{s.label}</span>
            <span className="font-serif text-[34px] leading-none tabular-nums">
              {s.value}
            </span>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-surface">
        <div
          role="tablist"
          aria-label="Status"
          className="flex gap-1 overflow-x-auto border-b border-border"
        >
          {tabs.map((t) => (
            <button
              key={t.label}
              type="button"
              role="tab"
              aria-selected={status === t.key}
              onClick={() => onStatus(t.key)}
              className={cn(
                'shrink-0 border-b-2 px-3.5 py-3 text-sm font-semibold whitespace-nowrap transition-colors duration-150',
                status === t.key
                  ? 'border-ink text-ink'
                  : 'border-transparent text-muted hover:text-ink',
              )}
            >
              {t.label}{' '}
              <span className="text-muted tabular-nums">{t.count}</span>
            </button>
          ))}
        </div>

        {data.rows.length === 0 ? (
          <p className="px-6 py-14 text-center text-text-2">
            {q || status
              ? 'No orders match that. Try clearing the filter.'
              : 'No orders yet.'}
          </p>
        ) : (
          <div className="relative overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="text-left text-xs tracking-[0.08em] text-muted uppercase">
                  {[
                    'Order',
                    'Date',
                    'Customer',
                    'Items',
                    'Total',
                    'Status',
                  ].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="border-b border-border px-4 py-3 font-semibold whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                  <th scope="col" className="border-b border-border px-4 py-3">
                    <span className="sr-only">Open</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((o) => (
                  <tr
                    key={o.ref}
                    className="group relative transition-colors duration-150 hover:bg-[#FBF8F3]"
                  >
                    <td className="border-b border-border px-4 py-3.5">
                      <Link
                        to="/admin/orders/$ref"
                        params={{ ref: o.ref }}
                        className="font-semibold tabular-nums no-underline after:absolute after:inset-0"
                      >
                        {o.ref}
                      </Link>
                    </td>
                    <td className="border-b border-border px-4 py-3.5 whitespace-nowrap text-muted tabular-nums">
                      {formatDateTime(o.createdAt)}
                    </td>
                    <td className="border-b border-border px-4 py-3.5">
                      <div className="flex flex-col">
                        <span>{o.customerName}</span>
                        <span className="text-[13px] text-muted">
                          {o.email}
                        </span>
                      </div>
                    </td>
                    <td className="border-b border-border px-4 py-3.5 tabular-nums">
                      {o.itemCount}
                    </td>
                    <td className="border-b border-border px-4 py-3.5 font-semibold tabular-nums">
                      {formatKobo(o.totalKobo)}
                    </td>
                    <td className="border-b border-border px-4 py-3.5">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="border-b border-border px-4 py-3.5 text-muted">
                      <ChevronRight
                        size={18}
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}

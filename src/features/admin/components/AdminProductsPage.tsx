import { useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { Pencil, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Switch } from '#/components/ui/Switch'
import { TierChip } from '#/features/catalog/components/TierChip'
import { tierLabels, tiers } from '#/features/catalog/schemas'
import { tierStyles } from '#/features/catalog/tiers'
import type { Tier } from '#/features/catalog/types'
import { Image } from '#/features/images/Image'
import { formatKobo } from '#/lib/money'
import { cn } from '#/lib/utils'
import { setProductActive } from '../server/products'
import type { AdminProductRow } from '../types'

const LOW_STOCK = 3
type Tab = 'all' | Tier | 'low'

export function AdminProductsPage({
  rows,
  q,
  onSearch,
}: {
  rows: AdminProductRow[]
  q?: string
  onSearch: (q: string) => void
}) {
  const queryClient = useQueryClient()
  const toggle = useServerFn(setProductActive)
  const [tab, setTab] = useState<Tab>('all')
  const [busyId, setBusyId] = useState<string | null>(null)

  const low = rows.filter((r) => r.isActive && r.totalStock <= LOW_STOCK)
  const shown = rows.filter((r) =>
    tab === 'all' ? true : tab === 'low' ? low.includes(r) : r.tier === tab,
  )
  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: rows.length },
    ...tiers.map((t) => ({
      key: t,
      label: tierLabels[t],
      count: rows.filter((r) => r.tier === t).length,
    })),
    { key: 'low', label: 'Low stock', count: low.length },
  ]

  const setActive = async (row: AdminProductRow, isActive: boolean) => {
    setBusyId(row.id)
    try {
      const res = await toggle({ data: { id: row.id, isActive } })
      if (!res.ok) throw new Error(res.error)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin'] }),
        queryClient.invalidateQueries({ queryKey: ['catalog'] }),
      ])
      toast.success(
        isActive
          ? `${row.name} is live`
          : `${row.name} is hidden from the shop`,
      )
    } catch {
      toast.error('Could not change that. Please try again.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-5xl">Products</h1>
        <div className="flex flex-wrap gap-2.5">
          <div className="relative w-[min(280px,100%)]">
            <label className="sr-only" htmlFor="admin-pq">
              Search products
            </label>
            <Search
              size={18}
              strokeWidth={1.5}
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted"
            />
            <input
              id="admin-pq"
              type="search"
              autoComplete="off"
              enterKeyHint="search"
              placeholder="Search products…"
              defaultValue={q ?? ''}
              onChange={(e) => onSearch(e.target.value)}
              className="min-h-12 w-full rounded-md border border-border-strong bg-surface pr-4 pl-11 text-base transition-[border-color,box-shadow] duration-180 hover:border-muted focus:border-ink focus:ring-3 focus:ring-ink/12 focus:outline-none"
            />
          </div>
          <Link
            to="/admin/products/new"
            className="inline-flex min-h-12 items-center gap-2 rounded-pill border border-ink bg-ink px-5 text-[15px] font-semibold text-cream no-underline transition-transform duration-150 ease-(--ease-out) active:scale-[0.97]"
          >
            <Plus size={18} strokeWidth={1.5} aria-hidden="true" /> New product
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-surface">
        <div
          role="tablist"
          aria-label="Filter"
          className="flex gap-1 overflow-x-auto border-b border-border"
        >
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'shrink-0 border-b-2 px-3.5 py-3 text-sm font-semibold whitespace-nowrap transition-colors duration-150',
                tab === t.key
                  ? 'border-ink text-ink'
                  : 'border-transparent text-muted hover:text-ink',
              )}
            >
              {t.label}{' '}
              <span className="text-muted tabular-nums">{t.count}</span>
            </button>
          ))}
        </div>
        {shown.length === 0 ? (
          <p className="px-6 py-14 text-center text-text-2">Nothing here.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="text-left text-xs tracking-[0.08em] text-muted uppercase">
                  {['Product', 'Tier', 'Sizes', 'Stock', 'From', 'Active'].map(
                    (h) => (
                      <th
                        key={h}
                        scope="col"
                        className="border-b border-border px-4 py-3 font-semibold whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ),
                  )}
                  <th scope="col" className="border-b border-border px-4 py-3">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {shown.map((p) => (
                  <tr
                    key={p.id}
                    className={cn(
                      'transition-colors duration-150 hover:bg-[#FBF8F3]',
                      !p.isActive && 'opacity-60',
                    )}
                  >
                    <td className="border-b border-border px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            'grid h-13 w-11 shrink-0 place-items-center overflow-hidden rounded-[10px]',
                            tierStyles[p.tier].tint,
                          )}
                        >
                          {p.imageUrl ? (
                            <Image
                              src={p.imageUrl}
                              alt=""
                              width={500}
                              height={500}
                              sizes="44px"
                              className="mix-blend-multiply"
                            />
                          ) : null}
                        </span>
                        <div className="flex flex-col">
                          <Link
                            to="/admin/products/$id"
                            params={{ id: p.id }}
                            className="font-semibold no-underline hover:underline"
                          >
                            {p.name}
                          </Link>
                          <span className="text-[13px] text-muted">
                            {p.brand}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="border-b border-border px-4 py-3">
                      <TierChip tier={p.tier} />
                    </td>
                    <td className="border-b border-border px-4 py-3 tabular-nums">
                      {p.variantCount}
                    </td>
                    <td
                      className={cn(
                        'border-b border-border px-4 py-3 tabular-nums',
                        p.totalStock <= LOW_STOCK &&
                          'font-semibold text-danger',
                      )}
                    >
                      {p.totalStock}
                    </td>
                    <td className="border-b border-border px-4 py-3 font-semibold tabular-nums">
                      {formatKobo(p.fromKobo)}
                    </td>
                    <td className="border-b border-border px-4 py-3">
                      <Switch
                        checked={p.isActive}
                        label={`${p.name} active`}
                        disabled={busyId === p.id}
                        onCheckedChange={(next) => void setActive(p, next)}
                      />
                    </td>
                    <td className="border-b border-border px-4 py-3 text-right">
                      <Link
                        to="/admin/products/$id"
                        params={{ id: p.id }}
                        aria-label={`Edit ${p.name}`}
                        className="inline-grid size-11 place-items-center rounded-pill transition-transform duration-150 active:scale-[0.97]"
                      >
                        <Pencil
                          size={18}
                          strokeWidth={1.5}
                          aria-hidden="true"
                        />
                      </Link>
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

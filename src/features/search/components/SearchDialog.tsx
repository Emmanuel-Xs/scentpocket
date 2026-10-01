import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import * as Dialog from '@radix-ui/react-dialog'
import { Search, Sprout, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { shopQueryOptions } from '#/features/catalog/queries'
import { tierLabels } from '#/features/catalog/schemas'
import { tierStyles } from '#/features/catalog/tiers'
import type { ProductCardData } from '#/features/catalog/types'
import { Image } from '#/features/images/Image'
import { formatKobo } from '#/lib/money'
import { cn } from '#/lib/utils'
import { searchCatalog } from '../search'
import { useSearchStore } from '../store'

type Row =
  | { kind: 'scent'; product: ProductCardData }
  | { kind: 'note'; note: string; count: number }

function highlight(text: string, query: string) {
  const q = query.trim()
  const i = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1
  if (i < 0) return text
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-sm bg-blush text-inherit">
        {text.slice(i, i + q.length)}
      </mark>
      {text.slice(i + q.length)}
    </>
  )
}

const rowBase =
  'flex min-h-14 w-full cursor-pointer items-center gap-3.5 rounded-lg px-2 text-left'

/** Header search. `/` opens it instantly; keyboard navigation never animates. */
export function SearchDialog() {
  const { open, viaKeyboard, setOpen } = useSearchStore()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)

  const { data: products = [] } = useQuery({
    ...shopQueryOptions(),
    enabled: open,
  })

  const rows = useMemo<Row[]>(() => {
    if (!query.trim()) {
      const popular = [...products]
        .filter((p) => p.featuredRank !== null)
        .sort((a, b) => (a.featuredRank ?? 0) - (b.featuredRank ?? 0))
        .slice(0, 4)
      return popular.map((product) => ({ kind: 'scent', product }))
    }
    const { scents, notes } = searchCatalog(products, query)
    return [
      ...scents.map((product): Row => ({ kind: 'scent', product })),
      ...notes.map((n): Row => ({ kind: 'note', ...n })),
    ]
  }, [products, query])

  const close = () => setOpen(false)

  const go = (row: Row | undefined) => {
    if (!row) return
    close()
    if (row.kind === 'scent') {
      void navigate({ to: '/p/$slug', params: { slug: row.product.slug } })
    } else {
      void navigate({ to: '/shop', search: { q: row.note } })
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, rows.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (rows.length > 0) go(rows.at(active))
      else if (query.trim()) {
        close()
        void navigate({ to: '/shop', search: { q: query.trim() } })
      }
    }
  }

  const scentRows = rows.filter((r) => r.kind === 'scent')
  const noteRows = rows.filter((r) => r.kind === 'note')
  const heading = query.trim() ? 'Scents' : 'Popular'

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          setQuery('')
          setActive(0)
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-59 bg-overlay" />
        <Dialog.Content
          aria-describedby={undefined}
          className={cn(
            'fixed top-18 left-1/2 z-(--z-dialog) w-[min(640px,calc(100%-24px))] -translate-x-1/2 origin-top overflow-hidden rounded-3xl bg-surface shadow-lg outline-none',
            !viaKeyboard && 'animate-pop',
          )}
        >
          <Dialog.Title className="sr-only">Search scents</Dialog.Title>
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <Search
              size={20}
              strokeWidth={1.5}
              aria-hidden="true"
              className="shrink-0 text-muted"
            />
            <label className="sr-only" htmlFor="site-search">
              Search scents
            </label>
            <input
              id="site-search"
              type="search"
              autoFocus
              enterKeyHint="search"
              autoComplete="off"
              placeholder="Search scents or notes"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setActive(0)
              }}
              onKeyDown={onKeyDown}
              className="min-h-11 flex-1 border-0 bg-transparent text-lg [&::-webkit-search-cancel-button]:hidden text-ink outline-none placeholder:text-disabled"
            />
            <Dialog.Close
              aria-label="Close search"
              className="grid size-11 place-items-center rounded-pill transition-transform duration-150 active:scale-[0.97]"
            >
              <X size={22} strokeWidth={1.5} aria-hidden="true" />
            </Dialog.Close>
          </div>
          <div className="max-h-[60vh] overflow-y-auto overscroll-contain p-2">
            {rows.length === 0 && query.trim() ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <span className="font-serif text-[26px] leading-none">
                  Not on our shelf yet
                </span>
                <span className="text-sm text-text-2">
                  Nothing matches “{query.trim()}”. Press Enter to browse the
                  shop anyway.
                </span>
              </div>
            ) : (
              <div
                className="flex flex-col gap-1 py-2"
                role="listbox"
                aria-label="Results"
              >
                {scentRows.length > 0 ? (
                  <span className="px-2 pt-2 pb-1 text-xs font-semibold tracking-[0.14em] text-muted uppercase">
                    {heading}
                  </span>
                ) : null}
                {scentRows.map((row, i) => (
                  <button
                    key={row.product.id}
                    type="button"
                    role="option"
                    aria-selected={active === i}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(row)}
                    className={cn(rowBase, active === i && 'bg-blush')}
                  >
                    <span
                      className={cn(
                        'grid h-13 w-11 shrink-0 place-items-center overflow-hidden rounded-[10px]',
                        tierStyles[row.product.tier].tint,
                      )}
                    >
                      {row.product.image ? (
                        <Image
                          src={row.product.image.src}
                          alt=""
                          width={row.product.image.width}
                          height={row.product.image.height}
                          sizes="44px"
                          className="mix-blend-multiply"
                        />
                      ) : null}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate font-semibold">
                        {highlight(row.product.name, query)}
                      </span>
                      <span className="truncate text-[13px] text-muted">
                        {highlight(row.product.brand, query)} ·{' '}
                        {tierLabels[row.product.tier]}
                      </span>
                    </span>
                    <span className="font-semibold tabular-nums">
                      {formatKobo(row.product.fromKobo)}
                    </span>
                  </button>
                ))}
                {noteRows.length > 0 ? (
                  <span className="px-2 pt-4 pb-1 text-xs font-semibold tracking-[0.14em] text-muted uppercase">
                    Notes
                  </span>
                ) : null}
                {noteRows.map((row, j) => {
                  const index = scentRows.length + j
                  return (
                    <button
                      key={row.note}
                      type="button"
                      role="option"
                      aria-selected={active === index}
                      onMouseEnter={() => setActive(index)}
                      onClick={() => go(row)}
                      className={cn(
                        rowBase,
                        'min-h-12',
                        active === index && 'bg-blush',
                      )}
                    >
                      <Sprout size={18} strokeWidth={1.5} aria-hidden="true" />
                      {row.note}
                      <span className="ml-auto text-[13px] text-muted">
                        {row.count} {row.count === 1 ? 'scent' : 'scents'}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
          <div className="hidden gap-4 border-t border-border px-4 py-2.5 text-xs text-muted md:flex">
            <span>↑↓ to move</span>
            <span>Enter to open</span>
            <span>Esc to close</span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

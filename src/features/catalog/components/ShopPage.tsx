import { Search } from 'lucide-react'
import { Breadcrumb } from '#/components/ui/Breadcrumb'
import { applyShopSearch, hasActiveFilters } from '../filter'
import { tierLabels, tiers } from '../schemas'
import type { ShopSearch } from '../schemas'
import type { ProductCardData, Tier } from '../types'
import { FilterGroups } from './FilterGroups'
import { FilterSheet } from './FilterSheet'
import { Pill } from './Pill'
import { ProductCard } from './ProductCard'
import { ShopEmpty } from './ShopEmpty'
import { SortSelect } from './SortSelect'
import { TierBanner } from './TierBanner'

type Props = {
  products: ProductCardData[]
  search: ShopSearch
  /** Merge a patch into the URL search params. `replace` avoids a history entry per keystroke. */
  setSearch: (patch: Partial<ShopSearch>, replace?: boolean) => void
  clearSearch: () => void
}

function countActive(search: ShopSearch) {
  return [
    search.tier,
    search.gender,
    search.family,
    search.occasion,
    search.q?.trim(),
  ].filter(Boolean).length
}

export function ShopPage({ products, search, setSearch, clearSearch }: Props) {
  const results = applyShopSearch(products, search)
  const activeCount = countActive(search)
  const tierCounts = Object.fromEntries(
    tiers.map((t) => [t, products.filter((p) => p.tier === t).length]),
  ) as Record<Tier, number>
  const query = search.q?.trim()

  return (
    <main className="flex-1">
      {search.tier ? (
        <TierBanner tier={search.tier} count={tierCounts[search.tier]} />
      ) : null}
      <div className="page-container flex flex-col gap-6 pt-8 pb-18">
        {search.tier ? null : (
          <div className="flex flex-col gap-2.5">
            <Breadcrumb
              items={[{ label: 'Home', to: '/' }, { label: 'Shop' }]}
            />
            <h1 className="text-(length:--text-h1)">
              {query ? (
                <>
                  Results for <em>“{query}”</em>
                </>
              ) : (
                'All scents'
              )}
            </h1>
          </div>
        )}

        <div
          className="-mx-6 flex snap-x snap-mandatory gap-2 overflow-x-auto px-6 pb-1 md:hidden"
          role="group"
          aria-label="Tier"
        >
          <Pill
            pressed={!search.tier}
            className="snap-start"
            onClick={() => setSearch({ tier: undefined })}
          >
            All
          </Pill>
          {tiers.map((t) => (
            <Pill
              key={t}
              pressed={search.tier === t}
              className="snap-start"
              onClick={() => setSearch({ tier: t })}
            >
              {tierLabels[t]}
            </Pill>
          ))}
        </div>

        <div className="grid gap-10 md:grid-cols-[240px_minmax(0,1fr)]">
          <aside
            aria-label="Filters"
            className="sticky top-24 hidden flex-col gap-7 self-start md:flex"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">Filters</span>
              {hasActiveFilters(search) ? (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="text-sm font-semibold underline underline-offset-4"
                >
                  Clear all
                </button>
              ) : null}
            </div>
            <FilterGroups
              search={search}
              tierCounts={tierCounts}
              onChange={setSearch}
            />
          </aside>

          <div className="flex min-w-0 flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span
                className="text-sm text-text-2 tabular-nums"
                aria-live="polite"
              >
                {results.length} {results.length === 1 ? 'scent' : 'scents'}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <label className="sr-only" htmlFor="shop-q">
                    Search name or brand
                  </label>
                  <Search
                    size={16}
                    strokeWidth={1.5}
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted"
                  />
                  <input
                    id="shop-q"
                    type="search"
                    enterKeyHint="search"
                    autoComplete="off"
                    placeholder="Search name or brand"
                    value={search.q ?? ''}
                    onChange={(e) =>
                      setSearch({ q: e.target.value || undefined }, true)
                    }
                    className="min-h-10 w-48 rounded-pill border border-border bg-surface pr-4 pl-9 text-base transition-colors duration-180 hover:border-muted focus:border-ink focus:ring-3 focus:ring-ink/12 focus:outline-none sm:w-60"
                  />
                </div>
                <FilterSheet
                  search={search}
                  tierCounts={tierCounts}
                  resultCount={results.length}
                  activeCount={activeCount}
                  onChange={setSearch}
                  onClear={clearSearch}
                />
                <SortSelect
                  value={search.sort}
                  onChange={(sort) => setSearch({ sort })}
                />
              </div>
            </div>

            {results.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">
                {results.map((p, i) => (
                  <ProductCard key={p.id} product={p} eager={i < 4} />
                ))}
              </div>
            ) : (
              <ShopEmpty
                query={query}
                suggestions={applyShopSearch(products, {}).slice(0, 3)}
                onClear={clearSearch}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

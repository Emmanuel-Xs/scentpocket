import { ChevronDown } from 'lucide-react'
import { sortLabels, sorts } from '../schemas'
import type { ShopSearch } from '../schemas'

export function SortSelect({
  value,
  onChange,
}: {
  value: ShopSearch['sort']
  onChange: (sort: ShopSearch['sort']) => void
}) {
  return (
    <div className="relative">
      <label className="sr-only" htmlFor="sort">
        Sort by
      </label>
      <select
        id="sort"
        value={value ?? 'featured'}
        onChange={(e) => {
          const next = sorts.find((s) => s === e.target.value)
          onChange(next === 'featured' ? undefined : next)
        }}
        className="min-h-10 cursor-pointer appearance-none rounded-pill border border-border bg-surface pr-9 pl-4 text-sm transition-colors duration-180 hover:border-ink focus:border-ink focus:ring-3 focus:ring-ink/12 focus:outline-none"
      >
        {sorts.map((s) => (
          <option key={s} value={s}>
            {sortLabels[s]}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        strokeWidth={1.5}
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-muted"
      />
    </div>
  )
}

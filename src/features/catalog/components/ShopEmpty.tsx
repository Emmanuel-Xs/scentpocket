import { Link } from '@tanstack/react-router'
import { SearchX } from 'lucide-react'
import type { ProductCardData } from '../types'
import { ProductCard } from './ProductCard'

type Props = {
  query?: string
  suggestions: ProductCardData[]
  onClear: () => void
}

export function ShopEmpty({ query, suggestions, onClear }: Props) {
  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-3xl border border-dashed border-border bg-surface">
        <div className="mx-auto flex max-w-115 flex-col items-center gap-4 px-6 py-16 text-center">
          <span className="grid size-18 place-items-center rounded-full bg-blush">
            <SearchX size={30} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <h2 className="font-serif text-[34px] leading-none">
            Not on our shelf yet
          </h2>
          <p className="text-text-2">
            {query
              ? `We don't stock "${query}", and nothing matches those filters.`
              : 'Nothing matches those filters.'}{' '}
            Try fewer filters, or have a look at what people are wearing.
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            <button
              type="button"
              onClick={onClear}
              className="inline-flex min-h-12 items-center rounded-pill border border-ink bg-ink px-5.5 text-[15px] font-semibold text-cream transition-transform duration-150 ease-(--ease-out) active:scale-[0.97]"
            >
              Clear filters
            </button>
            <Link
              to="/dupes"
              className="inline-flex min-h-12 items-center rounded-pill border border-ink px-5.5 text-[15px] font-semibold text-ink no-underline transition-[transform,background-color,color] duration-150 ease-(--ease-out) active:scale-[0.97] hover:bg-ink hover:text-cream"
            >
              Browse dupes
            </Link>
          </div>
        </div>
      </div>
      {suggestions.length > 0 ? (
        <section className="flex flex-col gap-7">
          <h2 className="text-(length:--text-h2)">You might like</h2>
          <div className="grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-3">
            {suggestions.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { tierStyles } from '#/features/catalog/tiers'
import type { TierSummary } from '#/features/catalog/types'
import { cn } from '#/lib/utils'

export function TierCards({
  tiers,
  total,
}: {
  tiers: TierSummary[]
  total: number
}) {
  return (
    <section className="page-container flex flex-col gap-7 pb-16">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-(length:--text-h2)">Shop by pocket</h2>
        <span className="text-[15px] text-text-2">
          Four tiers. {total} scents. One promise: you&apos;ll smell good.
        </span>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
        {tiers.map(({ tier, count }) => {
          const style = tierStyles[tier]
          const isNiche = tier === 'niche'
          return (
            <Link
              key={tier}
              to="/shop"
              search={{ tier }}
              className={cn(
                'group relative flex min-h-65 flex-col justify-between gap-7 overflow-hidden rounded-3xl p-6.5 text-cream no-underline transition-transform duration-240 ease-(--ease-out) active:scale-[0.98] hover:-translate-y-1',
                style.bg,
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={cn(
                    'rounded-pill border border-dashed px-3 py-1.5 text-[13px] font-semibold',
                    isNiche
                      ? 'border-gold text-gold'
                      : 'border-cream/60 text-cream',
                  )}
                >
                  {style.range}
                </span>
                <span className="text-[13px]">{count} scents</span>
              </div>
              <div className="flex flex-col gap-2.5">
                <span className="font-serif text-[40px] leading-none">
                  {style.label}
                </span>
                <span className="max-w-70 text-[15px] leading-normal">
                  {style.blurb}
                </span>
                <span className="mt-1.5 inline-flex items-center gap-2 text-[15px] font-semibold">
                  Shop {style.label}
                  <ArrowRight
                    size={18}
                    strokeWidth={1.5}
                    aria-hidden="true"
                    className="transition-transform duration-240 ease-(--ease-out) group-hover:translate-x-1"
                  />
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

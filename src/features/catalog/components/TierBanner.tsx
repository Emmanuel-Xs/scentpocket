import { Breadcrumb } from '#/components/ui/Breadcrumb'
import { cn } from '#/lib/utils'
import { tierStyles } from '../tiers'
import type { Tier } from '../types'

export function TierBanner({ tier, count }: { tier: Tier; count: number }) {
  const style = tierStyles[tier]
  return (
    <section className={cn('text-cream', style.bg)}>
      <div className="page-container flex flex-wrap items-end justify-between gap-6 py-12">
        <div className="flex max-w-155 flex-col gap-3">
          <Breadcrumb
            className="text-white [&_a]:text-white"
            items={[
              { label: 'Home', to: '/' },
              { label: 'Shop', to: '/shop' },
              { label: style.label },
            ]}
          />
          <h1 className="text-(length:--text-h1)">{style.label}</h1>
          <p className="text-[17px] leading-relaxed">
            {style.range}. {style.blurb}
          </p>
        </div>
        <span className="rounded-pill border border-dashed border-cream/60 px-3 py-1.5 text-[13px] font-semibold">
          {count} {count === 1 ? 'scent' : 'scents'}
        </span>
      </div>
    </section>
  )
}

import { Link } from '@tanstack/react-router'
import { ArrowRight, Banknote, BadgeCheck, Truck } from 'lucide-react'
import { Breadcrumb } from '#/components/ui/Breadcrumb'
import { ProductCard } from '#/features/catalog/components/ProductCard'
import { tierStyles } from '#/features/catalog/tiers'
import type { ProductDetail } from '#/features/catalog/types'
import { FREE_DELIVERY_THRESHOLD_KOBO } from '#/lib/config'
import { formatKobo } from '#/lib/money'
import { BuyBox } from './BuyBox'
import { DupeCallout, InspiredAlert, SoldOutAlert } from './DupeBlocks'
import { Gallery } from './Gallery'
import { ScentInfo } from './ScentInfo'

export function ProductPage({ product }: { product: ProductDetail }) {
  const { card } = product
  const tierLabel = tierStyles[card.tier].label
  const crumbs = [
    { label: 'Home', to: '/' as const },
    { label: tierLabel, to: '/shop' as const, tier: card.tier },
    { label: card.name },
  ]
  const lowest = formatKobo(card.fromKobo)
  const bestDupe = [...product.dupes]
    .sort((a, b) => a.fromKobo - b.fromKobo)
    .at(0)
  const freeDelivery = card.fromKobo >= FREE_DELIVERY_THRESHOLD_KOBO

  return (
    <main className="flex-1">
      <div className="page-container flex flex-col gap-14 pt-6 pb-32 md:pb-18">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] items-start gap-12">
          <div className="flex flex-col gap-3.5">
            <Breadcrumb items={crumbs} className="hidden md:flex" />
            <Gallery product={product} />
          </div>
          <div className="flex flex-col gap-5.5 md:sticky md:top-24">
            <Breadcrumb items={crumbs} className="md:hidden" />
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">
                {card.brand}
              </span>
              <h1 className="text-[clamp(40px,5vw,60px)]">{card.name}</h1>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-2xl font-semibold tabular-nums">
                  {card.multiSize ? 'from ' : ''}
                  {lowest}
                </span>
                {card.soldOut ? (
                  <span className="rounded-pill bg-ink px-2.75 py-1.25 text-xs font-semibold text-cream">
                    Sold out
                  </span>
                ) : null}
              </div>
            </div>
            {product.inspiredBy ? (
              <InspiredAlert original={product.inspiredBy} dupe={card} />
            ) : null}
            <p className="text-base leading-[1.65] text-text-2">
              {product.description}
            </p>
            {card.soldOut ? (
              <SoldOutAlert name={card.name} dupe={bestDupe} original={card} />
            ) : null}
            <BuyBox product={product} />
            {bestDupe && !card.soldOut ? (
              <DupeCallout original={card} dupe={bestDupe} />
            ) : null}
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-sm text-text-2">
              <li className="flex items-center gap-2.5">
                <Truck size={18} strokeWidth={1.5} aria-hidden="true" />
                {freeDelivery
                  ? 'Free delivery on this order (over ₦300k)'
                  : 'Free delivery over ₦300k'}
              </li>
              <li className="flex items-center gap-2.5">
                <Banknote size={18} strokeWidth={1.5} aria-hidden="true" />
                Pay on delivery, cash or transfer
              </li>
              <li className="flex items-center gap-2.5">
                <BadgeCheck size={18} strokeWidth={1.5} aria-hidden="true" />
                100% authentic, sealed bottle
              </li>
            </ul>
          </div>
        </div>

        <ScentInfo product={product} />

        {product.related.length > 0 ? (
          <section className="flex flex-col gap-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="text-(length:--text-h2)">More {tierLabel}</h2>
              <Link
                to="/shop"
                search={{ tier: card.tier }}
                className="inline-flex items-center gap-1.5 font-semibold underline decoration-1 underline-offset-4"
              >
                See all{' '}
                <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">
              {product.related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  )
}

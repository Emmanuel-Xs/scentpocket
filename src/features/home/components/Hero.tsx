import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { tierStyles } from '#/features/catalog/tiers'
import type { ProductCardData } from '#/features/catalog/types'
import { Image } from '#/features/images/Image'
import { formatKobo } from '#/lib/money'

const MAX_WIDTHS = ['max-w-17', 'max-w-25', 'max-w-33', 'max-w-41']

const btnBase =
  'inline-flex min-h-14 items-center justify-center gap-2 rounded-pill border px-7 text-base font-semibold whitespace-nowrap no-underline transition-[transform,background-color,color] duration-150 ease-(--ease-out) active:scale-[0.97]'

export function Hero({
  ladder,
  priciest,
}: {
  ladder: ProductCardData[]
  priciest: number
}) {
  return (
    <section className="page-container flex flex-wrap items-center gap-12 pt-[clamp(32px,6vw,80px)] pb-[clamp(40px,6vw,72px)]">
      <div className="flex min-w-0 flex-[1_1_400px] flex-col gap-6">
        <span className="text-[13px] font-semibold tracking-[0.16em] text-pocket-text uppercase">
          Lagos fragrance shop
        </span>
        <h1 className="font-serif text-(length:--text-display) leading-[0.95] tracking-[-0.02em]">
          A scent for every <em>pocket.</em>
        </h1>
        <p className="max-w-120 text-lg leading-relaxed text-text-2">
          From a {formatKobo(ladder[0]?.fromKobo ?? 350000)} body spray to a{' '}
          {formatKobo(priciest)} Baccarat Rouge. Real perfumes, honest prices,
          and dupes that let you smell the part on any budget.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/shop"
            className={`${btnBase} border-ink bg-ink text-cream`}
          >
            Shop all scents{' '}
            <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
          </Link>
          <Link
            to="/dupes"
            className={`${btnBase} border-ink bg-transparent text-ink hover:bg-ink hover:text-cream`}
          >
            Find a dupe
          </Link>
        </div>
      </div>
      <div className="relative flex min-h-95 min-w-0 flex-[1_1_340px] items-end justify-center gap-[clamp(6px,2.5vw,28px)] rounded-3xl bg-blush px-3 pt-16 pb-8">
        <span className="absolute top-5.5 left-6 font-serif text-[22px] text-text-2 italic">
          Pick your pocket.
        </span>
        {ladder.map((p, i) => (
          <Link
            key={p.id}
            to="/p/$slug"
            params={{ slug: p.slug }}
            aria-label={`${p.brand} ${p.name}, ${formatKobo(p.fromKobo)}`}
            className={`flex min-w-0 flex-[1_1_0] flex-col items-center gap-3 no-underline ${MAX_WIDTHS[i] ?? 'max-w-41'}`}
          >
            {p.image ? (
              <Image
                src={p.image.src}
                alt=""
                width={p.image.width}
                height={p.image.height}
                blurDataUrl={p.image.blurDataUrl}
                priority={i === ladder.length - 1}
                eager
                sizes="(min-width: 760px) 160px, 22vw"
                className="mix-blend-multiply"
              />
            ) : null}
            <span
              className="rounded-pill border border-dashed bg-surface px-2 py-1.25 text-[clamp(11px,2.8vw,13px)] font-semibold whitespace-nowrap tabular-nums"
              style={{ borderColor: tierStyles[p.tier].hex }}
            >
              {formatKobo(p.fromKobo)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

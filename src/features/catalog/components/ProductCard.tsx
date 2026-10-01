import { Link } from '@tanstack/react-router'
import { Image } from '#/features/images/Image'
import { formatKobo } from '#/lib/money'
import { cn } from '#/lib/utils'
import { tierStyles } from '../tiers'
import type { ProductCardData } from '../types'
import { TierChip } from './TierChip'

type Props = {
  product: ProductCardData
  /** Above the fold: load eagerly. */
  eager?: boolean
}

export function ProductCard({ product, eager }: Props) {
  const { image } = product
  return (
    <Link
      to="/p/$slug"
      params={{ slug: product.slug }}
      className="group flex flex-col gap-3.5 text-ink no-underline"
    >
      <div
        className={cn(
          'relative grid aspect-4/5 place-items-center overflow-hidden rounded-[22px]',
          tierStyles[product.tier].tint,
          product.soldOut && 'opacity-75 grayscale-60',
        )}
      >
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            blurDataUrl={image.blurDataUrl}
            eager={eager}
            sizes="(min-width: 1024px) 280px, (min-width: 640px) 33vw, 50vw"
            className="mix-blend-multiply transition-transform duration-500 ease-(--ease-out) group-hover:-translate-y-1 group-hover:scale-105"
          />
        ) : null}
        <div className="absolute inset-x-3.5 top-3.5 flex justify-between gap-2">
          <TierChip tier={product.tier} />
          {product.soldOut ? (
            <span className="rounded-pill bg-ink px-2.75 py-1.25 text-xs font-semibold text-cream">
              Sold out
            </span>
          ) : product.lowStock !== null ? (
            <span className="rounded-pill bg-danger/7 px-2.75 py-1.25 text-xs font-semibold text-danger">
              Only {product.lowStock} left
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs tracking-[0.12em] text-muted uppercase">
          {product.brand}
        </span>
        <span className="font-serif text-[26px] leading-[1.1] group-hover:underline group-hover:decoration-1 group-hover:underline-offset-5">
          {product.name}
        </span>
        <span className="text-sm text-text-2">{product.notes.join(', ')}</span>
        <span className="mt-1 text-base font-semibold tabular-nums">
          {product.multiSize ? 'from ' : ''}
          {formatKobo(product.fromKobo)}
        </span>
      </div>
    </Link>
  )
}

import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { Image } from '#/features/images/Image'
import { formatKobo } from '#/lib/money'
import type { DupePair, ProductCardData } from '../types'

function DupeSide({
  product,
  original,
}: {
  product: ProductCardData
  original?: boolean
}) {
  return (
    <Link
      to="/p/$slug"
      params={{ slug: product.slug }}
      className={`flex flex-col items-center gap-2.5 rounded-lg px-2 py-4 no-underline ${original ? 'bg-ink/6' : 'bg-pocket/10'}`}
    >
      {product.image ? (
        <Image
          src={product.image.src}
          alt={product.image.alt}
          width={product.image.width}
          height={product.image.height}
          blurDataUrl={product.image.blurDataUrl}
          sizes="140px"
          className="max-w-28 mix-blend-multiply"
        />
      ) : null}
      <span className="text-center font-serif text-[19px] leading-[1.1]">
        {product.name}
      </span>
      <span
        className={
          original
            ? 'text-sm text-muted tabular-nums line-through'
            : 'text-[15px] font-semibold tabular-nums'
        }
      >
        {formatKobo(product.fromKobo)}
      </span>
    </Link>
  )
}

export function DupeCard({
  original,
  dupe,
  savingKobo,
  savingPercent,
}: DupePair) {
  return (
    <div className="flex flex-col gap-4.5 rounded-3xl border border-border bg-surface p-5.5">
      <div className="grid grid-cols-2 items-end gap-3">
        <DupeSide product={original} original />
        <DupeSide product={dupe} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-text-2">
          Same vibe. You save{' '}
          <strong className="text-ink">{formatKobo(savingKobo)}</strong> (
          {savingPercent}%).
        </span>
        <Link
          to="/p/$slug"
          params={{ slug: dupe.slug }}
          className="inline-flex items-center gap-1.5 text-sm font-semibold underline decoration-1 underline-offset-4"
        >
          See the dupe{' '}
          <ArrowRight size={16} strokeWidth={1.5} aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}

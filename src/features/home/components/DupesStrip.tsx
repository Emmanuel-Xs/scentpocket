import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { Image } from '#/features/images/Image'
import { formatKobo } from '#/lib/money'
import type { DupePair, ProductCardData } from '#/features/catalog/types'

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

export function DupesStrip({ dupes }: { dupes: DupePair[] }) {
  if (dupes.length === 0) return null
  return (
    <section className="border-y border-border bg-surface">
      <div className="page-container flex flex-col gap-7 py-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex max-w-160 flex-col gap-2.5">
            <span className="text-[13px] font-semibold tracking-[0.16em] text-pocket-text uppercase">
              Dupes
            </span>
            <h2 className="text-(length:--text-h2)">
              Same vibe, <em>smaller pocket.</em>
            </h2>
            <p className="text-base text-text-2">
              Love a luxury scent but not the price? These smell close enough
              that people will ask.
            </p>
          </div>
          <Link
            to="/dupes"
            className="inline-flex items-center gap-1.5 font-semibold underline decoration-1 underline-offset-4"
          >
            All dupes{' '}
            <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
          </Link>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(290px,1fr))] gap-4">
          {dupes.map(({ original, dupe, savingKobo, savingPercent }) => (
            <div
              key={dupe.id}
              className="flex flex-col gap-4.5 rounded-3xl border border-border bg-surface p-5.5"
            >
              <div className="grid grid-cols-2 items-end gap-3">
                <DupeSide product={original} original />
                <DupeSide product={dupe} />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm text-text-2">
                  Same vibe. You save{' '}
                  <strong className="text-ink">{formatKobo(savingKobo)}</strong>{' '}
                  ({savingPercent}%).
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
          ))}
        </div>
      </div>
    </section>
  )
}

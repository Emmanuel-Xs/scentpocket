import { Link } from '@tanstack/react-router'
import { Info, TriangleAlert } from 'lucide-react'
import { tierStyles } from '#/features/catalog/tiers'
import type { ProductCardData } from '#/features/catalog/types'
import { Image } from '#/features/images/Image'
import { formatKobo } from '#/lib/money'

const savingPercent = (original: ProductCardData, dupe: ProductCardData) =>
  Math.round(((original.fromKobo - dupe.fromKobo) / original.fromKobo) * 100)

/** On a dupe: points to the pricier scent it is inspired by. */
export function InspiredAlert({
  original,
  dupe,
}: {
  original: ProductCardData
  dupe: ProductCardData
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-info/20 bg-info/5 px-4 py-3.5 text-sm leading-normal text-info">
      <Info
        size={20}
        strokeWidth={1.5}
        aria-hidden="true"
        className="shrink-0"
      />
      <span className="flex-1">
        Inspired by{' '}
        <Link
          to="/p/$slug"
          params={{ slug: original.slug }}
          className="font-semibold underline underline-offset-4"
        >
          {original.brand} {original.name}
        </Link>{' '}
        <span className="text-muted tabular-nums line-through">
          {formatKobo(original.fromKobo)}
        </span>
        . Same vibe, {savingPercent(original, dupe)}% less.
      </span>
    </div>
  )
}

function DupeThumb({ dupe }: { dupe: ProductCardData }) {
  return (
    <div
      className={`grid h-22 w-18 shrink-0 place-items-center overflow-hidden rounded-[14px] ${tierStyles[dupe.tier].tint}`}
    >
      {dupe.image ? (
        <Image
          src={dupe.image.src}
          alt=""
          width={dupe.image.width}
          height={dupe.image.height}
          sizes="72px"
          className="mix-blend-multiply"
        />
      ) : null}
    </div>
  )
}

/** On the original: "Same vibe, smaller pocket" card pointing to the cheapest dupe. */
export function DupeCallout({
  original,
  dupe,
}: {
  original: ProductCardData
  dupe: ProductCardData
}) {
  const saving = Math.max(0, original.fromKobo - dupe.fromKobo)
  return (
    <div className="flex items-center gap-4 rounded-3xl border-2 border-dashed border-border bg-surface p-4.5">
      <DupeThumb dupe={dupe} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-[11px] font-semibold tracking-[0.16em] text-pocket-text uppercase">
          Same vibe, smaller pocket
        </span>
        <span className="font-serif text-[22px] leading-[1.1]">
          {dupe.name}
        </span>
        <span className="text-sm text-text-2">
          <span className="font-semibold tabular-nums">
            {formatKobo(dupe.fromKobo)}
          </span>{' '}
          · you save {formatKobo(saving)}
        </span>
      </div>
      <Link
        to="/p/$slug"
        params={{ slug: dupe.slug }}
        className="inline-flex min-h-10 items-center rounded-pill border border-ink px-4 text-sm font-semibold text-ink no-underline transition-[transform,background-color,color] duration-150 ease-(--ease-out) active:scale-[0.97] hover:bg-ink hover:text-cream"
      >
        View
      </Link>
    </div>
  )
}

/** All sizes gone: send people to the dupe if there is one. */
export function SoldOutAlert({
  name,
  dupe,
  original,
}: {
  name: string
  dupe?: ProductCardData
  original: ProductCardData
}) {
  return (
    <div
      role="status"
      className="flex flex-col gap-3 rounded-lg border border-danger/25 bg-danger/6 px-4 py-3.5 text-sm leading-normal text-[#6E1F1F]"
    >
      <span className="flex items-start gap-3">
        <TriangleAlert
          size={20}
          strokeWidth={1.5}
          aria-hidden="true"
          className="shrink-0"
        />
        <span>
          <strong>{name} is sold out.</strong> We don&apos;t know when the next
          batch lands.
        </span>
      </span>
      {dupe ? (
        <div className="flex items-center gap-3 rounded-[14px] bg-surface p-3 text-ink">
          <DupeThumb dupe={dupe} />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="font-serif text-xl leading-[1.1]">
              {dupe.name}
            </span>
            <span className="text-[13px] text-text-2">
              Close in spirit, {formatKobo(dupe.fromKobo)} instead of{' '}
              {formatKobo(original.fromKobo)}.
            </span>
          </div>
          <Link
            to="/p/$slug"
            params={{ slug: dupe.slug }}
            className="inline-flex min-h-10 items-center rounded-pill border border-ink bg-ink px-4 text-sm font-semibold text-cream no-underline transition-transform duration-150 active:scale-[0.97]"
          >
            See it
          </Link>
        </div>
      ) : null}
    </div>
  )
}

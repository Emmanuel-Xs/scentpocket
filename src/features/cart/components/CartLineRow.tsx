import { Link } from '@tanstack/react-router'
import { QuantityStepper } from '#/components/ui/QuantityStepper'
import { tierStyles } from '#/features/catalog/tiers'
import { Image } from '#/features/images/Image'
import { MAX_QTY_PER_LINE } from '#/lib/config'
import { formatKobo } from '#/lib/money'
import { cn } from '#/lib/utils'
import type { CartLine } from '../store'
import type { CartLineData } from '../types'

type Props = {
  line: CartLine
  info: CartLineData
  onQty: (qty: number) => void
  onRemove: () => void
  onNavigate: () => void
  /** The sign in merge is running: edits would be overwritten. */
  disabled?: boolean
}

export function CartLineRow({
  line,
  info,
  onQty,
  onRemove,
  onNavigate,
  disabled,
}: Props) {
  const max = Math.max(1, Math.min(info.stock, MAX_QTY_PER_LINE))
  return (
    <li className="flex gap-3.5 border-b border-border py-4">
      <Link
        to="/p/$slug"
        params={{ slug: info.productSlug }}
        onClick={onNavigate}
        aria-label={`View ${info.productName}`}
        className={cn(
          'grid h-23 w-19 shrink-0 place-items-center overflow-hidden rounded-[14px]',
          tierStyles[info.tier].tint,
        )}
      >
        {info.image ? (
          <Image
            src={info.image.src}
            alt=""
            width={info.image.width}
            height={info.image.height}
            sizes="76px"
            className="mix-blend-multiply"
          />
        ) : null}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-xs tracking-[0.1em] text-muted uppercase">
              {info.brand}
            </span>
            <span className="font-serif text-xl leading-[1.1]">
              {info.productName}
            </span>
            <span className="text-[13px] text-muted">{info.sizeMl}ml</span>
          </div>
          <span className="font-semibold tabular-nums">
            {formatKobo(info.priceKobo * line.qty)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <QuantityStepper
            value={line.qty}
            max={max}
            onChange={onQty}
            disabled={disabled}
          />
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            aria-label={`Remove ${info.productName}`}
            className="inline-flex min-h-10 items-center rounded-pill px-2 text-[13px] font-semibold text-muted underline underline-offset-4 transition-transform duration-150 active:scale-[0.97] hover:text-ink disabled:cursor-not-allowed disabled:text-disabled disabled:no-underline"
          >
            Remove
          </button>
        </div>
        {info.stock < MAX_QTY_PER_LINE && line.qty >= info.stock ? (
          <span className="text-[13px] text-arabian">
            {info.stock === 1 ? 'Only 1 left' : `Only ${info.stock} left`}
          </span>
        ) : null}
      </div>
    </li>
  )
}

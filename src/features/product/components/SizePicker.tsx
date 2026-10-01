import { cn } from '#/lib/utils'
import type { VariantData } from '#/features/catalog/types'
import { formatKobo } from '#/lib/money'

/** Price per ml, rounded to whole naira (still integer kobo). */
export const perMlKobo = (priceKobo: number, sizeMl: number) =>
  Math.round(priceKobo / sizeMl / 100) * 100

type Props = {
  variants: VariantData[]
  selectedId: string
  onSelect: (id: string) => void
}

/** A radiogroup of buttons, never a select. Sold out sizes stay visible, dashed and struck through. */
export function SizePicker({ variants, selectedId, onSelect }: Props) {
  return (
    <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
      <legend className="mb-2.5 text-sm font-semibold">Size</legend>
      <div
        role="radiogroup"
        aria-label="Size"
        className="flex flex-wrap gap-2.5"
      >
        {variants.map((v) => {
          const soldOut = v.stock === 0
          const checked = v.id === selectedId
          return (
            <button
              key={v.id}
              type="button"
              role="radio"
              aria-checked={checked}
              aria-disabled={soldOut}
              onClick={() => {
                if (!soldOut) onSelect(v.id)
              }}
              className={cn(
                'flex min-w-32 flex-col items-start gap-0.5 rounded-lg bg-surface px-4 py-3 text-left transition-[border-color,transform] duration-180 ease-(--ease-out) active:scale-[0.97]',
                checked && 'border-2 border-ink px-[15px] py-[11px]',
                !checked &&
                  !soldOut &&
                  'border border-border-strong hover:border-ink',
                soldOut &&
                  'cursor-not-allowed border border-dashed border-border-strong bg-cream text-disabled active:scale-100',
              )}
            >
              <span
                className={cn(
                  'text-[15px] font-semibold',
                  soldOut && 'line-through',
                )}
              >
                {v.sizeMl}ml
              </span>
              <span className="text-sm tabular-nums">
                {formatKobo(v.priceKobo)}
              </span>
              <span className="text-xs text-muted tabular-nums">
                {soldOut
                  ? 'Sold out'
                  : `${formatKobo(perMlKobo(v.priceKobo, v.sizeMl))}/ml`}
              </span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

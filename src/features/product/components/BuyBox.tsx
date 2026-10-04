import { ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { QuantityStepper } from '#/components/ui/QuantityStepper'
import { cartActions } from '#/features/cart/sync'
import { useCartUi } from '#/features/cart/ui-store'
import type { ProductDetail } from '#/features/catalog/types'
import { MAX_QTY_PER_LINE } from '#/lib/config'
import { formatKobo } from '#/lib/money'
import { SizePicker } from './SizePicker'

const addButton =
  'inline-flex min-h-14 items-center justify-center gap-2 rounded-pill border border-ink bg-ink px-7 text-base font-semibold whitespace-nowrap text-cream transition-transform duration-150 ease-(--ease-out) active:scale-[0.97] disabled:cursor-not-allowed disabled:border-border disabled:bg-border disabled:text-disabled disabled:active:scale-100'

/** Size, quantity and add to cart. Also renders the phone sticky buy bar. */
export function BuyBox({ product }: { product: ProductDetail }) {
  const { variants } = product
  const firstInStock = variants.find((v) => v.stock > 0)
  const [selectedId, setSelectedId] = useState(
    (firstInStock ?? variants.at(0))?.id ?? '',
  )
  const [qty, setQty] = useState(1)
  const merging = useCartUi((s) => s.merging)

  const variant = variants.find((v) => v.id === selectedId)
  if (!variant) return null

  const soldOut = !firstInStock
  const maxQty = Math.max(1, Math.min(variant.stock, MAX_QTY_PER_LINE))
  const totalKobo = variant.priceKobo * qty
  const cappedByStock = variant.stock > 0 && variant.stock < MAX_QTY_PER_LINE

  const select = (id: string) => {
    setSelectedId(id)
    setQty(1)
  }

  const add = () => {
    cartActions.add(variant.id, qty, variant.stock)
    toast.success(`Added ${qty} × ${product.card.name} (${variant.sizeMl}ml)`)
    useCartUi.getState().setOpen(true)
  }

  const label = soldOut ? 'Sold out' : `Add to cart · ${formatKobo(totalKobo)}`

  return (
    <>
      <SizePicker
        variants={variants}
        selectedId={variant.id}
        onSelect={select}
      />
      <div className="flex flex-wrap items-center gap-3">
        <QuantityStepper
          value={qty}
          max={maxQty}
          onChange={setQty}
          disabled={soldOut}
        />
        <button
          type="button"
          disabled={soldOut || variant.stock === 0 || merging}
          onClick={add}
          className={`${addButton} flex-[1_1_240px]`}
        >
          <ShoppingBag size={20} strokeWidth={1.5} aria-hidden="true" /> {label}
        </button>
      </div>
      {cappedByStock ? (
        <p className="-mt-2.5 text-[13px] text-muted">
          Only {variant.stock} {variant.stock === 1 ? 'bottle' : 'bottles'} of{' '}
          {variant.sizeMl}ml left, so quantity is capped at {variant.stock}.
        </p>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-(--z-tabbar) flex items-center gap-3 border-t border-border bg-cream/96 px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] backdrop-blur-md md:hidden">
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-xs text-muted">
            {variant.sizeMl}ml × {qty}
          </span>
          <span className="text-lg font-semibold tabular-nums">
            {formatKobo(totalKobo)}
          </span>
        </div>
        <button
          type="button"
          disabled={soldOut || variant.stock === 0 || merging}
          onClick={add}
          className={`${addButton} min-h-12 flex-1`}
        >
          {soldOut ? 'Sold out' : 'Add to cart'}
        </button>
      </div>
    </>
  )
}

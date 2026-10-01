import { ShoppingBag } from 'lucide-react'
import { selectCartCount, useCartStore } from '../store'
import { useCartUi } from '../ui-store'

/** Header cart pill with the total item count. */
export function CartButton() {
  const count = useCartStore(selectCartCount)
  const setOpen = useCartUi((s) => s.setOpen)
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label={count > 0 ? `Open cart, ${count} items` : 'Open cart'}
      className="inline-flex h-11 items-center gap-2 rounded-pill border border-ink px-3.5 text-sm font-semibold text-ink transition-[transform,background-color,color] duration-180 ease-(--ease-out) select-none active:scale-[0.97] hover:bg-ink hover:text-cream"
    >
      <ShoppingBag size={20} strokeWidth={1.5} aria-hidden="true" />
      <span className="tabular-nums" suppressHydrationWarning>
        {count}
      </span>
    </button>
  )
}

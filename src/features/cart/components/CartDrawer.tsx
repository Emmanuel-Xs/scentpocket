import NumberFlow from '@number-flow/react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ArrowRight, ShoppingBag, TriangleAlert, X } from 'lucide-react'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from '#/components/ui/drawer'
import { useIsPhone } from '#/lib/use-is-phone'
import { cartLinesQueryOptions } from '../queries'
import { cartSubtotalKobo } from '../reconcile'
import { selectCartCount, useCartStore } from '../store'
import { useCartUi } from '../ui-store'
import { CartLineRow } from './CartLineRow'
import { FreeDeliveryProgress } from './FreeDeliveryProgress'

const primary =
  'inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-pill border border-ink bg-ink px-7 text-base font-semibold text-cream no-underline transition-transform duration-150 ease-(--ease-out) active:scale-[0.97]'

function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <div className="mx-auto flex max-w-115 flex-col items-center gap-4 px-6 py-16 text-center">
      <span className="grid size-18 place-items-center rounded-full bg-blush">
        <ShoppingBag size={30} strokeWidth={1.5} aria-hidden="true" />
      </span>
      <h2 className="font-serif text-[34px] leading-none">
        Your cart is empty
      </h2>
      <p className="text-text-2">
        Start with a tier, or find a dupe of a scent you already love.
      </p>
      <Link
        to="/shop"
        onClick={onClose}
        className="inline-flex min-h-12 items-center rounded-pill border border-ink bg-ink px-5.5 text-[15px] font-semibold text-cream no-underline transition-transform duration-150 ease-(--ease-out) active:scale-[0.97]"
      >
        Shop all scents
      </Link>
    </div>
  )
}

/** Right drawer on desktop, bottom sheet on phone. Prices and stock come from the server. */
export function CartDrawer() {
  const { open, notice, setOpen } = useCartUi()
  const isPhone = useIsPhone()
  const lines = useCartStore((s) => s.lines)
  const count = useCartStore(selectCartCount)
  const setQty = useCartStore((s) => s.setQty)
  const remove = useCartStore((s) => s.remove)

  const { data = [], isPending } = useQuery(
    cartLinesQueryOptions(lines.map((l) => l.variantId)),
  )
  const byId = new Map(data.map((d) => [d.variantId, d]))
  const visible = lines.flatMap((line) => {
    const info = byId.get(line.variantId)
    return info ? [{ line, info }] : []
  })
  const subtotalKobo = cartSubtotalKobo(lines, data)
  const close = () => setOpen(false)
  const loading = lines.length > 0 && isPending

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      direction={isPhone ? 'bottom' : 'right'}
    >
      <DrawerContent
        aria-describedby={undefined}
        className={
          isPhone
            ? 'inset-x-0 bottom-0 max-h-[90dvh] rounded-t-3xl'
            : 'inset-y-0 right-0 w-[min(440px,100%)]'
        }
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4.5">
          <DrawerTitle className="font-serif text-[28px] leading-none">
            Your cart{count > 0 ? ` (${count})` : ''}
          </DrawerTitle>
          <DrawerDescription className="sr-only">
            Review the scents in your cart
          </DrawerDescription>
          <DrawerClose
            aria-label="Close cart"
            className="grid size-11 place-items-center rounded-pill transition-transform duration-150 active:scale-[0.97]"
          >
            <X size={22} strokeWidth={1.5} aria-hidden="true" />
          </DrawerClose>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-2">
          {notice ? (
            <div
              role="status"
              className="mt-3 flex gap-3 rounded-lg border border-danger/25 bg-danger/6 px-4 py-3.5 text-sm leading-normal text-[#6E1F1F]"
            >
              <TriangleAlert
                size={20}
                strokeWidth={1.5}
                aria-hidden="true"
                className="shrink-0"
              />
              <div>
                <strong>We updated your cart.</strong> {notice}
              </div>
            </div>
          ) : null}
          {lines.length === 0 ? (
            <EmptyCart onClose={close} />
          ) : loading ? (
            <div
              className="flex flex-col gap-4 py-4"
              aria-busy="true"
              aria-label="Loading cart"
            >
              {lines.map((l) => (
                <div key={l.variantId} className="flex gap-3.5">
                  <div className="sk h-23 w-19 rounded-[14px]" />
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="sk h-3 w-1/3 rounded-md" />
                    <div className="sk h-5 w-3/4 rounded-md" />
                    <div className="sk h-10 w-28 rounded-pill" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ul className="m-0 list-none p-0">
              {visible.map(({ line, info }) => (
                <CartLineRow
                  key={line.variantId}
                  line={line}
                  info={info}
                  onQty={(qty) => setQty(line.variantId, qty)}
                  onRemove={() => remove(line.variantId)}
                  onNavigate={close}
                />
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 ? (
          <div className="flex flex-col gap-4 border-t border-border bg-cream px-5 pt-4 pb-[calc(20px+env(safe-area-inset-bottom,0px))]">
            <FreeDeliveryProgress subtotalKobo={subtotalKobo} />
            <div className="flex justify-between text-base">
              <span>Subtotal</span>
              <NumberFlow
                className="text-lg font-semibold tabular-nums"
                value={subtotalKobo / 100}
                locales="en-NG"
                format={{
                  style: 'currency',
                  currency: 'NGN',
                  maximumFractionDigits: 0,
                }}
              />
            </div>
            <span className="-mt-2 text-[13px] text-muted">
              Delivery and total are worked out at checkout.
            </span>
            {/* Checkout route arrives in 3.2; sign in is the gate until then. */}
            <Link to="/sign-in" onClick={close} className={primary}>
              Checkout{' '}
              <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
            </Link>
            <Link
              to="/shop"
              onClick={close}
              className="self-center rounded-pill px-2 py-2 text-[15px] font-semibold underline underline-offset-4"
            >
              Keep shopping
            </Link>
          </div>
        ) : null}
      </DrawerContent>
    </Drawer>
  )
}

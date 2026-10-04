import type { QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { setCartItem } from './server/cart'
import { useCartStore } from './store'
import type { CartLine } from './store'
import type { ServerCart } from './types'
import { useCartUi } from './ui-store'

/**
 * Signed in cart sync. The server cart is the truth; the Zustand store mirrors it.
 * Every change is applied to the store first (optimistic) and then saved with `setCartItem`.
 * Signed out (ownerId null) the store is the only copy and nothing is sent.
 */

export const SERVER_CART_KEY = ['cart', 'server'] as const

let queryClient: QueryClient | null = null
export const bindCartQueryClient = (client: QueryClient) => {
  queryClient = client
}

type Op = {
  /** The quantity the server last confirmed; where we roll back to on an error. */
  confirmed: number
  /** Changed again while a request was in flight: send the newest value next. */
  dirty: boolean
}
/** One entry per variant with a save in flight. Saves for a variant never overlap, so they land in order. */
const ops = new Map<string, Op>()

export const hasPendingSaves = () => ops.size > 0

const qtyOf = (variantId: string) =>
  useCartStore.getState().lines.find((l) => l.variantId === variantId)?.qty ?? 0

function setLocalQty(variantId: string, qty: number) {
  const { lines } = useCartStore.getState()
  const next =
    qty <= 0
      ? lines.filter((l) => l.variantId !== variantId)
      : lines.some((l) => l.variantId === variantId)
        ? lines.map((l) => (l.variantId === variantId ? { ...l, qty } : l))
        : [...lines, { variantId, qty }]
  useCartStore.setState({ lines: next })
}

export function sameLines(a: CartLine[], b: CartLine[]): boolean {
  if (a.length !== b.length) return false
  const byId = new Map(a.map((l) => [l.variantId, l.qty]))
  return b.every((l) => byId.get(l.variantId) === l.qty)
}

/**
 * Makes the store match a server cart and says why when the server changed something itself
 * (sold out, lowered to stock). Edits from another device change the lines silently.
 */
export function mirrorServerCart(cart: ServerCart) {
  const lines = cart.lines.map((l) => ({
    variantId: l.variantId,
    qty: l.quantity,
  }))
  const { lines: current, ownerId } = useCartStore.getState()
  if (ownerId && !sameLines(current, lines)) useCartStore.setState({ lines })
  if (cart.messages.length > 0) {
    const notice = cart.messages.join(' ')
    useCartUi.getState().setNotice(notice)
    toast.info('We updated your cart', { description: notice })
  }
}

async function flush(variantId: string, op: Op) {
  let cart: ServerCart
  do {
    op.dirty = false
    try {
      cart = await setCartItem({
        data: { variantId, quantity: qtyOf(variantId) },
      })
      op.confirmed =
        cart.lines.find((l) => l.variantId === variantId)?.quantity ?? 0
    } catch {
      setLocalQty(variantId, op.confirmed)
      toast.error("We couldn't update your cart", {
        description: 'Check your connection and try again.',
      })
      ops.delete(variantId)
      return
    }
    // `dirty` is set by save() while the request above was in flight (TS cannot see that).
  } while (ops.get(variantId)?.dirty)

  ops.delete(variantId)
  // The query cache feeds the mirror effect in CartSync, which skips it while other saves run.
  queryClient?.setQueryData(SERVER_CART_KEY, cart)
}

function save(variantId: string, qtyBefore: number) {
  if (useCartStore.getState().ownerId === null) return
  // A poll that started before this change would put the old quantity back when it lands.
  void queryClient?.cancelQueries({ queryKey: SERVER_CART_KEY })
  const running = ops.get(variantId)
  if (running) {
    running.dirty = true
    return
  }
  const op: Op = { confirmed: qtyBefore, dirty: false }
  ops.set(variantId, op)
  void flush(variantId, op)
}

/** The only way the UI changes the cart. Optimistic locally; saved to the server when signed in. */
export const cartActions = {
  add(variantId: string, qty: number, maxQty?: number) {
    const before = qtyOf(variantId)
    useCartStore.getState().add(variantId, qty, maxQty)
    save(variantId, before)
  },
  setQty(variantId: string, qty: number) {
    const before = qtyOf(variantId)
    useCartStore.getState().setQty(variantId, qty)
    save(variantId, before)
  },
  remove(variantId: string) {
    const before = qtyOf(variantId)
    useCartStore.getState().remove(variantId)
    save(variantId, before)
  },
}

/** Sign out: the local cart goes (the server keeps the user's cart for next time). */
export function clearCartOnSignOut() {
  ops.clear()
  useCartStore.getState().reset()
  queryClient?.removeQueries({ queryKey: SERVER_CART_KEY })
  useCartUi.getState().setNotice(null)
}

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MAX_QTY_PER_LINE } from '#/lib/config'

/** The cart stores only variant ids and quantities. Prices and stock always come from the server. */
export type CartLine = { variantId: string; qty: number }

type CartState = {
  lines: CartLine[]
  /**
   * Who the lines mirror: null while they are this device's own (signed out) lines, a user id once
   * they mirror that user's server cart. It is what keeps the one-time merge from running on a mirror.
   */
  ownerId: string | null
  add: (variantId: string, qty: number, maxQty?: number) => void
  setQty: (variantId: string, qty: number) => void
  remove: (variantId: string) => void
  /** Empties the lines but keeps the owner (the order just emptied the server cart too). */
  clear: () => void
  /** Signed out: forget the lines and the owner. */
  reset: () => void
  /** Replace the lines with the server's, for this owner. */
  adopt: (lines: CartLine[], ownerId: string) => void
}

const clamp = (qty: number, max = MAX_QTY_PER_LINE) =>
  Math.max(1, Math.min(Math.floor(qty), max, MAX_QTY_PER_LINE))

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      ownerId: null,
      add: (variantId, qty, maxQty) =>
        set((state) => {
          const existing = state.lines.find((l) => l.variantId === variantId)
          if (!existing)
            return {
              lines: [...state.lines, { variantId, qty: clamp(qty, maxQty) }],
            }
          return {
            lines: state.lines.map((l) =>
              l.variantId === variantId
                ? { ...l, qty: clamp(l.qty + qty, maxQty) }
                : l,
            ),
          }
        }),
      setQty: (variantId, qty) =>
        set((state) => ({
          lines: state.lines.map((l) =>
            l.variantId === variantId ? { ...l, qty: clamp(qty) } : l,
          ),
        })),
      remove: (variantId) =>
        set((state) => ({
          lines: state.lines.filter((l) => l.variantId !== variantId),
        })),
      clear: () => set({ lines: [] }),
      reset: () => set({ lines: [], ownerId: null }),
      adopt: (lines, ownerId) => set({ lines, ownerId }),
    }),
    {
      name: 'scentpocket-cart',
      version: 2,
      // v1 carts were always this device's own lines.
      migrate: (persisted) => ({
        ...(persisted as { lines?: CartLine[] }),
        ownerId: null,
      }),
    },
  ),
)

export const selectCartCount = (state: CartState) =>
  state.lines.reduce((sum, l) => sum + l.qty, 0)

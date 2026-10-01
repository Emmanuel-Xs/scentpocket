import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MAX_QTY_PER_LINE } from '#/lib/config'

/** The cart stores only variant ids and quantities. Prices and stock always come from the server. */
export type CartLine = { variantId: string; qty: number }

type CartState = {
  lines: CartLine[]
  add: (variantId: string, qty: number, maxQty?: number) => void
  setQty: (variantId: string, qty: number) => void
  remove: (variantId: string) => void
  clear: () => void
}

const clamp = (qty: number, max = MAX_QTY_PER_LINE) =>
  Math.max(1, Math.min(Math.floor(qty), max, MAX_QTY_PER_LINE))

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
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
    }),
    { name: 'scentpocket-cart', version: 1 },
  ),
)

export const selectCartCount = (state: CartState) =>
  state.lines.reduce((sum, l) => sum + l.qty, 0)

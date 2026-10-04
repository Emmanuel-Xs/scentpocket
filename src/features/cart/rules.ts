import { MAX_QTY_PER_LINE } from '#/lib/config'

/** The most of one variant a cart can hold: what is in stock, never more than the per line cap. */
export const maxCartQuantity = (stock: number) =>
  Math.max(0, Math.min(stock, MAX_QTY_PER_LINE))

/** Clamps a requested quantity to `0..maxCartQuantity(stock)`. 0 means "not in the cart". */
export function clampQuantity(quantity: number, stock: number): number {
  return Math.max(0, Math.min(Math.floor(quantity), maxCartQuantity(stock)))
}

/** Merge rule: the same variant adds its quantities, capped at stock (and the per line cap). */
export function mergeQuantity(
  existing: number,
  incoming: number,
  stock: number,
): number {
  return clampQuantity(existing + incoming, stock)
}

/** The same variant listed twice becomes one entry with the quantities added up. */
export function combineItems(
  items: { variantId: string; quantity: number }[],
): Map<string, number> {
  const combined = new Map<string, number>()
  for (const { variantId, quantity } of items)
    combined.set(variantId, (combined.get(variantId) ?? 0) + quantity)
  return combined
}

import { maxCartQuantity } from './rules'
import type { CartLine } from './store'
import type { CartLineData } from './types'

export type Reconciled = { lines: CartLine[]; messages: string[] }

/**
 * Compares the stored cart with what the server says exists right now.
 * Drops variants that are gone or sold out and clamps quantities to stock.
 * Returns the same lines (and no messages) when nothing needs to change.
 */
export function reconcileCart(
  lines: CartLine[],
  data: CartLineData[],
): Reconciled {
  const byId = new Map(data.map((d) => [d.variantId, d]))
  const next: CartLine[] = []
  const messages: string[] = []
  let unavailable = 0

  for (const line of lines) {
    const info = byId.get(line.variantId)
    if (!info) {
      unavailable += 1
      continue
    }
    const label = `${info.productName} ${info.sizeMl}ml`
    if (info.stock <= 0) {
      messages.push(`${label} sold out and was removed.`)
      continue
    }
    const max = maxCartQuantity(info.stock)
    if (line.qty > max) {
      messages.push(`${label} is down to ${max}.`)
      next.push({ ...line, qty: max })
    } else {
      next.push(line)
    }
  }

  if (unavailable > 0) {
    messages.push(
      unavailable === 1
        ? 'An item is no longer available and was removed.'
        : `${unavailable} items are no longer available and were removed.`,
    )
  }
  return { lines: messages.length > 0 ? next : lines, messages }
}

export function cartSubtotalKobo(
  lines: CartLine[],
  data: CartLineData[],
): number {
  const byId = new Map(data.map((d) => [d.variantId, d]))
  return lines.reduce(
    (sum, l) => sum + (byId.get(l.variantId)?.priceKobo ?? 0) * l.qty,
    0,
  )
}

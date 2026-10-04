import { and, asc, eq, gt, inArray } from 'drizzle-orm'
import type { Db } from '#/db/client'
import { cartItems } from '#/db/schema'
import { reconcileCart } from '../reconcile'
import { combineItems, mergeQuantity } from '../rules'
import type { CartLineData, ServerCart, ServerCartLine } from '../types'
import { loadCartLineData } from './cart-data'

/** Thrown when a cart operation names a variant that does not exist or is not for sale. */
export class CartError extends Error {
  readonly code = 'variant_not_found'
  constructor() {
    super('That item is not available.')
    this.name = 'CartError'
  }
}

/** The stored rows exactly as they are, without reconciling. Checkout uses this so it never changes quantities silently. */
export async function listCartItems(db: Db, userId: string) {
  return db
    .select({ variantId: cartItems.variantId, quantity: cartItems.quantity })
    .from(cartItems)
    .where(eq(cartItems.userId, userId))
    .orderBy(asc(cartItems.createdAt), asc(cartItems.id))
}

const label = (d: CartLineData) => `${d.productName} ${d.sizeMl}ml`

function toCart(lines: ServerCartLine[], messages: string[]): ServerCart {
  return {
    lines,
    itemCount: lines.reduce((sum, l) => sum + l.quantity, 0),
    subtotalKobo: lines.reduce((sum, l) => sum + l.priceKobo * l.quantity, 0),
    changed: messages.length > 0 || lines.some((l) => l.changed),
    messages,
  }
}

/**
 * The user's cart with current prices and stock. Reconciles first (FR-3.3): variants that are
 * gone or sold out are removed, quantities above stock are lowered, and the stored rows are
 * fixed to match, so the answer and the database never disagree.
 */
export async function getCart(db: Db, userId: string): Promise<ServerCart> {
  const rows = await listCartItems(db, userId)
  if (rows.length === 0) return toCart([], [])

  const data = await loadCartLineData(
    db,
    rows.map((r) => r.variantId),
  )
  const stored = rows.map((r) => ({ variantId: r.variantId, qty: r.quantity }))
  const { lines: kept, messages } = reconcileCart(stored, data)

  const keptIds = new Set(kept.map((l) => l.variantId))
  const removed = stored.filter((l) => !keptIds.has(l.variantId))
  if (removed.length > 0)
    await db.delete(cartItems).where(
      and(
        eq(cartItems.userId, userId),
        inArray(
          cartItems.variantId,
          removed.map((l) => l.variantId),
        ),
      ),
    )

  const byId = new Map(data.map((d) => [d.variantId, d]))
  const lines: ServerCartLine[] = []
  for (const line of kept) {
    const info = byId.get(line.variantId)
    if (!info) continue
    const before = stored.find((s) => s.variantId === line.variantId)?.qty ?? 0
    const changed = line.qty < before
    if (changed)
      await db
        .update(cartItems)
        .set({ quantity: line.qty })
        .where(
          and(
            eq(cartItems.userId, userId),
            eq(cartItems.variantId, line.variantId),
            gt(cartItems.quantity, line.qty),
          ),
        )
    lines.push({ ...info, quantity: line.qty, changed })
  }
  return toCart(lines, messages)
}

/** Adds the server's explanation of what it changed on top of a freshly read cart. */
function withNotes(
  cart: ServerCart,
  messages: string[],
  changedIds: string[],
): ServerCart {
  if (messages.length === 0) return cart
  return {
    ...cart,
    lines: cart.lines.map((l) =>
      changedIds.includes(l.variantId) ? { ...l, changed: true } : l,
    ),
    changed: true,
    messages: [...messages, ...cart.messages],
  }
}

/**
 * Sets one line to an absolute quantity (0 removes it). Above stock is clamped, not rejected,
 * and the response says so. Unknown or inactive variants throw CartError.
 */
export async function setCartItem(
  db: Db,
  userId: string,
  variantId: string,
  quantity: number,
): Promise<ServerCart> {
  if (quantity <= 0) {
    await db
      .delete(cartItems)
      .where(
        and(eq(cartItems.userId, userId), eq(cartItems.variantId, variantId)),
      )
    return getCart(db, userId)
  }

  const data = await loadCartLineData(db, [variantId])
  if (data.length === 0) throw new CartError()
  const { lines: kept, messages } = reconcileCart(
    [{ variantId, qty: quantity }],
    data,
  )
  const line = kept.at(0)
  if (!line) {
    // Sold out: nothing to keep.
    await db
      .delete(cartItems)
      .where(
        and(eq(cartItems.userId, userId), eq(cartItems.variantId, variantId)),
      )
  } else {
    await db
      .insert(cartItems)
      .values({ userId, variantId, quantity: line.qty })
      .onConflictDoUpdate({
        target: [cartItems.userId, cartItems.variantId],
        set: { quantity: line.qty },
      })
  }
  return withNotes(await getCart(db, userId), messages, [variantId])
}

export async function clearCart(db: Db, userId: string): Promise<ServerCart> {
  await db.delete(cartItems).where(eq(cartItems.userId, userId))
  return toCart([], [])
}

/**
 * Folds a signed out (local) cart into the server cart. The same variant adds quantities, capped
 * at stock and the per line cap. Variants that no longer exist or are sold out are skipped and
 * reported. Call it once per sign in: calling it twice with the same lines adds them twice.
 */
export async function mergeCart(
  db: Db,
  userId: string,
  items: { variantId: string; quantity: number }[],
): Promise<ServerCart> {
  const combined = combineItems(items)
  if (combined.size === 0) return getCart(db, userId)

  const ids = [...combined.keys()]
  const data = await loadCartLineData(db, ids)
  const byId = new Map(data.map((d) => [d.variantId, d]))
  const messages: string[] = []
  const changedIds: string[] = []
  let unavailable = 0

  await db.transaction(async (tx) => {
    const existing = await tx
      .select({ variantId: cartItems.variantId, quantity: cartItems.quantity })
      .from(cartItems)
      .where(
        and(eq(cartItems.userId, userId), inArray(cartItems.variantId, ids)),
      )
    const existingById = new Map(existing.map((e) => [e.variantId, e.quantity]))

    for (const [variantId, incoming] of combined) {
      const info = byId.get(variantId)
      if (!info) {
        unavailable += 1
        continue
      }
      const before = existingById.get(variantId) ?? 0
      const merged = mergeQuantity(before, incoming, info.stock)
      if (merged <= 0) {
        messages.push(`${label(info)} sold out and was not added.`)
        continue
      }
      if (merged < before + incoming) {
        messages.push(`${label(info)} is down to ${merged}.`)
        changedIds.push(variantId)
      }
      await tx
        .insert(cartItems)
        .values({ userId, variantId, quantity: merged })
        .onConflictDoUpdate({
          target: [cartItems.userId, cartItems.variantId],
          set: { quantity: merged },
        })
    }
  })

  if (unavailable > 0)
    messages.push(
      unavailable === 1
        ? 'An item is no longer available and was not added.'
        : `${unavailable} items are no longer available and were not added.`,
    )
  return withNotes(await getCart(db, userId), messages, changedIds)
}

import { and, asc, desc, eq, gte, inArray, ne, sql } from 'drizzle-orm'
import type { Db } from '#/db/client'
import {
  cartItems,
  orderItems,
  orders,
  productImages,
  productVariants,
  products,
} from '#/db/schema'
import { DUPLICATE_ORDER_WINDOW_SECONDS, MAX_QTY_PER_LINE } from '#/lib/config'
import { orderTotals } from '#/lib/money'
import type { OrderTotals } from '#/lib/money'
import { generateOrderRef } from '#/lib/order-ref'
import type { PlaceOrderData } from '../schemas'

export type ShortLine = { variantId: string; available: number }

/** Thrown inside the transaction so everything rolls back. */
export class StockError extends Error {
  readonly short: ShortLine[]
  constructor(short: ShortLine[]) {
    super('Not enough stock')
    this.name = 'StockError'
    this.short = short
  }
}

/** Thrown inside the transaction when a concurrent request already placed this order. */
class DuplicateOrder extends Error {}

export type CreatedOrder = {
  id: string
  ref: string
  totals: OrderTotals
  duplicate: boolean
}

const MAX_REF_ATTEMPTS = 3

/** Same variant twice becomes one line. */
export function mergeLines(items: PlaceOrderData['items']) {
  const merged = new Map<string, number>()
  for (const { variantId, qty } of items) {
    merged.set(
      variantId,
      Math.min(MAX_QTY_PER_LINE, (merged.get(variantId) ?? 0) + qty),
    )
  }
  return [...merged.entries()]
    .map(([variantId, qty]) => ({ variantId, qty }))
    .sort((a, b) => a.variantId.localeCompare(b.variantId))
}

type Line = ReturnType<typeof mergeLines>[number]

async function findExisting(
  db: Db,
  userId: string,
  key: string,
  lines: Line[],
) {
  const byKey = await db
    .select()
    .from(orders)
    .where(and(eq(orders.userId, userId), eq(orders.idempotencyKey, key)))
    .limit(1)
  const hit = byKey.at(0)
  if (hit) return hit

  // Double clicks that somehow carry different keys: an identical cart from the same user
  // in the last few seconds is the same order.
  const since = new Date(Date.now() - DUPLICATE_ORDER_WINDOW_SECONDS * 1000)
  const recent = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.userId, userId),
        gte(orders.createdAt, since),
        // A cancelled order is not a duplicate: the customer may be re-ordering.
        ne(orders.status, 'cancelled'),
      ),
    )
    .orderBy(desc(orders.createdAt))
  for (const order of recent) {
    const items = await db
      .select({ variantId: orderItems.variantId, qty: orderItems.qty })
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id))
    const same =
      items.length === lines.length &&
      lines.every((l) =>
        items.some((i) => i.variantId === l.variantId && i.qty === l.qty),
      )
    if (same) return order
  }
  return null
}

function toCreated(
  order: typeof orders.$inferSelect,
  duplicate: boolean,
): CreatedOrder {
  return {
    id: order.id,
    ref: order.ref,
    duplicate,
    totals: {
      subtotalKobo: order.subtotalKobo,
      deliveryFeeKobo: order.deliveryFeeKobo,
      totalKobo: order.totalKobo,
    },
  }
}

/**
 * Places an order in one transaction. Prices, fees and totals come from the database and config,
 * never from the caller. Stock is taken with a conditional UPDATE, so two buyers of the last
 * bottle cannot both succeed. Throws StockError (nothing written) when any line is short.
 */
export async function createOrder(
  db: Db,
  user: { id: string; email: string },
  input: PlaceOrderData,
): Promise<CreatedOrder> {
  const lines = mergeLines(input.items)

  const existing = await findExisting(db, user.id, input.idempotencyKey, lines)
  if (existing) return toCreated(existing, true)

  try {
    return await db.transaction(async (tx) => {
      const ids = lines.map((l) => l.variantId)
      const rows = await tx
        .select({
          variantId: productVariants.id,
          productId: products.id,
          productName: products.name,
          variantLabel: productVariants.label,
          priceKobo: productVariants.priceKobo,
        })
        .from(productVariants)
        .innerJoin(products, eq(products.id, productVariants.productId))
        .where(
          and(
            inArray(productVariants.id, ids),
            eq(productVariants.isActive, true),
            eq(products.isActive, true),
          ),
        )
      const byId = new Map(rows.map((r) => [r.variantId, r]))

      // Take stock in a fixed order (sorted ids) so concurrent orders cannot deadlock.
      const short: ShortLine[] = []
      for (const line of lines) {
        if (!byId.has(line.variantId)) {
          short.push({ variantId: line.variantId, available: 0 })
          continue
        }
        const updated = await tx
          .update(productVariants)
          .set({ stock: sql`${productVariants.stock} - ${line.qty}` })
          .where(
            and(
              eq(productVariants.id, line.variantId),
              gte(productVariants.stock, line.qty),
            ),
          )
          .returning({ id: productVariants.id })
        if (updated.length === 0) {
          const currentRows = await tx
            .select({ stock: productVariants.stock })
            .from(productVariants)
            .where(eq(productVariants.id, line.variantId))
          short.push({
            variantId: line.variantId,
            available: currentRows.at(0)?.stock ?? 0,
          })
        }
      }
      if (short.length > 0) throw new StockError(short)

      const subtotalKobo = lines.reduce(
        (sum, l) => sum + (byId.get(l.variantId)?.priceKobo ?? 0) * l.qty,
        0,
      )
      const totals = orderTotals(subtotalKobo, input.delivery.deliveryZone)

      let created: { id: string; ref: string } | undefined
      for (let attempt = 0; attempt < MAX_REF_ATTEMPTS && !created; attempt++) {
        const ref = generateOrderRef()
        const inserted = await tx
          .insert(orders)
          .values({
            ref,
            userId: user.id,
            paymentMethod: 'pay_on_delivery',
            customerName: input.delivery.fullName,
            email: user.email,
            phone: input.delivery.phone,
            addressLine: input.delivery.addressLine,
            city: input.delivery.city,
            state: input.delivery.state,
            deliveryZone: input.delivery.deliveryZone,
            subtotalKobo: totals.subtotalKobo,
            deliveryFeeKobo: totals.deliveryFeeKobo,
            totalKobo: totals.totalKobo,
            idempotencyKey: input.idempotencyKey,
          })
          .onConflictDoNothing()
          .returning({ id: orders.id, ref: orders.ref })
        created = inserted.at(0)
        if (!created) {
          // Conflict on the ref (retry with a new one) or on the idempotency key (a twin request won).
          const twin = await tx
            .select({ id: orders.id })
            .from(orders)
            .where(eq(orders.idempotencyKey, input.idempotencyKey))
            .limit(1)
          if (twin.length > 0) throw new DuplicateOrder()
        }
      }
      if (!created) throw new Error('Could not generate an order reference')

      const images = await tx
        .select({
          productId: productImages.productId,
          path: productImages.path,
        })
        .from(productImages)
        .where(
          and(
            inArray(productImages.productId, [
              ...new Set(rows.map((r) => r.productId)),
            ]),
            eq(productImages.position, 0),
          ),
        )
        .orderBy(asc(productImages.position))

      await tx.insert(orderItems).values(
        lines.flatMap((line) => {
          const row = byId.get(line.variantId)
          if (!row) return []
          return [
            {
              orderId: created.id,
              variantId: line.variantId,
              productName: row.productName,
              variantLabel: row.variantLabel,
              imagePath:
                images.find((i) => i.productId === row.productId)?.path ?? '',
              unitPriceKobo: row.priceKobo,
              qty: line.qty,
              lineTotalKobo: row.priceKobo * line.qty,
            },
          ]
        }),
      )

      // The cart is spent. Same transaction, so a failed order keeps it and a placed one never does.
      await tx.delete(cartItems).where(eq(cartItems.userId, user.id))

      return { id: created.id, ref: created.ref, totals, duplicate: false }
    })
  } catch (error) {
    if (error instanceof DuplicateOrder) {
      const winner = await findExisting(
        db,
        user.id,
        input.idempotencyKey,
        lines,
      )
      if (winner) return toCreated(winner, true)
    }
    throw error
  }
}

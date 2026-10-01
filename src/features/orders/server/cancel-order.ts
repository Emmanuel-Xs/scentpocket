import { eq, sql } from 'drizzle-orm'
import type { Db } from '#/db/client'
import { orderItems, orders, productVariants } from '#/db/schema'
import { canCancel } from '../status'

export class CancelError extends Error {
  constructor(
    message: string,
    readonly code: 'not_found' | 'not_cancellable',
  ) {
    super(message)
    this.name = 'CancelError'
  }
}

/** Cancels an order and puts every item's stock back, in one transaction. Only before shipping. */
export async function cancelOrder(db: Db, ref: string) {
  return db.transaction(async (tx) => {
    const found = await tx
      .select()
      .from(orders)
      .where(eq(orders.ref, ref))
      .for('update')
    const order = found.at(0)
    if (!order) throw new CancelError('Order not found', 'not_found')
    if (!canCancel(order.status)) {
      throw new CancelError(
        `A ${order.status} order cannot be cancelled`,
        'not_cancellable',
      )
    }

    const items = await tx
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id))
    for (const item of items) {
      await tx
        .update(productVariants)
        .set({ stock: sql`${productVariants.stock} + ${item.qty}` })
        .where(eq(productVariants.id, item.variantId))
    }
    await tx
      .update(orders)
      .set({ status: 'cancelled', cancelledAt: new Date() })
      .where(eq(orders.id, order.id))
    return { ref: order.ref, restocked: items.length }
  })
}

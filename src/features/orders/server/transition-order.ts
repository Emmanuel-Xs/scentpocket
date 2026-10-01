import { eq } from 'drizzle-orm'
import type { Db } from '#/db/client'
import { orders } from '#/db/schema'
import { canTransition } from '../status'
import type { OrderStatus } from '../status'
import { cancelOrder } from './cancel-order'

export class TransitionError extends Error {
  constructor(
    message: string,
    readonly code: 'not_found' | 'not_allowed',
  ) {
    super(message)
    this.name = 'TransitionError'
  }
}

const TIMESTAMP = {
  confirmed: 'confirmedAt',
  shipped: 'shippedAt',
  delivered: 'deliveredAt',
} as const

/**
 * Moves an order to its next status. Only the moves in `status.ts` are legal; the order row is
 * locked so two admins clicking at once cannot both apply. Cancelling goes through `cancelOrder`
 * so the stock is put back in the same transaction.
 */
export async function transitionOrder(db: Db, ref: string, to: OrderStatus) {
  if (to === 'cancelled') {
    await cancelOrder(db, ref)
    return { ref, status: to }
  }
  if (to === 'placed')
    throw new TransitionError(
      'An order cannot go back to placed',
      'not_allowed',
    )

  return db.transaction(async (tx) => {
    const found = await tx
      .select()
      .from(orders)
      .where(eq(orders.ref, ref))
      .for('update')
    const order = found.at(0)
    if (!order) throw new TransitionError('Order not found', 'not_found')
    if (!canTransition(order.status, to)) {
      throw new TransitionError(
        `A ${order.status} order cannot become ${to}`,
        'not_allowed',
      )
    }
    await tx
      .update(orders)
      .set({ status: to, [TIMESTAMP[to]]: new Date() })
      .where(eq(orders.id, order.id))
    return { ref, status: to }
  })
}

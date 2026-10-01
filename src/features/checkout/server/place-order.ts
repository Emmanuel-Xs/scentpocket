import { createServerFn } from '@tanstack/react-start'
import { getDb } from '#/db/client'
import { requireUser } from '#/features/auth/server/session'
import { placeOrderSchema } from '../schemas'
import { createOrder, StockError, type ShortLine } from './create-order'

export type PlaceOrderResult =
  { ok: true; ref: string } | { ok: false; reason: 'stock'; short: ShortLine[] }

/**
 * Checks the user itself (layout guards are not security), then places the order.
 * Email goes out after the commit and can never fail the order (wired in step 4.1).
 */
export const placeOrder = createServerFn({ method: 'POST' })
  .inputValidator(placeOrderSchema)
  .handler(async ({ data }): Promise<PlaceOrderResult> => {
    const user = await requireUser()
    try {
      const created = await createOrder(
        getDb(),
        { id: user.id, email: user.email },
        data,
      )
      return { ok: true, ref: created.ref }
    } catch (error) {
      if (error instanceof StockError)
        return { ok: false, reason: 'stock', short: error.short }
      throw error
    }
  })

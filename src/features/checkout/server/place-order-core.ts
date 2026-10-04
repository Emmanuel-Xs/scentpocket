import { getDb } from '#/db/client'
import { sendOrderEmail } from '#/features/email/send'
import type { PlaceOrderData } from '../schemas'
import { createOrder, StockError } from './create-order'
import type { ShortLine } from './create-order'

export type PlaceOrderResult =
  | { ok: true; ref: string; duplicate: boolean }
  | { ok: false; reason: 'stock'; short: ShortLine[] }

/**
 * Places the order and, after the commit, sends the confirmation email. Shared by the web server
 * function and the REST API. Email can never fail the order. The caller has already checked auth.
 */
export async function placeOrderForUser(
  user: { id: string; email: string },
  data: PlaceOrderData,
): Promise<PlaceOrderResult> {
  try {
    const created = await createOrder(getDb(), user, data)
    // After the commit, awaited (serverless stops after the response), and it cannot fail the order.
    if (!created.duplicate) await sendOrderEmail(created.id)
    return { ok: true, ref: created.ref, duplicate: created.duplicate }
  } catch (error) {
    if (error instanceof StockError)
      return { ok: false, reason: 'stock', short: error.short }
    throw error
  }
}

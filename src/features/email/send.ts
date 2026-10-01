import { eq } from 'drizzle-orm'
import { getDb } from '#/db/client'
import { orders } from '#/db/schema'
import { buildOrderDetail } from '#/features/orders/server/order-detail'
import { getServerEnv } from '#/lib/env'
import { deliverEmail } from './deliver'
import { createMailgunProvider } from './mailgun'
import { renderOrderEmail } from './render'
import { createSmtpProvider } from './smtp'
import type { DeliveryResult } from './types'

/**
 * Sends the confirmation for an order and records what happened on the order row.
 * Mailgun first, Gmail SMTP as the fallback. Never throws: an email problem must not
 * affect the order, it is only stored for the admin to see (and resend).
 */
export async function sendOrderEmail(orderId: string): Promise<DeliveryResult> {
  const db = getDb()
  try {
    const env = getServerEnv()
    const rows = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1)
    const order = rows.at(0)
    if (!order) return { ok: false, error: 'Order not found' }

    const detail = await buildOrderDetail(db, order)
    const rendered = await renderOrderEmail(detail, env.SITE_URL)
    const providers = [
      createMailgunProvider(env),
      createSmtpProvider(env),
    ].filter((p) => p !== null)
    const result = await deliverEmail(
      { to: order.email, ...rendered },
      providers,
    )

    await db
      .update(orders)
      .set(
        result.ok
          ? {
              emailProvider: result.provider,
              emailSentAt: new Date(),
              emailError: null,
            }
          : { emailError: result.error },
      )
      .where(eq(orders.id, orderId))
    return result
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    try {
      await db
        .update(orders)
        .set({ emailError: message.slice(0, 500) })
        .where(eq(orders.id, orderId))
    } catch {
      // Nothing more we can do; the order itself is already safe.
    }
    return { ok: false, error: message }
  }
}

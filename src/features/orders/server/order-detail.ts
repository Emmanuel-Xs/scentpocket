import { asc, eq } from 'drizzle-orm'
import type { Db } from '#/db/client'
import type { orders } from '#/db/schema'
import { orderItems } from '#/db/schema'
import { productImageUrl } from '#/features/images/url'
import type { OrderDetail } from '../types'
import { loadImagesByPath } from './order-images'

type OrderRow = typeof orders.$inferSelect

/** Order row plus its items as the shape the receipt, admin and email all use. */
export async function buildOrderDetail(
  db: Db,
  order: OrderRow,
): Promise<OrderDetail> {
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id))
    .orderBy(asc(orderItems.productName))

  const images = await loadImagesByPath(
    db,
    items.map((i) => i.imagePath),
  )

  return {
    ref: order.ref,
    status: order.status,
    paymentMethod: order.paymentMethod,
    customerName: order.customerName,
    email: order.email,
    phone: order.phone,
    addressLine: order.addressLine,
    city: order.city,
    state: order.state,
    deliveryZone: order.deliveryZone,
    subtotalKobo: order.subtotalKobo,
    deliveryFeeKobo: order.deliveryFeeKobo,
    totalKobo: order.totalKobo,
    createdAt: order.createdAt,
    confirmedAt: order.confirmedAt,
    shippedAt: order.shippedAt,
    deliveredAt: order.deliveredAt,
    cancelledAt: order.cancelledAt,
    emailProvider: order.emailProvider,
    emailSentAt: order.emailSentAt,
    emailError: order.emailError,
    items: items.map((i) => ({
      id: i.id,
      productName: i.productName,
      variantLabel: i.variantLabel,
      imageUrl: i.imagePath ? productImageUrl(i.imagePath) : null,
      image: images.get(i.imagePath) ?? null,
      unitPriceKobo: i.unitPriceKobo,
      qty: i.qty,
      lineTotalKobo: i.lineTotalKobo,
    })),
  }
}

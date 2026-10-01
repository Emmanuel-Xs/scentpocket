import { notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { asc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '#/db/client'
import { orderItems, orders } from '#/db/schema'
import { requireUser } from '#/features/auth/server/session'
import { isAdminRole } from '#/features/auth/types'
import { productImageUrl } from '#/features/images/url'
import { ORDER_REF_PATTERN } from '#/lib/order-ref'
import type { OrderDetail } from '../types'

/** One order. Only its owner or an admin can read it; anyone else gets a 404, not a 403. */
export const getOrder = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ ref: z.string().regex(ORDER_REF_PATTERN) }))
  .handler(async ({ data }): Promise<OrderDetail> => {
    const user = await requireUser()
    const db = getDb()
    const found = await db
      .select()
      .from(orders)
      .where(eq(orders.ref, data.ref))
      .limit(1)
    const order = found.at(0)
    if (!order || (order.userId !== user.id && !isAdminRole(user.role)))
      throw notFound()

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id))
      .orderBy(asc(orderItems.productName))

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
        unitPriceKobo: i.unitPriceKobo,
        qty: i.qty,
        lineTotalKobo: i.lineTotalKobo,
      })),
    }
  })

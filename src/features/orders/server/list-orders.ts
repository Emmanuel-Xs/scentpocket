import { createServerFn } from '@tanstack/react-start'
import { desc, eq, inArray } from 'drizzle-orm'
import { getDb } from '#/db/client'
import { orderItems, orders } from '#/db/schema'
import { requireUser } from '#/features/auth/server/session'
import { productImageUrl } from '#/features/images/url'
import type { OrderRow } from '../types'

/** The signed in user's own orders, newest first. */
export const listMyOrders = createServerFn({ method: 'GET' }).handler(
  async (): Promise<OrderRow[]> => {
    const user = await requireUser()
    const db = getDb()
    const rows = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, user.id))
      .orderBy(desc(orders.createdAt))
    if (rows.length === 0) return []

    const items = await db
      .select()
      .from(orderItems)
      .where(
        inArray(
          orderItems.orderId,
          rows.map((r) => r.id),
        ),
      )

    return rows.map((order) => {
      const mine = items.filter((i) => i.orderId === order.id)
      return {
        ref: order.ref,
        status: order.status,
        totalKobo: order.totalKobo,
        createdAt: order.createdAt,
        itemCount: mine.reduce((sum, i) => sum + i.qty, 0),
        imageUrls: mine
          .filter((i) => i.imagePath)
          .slice(0, 3)
          .map((i) => productImageUrl(i.imagePath)),
      }
    })
  },
)

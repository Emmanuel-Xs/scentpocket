import { and, desc, eq, inArray } from 'drizzle-orm'
import type { Db } from '#/db/client'
import { orderItems, orders } from '#/db/schema'
import { isAdminRole } from '#/features/auth/types'
import type { SessionUser } from '#/features/auth/types'
import { productImageUrl } from '#/features/images/url'
import type { OrderDetail, OrderRow } from '../types'
import { buildOrderDetail } from './order-detail'
import { loadImagesByPath } from './order-images'

/** The user's own orders, newest first. */
export async function loadMyOrders(
  db: Db,
  userId: string,
): Promise<OrderRow[]> {
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
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

  const images = await loadImagesByPath(
    db,
    items.map((i) => i.imagePath),
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
      images: mine.slice(0, 3).flatMap((i) => {
        const image = images.get(i.imagePath)
        return image ? [image] : []
      }),
    }
  })
}

/** One order, only for its owner or an admin. Null for anyone else, so callers answer 404, not 403. */
export async function loadOrderForUser(
  db: Db,
  user: SessionUser,
  ref: string,
): Promise<OrderDetail | null> {
  const found = await db
    .select()
    .from(orders)
    .where(eq(orders.ref, ref))
    .limit(1)
  const order = found.at(0)
  if (!order || (order.userId !== user.id && !isAdminRole(user.role)))
    return null
  return buildOrderDetail(db, order)
}

/** The user's order placed with this idempotency key, if any. */
export async function findOrderByKey(
  db: Db,
  user: SessionUser,
  key: string,
): Promise<OrderDetail | null> {
  const found = await db
    .select()
    .from(orders)
    .where(and(eq(orders.userId, user.id), eq(orders.idempotencyKey, key)))
    .limit(1)
  const order = found.at(0)
  return order ? buildOrderDetail(db, order) : null
}

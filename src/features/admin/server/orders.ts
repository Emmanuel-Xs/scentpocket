import { notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { and, desc, eq, gte, ilike, ne, or, sql } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '#/db/client'
import { orders } from '#/db/schema'
import { requireAdmin } from '#/features/auth/server/session'
import { sendOrderEmail } from '#/features/email/send'
import { ORDER_STATUSES } from '#/features/orders/status'
import { buildOrderDetail } from '#/features/orders/server/order-detail'
import { CancelError } from '#/features/orders/server/cancel-order'
import {
  transitionOrder,
  TransitionError,
} from '#/features/orders/server/transition-order'
import type { OrderDetail } from '#/features/orders/types'
import { ORDER_REF_PATTERN } from '#/lib/order-ref'
import type { AdminOrdersData } from '../types'

const WEEK_MS = 7 * 24 * 60 * 60 * 1000
const refSchema = z.object({ ref: z.string().regex(ORDER_REF_PATTERN) })

export const listAdminOrders = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      status: z.enum(ORDER_STATUSES).optional(),
      q: z.string().trim().max(80).optional(),
    }),
  )
  .handler(async ({ data }): Promise<AdminOrdersData> => {
    await requireAdmin()
    const db = getDb()
    const search = data.q
      ? or(ilike(orders.ref, `%${data.q}%`), ilike(orders.email, `%${data.q}%`))
      : undefined

    const rows = await db
      .select({
        ref: orders.ref,
        createdAt: orders.createdAt,
        customerName: orders.customerName,
        email: orders.email,
        totalKobo: orders.totalKobo,
        status: orders.status,
        // Raw names on purpose: Drizzle drops the table qualifier inside a correlated subquery.
        itemCount: sql<number>`coalesce((select sum(oi.qty) from order_items oi where oi.order_id = orders.id), 0)::int`,
      })
      .from(orders)
      .where(
        and(data.status ? eq(orders.status, data.status) : undefined, search),
      )
      .orderBy(desc(orders.createdAt))
      .limit(200)

    const grouped = await db
      .select({ status: orders.status, n: sql<number>`count(*)::int` })
      .from(orders)
      .groupBy(orders.status)
    const counts = {
      all: 0,
      placed: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    }
    for (const g of grouped) {
      counts[g.status] = g.n
      counts.all += g.n
    }

    const week = await db
      .select({
        total: sql<number>`coalesce(sum(${orders.totalKobo}), 0)::int`,
      })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, new Date(Date.now() - WEEK_MS)),
          ne(orders.status, 'cancelled'),
        ),
      )

    return {
      rows,
      counts,
      stats: {
        toConfirm: counts.placed,
        toShip: counts.confirmed,
        onTheWay: counts.shipped,
        weekKobo: week.at(0)?.total ?? 0,
      },
    }
  })

export const getAdminOrder = createServerFn({ method: 'GET' })
  .inputValidator(refSchema)
  .handler(async ({ data }): Promise<OrderDetail> => {
    await requireAdmin()
    const db = getDb()
    const found = await db
      .select()
      .from(orders)
      .where(eq(orders.ref, data.ref))
      .limit(1)
    const order = found.at(0)
    if (!order) throw notFound()
    return buildOrderDetail(db, order)
  })

export type AdminActionResult = { ok: true } | { ok: false; error: string }

export const setOrderStatus = createServerFn({ method: 'POST' })
  .inputValidator(refSchema.extend({ to: z.enum(ORDER_STATUSES) }))
  .handler(async ({ data }): Promise<AdminActionResult> => {
    await requireAdmin()
    try {
      await transitionOrder(getDb(), data.ref, data.to)
      return { ok: true }
    } catch (error) {
      if (error instanceof TransitionError || error instanceof CancelError) {
        return { ok: false, error: error.message }
      }
      throw error
    }
  })

export const resendOrderEmail = createServerFn({ method: 'POST' })
  .inputValidator(refSchema)
  .handler(async ({ data }): Promise<AdminActionResult> => {
    await requireAdmin()
    const db = getDb()
    const found = await db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.ref, data.ref))
      .limit(1)
    const order = found.at(0)
    if (!order) return { ok: false, error: 'Order not found' }
    const result = await sendOrderEmail(order.id)
    return result.ok ? { ok: true } : { ok: false, error: result.error }
  })

import { notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '#/db/client'
import { orders } from '#/db/schema'
import { requireUser } from '#/features/auth/server/session'
import { isAdminRole } from '#/features/auth/types'
import { ORDER_REF_PATTERN } from '#/lib/order-ref'
import type { OrderDetail } from '../types'
import { buildOrderDetail } from './order-detail'

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
    return buildOrderDetail(db, order)
  })

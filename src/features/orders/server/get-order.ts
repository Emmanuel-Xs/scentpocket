import { notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getDb } from '#/db/client'
import { requireUser } from '#/features/auth/server/session'
import { ORDER_REF_PATTERN } from '#/lib/order-ref'
import type { OrderDetail } from '../types'
import { loadOrderForUser } from './orders-core'

/** One order. Only its owner or an admin can read it; anyone else gets a 404, not a 403. */
export const getOrder = createServerFn({ method: 'GET' })
  .validator(z.object({ ref: z.string().regex(ORDER_REF_PATTERN) }))
  .handler(async ({ data }): Promise<OrderDetail> => {
    const user = await requireUser()
    const order = await loadOrderForUser(getDb(), user, data.ref)
    if (!order) throw notFound()
    return order
  })

import { createServerFn } from '@tanstack/react-start'
import { getDb } from '#/db/client'
import { requireUser } from '#/features/auth/server/session'
import type { OrderRow } from '../types'
import { loadMyOrders } from './orders-core'

/** The signed in user's own orders, newest first. */
export const listMyOrders = createServerFn({ method: 'GET' }).handler(
  async (): Promise<OrderRow[]> => {
    const user = await requireUser()
    return loadMyOrders(getDb(), user.id)
  },
)

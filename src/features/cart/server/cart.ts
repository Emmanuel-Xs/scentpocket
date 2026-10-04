import { createServerFn } from '@tanstack/react-start'
import { getDb } from '#/db/client'
import { requireUser } from '#/features/auth/server/session'
import { mergeCartSchema, setCartItemSchema } from '../schemas'
import type { ServerCart } from '../types'
import * as core from './cart-core'

// Every function checks the user itself. Each returns the whole cart so the client can mirror it.

export const getCart = createServerFn({ method: 'GET' }).handler(
  async (): Promise<ServerCart> => {
    const user = await requireUser()
    return core.getCart(getDb(), user.id)
  },
)

export const setCartItem = createServerFn({ method: 'POST' })
  .validator(setCartItemSchema)
  .handler(async ({ data }): Promise<ServerCart> => {
    const user = await requireUser()
    return core.setCartItem(getDb(), user.id, data.variantId, data.quantity)
  })

export const clearCart = createServerFn({ method: 'POST' }).handler(
  async (): Promise<ServerCart> => {
    const user = await requireUser()
    return core.clearCart(getDb(), user.id)
  },
)

export const mergeCart = createServerFn({ method: 'POST' })
  .validator(mergeCartSchema)
  .handler(async ({ data }): Promise<ServerCart> => {
    const user = await requireUser()
    return core.mergeCart(getDb(), user.id, data.items)
  })

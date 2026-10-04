import { getDb } from '#/db/client'
import { requireUser } from '#/features/auth/server/session'
import { mergeCartSchema, setCartItemSchema } from '#/features/cart/schemas'
import * as cart from '#/features/cart/server/cart-core'
import { json, parseInput, readJson } from './http'
import type { ApiHandler } from './http'

// Each handler authenticates itself; there is no shared middleware to forget.

export const getMyCart: ApiHandler = async ({ request }) => {
  const user = await requireUser(request)
  return json({ cart: await cart.getCart(getDb(), user.id) })
}

export const putCartItem: ApiHandler = async ({ request }) => {
  const user = await requireUser(request)
  const input = parseInput(setCartItemSchema, await readJson(request))
  return json({
    cart: await cart.setCartItem(
      getDb(),
      user.id,
      input.variantId,
      input.quantity,
    ),
  })
}

export const deleteMyCart: ApiHandler = async ({ request }) => {
  const user = await requireUser(request)
  return json({ cart: await cart.clearCart(getDb(), user.id) })
}

export const postCartMerge: ApiHandler = async ({ request }) => {
  const user = await requireUser(request)
  const input = parseInput(mergeCartSchema, await readJson(request))
  return json({ cart: await cart.mergeCart(getDb(), user.id, input.items) })
}

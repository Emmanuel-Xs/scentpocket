import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { getDb } from '#/db/client'
import { requireUser } from '#/features/auth/server/session'
import { listCartItems } from '#/features/cart/server/cart-core'
import { deliverySchema, placeOrderSchema } from '#/features/checkout/schemas'
import { placeOrderForUser } from '#/features/checkout/server/place-order-core'
import {
  findOrderByKey,
  loadMyOrders,
  loadOrderForUser,
} from '#/features/orders/server/orders-core'
import { ORDER_REF_PATTERN } from '#/lib/order-ref'
import { ApiError, json, parseInput, readJson } from './http'
import type { ApiHandler } from './http'

// Items are deliberately not part of the body: they come from the server cart.
const createOrderBodySchema = z.object({
  delivery: deliverySchema,
  idempotencyKey: z.string().min(8).max(100).optional(),
})

export const getMyOrders: ApiHandler = async ({ request }) => {
  const user = await requireUser(request)
  return json({ orders: await loadMyOrders(getDb(), user.id) })
}

export const getOrderByRef: ApiHandler = async ({ request, params }) => {
  const user = await requireUser(request)
  const ref = params.ref
  const order = ORDER_REF_PATTERN.test(ref)
    ? await loadOrderForUser(getDb(), user, ref)
    : null
  if (!order) throw new ApiError(404, 'not_found', 'Order not found.')
  return json({ order })
}

/**
 * Places an order from the server cart. The cart is read as stored (no silent clamping), so a
 * shortfall is a 409 rather than a smaller order. Send an `Idempotency-Key` header (or body field)
 * and a retry returns the first order with 200, even though the cart is already empty by then.
 */
export const postOrder: ApiHandler = async ({ request }) => {
  const user = await requireUser(request)
  const body = parseInput(createOrderBodySchema, await readJson(request))
  const key =
    request.headers.get('idempotency-key') ??
    body.idempotencyKey ??
    randomUUID()
  const db = getDb()

  const earlier = await findOrderByKey(db, user, key)
  if (earlier) return json({ order: earlier }, 200)

  const items = (await listCartItems(db, user.id)).map((i) => ({
    variantId: i.variantId,
    qty: i.quantity,
  }))
  if (items.length === 0)
    throw new ApiError(422, 'empty_cart', 'Your cart is empty.')

  const input = parseInput(placeOrderSchema, {
    items,
    delivery: body.delivery,
    idempotencyKey: key,
  })
  const result = await placeOrderForUser(user, input)
  if (!result.ok)
    throw new ApiError(
      409,
      'insufficient_stock',
      'Some items are no longer available in the quantity you chose.',
      { short: result.short },
    )

  const order = await loadOrderForUser(db, user, result.ref)
  if (!order) throw new ApiError(500, 'internal_error', 'Something went wrong.')
  return json({ order }, result.duplicate ? 200 : 201)
}

import { createServerFn } from '@tanstack/react-start'
import { requireUser } from '#/features/auth/server/session'
import { placeOrderSchema } from '../schemas'
import { placeOrderForUser } from './place-order-core'
import type { ShortLine } from './create-order'

export type PlaceOrderResult =
  { ok: true; ref: string } | { ok: false; reason: 'stock'; short: ShortLine[] }

/** Checks the user itself (layout guards are not security), then places the order. */
export const placeOrder = createServerFn({ method: 'POST' })
  .validator(placeOrderSchema)
  .handler(async ({ data }): Promise<PlaceOrderResult> => {
    const user = await requireUser()
    const result = await placeOrderForUser(user, data)
    return result.ok
      ? { ok: true, ref: result.ref }
      : { ok: false, reason: result.reason, short: result.short }
  })

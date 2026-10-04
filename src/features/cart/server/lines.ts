import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getDb } from '#/db/client'
import { MAX_CART_LINES } from '#/lib/config'
import type { CartLineData } from '../types'
import { loadCartLineData } from './cart-data'

/** Display data, price and stock for the variants in a (signed out) cart. */
export const getCartLines = createServerFn({ method: 'GET' })
  .validator(z.object({ variantIds: z.array(z.uuid()).max(MAX_CART_LINES) }))
  .handler(async ({ data }): Promise<CartLineData[]> =>
    loadCartLineData(getDb(), data.variantIds),
  )

import { z } from 'zod'
import { MAX_CART_LINES, MAX_QTY_PER_LINE } from '#/lib/config'

/** 0 removes the line. Anything above stock is clamped by the server, not rejected. */
export const setCartItemSchema = z.object({
  variantId: z.uuid(),
  quantity: z.number().int().min(0).max(MAX_QTY_PER_LINE),
})

export const mergeCartSchema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.uuid(),
        quantity: z.number().int().min(1).max(MAX_QTY_PER_LINE),
      }),
    )
    .max(MAX_CART_LINES),
})

export type SetCartItemInput = z.infer<typeof setCartItemSchema>
export type MergeCartInput = z.infer<typeof mergeCartSchema>

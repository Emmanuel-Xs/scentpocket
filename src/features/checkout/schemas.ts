import { z } from 'zod'
import {
  DELIVERY_ZONES,
  MAX_CART_LINES,
  MAX_QTY_PER_LINE,
  NIGERIAN_STATES,
} from '#/lib/config'

/**
 * Nigerian mobile numbers in any common format, normalised to `+234XXXXXXXXXX`.
 * Accepts `0803 123 4567`, `+234 803 123 4567`, `2348031234567`, `803-123-4567`.
 */
export function normalizeNigerianPhone(input: string): string | null {
  let digits = input.replace(/[^\d]/g, '')
  if (digits.startsWith('234')) {
    digits = digits.slice(3)
    if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1)
  } else if (digits.startsWith('0')) {
    digits = digits.slice(1)
  }
  return /^[789]\d{9}$/.test(digits) ? `+234${digits}` : null
}

export const phoneSchema = z
  .string()
  .trim()
  .min(1, 'Enter a phone number')
  .transform((value, ctx) => {
    const phone = normalizeNigerianPhone(value)
    if (!phone) {
      ctx.addIssue({
        code: 'custom',
        message: 'Enter a Nigerian number like 0803 123 4567',
      })
      return z.NEVER
    }
    return phone
  })

export const deliverySchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name').max(100),
  phone: phoneSchema,
  addressLine: z.string().trim().min(5, 'Enter your street address').max(200),
  city: z.string().trim().min(2, 'Enter your city or area').max(80),
  state: z.enum(NIGERIAN_STATES, 'Choose a state'),
  deliveryZone: z.enum(DELIVERY_ZONES, 'Choose a delivery zone'),
})

export const placeOrderSchema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.uuid(),
        qty: z.number().int().min(1).max(MAX_QTY_PER_LINE),
      }),
    )
    .min(1, 'Your cart is empty')
    .max(MAX_CART_LINES),
  delivery: deliverySchema,
  /** Fresh per checkout attempt; a retry of the same attempt reuses it. */
  idempotencyKey: z.string().min(8).max(100),
})

export type DeliveryInput = z.input<typeof deliverySchema>
export type DeliveryData = z.output<typeof deliverySchema>
export type PlaceOrderInput = z.input<typeof placeOrderSchema>
export type PlaceOrderData = z.output<typeof placeOrderSchema>

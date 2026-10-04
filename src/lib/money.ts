import { DELIVERY_FEES_KOBO } from './config'
import type { DeliveryZone } from './config'

/** Money is integer kobo everywhere. Format only at the edge, with these helpers. */

/** 4200000 -> "₦42,000". Shows kobo only when there are some (₦1,250.50). */
export function formatKobo(kobo: number): string {
  const naira = kobo / 100
  const whole = Number.isInteger(naira)
  return `₦${naira.toLocaleString('en-NG', {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  })}`
}

export type OrderTotals = {
  subtotalKobo: number
  deliveryFeeKobo: number
  totalKobo: number
}

/** Delivery is always the zone's flat fee. */
export function deliveryFeeKobo(zone: DeliveryZone): number {
  return DELIVERY_FEES_KOBO[zone]
}

export function orderTotals(
  subtotalKobo: number,
  zone: DeliveryZone,
): OrderTotals {
  const fee = deliveryFeeKobo(zone)
  return { subtotalKobo, deliveryFeeKobo: fee, totalKobo: subtotalKobo + fee }
}

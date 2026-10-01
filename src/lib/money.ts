import { DELIVERY_FEES_KOBO, FREE_DELIVERY_THRESHOLD_KOBO } from './config'
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

/** Delivery is free from the threshold up; otherwise the zone's fee. */
export function deliveryFeeKobo(
  zone: DeliveryZone,
  subtotalKobo: number,
): number {
  return subtotalKobo >= FREE_DELIVERY_THRESHOLD_KOBO
    ? 0
    : DELIVERY_FEES_KOBO[zone]
}

export function orderTotals(
  subtotalKobo: number,
  zone: DeliveryZone,
): OrderTotals {
  const fee = deliveryFeeKobo(zone, subtotalKobo)
  return { subtotalKobo, deliveryFeeKobo: fee, totalKobo: subtotalKobo + fee }
}

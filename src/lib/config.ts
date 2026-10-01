/** Store rules. Money is integer kobo. Server code recomputes everything from these. */
export const DELIVERY_ZONES = [
  'lagos_mainland',
  'lagos_island',
  'outside_lagos',
] as const
export type DeliveryZone = (typeof DELIVERY_ZONES)[number]

export const DELIVERY_FEES_KOBO: Record<DeliveryZone, number> = {
  lagos_mainland: 300_000, // ₦3,000
  lagos_island: 450_000, // ₦4,500
  outside_lagos: 700_000, // ₦7,000
}

export const DELIVERY_ZONE_LABELS: Record<DeliveryZone, string> = {
  lagos_mainland: 'Lagos Mainland',
  lagos_island: 'Lagos Island',
  outside_lagos: 'Outside Lagos',
}

export const DELIVERY_ZONE_ETA: Record<DeliveryZone, string> = {
  lagos_mainland: '1 to 2 working days',
  lagos_island: '1 to 2 working days',
  outside_lagos: '3 to 5 working days',
}

export const FREE_DELIVERY_THRESHOLD_KOBO = 30_000_000 // ₦300,000
export const MAX_QTY_PER_LINE = 10
export const MAX_VARIANTS_PER_PRODUCT = 3
export const MAX_CART_LINES = 50

/** A repeated identical request from the same user inside this window returns the first order. */
export const DUPLICATE_ORDER_WINDOW_SECONDS = 10

export const NIGERIAN_STATES = [
  'Abia',
  'Adamawa',
  'Akwa Ibom',
  'Anambra',
  'Bauchi',
  'Bayelsa',
  'Benue',
  'Borno',
  'Cross River',
  'Delta',
  'Ebonyi',
  'Edo',
  'Ekiti',
  'Enugu',
  'FCT Abuja',
  'Gombe',
  'Imo',
  'Jigawa',
  'Kaduna',
  'Kano',
  'Katsina',
  'Kebbi',
  'Kogi',
  'Kwara',
  'Lagos',
  'Nasarawa',
  'Niger',
  'Ogun',
  'Ondo',
  'Osun',
  'Oyo',
  'Plateau',
  'Rivers',
  'Sokoto',
  'Taraba',
  'Yobe',
  'Zamfara',
] as const

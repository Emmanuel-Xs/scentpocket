export const ORDER_STATUSES = [
  'placed',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const STATUS_LABELS: Record<OrderStatus, string> = {
  placed: 'Placed',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

/** The only legal moves. Anything not listed here is rejected by the server. */
export const TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  placed: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
}

export const canTransition = (from: OrderStatus, to: OrderStatus) =>
  TRANSITIONS[from].includes(to)

/** Cancelling puts the stock back, so it is only allowed before shipping. */
export const canCancel = (status: OrderStatus) =>
  canTransition(status, 'cancelled')

import type { OrderStatus } from '#/features/orders/status'

export type AdminOrderRow = {
  ref: string
  createdAt: Date
  customerName: string
  email: string
  itemCount: number
  totalKobo: number
  status: OrderStatus
}

export type AdminOrdersData = {
  rows: AdminOrderRow[]
  /** Orders per status across the whole store (ignores the search box), plus `all`. */
  counts: Record<OrderStatus | 'all', number>
  stats: {
    toConfirm: number
    toShip: number
    onTheWay: number
    weekKobo: number
  }
}

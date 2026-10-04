import type { CardImage } from '#/features/catalog/types'
import type { DeliveryZone } from '#/lib/config'
import type { OrderStatus } from './status'

export type OrderItemData = {
  id: string
  productName: string
  variantLabel: string
  imageUrl: string | null
  /** The same photo with size and blur placeholder; null when the product photo has since been removed. */
  image: CardImage | null
  unitPriceKobo: number
  qty: number
  lineTotalKobo: number
}

export type OrderDetail = {
  ref: string
  status: OrderStatus
  paymentMethod: 'pay_on_delivery' | 'paystack'
  customerName: string
  email: string
  phone: string
  addressLine: string
  city: string
  state: string
  deliveryZone: DeliveryZone
  subtotalKobo: number
  deliveryFeeKobo: number
  totalKobo: number
  createdAt: Date
  confirmedAt: Date | null
  shippedAt: Date | null
  deliveredAt: Date | null
  cancelledAt: Date | null
  emailProvider: 'mailgun' | 'smtp' | null
  emailSentAt: Date | null
  emailError: string | null
  items: OrderItemData[]
}

export type OrderRow = {
  ref: string
  status: OrderStatus
  totalKobo: number
  createdAt: Date
  itemCount: number
  /** Up to three product photos for the row. */
  imageUrls: string[]
  /** The same photos with size and blur placeholder. */
  images: CardImage[]
}

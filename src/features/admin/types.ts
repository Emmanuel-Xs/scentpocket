import type { Family, Gender, Occasion, Tier } from '#/features/catalog/types'
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

export type AdminProductRow = {
  id: string
  slug: string
  name: string
  brand: string
  tier: Tier
  isActive: boolean
  variantCount: number
  totalStock: number
  fromKobo: number
  imageUrl: string | null
}

export type AdminProductPhoto = {
  id: string
  url: string
  width: number
  height: number
  alt: string
}

export type AdminProductVariant = {
  id: string
  label: string
  sizeMl: number
  priceKobo: number
  stock: number
  isActive: boolean
}

export type AdminProductDetail = {
  id: string
  slug: string
  name: string
  brand: string
  description: string
  tier: Tier
  gender: Gender
  family: Family
  occasions: Occasion[]
  topNotes: string[]
  heartNotes: string[]
  baseNotes: string[]
  longevity: 'short' | 'moderate' | 'long' | 'very_long'
  projection: 'soft' | 'moderate' | 'strong'
  inspiredById: string | null
  isActive: boolean
  variants: AdminProductVariant[]
  photos: AdminProductPhoto[]
}

export type ProductOption = { id: string; name: string; brand: string }

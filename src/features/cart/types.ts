import type { CardImage, Tier } from '#/features/catalog/types'

/** Everything the cart UI needs to show one line. Comes from the server, never from localStorage. */
export type CartLineData = {
  variantId: string
  productSlug: string
  productName: string
  brand: string
  tier: Tier
  variantLabel: string
  sizeMl: number
  priceKobo: number
  stock: number
  image: CardImage | null
}

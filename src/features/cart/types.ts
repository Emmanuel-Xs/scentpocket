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

export type ServerCartLine = CartLineData & {
  quantity: number
  /** The server lowered this quantity (stock) while handling the request. */
  changed: boolean
}

/** The signed in user's cart as the server sees it right now. Prices and stock are current. */
export type ServerCart = {
  lines: ServerCartLine[]
  /** Sum of quantities. */
  itemCount: number
  subtotalKobo: number
  /** True when anything was removed or lowered; `messages` says what. */
  changed: boolean
  messages: string[]
}

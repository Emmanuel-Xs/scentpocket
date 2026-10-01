import type { tiers } from './schemas'

export type Tier = (typeof tiers)[number]

export type CardImage = {
  /** Public Supabase URL. */
  src: string
  width: number
  height: number
  blurDataUrl: string
  alt: string
}

/** What a product card needs. Prices are integer kobo. */
export type ProductCardData = {
  id: string
  slug: string
  name: string
  brand: string
  tier: Tier
  /** First three top notes, for the card subtitle. */
  notes: string[]
  /** Cheapest in-stock variant (cheapest overall when everything is sold out). */
  fromKobo: number
  /** More than one size: show "from". */
  multiSize: boolean
  soldOut: boolean
  /** Set when the total stock is 1 to 3. */
  lowStock: number | null
  image: CardImage | null
}

export type DupePair = {
  original: ProductCardData
  dupe: ProductCardData
  savingKobo: number
  savingPercent: number
}

export type TierSummary = { tier: Tier; count: number }

export type HomeData = {
  ladder: ProductCardData[]
  tiers: TierSummary[]
  dupes: DupePair[]
  featured: ProductCardData[]
  totalProducts: number
}

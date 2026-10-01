import type { families, genders, occasions, tiers } from './schemas'

export type Tier = (typeof tiers)[number]
export type Gender = (typeof genders)[number]
export type Occasion = (typeof occasions)[number]
export type Family = (typeof families)[number]

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
  gender: Gender
  family: Family
  occasions: Occasion[]
  /** Lower sorts first; null when not featured. */
  featuredRank: number | null
  /** Epoch ms, for the Newest sort. */
  createdAt: number
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

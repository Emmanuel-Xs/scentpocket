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
  /** Top, heart and base notes together, for search. */
  allNotes: string[]
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

export type VariantData = {
  id: string
  label: string
  sizeMl: number
  priceKobo: number
  stock: number
}

export type ProductDetail = {
  card: ProductCardData
  description: string
  topNotes: string[]
  heartNotes: string[]
  baseNotes: string[]
  longevity: 'short' | 'moderate' | 'long' | 'very_long'
  projection: 'soft' | 'moderate' | 'strong'
  /** Ordered by size, active only. */
  variants: VariantData[]
  images: CardImage[]
  /** The pricier scent this one is inspired by. */
  inspiredBy: ProductCardData | null
  /** Cheaper scents inspired by this one. */
  dupes: ProductCardData[]
  /** Same tier, other products. */
  related: ProductCardData[]
}

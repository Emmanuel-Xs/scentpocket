import { z } from 'zod'

export const tiers = ['pocket', 'arabian_gems', 'designer', 'niche'] as const
export const genders = ['men', 'women', 'unisex'] as const
export const occasions = ['office', 'owambe', 'date_night', 'everyday'] as const
export const families = [
  'fresh',
  'woody',
  'amber',
  'floral',
  'gourmand',
] as const
export const sorts = ['featured', 'price_asc', 'price_desc', 'newest'] as const

/** /shop search params. Invalid values fall back to "unset" instead of erroring. */
export const shopSearchSchema = z.object({
  tier: z.enum(tiers).optional().catch(undefined),
  gender: z.enum(genders).optional().catch(undefined),
  occasion: z.enum(occasions).optional().catch(undefined),
  family: z.enum(families).optional().catch(undefined),
  sort: z.enum(sorts).optional().catch(undefined),
  q: z.string().trim().max(80).optional().catch(undefined),
})

export type ShopSearch = z.infer<typeof shopSearchSchema>

export const tierLabels: Record<(typeof tiers)[number], string> = {
  pocket: 'Pocket',
  arabian_gems: 'Arabian Gems',
  designer: 'Designer',
  niche: 'Niche',
}

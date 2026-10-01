import { createServerFn } from '@tanstack/react-start'
import { tiers } from '../schemas'
import type { HomeData } from '../types'
import { buildDupePairs, loadActiveCards } from './cards'

/** One product per tier, cheapest to priciest, for the hero price ladder. */
const LADDER_SLUGS = [
  'fragrance-world-explore',
  'lattafa-khamrah',
  'dior-sauvage-edt',
  'mfk-baccarat-rouge-540',
]
const HOME_FEATURED = 4
const HOME_DUPES = 3

export const getHomeData = createServerFn({ method: 'GET' }).handler(
  async (): Promise<HomeData> => {
    const rows = await loadActiveCards()
    const bySlug = new Map(rows.map((r) => [r.card.slug, r.card]))

    const ladder = LADDER_SLUGS.flatMap((slug) => bySlug.get(slug) ?? [])

    const dupes = buildDupePairs(rows).slice(0, HOME_DUPES)

    const featured = rows
      .filter((r) => r.featuredRank !== null)
      .sort((a, b) => (a.featuredRank ?? 0) - (b.featuredRank ?? 0))
      .slice(0, HOME_FEATURED)
      .map((r) => r.card)

    return {
      ladder,
      tiers: tiers.map((tier) => ({
        tier,
        count: rows.filter((r) => r.card.tier === tier).length,
      })),
      dupes,
      featured,
      totalProducts: rows.length,
    }
  },
)

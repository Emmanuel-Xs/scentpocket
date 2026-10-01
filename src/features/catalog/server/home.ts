import { createServerFn } from '@tanstack/react-start'
import { tiers } from '../schemas'
import type { DupePair, HomeData } from '../types'
import { loadActiveCards } from './cards'

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
    const byId = new Map(rows.map((r) => [r.card.id, r.card]))

    const ladder = LADDER_SLUGS.flatMap((slug) => bySlug.get(slug) ?? [])

    const dupes = rows
      .flatMap<DupePair>((r) => {
        const original = r.inspiredById ? byId.get(r.inspiredById) : undefined
        if (!original) return []
        const savingKobo = Math.max(0, original.fromKobo - r.card.fromKobo)
        return [
          {
            original,
            dupe: r.card,
            savingKobo,
            savingPercent: Math.round((savingKobo / original.fromKobo) * 100),
          },
        ]
      })
      .sort((a, b) => b.savingKobo - a.savingKobo)
      .slice(0, HOME_DUPES)

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

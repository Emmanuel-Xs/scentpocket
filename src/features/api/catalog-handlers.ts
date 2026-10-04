import { z } from 'zod'
import { applyShopSearch } from '#/features/catalog/filter'
import {
  families,
  genders,
  occasions,
  sorts,
  tiers,
} from '#/features/catalog/schemas'
import {
  buildDupePairs,
  loadActiveCards,
} from '#/features/catalog/server/cards'
import { loadProductDetail } from '#/features/catalog/server/product-core'
import {
  DELIVERY_FEES_KOBO,
  DELIVERY_ZONE_ETA,
  DELIVERY_ZONE_LABELS,
  DELIVERY_ZONES,
  MAX_QTY_PER_LINE,
  NIGERIAN_STATES,
} from '#/lib/config'
import { ApiError, json, parseInput } from './http'
import type { ApiHandler } from './http'

// Strict, unlike the web's /shop params: a bad value is a 422, not silently ignored.
const catalogQuerySchema = z.object({
  tier: z.enum(tiers).optional(),
  gender: z.enum(genders).optional(),
  occasion: z.enum(occasions).optional(),
  family: z.enum(families).optional(),
  sort: z.enum(sorts).optional(),
  q: z.string().trim().max(80).optional(),
})

export const getCatalog: ApiHandler = async ({ request }) => {
  const query = parseInput(
    catalogQuerySchema,
    Object.fromEntries(new URL(request.url).searchParams),
  )
  const cards = (await loadActiveCards()).map((r) => r.card)
  const products = applyShopSearch(cards, query)
  return json({ products, total: products.length })
}

export const getProductBySlug: ApiHandler = async ({ params }) => {
  const slug = parseInput(z.string().min(1).max(120), params.slug)
  const product = await loadProductDetail(slug)
  if (!product) throw new ApiError(404, 'not_found', 'Product not found.')
  return json({ product })
}

export const getDupes: ApiHandler = async () =>
  json({ dupes: buildDupePairs(await loadActiveCards()) })

export const getDeliveryZones: ApiHandler = async () =>
  json({
    zones: DELIVERY_ZONES.map((id) => ({
      id,
      label: DELIVERY_ZONE_LABELS[id],
      feeKobo: DELIVERY_FEES_KOBO[id],
      eta: DELIVERY_ZONE_ETA[id],
    })),
    maxQuantityPerLine: MAX_QTY_PER_LINE,
    states: NIGERIAN_STATES,
  })

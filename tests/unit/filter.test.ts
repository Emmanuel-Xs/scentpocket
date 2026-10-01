import { describe, expect, it } from 'vitest'
import { applyShopSearch, hasActiveFilters } from '#/features/catalog/filter'
import { shopSearchSchema } from '#/features/catalog/schemas'
import type { ProductCardData } from '#/features/catalog/types'

function product(over: Partial<ProductCardData>): ProductCardData {
  return {
    id: over.slug ?? 'x',
    slug: 'x',
    name: 'X',
    brand: 'B',
    tier: 'pocket',
    gender: 'unisex',
    family: 'fresh',
    occasions: ['everyday'],
    featuredRank: null,
    createdAt: 0,
    notes: [],
    fromKobo: 1000,
    multiSize: false,
    soldOut: false,
    lowStock: null,
    image: null,
    ...over,
  }
}

const catalog = [
  product({
    slug: 'a',
    name: 'Alpha',
    brand: 'Lattafa',
    tier: 'arabian_gems',
    fromKobo: 4200000,
    featuredRank: 2,
    createdAt: 1,
  }),
  product({
    slug: 'b',
    name: 'Bravo',
    brand: 'Armaf',
    tier: 'pocket',
    gender: 'men',
    fromKobo: 1150000,
    occasions: ['office', 'owambe'],
    createdAt: 3,
  }),
  product({
    slug: 'c',
    name: 'Charlie',
    brand: 'Dior',
    tier: 'designer',
    family: 'woody',
    fromKobo: 24000000,
    featuredRank: 1,
    createdAt: 2,
  }),
]

describe('applyShopSearch', () => {
  it('sorts featured first by default', () => {
    expect(applyShopSearch(catalog, {}).map((p) => p.slug)).toEqual([
      'c',
      'a',
      'b',
    ])
  })

  it('filters by tier, gender, family and occasion', () => {
    expect(
      applyShopSearch(catalog, { tier: 'pocket' }).map((p) => p.slug),
    ).toEqual(['b'])
    expect(
      applyShopSearch(catalog, { gender: 'men' }).map((p) => p.slug),
    ).toEqual(['b'])
    expect(
      applyShopSearch(catalog, { family: 'woody' }).map((p) => p.slug),
    ).toEqual(['c'])
    expect(
      applyShopSearch(catalog, { occasion: 'owambe' }).map((p) => p.slug),
    ).toEqual(['b'])
  })

  it('searches name and brand, case insensitive', () => {
    expect(applyShopSearch(catalog, { q: 'DIOR' }).map((p) => p.slug)).toEqual([
      'c',
    ])
    expect(applyShopSearch(catalog, { q: 'alp' }).map((p) => p.slug)).toEqual([
      'a',
    ])
    expect(applyShopSearch(catalog, { q: 'nothing' })).toEqual([])
  })

  it('sorts by price and newest', () => {
    expect(
      applyShopSearch(catalog, { sort: 'price_asc' }).map((p) => p.slug),
    ).toEqual(['b', 'a', 'c'])
    expect(
      applyShopSearch(catalog, { sort: 'price_desc' }).map((p) => p.slug),
    ).toEqual(['c', 'a', 'b'])
    expect(
      applyShopSearch(catalog, { sort: 'newest' }).map((p) => p.slug),
    ).toEqual(['b', 'c', 'a'])
  })

  it('does not mutate the input', () => {
    const copy = [...catalog]
    applyShopSearch(catalog, { sort: 'price_desc' })
    expect(catalog).toEqual(copy)
  })
})

describe('shopSearchSchema', () => {
  it('falls back to unset on invalid values instead of throwing', () => {
    const parsed = shopSearchSchema.parse({
      tier: 'bogus',
      sort: 7,
      q: 'x'.repeat(200),
    })
    expect(parsed.tier).toBeUndefined()
    expect(parsed.sort).toBeUndefined()
    expect(parsed.q).toBeUndefined()
  })
})

describe('hasActiveFilters', () => {
  it('ignores sort and blank search', () => {
    expect(hasActiveFilters({ sort: 'price_asc', q: '  ' })).toBe(false)
    expect(hasActiveFilters({ tier: 'niche' })).toBe(true)
  })
})

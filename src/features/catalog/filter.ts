import type { ShopSearch } from './schemas'
import type { ProductCardData } from './types'

/** Filters, searches and sorts the catalog. Pure, so it runs the same on server and client. */
export function applyShopSearch(
  products: ProductCardData[],
  search: ShopSearch,
): ProductCardData[] {
  const q = search.q?.trim().toLowerCase()

  const filtered = products.filter((p) => {
    if (search.tier && p.tier !== search.tier) return false
    if (search.gender && p.gender !== search.gender) return false
    if (search.family && p.family !== search.family) return false
    if (search.occasion && !p.occasions.includes(search.occasion)) return false
    if (q && !`${p.brand} ${p.name}`.toLowerCase().includes(q)) return false
    return true
  })

  const sort = search.sort ?? 'featured'
  return filtered.sort((a, b) => {
    switch (sort) {
      case 'price_asc':
        return a.fromKobo - b.fromKobo
      case 'price_desc':
        return b.fromKobo - a.fromKobo
      case 'newest':
        return b.createdAt - a.createdAt
      case 'featured':
        // Featured first (lowest rank), then the rest by name.
        return (
          (a.featuredRank ?? Infinity) - (b.featuredRank ?? Infinity) ||
          a.name.localeCompare(b.name)
        )
    }
  })
}

export function hasActiveFilters(search: ShopSearch): boolean {
  return Boolean(
    search.tier ||
    search.gender ||
    search.family ||
    search.occasion ||
    search.q?.trim(),
  )
}

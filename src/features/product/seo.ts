import type { ProductDetail } from '#/features/catalog/types'
import { SITE_ORIGIN } from '#/lib/seo'

const naira = (kobo: number) => (kobo / 100).toFixed(2)

/** schema.org Product. One size is an Offer, several sizes an AggregateOffer. No ratings. */
export function productLd(p: ProductDetail): Record<string, unknown> {
  const url = `${SITE_ORIGIN}/p/${p.card.slug}`
  const prices = p.variants.map((v) => v.priceKobo)
  const availability = p.variants.some((v) => v.stock > 0)
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock'
  const base = { priceCurrency: 'NGN', availability, url }
  const offers =
    p.variants.length > 1
      ? {
          '@type': 'AggregateOffer',
          ...base,
          lowPrice: naira(Math.min(...prices)),
          highPrice: naira(Math.max(...prices)),
          offerCount: p.variants.length,
        }
      : { '@type': 'Offer', ...base, price: naira(prices[0] ?? 0) }
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.card.name,
    brand: { '@type': 'Brand', name: p.card.brand },
    description: p.description,
    sku: p.card.slug,
    image: p.images.map((i) => i.src),
    url,
    offers,
  }
}

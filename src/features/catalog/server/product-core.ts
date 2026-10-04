import { and, asc, eq } from 'drizzle-orm'
import { getDb } from '#/db/client'
import { productImages, productVariants, products } from '#/db/schema'
import { productImageUrl } from '#/features/images/url'
import type { ProductDetail } from '../types'
import { loadActiveCards } from './cards'

const RELATED_COUNT = 4

/** One active product with everything the product page shows, or null when it is unknown or inactive. */
export async function loadProductDetail(
  slug: string,
): Promise<ProductDetail | null> {
  const db = getDb()
  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.isActive, true)))
    .limit(1)
  const product = rows.at(0)
  if (!product) return null

  const [variants, images, cards] = await Promise.all([
    db
      .select()
      .from(productVariants)
      .where(
        and(
          eq(productVariants.productId, product.id),
          eq(productVariants.isActive, true),
        ),
      )
      .orderBy(asc(productVariants.sizeMl)),
    db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, product.id))
      .orderBy(asc(productImages.position)),
    loadActiveCards(),
  ])

  const self = cards.find((c) => c.card.id === product.id)
  if (!self) return null

  return {
    card: self.card,
    description: product.description,
    topNotes: product.topNotes,
    heartNotes: product.heartNotes,
    baseNotes: product.baseNotes,
    longevity: product.longevity,
    projection: product.projection,
    variants: variants.map((v) => ({
      id: v.id,
      label: v.label,
      sizeMl: v.sizeMl,
      priceKobo: v.priceKobo,
      stock: v.stock,
    })),
    images: images.map((i) => ({
      src: productImageUrl(i.path),
      width: i.width,
      height: i.height,
      blurDataUrl: i.blurDataUrl,
      alt: i.alt,
    })),
    inspiredBy:
      cards.find((c) => c.card.id === product.inspiredById)?.card ?? null,
    dupes: cards
      .filter((c) => c.inspiredById === product.id)
      .map((c) => c.card),
    related: cards
      .filter((c) => c.card.tier === product.tier && c.card.id !== product.id)
      .map((c) => c.card)
      .slice(0, RELATED_COUNT),
  }
}

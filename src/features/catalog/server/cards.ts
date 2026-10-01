import { asc, eq } from 'drizzle-orm'
import { getDb } from '#/db/client'
import { productImages, productVariants, products } from '#/db/schema'
import { productImageUrl } from '#/features/images/url'
import type { DupePair, ProductCardData } from '../types'

/** Every active product as card data, plus the dupe link, in one pass (16 rows). */
export async function loadActiveCards() {
  const db = getDb()
  const [productRows, variantRows, imageRows] = await Promise.all([
    db
      .select()
      .from(products)
      .where(eq(products.isActive, true))
      .orderBy(asc(products.name)),
    db.select().from(productVariants).where(eq(productVariants.isActive, true)),
    db.select().from(productImages).where(eq(productImages.position, 0)),
  ])

  return productRows.map((p) => {
    const variants = variantRows.filter((v) => v.productId === p.id)
    const inStock = variants.filter((v) => v.stock > 0)
    const priced = inStock.length > 0 ? inStock : variants
    const totalStock = variants.reduce((sum, v) => sum + v.stock, 0)
    const image = imageRows.find((i) => i.productId === p.id)

    const card: ProductCardData = {
      id: p.id,
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      tier: p.tier,
      gender: p.gender,
      family: p.family,
      occasions: p.occasions,
      featuredRank: p.featuredRank,
      createdAt: p.createdAt.getTime(),
      notes: p.topNotes.slice(0, 3),
      allNotes: [...p.topNotes, ...p.heartNotes, ...p.baseNotes],
      fromKobo: Math.min(...priced.map((v) => v.priceKobo)),
      multiSize: variants.length > 1,
      soldOut: inStock.length === 0,
      lowStock: totalStock > 0 && totalStock <= 3 ? totalStock : null,
      image: image
        ? {
            src: productImageUrl(image.path),
            width: image.width,
            height: image.height,
            blurDataUrl: image.blurDataUrl,
            alt: image.alt,
          }
        : null,
    }
    return { card, inspiredById: p.inspiredById, featuredRank: p.featuredRank }
  })
}

/** Every dupe link as a pair, biggest saving first. */
export function buildDupePairs(
  rows: Awaited<ReturnType<typeof loadActiveCards>>,
): DupePair[] {
  const byId = new Map(rows.map((r) => [r.card.id, r.card]))
  return rows
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
}

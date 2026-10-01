import { asc, eq } from 'drizzle-orm'
import { getDb } from '#/db/client'
import { productImages, productVariants, products } from '#/db/schema'
import { productImageUrl } from '#/features/images/url'
import type { ProductCardData } from '../types'

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
      notes: p.topNotes.slice(0, 3),
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

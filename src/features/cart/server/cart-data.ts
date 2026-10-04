import { and, eq, inArray } from 'drizzle-orm'
import type { Db } from '#/db/client'
import { productImages, productVariants, products } from '#/db/schema'
import { productImageUrl } from '#/features/images/url'
import type { CartLineData } from '../types'

/**
 * Display data, current price and stock for variants. Variants that are gone or inactive are
 * simply absent from the result, which is how callers know to drop them.
 */
export async function loadCartLineData(
  db: Db,
  variantIds: string[],
): Promise<CartLineData[]> {
  if (variantIds.length === 0) return []

  const rows = await db
    .select({
      variantId: productVariants.id,
      productId: products.id,
      productSlug: products.slug,
      productName: products.name,
      brand: products.brand,
      tier: products.tier,
      variantLabel: productVariants.label,
      sizeMl: productVariants.sizeMl,
      priceKobo: productVariants.priceKobo,
      stock: productVariants.stock,
    })
    .from(productVariants)
    .innerJoin(products, eq(products.id, productVariants.productId))
    .where(
      and(
        inArray(productVariants.id, variantIds),
        eq(productVariants.isActive, true),
        eq(products.isActive, true),
      ),
    )
  if (rows.length === 0) return []

  const images = await db
    .select()
    .from(productImages)
    .where(
      and(
        inArray(productImages.productId, [
          ...new Set(rows.map((r) => r.productId)),
        ]),
        eq(productImages.position, 0),
      ),
    )

  return rows.map(({ productId, ...row }) => {
    const image = images.find((i) => i.productId === productId)
    return {
      ...row,
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
  })
}

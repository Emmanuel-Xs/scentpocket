import { and, asc, eq, inArray, max, ne } from 'drizzle-orm'
import type { Db } from '#/db/client'
import {
  orderItems,
  productImages,
  productVariants,
  products,
} from '#/db/schema'
import type { ProductData } from '../schemas'

export class ProductError extends Error {
  constructor(
    message: string,
    readonly code: 'slug_taken' | 'not_found' | 'has_orders' | 'self_inspired',
  ) {
    super(message)
    this.name = 'ProductError'
  }
}

const toKobo = (naira: number) => Math.round(naira * 100)

function skuFor(slug: string, sizeMl: number) {
  return `SP-${slug}-${sizeMl}`.toUpperCase()
}

/**
 * Creates or updates a product and its sizes in one transaction.
 * Sizes dropped from the form are deleted if they were never ordered, otherwise hidden
 * (inactive), because past orders point at them. Returns the product id.
 */
export async function saveProduct(db: Db, input: ProductData): Promise<string> {
  if (input.id && input.inspiredById === input.id) {
    throw new ProductError(
      'A scent cannot be inspired by itself',
      'self_inspired',
    )
  }

  return db.transaction(async (tx) => {
    const clash = await tx
      .select({ id: products.id })
      .from(products)
      .where(
        input.id
          ? and(eq(products.slug, input.slug), ne(products.id, input.id))
          : eq(products.slug, input.slug),
      )
      .limit(1)
    if (clash.length > 0)
      throw new ProductError('That slug is already used', 'slug_taken')

    const values = {
      slug: input.slug,
      name: input.name,
      brand: input.brand,
      description: input.description,
      tier: input.tier,
      gender: input.gender,
      family: input.family,
      occasions: input.occasions,
      topNotes: input.topNotes,
      heartNotes: input.heartNotes,
      baseNotes: input.baseNotes,
      longevity: input.longevity,
      projection: input.projection,
      inspiredById: input.inspiredById,
      isActive: input.isActive,
    }

    let productId: string
    if (input.id) {
      const updated = await tx
        .update(products)
        .set(values)
        .where(eq(products.id, input.id))
        .returning({ id: products.id })
      const row = updated.at(0)
      if (!row) throw new ProductError('Product not found', 'not_found')
      productId = row.id
    } else {
      const inserted = await tx
        .insert(products)
        .values(values)
        .returning({ id: products.id })
      const row = inserted.at(0)
      if (!row) throw new Error('Could not create the product')
      productId = row.id
    }

    const existing = await tx
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, productId))
    const keepIds = new Set(input.variants.flatMap((v) => (v.id ? [v.id] : [])))

    for (const [position, v] of input.variants.entries()) {
      const fields = {
        label: v.label,
        sizeMl: v.sizeMl,
        priceKobo: toKobo(v.priceNaira),
        stock: v.stock,
        position,
        isActive: true,
      }
      if (v.id && existing.some((e) => e.id === v.id)) {
        await tx
          .update(productVariants)
          .set(fields)
          .where(eq(productVariants.id, v.id))
      } else {
        // Same size twice would collide on the SKU, so make it unique with the position.
        const sku = skuFor(input.slug, v.sizeMl)
        const taken = await tx
          .select({ id: productVariants.id })
          .from(productVariants)
          .where(eq(productVariants.sku, sku))
          .limit(1)
        await tx.insert(productVariants).values({
          productId,
          sku: taken.length > 0 ? `${sku}-${position + 1}` : sku,
          ...fields,
        })
      }
    }

    const removed = existing.filter((e) => !keepIds.has(e.id))
    if (removed.length > 0) {
      const ordered = await tx
        .select({ variantId: orderItems.variantId })
        .from(orderItems)
        .where(
          inArray(
            orderItems.variantId,
            removed.map((r) => r.id),
          ),
        )
      const orderedIds = new Set(ordered.map((o) => o.variantId))
      const hide = removed.filter((r) => orderedIds.has(r.id)).map((r) => r.id)
      const drop = removed.filter((r) => !orderedIds.has(r.id)).map((r) => r.id)
      if (hide.length > 0) {
        await tx
          .update(productVariants)
          .set({ isActive: false })
          .where(inArray(productVariants.id, hide))
      }
      if (drop.length > 0)
        await tx
          .delete(productVariants)
          .where(inArray(productVariants.id, drop))
    }
    return productId
  })
}

/**
 * Deletes a product that has never been ordered. Returns the storage paths of its photos so the
 * caller can remove the files. Products with orders must be deactivated instead.
 */
export async function deleteProduct(db: Db, id: string): Promise<string[]> {
  return db.transaction(async (tx) => {
    const variants = await tx
      .select({ id: productVariants.id })
      .from(productVariants)
      .where(eq(productVariants.productId, id))
    if (variants.length > 0) {
      const ordered = await tx
        .select({ id: orderItems.id })
        .from(orderItems)
        .where(
          inArray(
            orderItems.variantId,
            variants.map((v) => v.id),
          ),
        )
        .limit(1)
      if (ordered.length > 0) {
        throw new ProductError(
          'This product has orders, so it cannot be deleted. Deactivate it instead.',
          'has_orders',
        )
      }
    }
    const photos = await tx
      .select({ path: productImages.path })
      .from(productImages)
      .where(eq(productImages.productId, id))
    const gone = await tx
      .delete(products)
      .where(eq(products.id, id))
      .returning({ id: products.id })
    if (gone.length === 0)
      throw new ProductError('Product not found', 'not_found')
    return photos.map((p) => p.path)
  })
}

/** Next free photo position for a product (0 is the main photo). */
export async function nextImagePosition(
  db: Db,
  productId: string,
): Promise<number> {
  const rows = await db
    .select({ top: max(productImages.position) })
    .from(productImages)
    .where(eq(productImages.productId, productId))
  const top = rows.at(0)?.top
  return top === null || top === undefined ? 0 : top + 1
}

/** After a photo is removed, close the gap so the first one is always position 0. */
export async function renumberImages(db: Db, productId: string): Promise<void> {
  const rows = await db
    .select({ id: productImages.id })
    .from(productImages)
    .where(eq(productImages.productId, productId))
    .orderBy(asc(productImages.position), asc(productImages.createdAt))
  for (const [position, row] of rows.entries()) {
    await db
      .update(productImages)
      .set({ position })
      .where(eq(productImages.id, row.id))
  }
}

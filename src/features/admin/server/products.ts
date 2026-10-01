import { notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { asc, eq, ilike, or } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { getDb } from '#/db/client'
import { productImages, productVariants, products } from '#/db/schema'
import { requireAdmin } from '#/features/auth/server/session'
import { removeFiles, uploadWebp } from '#/features/images/server/storage'
import { productImageUrl } from '#/features/images/url'
import { IMAGE_TYPES, MAX_IMAGE_BYTES, productInputSchema } from '../schemas'
import type {
  AdminProductDetail,
  AdminProductRow,
  ProductOption,
} from '../types'
import {
  deleteProduct,
  nextImagePosition,
  ProductError,
  renumberImages,
  saveProduct,
} from './product-core'

export type AdminActionResult = { ok: true } | { ok: false; error: string }
const idSchema = z.object({ id: z.uuid() })

export const listAdminProducts = createServerFn({ method: 'GET' })
  .validator(z.object({ q: z.string().trim().max(80).optional() }))
  .handler(async ({ data }): Promise<AdminProductRow[]> => {
    await requireAdmin()
    const db = getDb()
    const [rows, variants, images] = await Promise.all([
      db
        .select()
        .from(products)
        .where(
          data.q
            ? or(
                ilike(products.name, `%${data.q}%`),
                ilike(products.brand, `%${data.q}%`),
              )
            : undefined,
        )
        .orderBy(asc(products.tier), asc(products.name)),
      db.select().from(productVariants),
      db.select().from(productImages).where(eq(productImages.position, 0)),
    ])
    return rows.map((p) => {
      const mine = variants.filter((v) => v.productId === p.id && v.isActive)
      const image = images.find((i) => i.productId === p.id)
      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        brand: p.brand,
        tier: p.tier,
        isActive: p.isActive,
        variantCount: mine.length,
        totalStock: mine.reduce((sum, v) => sum + v.stock, 0),
        fromKobo:
          mine.length > 0 ? Math.min(...mine.map((v) => v.priceKobo)) : 0,
        imageUrl: image ? productImageUrl(image.path) : null,
      }
    })
  })

/** Everything the product form needs, including the list of scents it can be "inspired by". */
export const getAdminProduct = createServerFn({ method: 'GET' })
  .validator(z.object({ id: z.uuid().optional() }))
  .handler(
    async ({
      data,
    }): Promise<{
      product: AdminProductDetail | null
      options: ProductOption[]
    }> => {
      await requireAdmin()
      const db = getDb()
      const options = await db
        .select({ id: products.id, name: products.name, brand: products.brand })
        .from(products)
        .orderBy(asc(products.name))
      if (!data.id) return { product: null, options }

      const found = await db
        .select()
        .from(products)
        .where(eq(products.id, data.id))
        .limit(1)
      const p = found.at(0)
      if (!p) throw notFound()
      const [variants, photos] = await Promise.all([
        db
          .select()
          .from(productVariants)
          .where(eq(productVariants.productId, p.id))
          .orderBy(asc(productVariants.position), asc(productVariants.sizeMl)),
        db
          .select()
          .from(productImages)
          .where(eq(productImages.productId, p.id))
          .orderBy(asc(productImages.position)),
      ])
      return {
        options,
        product: {
          id: p.id,
          slug: p.slug,
          name: p.name,
          brand: p.brand,
          description: p.description,
          tier: p.tier,
          gender: p.gender,
          family: p.family,
          occasions: p.occasions,
          topNotes: p.topNotes,
          heartNotes: p.heartNotes,
          baseNotes: p.baseNotes,
          longevity: p.longevity,
          projection: p.projection,
          inspiredById: p.inspiredById,
          isActive: p.isActive,
          variants: variants
            .filter((v) => v.isActive)
            .map((v) => ({
              id: v.id,
              label: v.label,
              sizeMl: v.sizeMl,
              priceKobo: v.priceKobo,
              stock: v.stock,
              isActive: v.isActive,
            })),
          photos: photos.map((i) => ({
            id: i.id,
            url: productImageUrl(i.path),
            width: i.width,
            height: i.height,
            alt: i.alt,
          })),
        },
      }
    },
  )

export const saveAdminProduct = createServerFn({ method: 'POST' })
  .validator(productInputSchema)
  .handler(
    async ({
      data,
    }): Promise<{ ok: true; id: string } | { ok: false; error: string }> => {
      await requireAdmin()
      try {
        return { ok: true, id: await saveProduct(getDb(), data) }
      } catch (error) {
        if (error instanceof ProductError)
          return { ok: false, error: error.message }
        throw error
      }
    },
  )

export const setProductActive = createServerFn({ method: 'POST' })
  .validator(idSchema.extend({ isActive: z.boolean() }))
  .handler(async ({ data }): Promise<AdminActionResult> => {
    await requireAdmin()
    const done = await getDb()
      .update(products)
      .set({ isActive: data.isActive })
      .where(eq(products.id, data.id))
      .returning({ id: products.id })
    return done.length > 0
      ? { ok: true }
      : { ok: false, error: 'Product not found' }
  })

export const deleteAdminProduct = createServerFn({ method: 'POST' })
  .validator(idSchema)
  .handler(async ({ data }): Promise<AdminActionResult> => {
    await requireAdmin()
    try {
      const paths = await deleteProduct(getDb(), data.id)
      await removeFiles(paths)
      return { ok: true }
    } catch (error) {
      if (error instanceof ProductError)
        return { ok: false, error: error.message }
      throw error
    }
  })

/** Photo upload: image types only, 8 MB max, converted to a WebP master + blur placeholder. */
export const uploadProductPhoto = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error('Expected form data')
    return data
  })
  .handler(async ({ data }): Promise<AdminActionResult> => {
    await requireAdmin()
    const productId = z.uuid().safeParse(data.get('productId'))
    const file = data.get('file')
    if (!productId.success || !(file instanceof File)) {
      return { ok: false, error: 'Choose an image file.' }
    }
    if (!(IMAGE_TYPES as readonly string[]).includes(file.type)) {
      return { ok: false, error: 'Use a PNG, JPEG or WebP image.' }
    }
    if (file.size > MAX_IMAGE_BYTES)
      return { ok: false, error: 'That image is over 8 MB.' }

    const db = getDb()
    const found = await db
      .select({ name: products.name, brand: products.brand })
      .from(products)
      .where(eq(products.id, productId.data))
      .limit(1)
    const product = found.at(0)
    if (!product) return { ok: false, error: 'Product not found' }

    let processed
    try {
      // Loaded on demand: sharp is a native module that only the upload path needs.
      const { processImage } = await import('#/features/images/process')
      processed = await processImage(Buffer.from(await file.arrayBuffer()))
    } catch {
      return {
        ok: false,
        error: 'We could not read that image. Try another file.',
      }
    }
    const path = `${productId.data}/${randomUUID()}.webp`
    await uploadWebp(path, processed.master)
    await db.insert(productImages).values({
      productId: productId.data,
      path,
      width: processed.width,
      height: processed.height,
      blurDataUrl: processed.blurDataUrl,
      alt: `${product.brand} ${product.name} bottle`,
      position: await nextImagePosition(db, productId.data),
    })
    return { ok: true }
  })

export const deleteProductPhoto = createServerFn({ method: 'POST' })
  .validator(idSchema)
  .handler(async ({ data }): Promise<AdminActionResult> => {
    await requireAdmin()
    const db = getDb()
    const removed = await db
      .delete(productImages)
      .where(eq(productImages.id, data.id))
      .returning({
        path: productImages.path,
        productId: productImages.productId,
      })
    const row = removed.at(0)
    if (!row) return { ok: false, error: 'Photo not found' }
    await removeFiles([row.path])
    await renumberImages(db, row.productId)
    return { ok: true }
  })

/** Makes a photo the main one (position 0); the others keep their order behind it. */
export const makeMainPhoto = createServerFn({ method: 'POST' })
  .validator(idSchema)
  .handler(async ({ data }): Promise<AdminActionResult> => {
    await requireAdmin()
    const db = getDb()
    const found = await db
      .select()
      .from(productImages)
      .where(eq(productImages.id, data.id))
      .limit(1)
    const photo = found.at(0)
    if (!photo) return { ok: false, error: 'Photo not found' }
    await db
      .update(productImages)
      .set({ position: -1 })
      .where(eq(productImages.id, photo.id))
    await renumberImages(db, photo.productId)
    return { ok: true }
  })

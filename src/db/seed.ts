import { randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { eq, sql } from 'drizzle-orm'
import { getDb } from './client'
import { productImages, productVariants, products } from './schema'
import { seedProducts } from './seed-data'
import type { SeedProduct } from './seed-data'
import { CACHE_CONTROL_SECONDS, processImage } from '#/features/images/process'
import { PRODUCTS_BUCKET } from '#/features/images/url'
import { getPublicEnv, getServerEnv } from '#/lib/env'

const db = getDb()

const supabase = createClient(
  getPublicEnv().VITE_SUPABASE_URL,
  getServerEnv().SUPABASE_SECRET_KEY,
  {
    auth: { persistSession: false },
  },
)

async function upsertProduct(p: SeedProduct) {
  const values = {
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    description: p.description,
    tier: p.tier,
    gender: p.gender,
    family: p.family,
    occasions: p.occasions,
    topNotes: p.top,
    heartNotes: p.heart,
    baseNotes: p.base,
    longevity: p.longevity,
    projection: p.projection,
    featuredRank: p.featuredRank ?? null,
  }
  const [row] = await db
    .insert(products)
    .values(values)
    .onConflictDoUpdate({ target: products.slug, set: values })
    .returning({ id: products.id })
  return row.id
}

async function upsertVariants(productId: string, p: SeedProduct) {
  for (const [position, v] of p.variants.entries()) {
    const sku = `SP-${p.slug}-${v.sizeMl}`.toUpperCase()
    // Stock is only set on first insert so re-seeding never undoes real orders.
    await db
      .insert(productVariants)
      .values({ productId, sku, position, ...v })
      .onConflictDoUpdate({
        target: productVariants.sku,
        set: {
          label: v.label,
          sizeMl: v.sizeMl,
          priceKobo: v.priceKobo,
          position,
        },
      })
  }
}

async function fetchImage(sourceJsonUrl: string): Promise<Buffer> {
  // A direct image URL (a product the reference store does not stock) skips the product json step.
  if (/\.(jpe?g|png|webp)(\?|$)/i.test(sourceJsonUrl)) {
    const direct = await fetch(sourceJsonUrl, {
      headers: { 'user-agent': 'Mozilla/5.0' },
    })
    if (!direct.ok) throw new Error(`image ${direct.status}`)
    return Buffer.from(await direct.arrayBuffer())
  }
  const res = await fetch(sourceJsonUrl, {
    headers: { 'user-agent': 'Mozilla/5.0' },
  })
  if (!res.ok) throw new Error(`product json ${res.status}`)
  const json = (await res.json()) as { product: { images: { src: string }[] } }
  const src = json.product.images[0]?.src
  if (!src) throw new Error('no image in product json')
  const img = await fetch(src)
  if (!img.ok) throw new Error(`image ${img.status}`)
  return Buffer.from(await img.arrayBuffer())
}

async function ensureImage(productId: string, p: SeedProduct) {
  if (!p.imageSourceUrl) return 'no source'
  const existing = await db
    .select({ id: productImages.id })
    .from(productImages)
    .where(eq(productImages.productId, productId))
    .limit(1)
  if (existing.length > 0) return 'exists'

  const processed = await processImage(await fetchImage(p.imageSourceUrl))
  const path = `${productId}/${randomUUID()}.webp`
  const { error } = await supabase.storage
    .from(PRODUCTS_BUCKET)
    .upload(path, processed.master, {
      contentType: 'image/webp',
      cacheControl: String(CACHE_CONTROL_SECONDS),
    })
  if (error) throw new Error(`upload: ${error.message}`)

  await db.insert(productImages).values({
    productId,
    path,
    width: processed.width,
    height: processed.height,
    blurDataUrl: processed.blurDataUrl,
    alt: `${p.brand} ${p.name} bottle`,
    position: 0,
  })
  return `uploaded ${Math.round(processed.master.length / 1024)}kB`
}

async function main() {
  const ids = new Map<string, string>()
  for (const p of seedProducts) {
    const id = await upsertProduct(p)
    ids.set(p.slug, id)
    await upsertVariants(id, p)
  }

  // Second pass: dupe links need every product to exist first.
  for (const p of seedProducts) {
    const target = p.inspiredBy ? (ids.get(p.inspiredBy) ?? null) : null
    await db
      .update(products)
      .set({ inspiredById: target, updatedAt: sql`now()` })
      .where(eq(products.slug, p.slug))
  }

  for (const p of seedProducts) {
    try {
      console.log(p.slug.padEnd(28), await ensureImage(ids.get(p.slug)!, p))
    } catch (e) {
      console.error(
        p.slug.padEnd(28),
        'IMAGE FAILED:',
        e instanceof Error ? e.message : e,
      )
      process.exitCode = 1
    }
  }
  console.log(`Seeded ${seedProducts.length} products`)
  process.exit()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

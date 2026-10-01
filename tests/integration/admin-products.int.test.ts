import { randomUUID } from 'node:crypto'
import { eq, inArray, like } from 'drizzle-orm'
import { afterAll, describe, expect, it } from 'vitest'
import { getDb } from '#/db/client'
import { orders, productVariants, products, profiles } from '#/db/schema'
import type { ProductData } from '#/features/admin/schemas'
import {
  deleteProduct,
  ProductError,
  saveProduct,
} from '#/features/admin/server/product-core'
import { createOrder } from '#/features/checkout/server/create-order'

/** Real database, uniquely tagged rows, cleaned up after. */
const db = getDb()
const tag = randomUUID().slice(0, 8)
const slug = (s: string) => `zz-admin-${tag}-${s}`
const userIds: string[] = []

const base = (over: Partial<ProductData> = {}): ProductData => ({
  name: 'Admin Test Scent',
  brand: 'Test',
  slug: slug('a'),
  description: 'A bright, sunny scent for everyday wear.',
  tier: 'pocket',
  gender: 'unisex',
  family: 'fresh',
  occasions: ['everyday'],
  topNotes: ['Lemon'],
  heartNotes: ['Jasmine'],
  baseNotes: ['Musk'],
  longevity: 'short',
  projection: 'soft',
  inspiredById: null,
  isActive: true,
  variants: [{ label: '100ml', sizeMl: 100, priceNaira: 12500, stock: 5 }],
  ...over,
})

const variantsOf = (productId: string) =>
  db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, productId))

afterAll(async () => {
  await db.delete(orders).where(inArray(orders.userId, userIds))
  await db.delete(products).where(like(products.slug, `zz-admin-${tag}-%`))
  if (userIds.length > 0)
    await db.delete(profiles).where(inArray(profiles.id, userIds))
})

describe('saveProduct', () => {
  it('creates a product with sizes, converting naira to kobo and generating SKUs', async () => {
    const id = await saveProduct(
      db,
      base({
        variants: [
          { label: '50ml', sizeMl: 50, priceNaira: 8000, stock: 3 },
          { label: '100ml', sizeMl: 100, priceNaira: 12500.5, stock: 0 },
        ],
      }),
    )
    const rows = (await variantsOf(id)).sort((a, b) => a.sizeMl - b.sizeMl)
    expect(rows.map((r) => r.priceKobo)).toEqual([800_000, 1_250_050])
    expect(rows.map((r) => r.stock)).toEqual([3, 0])
    expect(rows[0]?.sku).toBe(`SP-${slug('a')}-50`.toUpperCase())
  })

  it('rejects a slug that another product already uses', async () => {
    await saveProduct(db, base({ slug: slug('dup') }))
    await expect(
      saveProduct(db, base({ slug: slug('dup') })),
    ).rejects.toMatchObject({
      code: 'slug_taken',
    })
  })

  it('updates in place, keeps edited sizes and drops never ordered ones', async () => {
    const id = await saveProduct(
      db,
      base({
        slug: slug('edit'),
        variants: [
          { label: '50ml', sizeMl: 50, priceNaira: 8000, stock: 3 },
          { label: '100ml', sizeMl: 100, priceNaira: 12500, stock: 5 },
        ],
      }),
    )
    const [small, big] = (await variantsOf(id)).sort(
      (a, b) => a.sizeMl - b.sizeMl,
    )
    await saveProduct(
      db,
      base({
        id,
        slug: slug('edit'),
        name: 'Renamed',
        variants: [
          {
            id: big?.id,
            label: '100ml EDP',
            sizeMl: 100,
            priceNaira: 15000,
            stock: 9,
          },
        ],
      }),
    )
    const after = await variantsOf(id)
    expect(after).toHaveLength(1) // the 50ml was never ordered, so it is gone
    expect(after[0]).toMatchObject({
      id: big?.id,
      label: '100ml EDP',
      priceKobo: 1_500_000,
      stock: 9,
    })
    expect(after.some((v) => v.id === small?.id)).toBe(false)
    const [row] = await db.select().from(products).where(eq(products.id, id))
    expect(row.name).toBe('Renamed')
  })

  it('hides (not deletes) a size that past orders point at', async () => {
    const id = await saveProduct(
      db,
      base({
        slug: slug('ordered'),
        variants: [
          { label: '50ml', sizeMl: 50, priceNaira: 8000, stock: 3 },
          { label: '100ml', sizeMl: 100, priceNaira: 12500, stock: 5 },
        ],
      }),
    )
    const [small, big] = (await variantsOf(id)).sort(
      (a, b) => a.sizeMl - b.sizeMl,
    )
    const buyer = { id: randomUUID(), email: `int-admin-${tag}@example.com` }
    await db
      .insert(profiles)
      .values({ id: buyer.id, email: buyer.email, role: 'customer' })
    userIds.push(buyer.id)
    await createOrder(db, buyer, {
      items: [{ variantId: small?.id ?? '', qty: 1 }],
      delivery: {
        fullName: 'Ada Obi',
        phone: '+2348031234567',
        addressLine: '12 Allen Avenue',
        city: 'Ikeja',
        state: 'Lagos',
        deliveryZone: 'lagos_mainland',
      },
      idempotencyKey: `k-${randomUUID()}`,
    })

    await saveProduct(
      db,
      base({
        id,
        slug: slug('ordered'),
        variants: [
          {
            id: big?.id,
            label: '100ml',
            sizeMl: 100,
            priceNaira: 12500,
            stock: 5,
          },
        ],
      }),
    )
    const after = await variantsOf(id)
    const hidden = after.find((v) => v.id === small?.id)
    expect(hidden?.isActive).toBe(false) // still there for the order history
    expect(after.find((v) => v.id === big?.id)?.isActive).toBe(true)
  })

  it('refuses a scent inspired by itself', async () => {
    const id = await saveProduct(db, base({ slug: slug('self') }))
    await expect(
      saveProduct(db, base({ id, slug: slug('self'), inspiredById: id })),
    ).rejects.toMatchObject({ code: 'self_inspired' })
  })
})

describe('deleteProduct', () => {
  it('deletes a never ordered product with its sizes', async () => {
    const id = await saveProduct(db, base({ slug: slug('del') }))
    await deleteProduct(db, id)
    expect(
      await db.select().from(products).where(eq(products.id, id)),
    ).toHaveLength(0)
    expect(await variantsOf(id)).toHaveLength(0)
  })

  it('is blocked once the product has orders', async () => {
    const [ordered] = await db
      .select()
      .from(products)
      .where(eq(products.slug, slug('ordered')))
    await expect(deleteProduct(db, ordered.id)).rejects.toMatchObject({
      code: 'has_orders',
    })
    await expect(deleteProduct(db, ordered.id)).rejects.toBeInstanceOf(
      ProductError,
    )
  })

  it('reports an unknown product', async () => {
    await expect(deleteProduct(db, randomUUID())).rejects.toMatchObject({
      code: 'not_found',
    })
  })
})

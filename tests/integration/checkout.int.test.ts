import { randomUUID } from 'node:crypto'
import { eq, inArray } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { getDb } from '#/db/client'
import {
  orderItems,
  orders,
  productVariants,
  products,
  profiles,
} from '#/db/schema'
import {
  createOrder,
  StockError,
} from '#/features/checkout/server/create-order'
import type { PlaceOrderData } from '#/features/checkout/schemas'
import { cancelOrder, CancelError } from '#/features/orders/server/cancel-order'
import { transitionOrder } from '#/features/orders/server/transition-order'

/**
 * Runs against the real database with uniquely named rows, and cleans up after itself.
 * The fixture product is briefly active, so it can show up in the catalog while this runs.
 */
const db = getDb()
const tag = randomUUID().slice(0, 8)
const userIds: string[] = []

/** A fresh customer per test, so the 10 second duplicate window never links unrelated tests. */
async function newUser() {
  const u = {
    id: randomUUID(),
    email: `int-${randomUUID().slice(0, 8)}@example.com`,
  }
  await db
    .insert(profiles)
    .values({ id: u.id, email: u.email, role: 'customer' })
  userIds.push(u.id)
  return u
}

let productId = ''
const variants = {
  cheap: { id: '', price: 1_150_000 }, // ₦11,500, stock 10
  last: { id: '', price: 68_000_000 }, // ₦680,000, stock 1
  second: { id: '', price: 2_800_000 }, // ₦28,000, stock 2
}

const delivery = {
  fullName: 'Ada Obi',
  phone: '+2348031234567',
  addressLine: '12 Allen Avenue',
  city: 'Ikeja',
  state: 'Lagos' as const,
  deliveryZone: 'lagos_mainland' as const,
}

const order = (
  items: { variantId: string; qty: number }[],
  over: Partial<PlaceOrderData> = {},
): PlaceOrderData => ({
  items,
  delivery,
  idempotencyKey: `key-${randomUUID()}`,
  ...over,
})

const stockOf = async (id: string) =>
  (
    await db
      .select({ s: productVariants.stock })
      .from(productVariants)
      .where(eq(productVariants.id, id))
  )[0]?.s

async function reset() {
  await db
    .update(productVariants)
    .set({ stock: 10 })
    .where(eq(productVariants.id, variants.cheap.id))
  await db
    .update(productVariants)
    .set({ stock: 1 })
    .where(eq(productVariants.id, variants.last.id))
  await db
    .update(productVariants)
    .set({ stock: 2 })
    .where(eq(productVariants.id, variants.second.id))
}

beforeAll(async () => {
  const [p] = await db
    .insert(products)
    .values({
      slug: `zz-int-${tag}`,
      name: 'Integration Test Scent',
      brand: 'Test',
      description: 'Fixture',
      tier: 'pocket',
      gender: 'unisex',
      family: 'fresh',
      longevity: 'short',
      projection: 'soft',
    })
    .returning({ id: products.id })
  productId = p.id
  const rows = await db
    .insert(productVariants)
    .values([
      {
        productId,
        label: '100ml',
        sizeMl: 100,
        priceKobo: variants.cheap.price,
        stock: 10,
        sku: `ZZ-${tag}-A`,
      },
      {
        productId,
        label: '70ml',
        sizeMl: 70,
        priceKobo: variants.last.price,
        stock: 1,
        sku: `ZZ-${tag}-B`,
      },
      {
        productId,
        label: '50ml',
        sizeMl: 50,
        priceKobo: variants.second.price,
        stock: 2,
        sku: `ZZ-${tag}-C`,
      },
    ])
    .returning({ id: productVariants.id, sku: productVariants.sku })
  for (const r of rows) {
    if (r.sku.endsWith('-A')) variants.cheap.id = r.id
    if (r.sku.endsWith('-B')) variants.last.id = r.id
    if (r.sku.endsWith('-C')) variants.second.id = r.id
  }
})

afterAll(async () => {
  await db.delete(orders).where(inArray(orders.userId, userIds)) // items cascade
  await db.delete(products).where(eq(products.id, productId)) // variants cascade
  await db.delete(profiles).where(inArray(profiles.id, userIds))
})

describe('createOrder', () => {
  it('decrements stock, uses database prices, adds the zone fee and snapshots lines', async () => {
    const user = await newUser()

    await reset()
    const created = await createOrder(
      db,
      user,
      order([{ variantId: variants.cheap.id, qty: 2 }]),
    )
    expect(created.totals).toEqual({
      subtotalKobo: 2_300_000,
      deliveryFeeKobo: 300_000,
      totalKobo: 2_600_000,
    })
    expect(created.ref).toMatch(/^SP-/)
    expect(await stockOf(variants.cheap.id)).toBe(8)

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, created.id))
    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({
      productName: 'Integration Test Scent',
      variantLabel: '100ml',
      unitPriceKobo: 1_150_000,
      qty: 2,
      lineTotalKobo: 2_300_000,
    })
  })

  it('charges no delivery at ₦300,000 or more', async () => {
    const user = await newUser()

    await reset()
    const created = await createOrder(
      db,
      user,
      order([{ variantId: variants.last.id, qty: 1 }]),
    )
    expect(created.totals.deliveryFeeKobo).toBe(0)
    expect(created.totals.totalKobo).toBe(68_000_000)
  })

  it('lets only one of two concurrent buyers take the last bottle', async () => {
    const user = await newUser()
    const other = await newUser()

    await reset()
    const results = await Promise.allSettled([
      createOrder(db, user, order([{ variantId: variants.last.id, qty: 1 }])),
      createOrder(db, other, order([{ variantId: variants.last.id, qty: 1 }])),
    ])
    const ok = results.filter((r) => r.status === 'fulfilled')
    const failed = results.filter((r) => r.status === 'rejected')
    expect(ok).toHaveLength(1)
    expect(failed).toHaveLength(1)
    expect(failed[0].reason).toBeInstanceOf(StockError)
    expect(await stockOf(variants.last.id)).toBe(0)
  })

  it('rolls everything back when one line is short', async () => {
    const user = await newUser()

    await reset()
    const before = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, user.id))
    const attempt = createOrder(
      db,
      user,
      order([
        { variantId: variants.cheap.id, qty: 3 },
        { variantId: variants.second.id, qty: 5 }, // only 2 in stock
      ]),
    )
    await expect(attempt).rejects.toMatchObject({
      name: 'StockError',
      short: [{ variantId: variants.second.id, available: 2 }],
    })
    expect(await stockOf(variants.cheap.id)).toBe(10) // first line untouched
    expect(await stockOf(variants.second.id)).toBe(2)
    const after = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, user.id))
    expect(after).toHaveLength(before.length)
  })

  it('treats an unknown variant as out of stock', async () => {
    const user = await newUser()

    await expect(
      createOrder(db, user, order([{ variantId: randomUUID(), qty: 1 }])),
    ).rejects.toBeInstanceOf(StockError)
  })

  it('is idempotent: the same key twice creates one order and takes stock once', async () => {
    const user = await newUser()

    await reset()
    const input = order([{ variantId: variants.cheap.id, qty: 1 }], {
      idempotencyKey: `idem-${tag}`,
    })
    const first = await createOrder(db, user, input)
    const second = await createOrder(db, user, input)
    expect(second.ref).toBe(first.ref)
    expect(second.duplicate).toBe(true)
    expect(await stockOf(variants.cheap.id)).toBe(9)
  })

  it('collapses concurrent double submits with the same key into one order', async () => {
    const user = await newUser()

    await reset()
    const input = order([{ variantId: variants.cheap.id, qty: 1 }], {
      idempotencyKey: `race-${tag}`,
    })
    const [a, b] = await Promise.all([
      createOrder(db, user, input),
      createOrder(db, user, input),
    ])
    expect(a.ref).toBe(b.ref)
    expect(await stockOf(variants.cheap.id)).toBe(9)
  })

  it('merges repeated variants into one line', async () => {
    const user = await newUser()

    await reset()
    const created = await createOrder(
      db,
      user,
      order([
        { variantId: variants.cheap.id, qty: 1 },
        { variantId: variants.cheap.id, qty: 2 },
      ]),
    )
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, created.id))
    expect(items).toHaveLength(1)
    expect(items[0]?.qty).toBe(3)
  })

  it('uses the current database price, not anything the caller could send', async () => {
    const user = await newUser()

    await reset()
    await db
      .update(productVariants)
      .set({ priceKobo: 2_000_000 })
      .where(eq(productVariants.id, variants.cheap.id))
    const created = await createOrder(
      db,
      user,
      order([{ variantId: variants.cheap.id, qty: 1 }]),
    )
    expect(created.totals.subtotalKobo).toBe(2_000_000)
    await db
      .update(productVariants)
      .set({ priceKobo: variants.cheap.price })
      .where(eq(productVariants.id, variants.cheap.id))
  })
})

describe('real concurrency', () => {
  it('four buyers on separate connections, two bottles: exactly two succeed', async () => {
    await reset()
    const clients = Array.from({ length: 4 }, () =>
      postgres(process.env.DATABASE_URL ?? '', { prepare: false, max: 1 }),
    )
    try {
      const buyers = await Promise.all(clients.map(() => newUser()))
      const results = await Promise.allSettled(
        clients.map((client, i) =>
          createOrder(
            drizzle(client),
            buyers[i] as { id: string; email: string },
            order([{ variantId: variants.second.id, qty: 1 }]),
          ),
        ),
      )
      expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(2)
      const failures = results.filter(
        (r): r is PromiseRejectedResult => r.status === 'rejected',
      )
      expect(failures).toHaveLength(2)
      for (const f of failures) expect(f.reason).toBeInstanceOf(StockError)
      expect(await stockOf(variants.second.id)).toBe(0)
    } finally {
      await Promise.all(clients.map((c) => c.end()))
    }
  })
})

describe('cancelOrder', () => {
  it('restocks every item and marks the order cancelled', async () => {
    const user = await newUser()

    await reset()
    const created = await createOrder(
      db,
      user,
      order([
        { variantId: variants.cheap.id, qty: 4 },
        { variantId: variants.second.id, qty: 1 },
      ]),
    )
    expect(await stockOf(variants.cheap.id)).toBe(6)
    await cancelOrder(db, created.ref)
    expect(await stockOf(variants.cheap.id)).toBe(10)
    expect(await stockOf(variants.second.id)).toBe(2)
    const [row] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, created.id))
    expect(row.status).toBe('cancelled')
    expect(row.cancelledAt).not.toBeNull()
  })

  it('refuses to cancel twice (no double restock) or an unknown ref', async () => {
    const user = await newUser()

    await reset()
    const created = await createOrder(
      db,
      user,
      order([{ variantId: variants.cheap.id, qty: 1 }]),
    )
    await cancelOrder(db, created.ref)
    await expect(cancelOrder(db, created.ref)).rejects.toMatchObject({
      code: 'not_cancellable',
    })
    expect(await stockOf(variants.cheap.id)).toBe(10)
    await expect(cancelOrder(db, 'SP-NOPE00')).rejects.toBeInstanceOf(
      CancelError,
    )
  })

  it('refuses to cancel a shipped order', async () => {
    const user = await newUser()

    await reset()
    const created = await createOrder(
      db,
      user,
      order([{ variantId: variants.cheap.id, qty: 1 }]),
    )
    await db
      .update(orders)
      .set({ status: 'shipped' })
      .where(eq(orders.id, created.id))
    await expect(cancelOrder(db, created.ref)).rejects.toMatchObject({
      code: 'not_cancellable',
    })
    expect(await stockOf(variants.cheap.id)).toBe(9)
  })
})

describe('transitionOrder', () => {
  it('walks placed to delivered, stamping each step', async () => {
    await reset()
    const user = await newUser()
    const created = await createOrder(
      db,
      user,
      order([{ variantId: variants.cheap.id, qty: 1 }]),
    )
    await transitionOrder(db, created.ref, 'confirmed')
    await transitionOrder(db, created.ref, 'shipped')
    await transitionOrder(db, created.ref, 'delivered')
    const [row] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, created.id))
    expect(row.status).toBe('delivered')
    expect(row.confirmedAt).not.toBeNull()
    expect(row.shippedAt).not.toBeNull()
    expect(row.deliveredAt).not.toBeNull()
  })

  it('rejects skipped, backward and post-final moves', async () => {
    await reset()
    const user = await newUser()
    const created = await createOrder(
      db,
      user,
      order([{ variantId: variants.cheap.id, qty: 1 }]),
    )
    await expect(
      transitionOrder(db, created.ref, 'shipped'),
    ).rejects.toMatchObject({
      code: 'not_allowed',
    })
    await expect(
      transitionOrder(db, created.ref, 'placed'),
    ).rejects.toMatchObject({
      code: 'not_allowed',
    })
    await transitionOrder(db, created.ref, 'confirmed')
    await transitionOrder(db, created.ref, 'shipped')
    await transitionOrder(db, created.ref, 'delivered')
    await expect(
      transitionOrder(db, created.ref, 'cancelled'),
    ).rejects.toMatchObject({
      code: 'not_cancellable',
    })
  })

  it('cancelling through a transition restocks', async () => {
    await reset()
    const user = await newUser()
    const created = await createOrder(
      db,
      user,
      order([{ variantId: variants.cheap.id, qty: 3 }]),
    )
    expect(await stockOf(variants.cheap.id)).toBe(7)
    await transitionOrder(db, created.ref, 'confirmed')
    await transitionOrder(db, created.ref, 'cancelled')
    expect(await stockOf(variants.cheap.id)).toBe(10)
  })

  it('reports an unknown order', async () => {
    await expect(
      transitionOrder(db, 'SP-NOPE00', 'confirmed'),
    ).rejects.toMatchObject({
      code: 'not_found',
    })
  })
})

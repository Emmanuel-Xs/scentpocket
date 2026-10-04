import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { getDb } from '#/db/client'
import { cartItems, orders, productVariants } from '#/db/schema'
import { getMe } from '#/features/api/account-handlers'
import {
  getDupes,
  getCatalog,
  getProductBySlug,
} from '#/features/api/catalog-handlers'
import {
  deleteMyCart,
  getMyCart,
  postCartMerge,
  putCartItem,
} from '#/features/api/cart-handlers'
import { handle } from '#/features/api/http'
import type { ApiHandler } from '#/features/api/http'
import {
  getMyOrders,
  getOrderByRef,
  postOrder,
} from '#/features/api/order-handlers'
import {
  createAuthUser,
  createFixture,
  dropFixture,
  dropUsers,
  restock,
} from './helpers'
import type { Fixture } from './helpers'

// No request context outside the server: the cookie path sees an empty jar. Email is not sent.
vi.mock('@tanstack/react-start/server', () => ({
  getCookies: () => ({}),
  setCookie: () => undefined,
  getRequestHeader: () => undefined,
}))
vi.mock('#/features/email/send', () => ({ sendOrderEmail: vi.fn() }))

const db = getDb()
const tag = randomUUID().slice(0, 8)
let f: Fixture
let user: Awaited<ReturnType<typeof createAuthUser>>
let other: Awaited<ReturnType<typeof createAuthUser>>

const delivery = {
  fullName: 'Ada Obi',
  phone: '0803 123 4567',
  addressLine: '12 Allen Avenue',
  city: 'Ikeja',
  state: 'Lagos',
  deliveryZone: 'lagos_mainland',
}

/** Calls a handler the way the route does, through `handle`. */
async function call(
  handler: ApiHandler,
  opts: {
    method?: string
    token?: string
    body?: unknown
    headers?: Record<string, string>
    params?: Record<string, string>
    url?: string
  } = {},
) {
  const request = new Request(opts.url ?? 'http://test/api/v1/x', {
    method: opts.method ?? 'GET',
    headers: {
      ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}),
      ...(opts.body === undefined
        ? {}
        : { 'content-type': 'application/json' }),
      ...opts.headers,
    },
    ...(opts.body === undefined ? {} : { body: JSON.stringify(opts.body) }),
  })
  const res = await handle(handler)({ request, params: opts.params ?? {} })
  const body = (await res.json()) as Record<string, any>
  return { status: res.status, body }
}

beforeAll(async () => {
  f = await createFixture(tag)
  user = await createAuthUser()
  other = await createAuthUser()
})
beforeEach(async () => {
  await restock(f)
  await db.delete(cartItems).where(eq(cartItems.userId, user.id))
  await db.delete(orders).where(eq(orders.userId, user.id))
})
afterAll(async () => {
  await dropUsers([user.id, other.id])
  await user.remove()
  await other.remove()
  await dropFixture(f)
})

describe('bearer auth', () => {
  it('401 without a token', async () => {
    const res = await call(getMe)
    expect(res.status).toBe(401)
    expect(res.body).toEqual({
      error: { code: 'unauthorized', message: 'Sign in required.' },
    })
  })

  it('401 with a token Supabase does not accept', async () => {
    const res = await call(getMe, { token: 'not-a-real-token' })
    expect(res.status).toBe(401)
  })

  it('200 with a real token, and the profile is created on first sight', async () => {
    const res = await call(getMe, { token: user.token })
    expect(res.status).toBe(200)
    expect(res.body.user).toMatchObject({
      id: user.id,
      email: user.email,
      role: 'customer',
    })
  })

  it.each([
    ['cart', getMyCart],
    ['orders', getMyOrders],
    ['order by ref', getOrderByRef],
    ['clear cart', deleteMyCart],
    ['put item', putCartItem],
    ['merge', postCartMerge],
    ['place order', postOrder],
  ] as const)(
    'every protected route checks auth itself: %s',
    async (_name, h) => {
      expect((await call(h)).status).toBe(401)
    },
  )
})

describe('public catalog', () => {
  it('lists, filters and validates', async () => {
    const all = await call(getCatalog)
    expect(all.status).toBe(200)
    expect(all.body.total).toBe(all.body.products.length)
    const pocket = await call(getCatalog, {
      url: 'http://test/api/v1/catalog?tier=pocket&sort=price_asc',
    })
    expect(
      pocket.body.products.every((p: { tier: string }) => p.tier === 'pocket'),
    ).toBe(true)
    const bad = await call(getCatalog, {
      url: 'http://test/api/v1/catalog?tier=nope',
    })
    expect(bad.status).toBe(422)
    expect(bad.body.error.code).toBe('validation_failed')
  })

  it('returns a product with absolute image URLs, and 404 for an unknown slug', async () => {
    const ok = await call(getProductBySlug, { params: { slug: f.slug } })
    expect(ok.status).toBe(200)
    expect(ok.body.product.variants).toHaveLength(3)
    const missing = await call(getProductBySlug, {
      params: { slug: 'nope-nope' },
    })
    expect(missing.status).toBe(404)
    const dupes = await call(getDupes)
    expect(dupes.status).toBe(200)
    for (const pair of dupes.body.dupes) {
      expect(pair.dupe.image.src).toMatch(/^https:\/\//)
      expect(pair.dupe.image.width).toBeGreaterThan(0)
    }
  })
})

describe('cart routes', () => {
  it('PUT items, GET cart, merge and DELETE', async () => {
    const put = await call(putCartItem, {
      method: 'PUT',
      token: user.token,
      body: { variantId: f.plenty.id, quantity: 2 },
    })
    expect(put.status).toBe(200)
    expect(put.body.cart.itemCount).toBe(2)

    const merged = await call(postCartMerge, {
      method: 'POST',
      token: user.token,
      body: { items: [{ variantId: f.plenty.id, quantity: 3 }] },
    })
    expect(merged.body.cart.lines[0].quantity).toBe(5)

    const got = await call(getMyCart, { token: user.token })
    expect(got.body.cart.subtotalKobo).toBe(5 * f.plenty.priceKobo)

    const cleared = await call(deleteMyCart, {
      method: 'DELETE',
      token: user.token,
    })
    expect(cleared.body.cart.lines).toEqual([])
  })

  it('422 for a bad body, 400 for bad JSON, 404 for an unknown variant', async () => {
    const bad = await call(putCartItem, {
      method: 'PUT',
      token: user.token,
      body: { variantId: 'x', quantity: -1 },
    })
    expect(bad.status).toBe(422)
    const unknown = await call(putCartItem, {
      method: 'PUT',
      token: user.token,
      body: { variantId: randomUUID(), quantity: 1 },
    })
    expect(unknown.status).toBe(404)
    const request = new Request('http://test/api/v1/cart/items', {
      method: 'PUT',
      headers: { authorization: `Bearer ${user.token}` },
      body: '{nope',
    })
    const res = await handle(putCartItem)({ request, params: {} })
    expect(res.status).toBe(400)
  })
})

describe('POST /orders', () => {
  const place = (
    extra: Record<string, unknown> = {},
    headers: Record<string, string> = {},
    token = user.token,
  ) =>
    call(postOrder, {
      method: 'POST',
      token,
      body: { delivery, ...extra },
      headers,
    })

  const cartRows = (userId: string) =>
    db.select().from(cartItems).where(eq(cartItems.userId, userId))

  it('places the order from the server cart and clears it', async () => {
    await call(putCartItem, {
      method: 'PUT',
      token: user.token,
      body: { variantId: f.plenty.id, quantity: 2 },
    })
    // Items in the body are ignored on purpose: only contact + zone are read.
    const res = await place({ items: [{ variantId: f.last.id, qty: 1 }] })
    expect(res.status).toBe(201)
    expect(res.body.order.items).toHaveLength(1)
    expect(res.body.order.items[0].qty).toBe(2)
    expect(res.body.order.subtotalKobo).toBe(2 * f.plenty.priceKobo)
    expect(res.body.order.phone).toBe('+2348031234567')
    expect(await cartRows(user.id)).toHaveLength(0)
    expect(
      (await call(getMyCart, { token: user.token })).body.cart.lines,
    ).toEqual([])

    const [stock] = await db
      .select({ s: productVariants.stock })
      .from(productVariants)
      .where(eq(productVariants.id, f.plenty.id))
    expect(stock?.s).toBe(8)

    const list = await call(getMyOrders, { token: user.token })
    expect(list.body.orders.map((o: { ref: string }) => o.ref)).toContain(
      res.body.order.ref,
    )
    const one = await call(getOrderByRef, {
      token: user.token,
      params: { ref: res.body.order.ref },
    })
    expect(one.status).toBe(200)
  })

  it("someone else's order is a 404, and so is a malformed ref", async () => {
    await call(putCartItem, {
      method: 'PUT',
      token: user.token,
      body: { variantId: f.plenty.id, quantity: 1 },
    })
    const res = await place()
    const ref = res.body.order.ref as string
    expect(
      (await call(getOrderByRef, { token: other.token, params: { ref } }))
        .status,
    ).toBe(404)
    expect(
      (
        await call(getOrderByRef, {
          token: user.token,
          params: { ref: 'nope' },
        })
      ).status,
    ).toBe(404)
    expect(
      (await call(getMyOrders, { token: other.token })).body.orders,
    ).toEqual([])
  })

  it('422 for an empty cart and for invalid contact details', async () => {
    const empty = await place()
    expect(empty.status).toBe(422)
    expect(empty.body.error.code).toBe('empty_cart')
    const bad = await call(postOrder, {
      method: 'POST',
      token: user.token,
      body: { delivery: { ...delivery, phone: '123' } },
    })
    expect(bad.status).toBe(422)
    expect(bad.body.error.code).toBe('validation_failed')
  })

  it('409 when stock ran out after the item was added, and the cart is kept', async () => {
    await call(putCartItem, {
      method: 'PUT',
      token: user.token,
      body: { variantId: f.two.id, quantity: 2 },
    })
    await db
      .update(productVariants)
      .set({ stock: 1 })
      .where(eq(productVariants.id, f.two.id))
    const res = await place()
    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe('insufficient_stock')
    expect(res.body.error.details.short).toEqual([
      { variantId: f.two.id, available: 1 },
    ])
    expect(await cartRows(user.id)).toHaveLength(1)
    expect(
      await db.select().from(orders).where(eq(orders.userId, user.id)),
    ).toHaveLength(0)
  })

  it('a retry with the same Idempotency-Key returns the first order with 200', async () => {
    await call(putCartItem, {
      method: 'PUT',
      token: user.token,
      body: { variantId: f.plenty.id, quantity: 1 },
    })
    const key = `mobile-${randomUUID()}`
    const first = await place({}, { 'Idempotency-Key': key })
    expect(first.status).toBe(201)
    const retry = await place({}, { 'Idempotency-Key': key })
    expect(retry.status).toBe(200)
    expect(retry.body.order.ref).toBe(first.body.order.ref)
    expect(
      await db.select().from(orders).where(eq(orders.userId, user.id)),
    ).toHaveLength(1)
  })
})

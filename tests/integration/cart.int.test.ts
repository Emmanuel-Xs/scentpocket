import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { getDb } from '#/db/client'
import { cartItems, productVariants } from '#/db/schema'
import {
  CartError,
  clearCart,
  getCart,
  mergeCart,
  setCartItem,
} from '#/features/cart/server/cart-core'
import {
  createOrder,
  StockError,
} from '#/features/checkout/server/create-order'
import {
  createFixture,
  createProfile,
  dropFixture,
  dropUsers,
  restock,
} from './helpers'
import type { Fixture } from './helpers'

const db = getDb()
const tag = randomUUID().slice(0, 8)
const userIds: string[] = []
let f: Fixture

const newUser = async () => {
  const u = await createProfile()
  userIds.push(u.id)
  return u
}

const rowsOf = (userId: string) =>
  db.select().from(cartItems).where(eq(cartItems.userId, userId))

beforeAll(async () => {
  f = await createFixture(tag)
})
beforeEach(() => restock(f))
afterAll(async () => {
  await dropUsers(userIds)
  await dropFixture(f)
})

describe('setCartItem', () => {
  it('adds, changes and removes a line (0 removes)', async () => {
    const u = await newUser()
    let cart = await setCartItem(db, u.id, f.plenty.id, 2)
    expect(cart.lines).toHaveLength(1)
    expect(cart.lines[0]?.quantity).toBe(2)
    expect(cart.subtotalKobo).toBe(2 * f.plenty.priceKobo)
    expect(cart.changed).toBe(false)

    cart = await setCartItem(db, u.id, f.plenty.id, 5)
    expect(cart.itemCount).toBe(5)
    expect(await rowsOf(u.id)).toHaveLength(1)

    cart = await setCartItem(db, u.id, f.plenty.id, 0)
    expect(cart.lines).toEqual([])
    expect(await rowsOf(u.id)).toHaveLength(0)
  })

  it('clamps to stock and says so', async () => {
    const u = await newUser()
    const cart = await setCartItem(db, u.id, f.two.id, 9)
    expect(cart.lines[0]?.quantity).toBe(2)
    expect(cart.lines[0]?.changed).toBe(true)
    expect(cart.changed).toBe(true)
    expect(cart.messages.join(' ')).toContain('is down to 2')
    expect((await rowsOf(u.id))[0]?.quantity).toBe(2)
  })

  it('does not keep a sold out variant', async () => {
    const u = await newUser()
    await db
      .update(productVariants)
      .set({ stock: 0 })
      .where(eq(productVariants.id, f.last.id))
    const cart = await setCartItem(db, u.id, f.last.id, 1)
    expect(cart.lines).toEqual([])
    expect(cart.messages.join(' ')).toContain('sold out')
    expect(await rowsOf(u.id)).toHaveLength(0)
  })

  it('rejects an unknown variant', async () => {
    const u = await newUser()
    await expect(setCartItem(db, u.id, randomUUID(), 1)).rejects.toBeInstanceOf(
      CartError,
    )
  })

  it('keeps carts separate per user', async () => {
    const a = await newUser()
    const b = await newUser()
    await setCartItem(db, a.id, f.plenty.id, 3)
    expect((await getCart(db, b.id)).lines).toEqual([])
  })
})

describe('getCart reconciliation', () => {
  it('lowers a quantity that is now above stock and fixes the stored row', async () => {
    const u = await newUser()
    await setCartItem(db, u.id, f.plenty.id, 6)
    await db
      .update(productVariants)
      .set({ stock: 4 })
      .where(eq(productVariants.id, f.plenty.id))
    const cart = await getCart(db, u.id)
    expect(cart.lines[0]?.quantity).toBe(4)
    expect(cart.lines[0]?.changed).toBe(true)
    expect(cart.lines[0]?.stock).toBe(4)
    expect((await rowsOf(u.id))[0]?.quantity).toBe(4)
    // Second read: nothing left to change.
    expect((await getCart(db, u.id)).changed).toBe(false)
  })

  it('removes a variant that sold out and returns the current price', async () => {
    const u = await newUser()
    await setCartItem(db, u.id, f.plenty.id, 1)
    await setCartItem(db, u.id, f.two.id, 1)
    await db
      .update(productVariants)
      .set({ stock: 0, priceKobo: 3_000_000 })
      .where(eq(productVariants.id, f.two.id))
    const cart = await getCart(db, u.id)
    expect(cart.lines.map((l) => l.variantId)).toEqual([f.plenty.id])
    expect(cart.messages.join(' ')).toContain('sold out')
    expect(await rowsOf(u.id)).toHaveLength(1)
    await db
      .update(productVariants)
      .set({ priceKobo: f.two.priceKobo })
      .where(eq(productVariants.id, f.two.id))
  })
})

describe('mergeCart', () => {
  it('adds the same variant and caps at stock', async () => {
    const u = await newUser()
    await setCartItem(db, u.id, f.two.id, 1)
    const cart = await mergeCart(db, u.id, [
      { variantId: f.two.id, quantity: 5 },
      { variantId: f.plenty.id, quantity: 3 },
    ])
    const qty = Object.fromEntries(
      cart.lines.map((l) => [l.variantId, l.quantity]),
    )
    expect(qty[f.two.id]).toBe(2) // 1 + 5, capped at stock 2
    expect(qty[f.plenty.id]).toBe(3)
    expect(cart.messages.join(' ')).toContain('is down to 2')
  })

  it('adds quantities that fit', async () => {
    const u = await newUser()
    await setCartItem(db, u.id, f.plenty.id, 2)
    const cart = await mergeCart(db, u.id, [
      { variantId: f.plenty.id, quantity: 3 },
    ])
    expect(cart.lines[0]?.quantity).toBe(5)
    expect(cart.changed).toBe(false)
  })

  it('skips unknown and sold out variants and reports them', async () => {
    const u = await newUser()
    await db
      .update(productVariants)
      .set({ stock: 0 })
      .where(eq(productVariants.id, f.last.id))
    const cart = await mergeCart(db, u.id, [
      { variantId: randomUUID(), quantity: 1 },
      { variantId: f.last.id, quantity: 1 },
      { variantId: f.plenty.id, quantity: 1 },
    ])
    expect(cart.lines.map((l) => l.variantId)).toEqual([f.plenty.id])
    expect(cart.messages).toHaveLength(2)
  })

  it('adds a variant listed twice before capping', async () => {
    const u = await newUser()
    const cart = await mergeCart(db, u.id, [
      { variantId: f.plenty.id, quantity: 4 },
      { variantId: f.plenty.id, quantity: 4 },
    ])
    expect(cart.lines[0]?.quantity).toBe(8)
  })
})

describe('clearCart', () => {
  it('empties the cart', async () => {
    const u = await newUser()
    await setCartItem(db, u.id, f.plenty.id, 2)
    expect((await clearCart(db, u.id)).lines).toEqual([])
    expect(await rowsOf(u.id)).toHaveLength(0)
  })
})

describe('createOrder and the server cart', () => {
  const delivery = {
    fullName: 'Ada Obi',
    phone: '+2348031234567',
    addressLine: '12 Allen Avenue',
    city: 'Ikeja',
    state: 'Lagos' as const,
    deliveryZone: 'lagos_mainland' as const,
  }

  it('clears the cart in the same transaction as the order', async () => {
    const u = await newUser()
    await setCartItem(db, u.id, f.plenty.id, 2)
    await createOrder(db, u, {
      items: [{ variantId: f.plenty.id, qty: 2 }],
      delivery,
      idempotencyKey: `key-${randomUUID()}`,
    })
    expect(await rowsOf(u.id)).toHaveLength(0)
  })

  it('keeps the cart when the order fails', async () => {
    const u = await newUser()
    await setCartItem(db, u.id, f.plenty.id, 2)
    await db
      .update(productVariants)
      .set({ stock: 1 })
      .where(eq(productVariants.id, f.plenty.id))
    await expect(
      createOrder(db, u, {
        items: [{ variantId: f.plenty.id, qty: 2 }],
        delivery,
        idempotencyKey: `key-${randomUUID()}`,
      }),
    ).rejects.toBeInstanceOf(StockError)
    expect(await rowsOf(u.id)).toHaveLength(1)
  })
})

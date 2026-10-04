import { randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { eq, inArray } from 'drizzle-orm'
import { getDb } from '#/db/client'
import { orders, productVariants, products, profiles } from '#/db/schema'

/** A throwaway active product with three variants (stock 10, 1, 2). Remove it with `dropFixture`. */
export async function createFixture(tag: string) {
  const db = getDb()
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
  if (!p) throw new Error('fixture product not created')
  const rows = await db
    .insert(productVariants)
    .values([
      {
        productId: p.id,
        label: '100ml',
        sizeMl: 100,
        priceKobo: 1_150_000,
        stock: 10,
        sku: `ZZ-${tag}-A`,
      },
      {
        productId: p.id,
        label: '70ml',
        sizeMl: 70,
        priceKobo: 68_000_000,
        stock: 1,
        sku: `ZZ-${tag}-B`,
      },
      {
        productId: p.id,
        label: '50ml',
        sizeMl: 50,
        priceKobo: 2_800_000,
        stock: 2,
        sku: `ZZ-${tag}-C`,
      },
    ])
    .returning({ id: productVariants.id, sku: productVariants.sku })
  const idOf = (suffix: string) => {
    const row = rows.find((r) => r.sku.endsWith(suffix))
    if (!row) throw new Error('fixture variant missing')
    return row.id
  }
  return {
    productId: p.id,
    slug: `zz-int-${tag}`,
    plenty: { id: idOf('-A'), stock: 10, priceKobo: 1_150_000 },
    last: { id: idOf('-B'), stock: 1, priceKobo: 68_000_000 },
    two: { id: idOf('-C'), stock: 2, priceKobo: 2_800_000 },
  }
}

export type Fixture = Awaited<ReturnType<typeof createFixture>>

/** Puts the fixture stock back after a test that sold some. */
export async function restock(f: Fixture) {
  const db = getDb()
  for (const v of [f.plenty, f.last, f.two])
    await db
      .update(productVariants)
      .set({ stock: v.stock })
      .where(eq(productVariants.id, v.id))
}

/** A profile row without a Supabase auth user, for tests that call the cart code directly. */
export async function createProfile() {
  const user = {
    id: randomUUID(),
    email: `int-${randomUUID().slice(0, 8)}@example.com`,
  }
  await getDb()
    .insert(profiles)
    .values({ ...user, role: 'customer' })
  return user
}

/** A real Supabase auth user with a real access token (admin API + password sign in). */
export async function createAuthUser() {
  const url = process.env.VITE_SUPABASE_URL ?? ''
  const admin = createClient(url, process.env.SUPABASE_SECRET_KEY ?? '', {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const email = `int-${randomUUID().slice(0, 8)}@example.com`
  const password = randomUUID()
  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (created.error) throw created.error
  const anon = createClient(
    url,
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '',
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  )
  const signedIn = await anon.auth.signInWithPassword({ email, password })
  if (signedIn.error) throw signedIn.error
  return {
    id: created.data.user.id,
    email,
    token: signedIn.data.session.access_token,
    remove: async () => {
      await admin.auth.admin.deleteUser(created.data.user.id)
    },
  }
}

/** Deletes everything the given users own (orders first: they reference the profile). */
export async function dropUsers(ids: string[]) {
  if (ids.length === 0) return
  const db = getDb()
  await db.delete(orders).where(inArray(orders.userId, ids)) // items cascade
  await db.delete(profiles).where(inArray(profiles.id, ids)) // cart items cascade
}

export async function dropFixture(f: Fixture) {
  await getDb().delete(products).where(eq(products.id, f.productId)) // variants cascade
}

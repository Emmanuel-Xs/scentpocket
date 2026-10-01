import { randomUUID } from 'node:crypto'
import { eq, inArray } from 'drizzle-orm'
import { afterAll, describe, expect, it } from 'vitest'
import { getDb } from '#/db/client'
import { profiles } from '#/db/schema'
import {
  addAdmin,
  listTeam,
  removeAdmin,
} from '#/features/admin/server/team-core'

/** Real database, tagged rows, cleaned up after. */
const db = getDb()
const tag = randomUUID().slice(0, 8)
const ids: string[] = []

async function person(role: 'customer' | 'admin' | 'owner', label: string) {
  const row = {
    id: randomUUID(),
    email: `int-team-${label}-${tag}@example.com`,
    role,
  }
  await db.insert(profiles).values(row)
  ids.push(row.id)
  return row
}
const roleOf = async (id: string) =>
  (
    await db
      .select({ r: profiles.role })
      .from(profiles)
      .where(eq(profiles.id, id))
  )[0]?.r

afterAll(async () => {
  await db.delete(profiles).where(inArray(profiles.id, ids))
})

describe('team', () => {
  it('promotes a customer who has signed in, matching email case-insensitively', async () => {
    const p = await person('customer', 'a')
    await addAdmin(db, `  ${p.email.toUpperCase()} `)
    expect(await roleOf(p.id)).toBe('admin')
  })

  it('refuses someone who has never signed in', async () => {
    await expect(
      addAdmin(db, `nobody-${tag}@example.com`),
    ).rejects.toMatchObject({
      code: 'not_signed_in',
    })
  })

  it('refuses to add an existing admin or the owner again', async () => {
    const admin = await person('admin', 'b')
    const owner = await person('owner', 'c')
    await expect(addAdmin(db, admin.email)).rejects.toMatchObject({
      code: 'already_admin',
    })
    await expect(addAdmin(db, owner.email)).rejects.toMatchObject({
      code: 'already_admin',
    })
    expect(await roleOf(owner.id)).toBe('owner')
  })

  it('demotes an admin back to customer', async () => {
    const admin = await person('admin', 'd')
    await removeAdmin(db, admin.id)
    expect(await roleOf(admin.id)).toBe('customer')
  })

  it('never demotes the owner, and rejects customers and unknown people', async () => {
    const owner = await person('owner', 'e')
    const customer = await person('customer', 'f')
    await expect(removeAdmin(db, owner.id)).rejects.toMatchObject({
      code: 'is_owner',
    })
    expect(await roleOf(owner.id)).toBe('owner')
    await expect(removeAdmin(db, customer.id)).rejects.toMatchObject({
      code: 'not_admin',
    })
    await expect(removeAdmin(db, randomUUID())).rejects.toMatchObject({
      code: 'not_found',
    })
  })

  it('lists owners and admins only, owner first', async () => {
    const team = await listTeam(db)
    const mine = team.filter((m) => m.email.includes(tag))
    expect(mine.every((m) => m.role === 'admin' || m.role === 'owner')).toBe(
      true,
    )
    expect(mine.some((m) => m.email.includes('-f-'))).toBe(false) // a customer
    const roles = team.map((m) => m.role)
    expect(roles.indexOf('owner')).toBeLessThanOrEqual(
      roles.indexOf('admin') === -1 ? 99 : roles.indexOf('admin'),
    )
  })
})

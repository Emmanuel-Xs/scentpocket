import { eq, ne, and, sql } from 'drizzle-orm'
import { getDb } from '#/db/client'
import { profiles } from '#/db/schema'
import { getServerEnv } from '#/lib/env'

export type Profile = typeof profiles.$inferSelect

type AuthIdentity = {
  id: string
  email: string
  user_metadata?: unknown
}

const text = (v: unknown) => (typeof v === 'string' && v ? v : null)

/**
 * A profile can outlive its auth user (the auth user was deleted and the person signed in again,
 * which gives a new id for the same email). The profile row is the target of cart and order
 * foreign keys, so move it to the new id instead of failing on the unique email. Only done when
 * the old id has no auth user left; two live auth users never share an email.
 */
async function repointOrphan(id: string, email: string): Promise<void> {
  await getDb().transaction(async (tx) => {
    const orphan = (
      await tx
        .select({ id: profiles.id })
        .from(profiles)
        .where(and(eq(profiles.email, email), ne(profiles.id, id)))
        .limit(1)
    ).at(0)
    if (!orphan) return
    const alive = await tx.execute(
      sql`select 1 from auth.users where id = ${orphan.id}`,
    )
    if (alive.length > 0)
      throw new Error('Another account already uses this email.')
    await tx
      .update(profiles)
      .set({ email: sql`${email} || '.repoint'` })
      .where(eq(profiles.id, orphan.id))
    await tx.execute(sql`
      insert into profiles (id, email, full_name, avatar_url, role, created_at, updated_at)
      select ${id}, ${email}, full_name, avatar_url, role, created_at, now()
      from profiles where id = ${orphan.id}`)
    await tx.execute(
      sql`update orders set user_id = ${id} where user_id = ${orphan.id}`,
    )
    await tx.execute(
      sql`update cart_items set user_id = ${id} where user_id = ${orphan.id}`,
    )
    await tx.delete(profiles).where(eq(profiles.id, orphan.id))
  })
}

/**
 * The profile for a verified auth user, created on first sight. The one place profiles are
 * created, shared by the web callback and the bearer path (mobile), so they cannot race each other:
 * insert ... on conflict (id) do nothing, then select. ADMIN_EMAILS gives owner (never lowers a role).
 */
export async function ensureProfile(user: AuthIdentity): Promise<Profile> {
  const db = getDb()
  const email = user.email.toLowerCase()
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>
  const isOwner = getServerEnv().ADMIN_EMAILS.includes(email)
  const find = async () =>
    (
      await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1)
    ).at(0)

  let profile = await find()
  if (!profile) {
    await repointOrphan(user.id, email)
    await db
      .insert(profiles)
      .values({
        id: user.id,
        email,
        fullName: text(meta.full_name) ?? text(meta.name),
        avatarUrl: text(meta.avatar_url) ?? text(meta.picture),
        role: isOwner ? 'owner' : 'customer',
      })
      .onConflictDoNothing({ target: profiles.id })
    profile = await find()
  }
  if (!profile) throw new Error('Profile could not be created.')
  if (isOwner && profile.role !== 'owner') {
    await db
      .update(profiles)
      .set({ role: 'owner' })
      .where(eq(profiles.id, user.id))
    profile = { ...profile, role: 'owner' }
  }
  return profile
}

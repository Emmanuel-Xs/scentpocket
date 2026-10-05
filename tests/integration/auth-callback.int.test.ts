import { eq } from 'drizzle-orm'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { getDb } from '#/db/client'
import { profiles } from '#/db/schema'
import { handleAuthCallback } from '#/features/auth/server/callback'
import { ensureProfile } from '#/features/auth/server/profile'
import { createAuthUser, dropUsers } from './helpers'

type AuthUser = Awaited<ReturnType<typeof createAuthUser>>

let signingIn: {
  id: string
  email: string
  user_metadata: Record<string, unknown>
} | null = null

// The OAuth exchange itself is Supabase's; here it hands back a real, freshly created auth user.
vi.mock('#/features/auth/server/supabase', () => ({
  createSupabaseServerClient: () => ({
    auth: {
      getUser: async () => ({ data: { user: null } }),
      exchangeCodeForSession: async () => ({
        data: { user: signingIn },
        error: null,
      }),
    },
  }),
}))

const db = getDb()
const made: AuthUser[] = []
const profileIds: string[] = []

const callback = () =>
  handleAuthCallback(
    new Request('http://test/auth/callback?code=abc&next=%2F'),
  )

async function newAuthUser() {
  const u = await createAuthUser()
  made.push(u)
  profileIds.push(u.id)
  return u
}

const profileOf = async (id: string) =>
  (await db.select().from(profiles).where(eq(profiles.id, id))).at(0)

beforeAll(() => {
  signingIn = null
})

afterAll(async () => {
  await dropUsers(profileIds)
  for (const u of made) await u.remove()
})

describe('/auth/callback', () => {
  it('creates the profile for a first-time user and lands on the next page', async () => {
    const u = await newAuthUser()
    signingIn = {
      id: u.id,
      email: u.email,
      user_metadata: { full_name: 'New Person', picture: 'https://x/y.png' },
    }
    const res = await callback()
    expect(res.status).toBe(200)
    expect(await res.text()).not.toContain('sign-in')
    const p = await profileOf(u.id)
    expect(p).toMatchObject({
      email: u.email,
      fullName: 'New Person',
      avatarUrl: 'https://x/y.png',
      role: 'customer',
    })
  })

  it('is safe to run twice (callback and bearer path racing)', async () => {
    const u = await newAuthUser()
    const identity = { id: u.id, email: u.email, user_metadata: {} }
    await Promise.all([ensureProfile(identity), ensureProfile(identity)])
    expect(await profileOf(u.id)).toBeDefined()
  })

  it('moves an orphaned profile to the new id when the same email signs in again', async () => {
    const oldUser = await newAuthUser()
    await ensureProfile({ id: oldUser.id, email: oldUser.email })
    await oldUser.remove() // the auth user is gone, its profile row is left behind
    const again = await newAuthUser()
    // Supabase will not reuse an email across ids in a test, so give the orphan the new user's email.
    await db
      .update(profiles)
      .set({ email: again.email })
      .where(eq(profiles.id, oldUser.id))
    signingIn = { id: again.id, email: again.email, user_metadata: {} }
    const res = await callback()
    expect(await res.text()).not.toContain('error=callback')
    expect(await profileOf(oldUser.id)).toBeUndefined()
    expect((await profileOf(again.id))?.email).toBe(again.email)
  })

  it('never throws: a failure after the exchange goes to the sign in page', async () => {
    signingIn = { id: 'not-a-uuid', email: 'x@example.com', user_metadata: {} }
    const res = await callback()
    expect(res.status).toBe(200)
    expect(await res.text()).toContain('/sign-in?error=callback')
  })
})


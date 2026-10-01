import { eq } from 'drizzle-orm'
import { getDb } from '#/db/client'
import { profiles } from '#/db/schema'
import { isAdminRole } from '../types'
import type { SessionUser } from '../types'
import { createSupabaseServerClient } from './supabase'

/**
 * The signed in user, verified with Supabase (`getUser`, never the unverified cookie session),
 * plus the role from our own profiles table. Null when signed out.
 */
export async function readSessionUser(): Promise<SessionUser | null> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user.email) return null

  const rows = await getDb()
    .select()
    .from(profiles)
    .where(eq(profiles.id, data.user.id))
    .limit(1)
  const profile = rows.at(0)
  const meta = data.user.user_metadata as Record<string, unknown>
  const text = (v: unknown) => (typeof v === 'string' && v ? v : null)

  return {
    id: data.user.id,
    email: profile?.email ?? data.user.email,
    name: profile?.fullName ?? text(meta.full_name) ?? text(meta.name),
    avatarUrl:
      profile?.avatarUrl ?? text(meta.avatar_url) ?? text(meta.picture),
    role: profile?.role ?? 'customer',
  }
}

/** Call at the top of every protected server function. Layout guards are UX, not security. */
export async function requireUser(): Promise<SessionUser> {
  const user = await readSessionUser()
  if (!user) throw new Response('Please sign in.', { status: 401 })
  return user
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser()
  if (!isAdminRole(user.role)) throw new Response('Not found', { status: 404 })
  return user
}

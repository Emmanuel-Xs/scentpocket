import { createClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'
import { getRequestHeader } from '@tanstack/react-start/server'
import { eq } from 'drizzle-orm'
import { getDb } from '#/db/client'
import { profiles } from '#/db/schema'
import { getPublicEnv, getServerEnv } from '#/lib/env'
import { isAdminRole } from '../types'
import type { SessionUser } from '../types'
import { createSupabaseServerClient } from './supabase'

/**
 * The access token from `Authorization: Bearer <token>`, if there is one. Pass the request when
 * you have it (REST routes); server functions omit it and read the current request's headers.
 */
export function bearerToken(request?: Request): string | null {
  const header = request
    ? request.headers.get('authorization')
    : getRequestHeader('authorization')
  const match = /^Bearer\s+(\S+)$/i.exec(header ?? '')
  return match?.[1] ?? null
}

/** Verifies an access token with Supabase (a signature check alone would not notice revocation). */
async function userFromToken(token: string): Promise<User | null> {
  const env = getPublicEnv()
  const supabase = createClient(
    env.VITE_SUPABASE_URL,
    env.VITE_SUPABASE_PUBLISHABLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
  const { data, error } = await supabase.auth.getUser(token)
  return error ? null : data.user
}

async function userFromCookies(): Promise<User | null> {
  const { data, error } = await createSupabaseServerClient().auth.getUser()
  return error ? null : data.user
}

/**
 * The signed in user, verified with Supabase (`getUser`, never the unverified cookie session),
 * plus the role from our own profiles table. Null when signed out.
 *
 * A bearer token wins when present (mobile app); an invalid one is "signed out", it never falls
 * back to cookies. Otherwise the cookie session is used (web).
 */
export async function readSessionUser(
  request?: Request,
): Promise<SessionUser | null> {
  const token = bearerToken(request)
  const authUser = token ? await userFromToken(token) : await userFromCookies()
  if (!authUser?.email) return null

  const db = getDb()
  const meta = authUser.user_metadata as Record<string, unknown>
  const text = (v: unknown) => (typeof v === 'string' && v ? v : null)

  let profile = (
    await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, authUser.id))
      .limit(1)
  ).at(0)
  if (!profile) {
    // Mobile users sign in with Supabase directly and never pass through /auth/callback, so their
    // profile (the target of cart and order foreign keys) is created the first time we see them.
    const email = authUser.email.toLowerCase()
    await db
      .insert(profiles)
      .values({
        id: authUser.id,
        email,
        fullName: text(meta.full_name) ?? text(meta.name),
        avatarUrl: text(meta.avatar_url) ?? text(meta.picture),
        role: getServerEnv().ADMIN_EMAILS.includes(email)
          ? 'owner'
          : 'customer',
      })
      .onConflictDoNothing()
    profile = (
      await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, authUser.id))
        .limit(1)
    ).at(0)
  }

  return {
    id: authUser.id,
    email: profile?.email ?? authUser.email,
    name: profile?.fullName ?? text(meta.full_name) ?? text(meta.name),
    avatarUrl:
      profile?.avatarUrl ?? text(meta.avatar_url) ?? text(meta.picture),
    role: profile?.role ?? 'customer',
  }
}

/** Call at the top of every protected server function or route. Layout guards are UX, not security. */
export async function requireUser(request?: Request): Promise<SessionUser> {
  const user = await readSessionUser(request)
  if (!user) throw new Response('Please sign in.', { status: 401 })
  return user
}

export async function requireAdmin(request?: Request): Promise<SessionUser> {
  const user = await requireUser(request)
  if (!isAdminRole(user.role)) throw new Response('Not found', { status: 404 })
  return user
}

/** Team management is for the owner only; plain admins get a 404 like everyone else. */
export async function requireOwner(request?: Request): Promise<SessionUser> {
  const user = await requireUser(request)
  if (user.role !== 'owner') throw new Response('Not found', { status: 404 })
  return user
}

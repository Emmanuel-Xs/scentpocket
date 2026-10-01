import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getServerEnv } from '#/lib/env'
import { safeNext } from '../next'
import type { SessionUser } from '../types'
import { readSessionUser } from './session'
import { createSupabaseServerClient } from './supabase'

export const getSessionUser = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SessionUser | null> => readSessionUser(),
)

/** Starts Google OAuth (PKCE; the verifier is stored in a cookie). Returns the URL to send the browser to. */
export const startGoogleSignIn = createServerFn({ method: 'POST' })
  .validator(z.object({ next: z.string().max(500).optional() }))
  .handler(async ({ data }): Promise<{ url: string }> => {
    const supabase = createSupabaseServerClient()
    const next = safeNext(data.next)
    const { data: oauth, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${getServerEnv().SITE_URL}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })
    if (error) throw new Error(error.message)
    return { url: oauth.url }
  })

export const signOut = createServerFn({ method: 'POST' }).handler(async () => {
  await createSupabaseServerClient().auth.signOut()
  return { ok: true }
})

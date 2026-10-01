import { createServerClient } from '@supabase/ssr'
import { getCookies, setCookie } from '@tanstack/react-start/server'
import { getPublicEnv } from '#/lib/env'

/**
 * Supabase client bound to this request's cookies. Auth only: app data goes through Drizzle.
 * Unlike the TanStack example, `setAll` passes the cookie options through (httpOnly, sameSite, maxAge).
 */
export function createSupabaseServerClient() {
  const env = getPublicEnv()
  return createServerClient(
    env.VITE_SUPABASE_URL,
    env.VITE_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return Object.entries(getCookies()).map(([name, value]) => ({
            name,
            value,
          }))
        },
        setAll(cookies) {
          for (const { name, value, options } of cookies)
            setCookie(name, value, options)
        },
      },
    },
  )
}

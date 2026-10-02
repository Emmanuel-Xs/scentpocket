import { createFileRoute } from '@tanstack/react-router'
import { getDb } from '#/db/client'
import { profiles } from '#/db/schema'
import { safeNext } from '#/features/auth/next'
import { createSupabaseServerClient } from '#/features/auth/server/supabase'
import { getServerEnv } from '#/lib/env'

const escapeHtml = (v: string) =>
  v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

/**
 * Leaves via a 200 HTML page, not a 3xx: Netlify re-appends the incoming query string (the OAuth
 * code) to a Location that has none, which looped the browser back to "/?code=...".
 */
const redirectTo = (path: string) => {
  const target = `${getServerEnv().SITE_URL}${path}`
  const safe = escapeHtml(target)
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=${safe}"><title>Signing you in</title></head><body><script>location.replace(${JSON.stringify(target).replace(/</g, '\\u003c')})</script><a href="${safe}">Continue</a></body></html>`
  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer',
    },
  })
}

export const Route = createFileRoute('/auth/callback')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const code = url.searchParams.get('code')
        const next = safeNext(url.searchParams.get('next'))
        if (!code) {
          console.error('[auth/callback] no code in the request')
          return redirectTo('/sign-in?error=auth')
        }

        const supabase = createSupabaseServerClient()
        // Already signed in (a repeated or stray code): skip the exchange and land on a clean URL.
        const existing = await supabase.auth.getUser()
        if (existing.data.user) return redirectTo(next)

        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        const user = data.user
        if (error || !user?.email) {
          console.error(
            '[auth/callback] code exchange failed:',
            error?.message ?? 'no user email',
          )
          return redirectTo('/sign-in?error=auth')
        }

        const email = user.email.toLowerCase()
        const meta = user.user_metadata as Record<string, unknown>
        const text = (v: unknown) => (typeof v === 'string' && v ? v : null)
        const isOwner = getServerEnv().ADMIN_EMAILS.includes(email)

        // Role is only ever raised here (owner from ADMIN_EMAILS); an existing admin keeps theirs.
        await getDb()
          .insert(profiles)
          .values({
            id: user.id,
            email,
            fullName: text(meta.full_name) ?? text(meta.name),
            avatarUrl: text(meta.avatar_url) ?? text(meta.picture),
            role: isOwner ? 'owner' : 'customer',
          })
          .onConflictDoUpdate({
            target: profiles.id,
            set: {
              email,
              fullName: text(meta.full_name) ?? text(meta.name),
              avatarUrl: text(meta.avatar_url) ?? text(meta.picture),
              ...(isOwner ? { role: 'owner' as const } : {}),
            },
          })

        return redirectTo(next)
      },
    },
  },
})

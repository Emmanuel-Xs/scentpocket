import { createFileRoute } from '@tanstack/react-router'
import { getDb } from '#/db/client'
import { profiles } from '#/db/schema'
import { safeNext } from '#/features/auth/next'
import { createSupabaseServerClient } from '#/features/auth/server/supabase'
import { getServerEnv } from '#/lib/env'

const redirectTo = (path: string) =>
  new Response(null, {
    status: 302,
    headers: { Location: `${getServerEnv().SITE_URL}${path}` },
  })

export const Route = createFileRoute('/auth/callback')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        console.log(
          '[auth/callback] hit',
          JSON.stringify({
            hasCode: url.searchParams.has('code'),
            next: url.searchParams.get('next'),
            referer: request.headers.get('referer'),
            hasVerifierCookie: (request.headers.get('cookie') ?? '').includes(
              'code-verifier',
            ),
          }),
        )
        const code = url.searchParams.get('code')
        const next = safeNext(url.searchParams.get('next'))
        if (!code) {
          console.error('[auth/callback] no code in the request')
          return redirectTo('/sign-in?error=auth')
        }

        const supabase = createSupabaseServerClient()
        // Already signed in (a repeated or stray code): skip the exchange and land on a clean URL.
        const existing = await supabase.auth.getUser()
        if (existing.data.user) {
          console.log(
            '[auth/callback] already signed in, redirecting to',
            getServerEnv().SITE_URL + next,
          )
          return redirectTo(next)
        }
        console.log(
          '[auth/callback] no session yet, exchanging',
          existing.error?.message,
        )

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

        console.log('[auth/callback] ok, redirecting to', next)
        return redirectTo(next)
      },
    },
  },
})

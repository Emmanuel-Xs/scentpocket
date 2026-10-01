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
        const code = url.searchParams.get('code')
        const next = safeNext(url.searchParams.get('next'))
        if (!code) return redirectTo('/sign-in?error=auth')

        const supabase = createSupabaseServerClient()
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        const user = data.user
        if (error || !user?.email) return redirectTo('/sign-in?error=auth')

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

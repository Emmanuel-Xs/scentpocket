import { safeNext } from '#/features/auth/next'
import { getServerEnv } from '#/lib/env'
import { ensureProfile } from './profile'
import { createSupabaseServerClient } from './supabase'

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

/** GET /auth/callback. Never throws: any failure lands on the sign in page with a friendly message. */
export async function handleAuthCallback(request: Request): Promise<Response> {
  try {
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

    await ensureProfile({ ...user, email: user.email })
    return redirectTo(next)
  } catch (err) {
    console.error('[auth/callback] failed after the exchange:', err)
    return redirectTo('/sign-in?error=callback')
  }
}

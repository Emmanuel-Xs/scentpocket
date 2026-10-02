import { createFileRoute } from '@tanstack/react-router'
import { SITE_ORIGIN } from '#/lib/seo'

const body = `User-agent: *
Allow: /
Disallow: /checkout
Disallow: /account
Disallow: /admin
Disallow: /auth
Disallow: /sign-in

Sitemap: ${SITE_ORIGIN}/sitemap.xml
`

export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: () =>
        new Response(body, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        }),
    },
  },
})

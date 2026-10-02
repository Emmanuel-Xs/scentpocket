import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import { getDb } from '#/db/client'
import { products } from '#/db/schema'
import { tiers } from '#/features/catalog/schemas'
import { SITE_ORIGIN } from '#/lib/seo'

const escapeXml = (v: string) =>
  v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const rows = await getDb()
          .select({ slug: products.slug, updatedAt: products.updatedAt })
          .from(products)
          .where(eq(products.isActive, true))
        const urls = [
          { path: '/' },
          { path: '/shop' },
          ...tiers.map((t) => ({ path: `/shop?tier=${t}` })),
          { path: '/dupes' },
          { path: '/privacy' },
          { path: '/terms' },
          ...rows.map((r) => ({
            path: `/p/${r.slug}`,
            lastmod: r.updatedAt.toISOString().slice(0, 10),
          })),
        ]
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${escapeXml(SITE_ORIGIN + u.path)}</loc>${'lastmod' in u ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`,
  )
  .join('\n')}
</urlset>
`
        return new Response(xml, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        })
      },
    },
  },
})

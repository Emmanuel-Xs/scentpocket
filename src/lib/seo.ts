/** Canonical public origin. Search engines should always see this one, never the netlify.app address. */
export const SITE_ORIGIN = 'https://scentpocket.com.ng'
export const SITE_NAME = 'Scentpocket'
export const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/og-image.png`

type JsonLd = Record<string, unknown>

type SeoInput = {
  title: string
  description: string
  /** Path with any canonical query, for example `/shop?tier=pocket`. */
  path: string
  image?: string
  /** Open Graph type. */
  type?: 'website' | 'product'
  jsonLd?: JsonLd[]
}

/** Title, description, canonical, Open Graph, Twitter and JSON-LD for one route's `head()`. */
export function seoHead({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  type = 'website',
  jsonLd = [],
}: SeoInput) {
  const url = `${SITE_ORIGIN}${path}`
  return {
    meta: [
      { title },
      { name: 'description', content: description },
      { property: 'og:site_name', content: SITE_NAME },
      { property: 'og:type', content: type },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { property: 'og:image', content: image },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
    ],
    links: [{ rel: 'canonical', href: url }],
    scripts: jsonLd.map((data) => ({
      type: 'application/ld+json',
      // `<` is escaped so a product name can never close the script tag.
      children: JSON.stringify(data).replace(/</g, '\\u003c'),
    })),
  }
}

export function breadcrumbLd(crumbs: { name: string; path: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: `${SITE_ORIGIN}${c.path}`,
    })),
  }
}

export const organizationLd: JsonLd[] = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_ORIGIN,
    logo: `${SITE_ORIGIN}/icon-512.png`,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_ORIGIN,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_ORIGIN}/shop?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  },
]

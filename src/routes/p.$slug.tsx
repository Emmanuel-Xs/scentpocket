import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { productQueryOptions } from '#/features/catalog/queries'
import { tierStyles } from '#/features/catalog/tiers'
import { productLd } from '#/features/product/seo'
import { breadcrumbLd, seoHead } from '#/lib/seo'
import { ProductPage } from '#/features/product/components/ProductPage'
import { ProductSkeleton } from '#/features/product/components/ProductSkeleton'

export const Route = createFileRoute('/p/$slug')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(productQueryOptions(params.slug)),
  pendingComponent: ProductSkeleton,
  head: ({ loaderData }) => {
    if (!loaderData) return {}
    const { card, description, images } = loaderData
    const path = `/p/${card.slug}`
    return seoHead({
      title: `${card.name} by ${card.brand} · Scentpocket`,
      description,
      path,
      type: 'product',
      image: images.at(0)?.src,
      jsonLd: [
        productLd(loaderData),
        breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'Shop', path: '/shop' },
          {
            name: tierStyles[card.tier].label,
            path: `/shop?tier=${card.tier}`,
          },
          { name: card.name, path },
        ]),
      ],
    })
  },
  component: Product,
})

function Product() {
  const { slug } = Route.useParams()
  const { data } = useSuspenseQuery(productQueryOptions(slug))
  return <ProductPage product={data} />
}

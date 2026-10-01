import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { productQueryOptions } from '#/features/catalog/queries'
import { ProductPage } from '#/features/product/components/ProductPage'
import { ProductSkeleton } from '#/features/product/components/ProductSkeleton'

export const Route = createFileRoute('/p/$slug')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(productQueryOptions(params.slug)),
  pendingComponent: ProductSkeleton,
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          {
            title: `${loaderData.card.name} by ${loaderData.card.brand} · Scentpocket`,
          },
          { name: 'description', content: loaderData.description },
        ]
      : [],
  }),
  component: Product,
})

function Product() {
  const { slug } = Route.useParams()
  const { data } = useSuspenseQuery(productQueryOptions(slug))
  return <ProductPage product={data} />
}

import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { ProductForm } from '#/features/admin/components/ProductForm'
import { adminProductQueryOptions } from '#/features/admin/queries'

export const Route = createFileRoute('/_admin/admin/products/$id')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(adminProductQueryOptions(params.id)),
  head: () => ({
    meta: [
      { title: 'Edit product · Admin · Scentpocket' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: EditProduct,
})

function EditProduct() {
  const { id } = Route.useParams()
  const { data } = useSuspenseQuery(adminProductQueryOptions(id))
  return <ProductForm key={id} product={data.product} options={data.options} />
}

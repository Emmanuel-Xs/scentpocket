import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { ProductForm } from '#/features/admin/components/ProductForm'
import { adminProductQueryOptions } from '#/features/admin/queries'

export const Route = createFileRoute('/_admin/admin/products/new')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(adminProductQueryOptions()),
  head: () => ({
    meta: [
      { title: 'New product · Admin · Scentpocket' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: NewProduct,
})

function NewProduct() {
  const { data } = useSuspenseQuery(adminProductQueryOptions())
  return <ProductForm key="new" product={null} options={data.options} />
}

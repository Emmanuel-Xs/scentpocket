import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/admin/products')({
  head: () => ({
    meta: [
      { title: 'Products · Admin · Scentpocket' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: () => (
    <>
      <h1 className="text-5xl">Products</h1>
      <p className="text-text-2">This part of the admin lands in step 4.5.</p>
    </>
  ),
})

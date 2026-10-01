import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/account/orders')({
  head: () => ({
    meta: [
      { title: 'My orders · Scentpocket' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: () => (
    <main className="page-container py-16">
      <h1 className="text-(length:--text-h1)">My orders</h1>
      <p className="mt-3 text-text-2">Order history lands in step 3.5.</p>
    </main>
  ),
})

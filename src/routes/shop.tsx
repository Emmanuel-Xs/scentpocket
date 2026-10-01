import { createFileRoute } from '@tanstack/react-router'
import { shopSearchSchema } from '#/features/catalog/schemas'

export const Route = createFileRoute('/shop')({
  validateSearch: shopSearchSchema,
  head: () => ({ meta: [{ title: 'Shop all scents · Scentpocket' }] }),
  component: () => (
    <main className="page-container py-16">
      <h1 className="text-(length:--text-h1)">Shop</h1>
      <p className="mt-3 text-text-2">The full catalog lands in step 1.6.</p>
    </main>
  ),
})

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/p/$slug')({
  component: () => (
    <main className="page-container py-16">
      <h1 className="text-(length:--text-h1)">Product</h1>
      <p className="mt-3 text-text-2">The product page lands in step 1.7.</p>
    </main>
  ),
})

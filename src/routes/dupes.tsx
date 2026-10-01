import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dupes')({
  head: () => ({ meta: [{ title: 'Dupes · Scentpocket' }] }),
  component: () => (
    <main className="page-container py-16">
      <h1 className="text-(length:--text-h1)">Dupes</h1>
      <p className="mt-3 text-text-2">The dupes page lands in step 1.8.</p>
    </main>
  ),
})

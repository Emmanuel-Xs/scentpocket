import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/admin/')({
  head: () => ({
    meta: [
      { title: 'Admin · Scentpocket' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: () => (
    <main className="page-container py-16">
      <h1 className="text-(length:--text-h1)">Admin</h1>
      <p className="mt-3 text-text-2">The admin area lands in Phase 4.</p>
    </main>
  ),
})

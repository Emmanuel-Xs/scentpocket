import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/sign-in')({
  head: () => ({
    meta: [
      { title: 'Sign in · Scentpocket' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: () => (
    <main className="page-container py-16">
      <h1 className="text-(length:--text-h1)">Sign in</h1>
      <p className="mt-3 text-text-2">Google sign in lands in step 2.4.</p>
    </main>
  ),
})

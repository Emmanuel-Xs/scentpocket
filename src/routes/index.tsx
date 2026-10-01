import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <main className="page-container py-16">
      <h1 className="text-(length:--text-display)">
        A scent for every pocket.
      </h1>
      <p className="mt-4 text-lg text-text-2">
        The real home page lands in step 1.5.
      </p>
    </main>
  )
}

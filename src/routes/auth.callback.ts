import { createFileRoute } from '@tanstack/react-router'
import { handleAuthCallback } from '#/features/auth/server/callback'

export const Route = createFileRoute('/auth/callback')({
  server: {
    handlers: {
      GET: ({ request }) => handleAuthCallback(request),
    },
  },
})

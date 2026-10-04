import { createFileRoute } from '@tanstack/react-router'
import { getMe } from '#/features/api/account-handlers'
import { handle } from '#/features/api/http'

export const Route = createFileRoute('/api/v1/me')({
  server: {
    handlers: {
      GET: handle(getMe),
    },
  },
})

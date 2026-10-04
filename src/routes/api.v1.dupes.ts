import { createFileRoute } from '@tanstack/react-router'
import { getDupes } from '#/features/api/catalog-handlers'
import { handle } from '#/features/api/http'

export const Route = createFileRoute('/api/v1/dupes')({
  server: {
    handlers: {
      GET: handle(getDupes),
    },
  },
})

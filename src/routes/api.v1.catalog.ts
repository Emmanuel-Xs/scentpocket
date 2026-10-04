import { createFileRoute } from '@tanstack/react-router'
import { getCatalog } from '#/features/api/catalog-handlers'
import { handle } from '#/features/api/http'

export const Route = createFileRoute('/api/v1/catalog')({
  server: { handlers: { GET: handle(getCatalog) } },
})

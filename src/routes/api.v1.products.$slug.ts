import { createFileRoute } from '@tanstack/react-router'
import { getProductBySlug } from '#/features/api/catalog-handlers'
import { handle } from '#/features/api/http'

export const Route = createFileRoute('/api/v1/products/$slug')({
  server: {
    handlers: {
      GET: handle(getProductBySlug),
    },
  },
})

import { createFileRoute } from '@tanstack/react-router'
import { ApiError, handle } from '#/features/api/http'

// Anything under /api/v1 that is not a route above: JSON 404, never the website's HTML 404 page.
const notFound = handle(() => {
  throw new ApiError(404, 'not_found', 'No such API route.')
})

export const Route = createFileRoute('/api/v1/$')({
  server: {
    handlers: {
      GET: notFound,
      POST: notFound,
      PUT: notFound,
      PATCH: notFound,
      DELETE: notFound,
    },
  },
})

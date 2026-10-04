import { createFileRoute } from '@tanstack/react-router'
import { postCartMerge } from '#/features/api/cart-handlers'
import { handle } from '#/features/api/http'

export const Route = createFileRoute('/api/v1/cart/merge')({
  server: {
    handlers: {
      POST: handle(postCartMerge),
    },
  },
})

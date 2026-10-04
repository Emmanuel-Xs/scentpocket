import { createFileRoute } from '@tanstack/react-router'
import { putCartItem } from '#/features/api/cart-handlers'
import { handle } from '#/features/api/http'

export const Route = createFileRoute('/api/v1/cart/items')({
  server: {
    handlers: {
      PUT: handle(putCartItem),
    },
  },
})

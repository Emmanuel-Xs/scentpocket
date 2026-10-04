import { createFileRoute } from '@tanstack/react-router'
import { deleteMyCart, getMyCart } from '#/features/api/cart-handlers'
import { handle } from '#/features/api/http'

export const Route = createFileRoute('/api/v1/cart')({
  server: {
    handlers: {
      GET: handle(getMyCart),
      DELETE: handle(deleteMyCart),
    },
  },
})

import { createFileRoute } from '@tanstack/react-router'
import { getMyOrders, postOrder } from '#/features/api/order-handlers'
import { handle } from '#/features/api/http'

export const Route = createFileRoute('/api/v1/orders')({
  server: {
    handlers: {
      GET: handle(getMyOrders),
      POST: handle(postOrder),
    },
  },
})

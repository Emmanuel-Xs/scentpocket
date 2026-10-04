import { createFileRoute } from '@tanstack/react-router'
import { getOrderByRef } from '#/features/api/order-handlers'
import { handle } from '#/features/api/http'

export const Route = createFileRoute('/api/v1/orders/$ref')({
  server: {
    handlers: {
      GET: handle(getOrderByRef),
    },
  },
})

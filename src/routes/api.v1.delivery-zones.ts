import { createFileRoute } from '@tanstack/react-router'
import { getDeliveryZones } from '#/features/api/catalog-handlers'
import { handle } from '#/features/api/http'

export const Route = createFileRoute('/api/v1/delivery-zones')({
  server: {
    handlers: {
      GET: handle(getDeliveryZones),
    },
  },
})

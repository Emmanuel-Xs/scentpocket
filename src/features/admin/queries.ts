import { queryOptions } from '@tanstack/react-query'
import type { OrderStatus } from '#/features/orders/status'
import { getAdminOrder, listAdminOrders } from './server/orders'

export const adminOrdersQueryOptions = (filter: {
  status?: OrderStatus
  q?: string
}) =>
  queryOptions({
    queryKey: ['admin', 'orders', filter],
    queryFn: () => listAdminOrders({ data: filter }),
    staleTime: 0,
  })

export const adminOrderQueryOptions = (ref: string) =>
  queryOptions({
    queryKey: ['admin', 'order', ref],
    queryFn: () => getAdminOrder({ data: { ref } }),
    staleTime: 0,
  })

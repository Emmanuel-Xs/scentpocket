import { queryOptions } from '@tanstack/react-query'
import { getOrder } from './server/get-order'
import { listMyOrders } from './server/list-orders'

export const orderQueryOptions = (ref: string) =>
  queryOptions({
    queryKey: ['orders', 'detail', ref],
    queryFn: () => getOrder({ data: { ref } }),
    staleTime: 15_000,
  })

export const myOrdersQueryOptions = () =>
  queryOptions({
    queryKey: ['orders', 'mine'],
    queryFn: () => listMyOrders(),
    staleTime: 15_000,
  })

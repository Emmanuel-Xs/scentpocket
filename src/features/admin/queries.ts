import { queryOptions } from '@tanstack/react-query'
import type { OrderStatus } from '#/features/orders/status'
import { getAdminOrder, listAdminOrders } from './server/orders'
import { getAdminProduct, listAdminProducts } from './server/products'

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

export const adminProductsQueryOptions = (q?: string) =>
  queryOptions({
    queryKey: ['admin', 'products', q ?? ''],
    queryFn: () => listAdminProducts({ data: { q } }),
    staleTime: 0,
  })

export const adminProductQueryOptions = (id?: string) =>
  queryOptions({
    queryKey: ['admin', 'product', id ?? 'new'],
    queryFn: () => getAdminProduct({ data: { id } }),
    staleTime: 0,
  })

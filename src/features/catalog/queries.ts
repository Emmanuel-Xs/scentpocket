import { queryOptions } from '@tanstack/react-query'
import { getHomeData } from './server/home'
import { getShopProducts } from './server/shop'

export const homeQueryOptions = () =>
  queryOptions({
    queryKey: ['catalog', 'home'],
    queryFn: () => getHomeData(),
    staleTime: 60_000,
  })

export const shopQueryOptions = () =>
  queryOptions({
    queryKey: ['catalog', 'shop'],
    queryFn: () => getShopProducts(),
    staleTime: 60_000,
  })

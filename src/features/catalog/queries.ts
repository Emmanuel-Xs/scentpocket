import { queryOptions } from '@tanstack/react-query'
import { getHomeData } from './server/home'
import { getDupePairs } from './server/dupes'
import { getProduct } from './server/product'
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

export const productQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ['catalog', 'product', slug],
    queryFn: () => getProduct({ data: { slug } }),
    staleTime: 30_000,
  })

export const dupesQueryOptions = () =>
  queryOptions({
    queryKey: ['catalog', 'dupes'],
    queryFn: () => getDupePairs(),
    staleTime: 60_000,
  })

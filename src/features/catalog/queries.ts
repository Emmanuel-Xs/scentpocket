import { queryOptions } from '@tanstack/react-query'
import { getHomeData } from './server/home'

export const homeQueryOptions = () =>
  queryOptions({
    queryKey: ['catalog', 'home'],
    queryFn: () => getHomeData(),
    staleTime: 60_000,
  })

import { queryOptions } from '@tanstack/react-query'
import { getSessionUser } from './server/actions'

export const userQueryOptions = () =>
  queryOptions({
    queryKey: ['auth', 'user'],
    queryFn: () => getSessionUser(),
    staleTime: 5 * 60_000,
  })

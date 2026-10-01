import { queryOptions } from '@tanstack/react-query'
import { getCartLines } from './server/lines'

export const cartLinesQueryOptions = (variantIds: string[]) => {
  const ids = [...variantIds].sort()
  return queryOptions({
    queryKey: ['cart', 'lines', ids],
    queryFn: () => getCartLines({ data: { variantIds: ids } }),
    enabled: ids.length > 0,
    staleTime: 0,
  })
}

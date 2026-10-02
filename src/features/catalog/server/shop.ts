import { createServerFn } from '@tanstack/react-start'
import type { ProductCardData } from '../types'
import { loadActiveCards } from './cards'

/** The whole active catalog (16 products). Filtering and sorting happen in `filter.ts`. */
export const getShopProducts = createServerFn({ method: 'GET' }).handler(
  async (): Promise<ProductCardData[]> => {
    const rows = await loadActiveCards()
    return rows.map((r) => r.card)
  },
)

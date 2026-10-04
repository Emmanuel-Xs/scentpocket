import { notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import type { ProductDetail } from '../types'
import { loadProductDetail } from './product-core'

export const getProduct = createServerFn({ method: 'GET' })
  .validator(z.object({ slug: z.string().min(1).max(120) }))
  .handler(async ({ data }): Promise<ProductDetail> => {
    const product = await loadProductDetail(data.slug)
    if (!product) throw notFound()
    return product
  })

import { getPublicEnv } from '#/lib/env'

export const PRODUCTS_BUCKET = 'products'

/** Public Supabase Storage URL for a path in the products bucket. */
export function productImageUrl(path: string): string {
  return `${getPublicEnv().VITE_SUPABASE_URL}/storage/v1/object/public/${PRODUCTS_BUCKET}/${path}`
}

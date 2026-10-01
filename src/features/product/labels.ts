import type { ProductDetail } from '#/features/catalog/types'

export const longevityInfo: Record<
  ProductDetail['longevity'],
  { label: string; level: number }
> = {
  short: { label: 'Short, 2 to 4h', level: 1 },
  moderate: { label: 'Moderate, 4 to 6h', level: 2 },
  long: { label: 'Long, 6 to 10h', level: 3 },
  very_long: { label: 'Very long, 10h+', level: 4 },
}

export const projectionInfo: Record<
  ProductDetail['projection'],
  { label: string; level: number }
> = {
  soft: { label: 'Soft', level: 1 },
  moderate: { label: 'Moderate', level: 2 },
  strong: { label: 'Strong', level: 3 },
}

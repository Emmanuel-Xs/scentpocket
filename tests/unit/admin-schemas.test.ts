import { describe, expect, it } from 'vitest'
import { productInputSchema, slugify } from '#/features/admin/schemas'

const valid = {
  name: 'Test Scent',
  brand: 'Test Brand',
  slug: 'test-scent',
  description: 'A bright, sunny scent for everyday wear.',
  tier: 'pocket',
  gender: 'unisex',
  family: 'fresh',
  occasions: ['everyday'],
  topNotes: ['Lemon'],
  heartNotes: ['Jasmine'],
  baseNotes: ['Musk'],
  longevity: 'short',
  projection: 'soft',
  inspiredById: null,
  isActive: true,
  variants: [{ label: '100ml EDP', sizeMl: 100, priceNaira: 12500, stock: 5 }],
}

describe('slugify', () => {
  it('makes url safe slugs', () => {
    expect(slugify('Baccarat Rouge 540')).toBe('baccarat-rouge-540')
    expect(slugify('  Club de Nuit: Intense Man! ')).toBe(
      'club-de-nuit-intense-man',
    )
    expect(slugify('Crème Brûlée')).toBe('creme-brulee')
  })
})

describe('productInputSchema', () => {
  it('accepts a complete product', () => {
    expect(productInputSchema.safeParse(valid).success).toBe(true)
  })

  it('needs 1 to 3 sizes', () => {
    expect(
      productInputSchema.safeParse({ ...valid, variants: [] }).success,
    ).toBe(false)
    const four = Array.from({ length: 4 }, (_, i) => ({
      ...valid.variants[0],
      sizeMl: 50 + i,
    }))
    expect(
      productInputSchema.safeParse({ ...valid, variants: four }).success,
    ).toBe(false)
  })

  it('rejects bad slugs, prices and stock', () => {
    expect(
      productInputSchema.safeParse({ ...valid, slug: 'Not A Slug' }).success,
    ).toBe(false)
    const price = { ...valid.variants[0], priceNaira: 0 }
    expect(
      productInputSchema.safeParse({ ...valid, variants: [price] }).success,
    ).toBe(false)
    const stock = { ...valid.variants[0], stock: -1 }
    expect(
      productInputSchema.safeParse({ ...valid, variants: [stock] }).success,
    ).toBe(false)
    const frac = { ...valid.variants[0], stock: 1.5 }
    expect(
      productInputSchema.safeParse({ ...valid, variants: [frac] }).success,
    ).toBe(false)
  })

  it('rejects unknown enum values', () => {
    expect(
      productInputSchema.safeParse({ ...valid, tier: 'luxury' }).success,
    ).toBe(false)
  })
})

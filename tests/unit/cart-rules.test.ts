import { describe, expect, it } from 'vitest'
import {
  clampQuantity,
  combineItems,
  maxCartQuantity,
  mergeQuantity,
} from '#/features/cart/rules'
import { MAX_QTY_PER_LINE } from '#/lib/config'

describe('maxCartQuantity', () => {
  it('is the stock, capped at the per line limit, never negative', () => {
    expect(maxCartQuantity(3)).toBe(3)
    expect(maxCartQuantity(500)).toBe(MAX_QTY_PER_LINE)
    expect(maxCartQuantity(0)).toBe(0)
    expect(maxCartQuantity(-4)).toBe(0)
  })
})

describe('clampQuantity', () => {
  it('keeps a quantity that fits', () => {
    expect(clampQuantity(2, 5)).toBe(2)
  })
  it('lowers a quantity above stock to stock', () => {
    expect(clampQuantity(9, 4)).toBe(4)
  })
  it('lowers a quantity above the per line cap', () => {
    expect(clampQuantity(50, 500)).toBe(MAX_QTY_PER_LINE)
  })
  it('is 0 when sold out, and never negative', () => {
    expect(clampQuantity(3, 0)).toBe(0)
    expect(clampQuantity(-2, 5)).toBe(0)
  })
  it('floors fractions', () => {
    expect(clampQuantity(2.9, 5)).toBe(2)
  })
})

describe('mergeQuantity', () => {
  it('adds the quantities for the same variant', () => {
    expect(mergeQuantity(2, 3, 10)).toBe(5)
  })
  it('caps the sum at stock', () => {
    expect(mergeQuantity(3, 4, 5)).toBe(5)
  })
  it('caps the sum at the per line limit', () => {
    expect(mergeQuantity(8, 8, 100)).toBe(MAX_QTY_PER_LINE)
  })
  it('is 0 for a sold out variant', () => {
    expect(mergeQuantity(0, 2, 0)).toBe(0)
  })
  it('starts from nothing when the server cart had none', () => {
    expect(mergeQuantity(0, 2, 5)).toBe(2)
  })
})

describe('combineItems', () => {
  it('adds the same variant listed twice', () => {
    const combined = combineItems([
      { variantId: 'a', quantity: 1 },
      { variantId: 'b', quantity: 2 },
      { variantId: 'a', quantity: 3 },
    ])
    expect(Object.fromEntries(combined)).toEqual({ a: 4, b: 2 })
  })
  it('is empty for no items', () => {
    expect(combineItems([]).size).toBe(0)
  })
})

import { describe, expect, it } from 'vitest'
import { generateOrderRef, ORDER_REF_PATTERN } from '#/lib/order-ref'

describe('generateOrderRef', () => {
  it('looks like SP-XXXXXX with no ambiguous characters', () => {
    for (let i = 0; i < 500; i++) {
      const ref = generateOrderRef()
      expect(ref).toMatch(ORDER_REF_PATTERN)
      expect(ref.slice(3)).not.toMatch(/[01OIL]/)
    }
  })

  it('does not repeat in a normal run', () => {
    const refs = new Set(Array.from({ length: 1000 }, generateOrderRef))
    expect(refs.size).toBe(1000)
  })
})

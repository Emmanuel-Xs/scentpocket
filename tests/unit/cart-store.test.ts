import { beforeEach, describe, expect, it } from 'vitest'
import { useCartStore } from '#/features/cart/store'

beforeEach(() => useCartStore.setState({ lines: [] }))

describe('cart store', () => {
  it('adds a line and merges repeat adds', () => {
    useCartStore.getState().add('v1', 1)
    useCartStore.getState().add('v1', 2)
    expect(useCartStore.getState().lines).toEqual([{ variantId: 'v1', qty: 3 }])
  })

  it('caps at the given stock and at 10', () => {
    useCartStore.getState().add('v1', 5, 3)
    expect(useCartStore.getState().lines[0]?.qty).toBe(3)
    useCartStore.getState().add('v2', 99)
    expect(useCartStore.getState().lines[1]?.qty).toBe(10)
  })

  it('sets, removes and clears', () => {
    useCartStore.getState().add('v1', 1)
    useCartStore.getState().setQty('v1', 4)
    expect(useCartStore.getState().lines[0]?.qty).toBe(4)
    useCartStore.getState().remove('v1')
    expect(useCartStore.getState().lines).toEqual([])
  })
})
